"""Proxy routes to forward requests to the C# backend at api.zont.cab"""
from fastapi import APIRouter, Request, HTTPException, Response
from pydantic import BaseModel
from typing import List, Optional, Any, Dict
from contextlib import asynccontextmanager
import httpx
import logging
import json
import os
import secrets
import string
from google.oauth2 import id_token as google_id_token
from google.auth.transport import requests as google_requests

logger = logging.getLogger(__name__)

# --- Database access for social auth ---
_google_db = None

def set_proxy_db(database):
    global _google_db
    _google_db = database

# --- Global Async HTTP Client Configuration via Lifespan ---
# This reuses TCP connections to api.zont.cab, drastically reducing latency.
http_client: httpx.AsyncClient = None
_client_lock = None

async def get_http_client():
    global http_client, _client_lock
    if _client_lock is None:
        import asyncio
        _client_lock = asyncio.Lock()
    if http_client is None or http_client.is_closed:
        async with _client_lock:
            if http_client is None or http_client.is_closed:
                http_client = httpx.AsyncClient(
                    base_url="https://api.zont.cab",
                    timeout=httpx.Timeout(15.0, connect=5.0, read=30.0)
                )
    return http_client

@asynccontextmanager
async def lifespan_client(router_instance: APIRouter):
    global http_client
    http_client = httpx.AsyncClient(
        base_url="https://api.zont.cab",
        timeout=httpx.Timeout(15.0, connect=5.0, read=30.0)
    )
    yield
    await (await get_http_client()).aclose()

router = APIRouter(prefix="/api/proxy", tags=["proxy"])

GOOGLE_CLIENT_ID = "71410638404-lnkcacu3k26efkhd76us4jp1ha1dahtf.apps.googleusercontent.com"
GOOGLE_CLIENT_ID_MOBILE = "71410638404-lnkcacu3k26efkhd76us4jp1ha1dahtf.apps.googleusercontent.com"
FACEBOOK_APP_ID = os.environ.get("FACEBOOK_APP_ID", "")
FACEBOOK_APP_SECRET = os.environ.get("FACEBOOK_APP_SECRET", "")

# ---- Pydantic Schemas ----

class Coordinate(BaseModel):
    latitude: float
    longitude: float

class DistanceRequest(BaseModel):
    coordinates: List[Coordinate]
    radius: Optional[int] = 50

class PreorderRequest(BaseModel):
    coordinates: List[Coordinate]

class RegisterPhoneRequest(BaseModel):
    phone: str

class VerifyPhoneRequest(BaseModel):
    phoneNumber: str
    verificationCode: str

class RegisterClientRequest(BaseModel):
    firstName: str
    lastName: str
    email: Optional[str] = None
    phoneNumber: str
    password: str
    gender: Optional[str] = "male"

class LoginRequest(BaseModel):
    username: str
    password: str

class GoogleLoginRequest(BaseModel):
    idToken: str

class FacebookLoginRequest(BaseModel):
    accessToken: str
    userID: str

class ForgotPasswordRequest(BaseModel):
    email: str

class ResetPasswordRequest(BaseModel):
    forgotPasswordToken: str
    newPassword: str

class AuctionAddRequest(BaseModel):
    startPointLatitude: float
    startPointLongitude: float
    clientPrice: float
    startDate: str
    startAddress: Optional[str] = None
    endAddress: Optional[str] = None
    destination: Optional[str] = None
    tripType: Optional[str] = None
    carType: Optional[str] = None
    distance: Optional[int] = None
    duration: Optional[int] = None
    additionalComments: Optional[str] = None
    terminal: Optional[str] = None
    cardId: Optional[str] = None
    email: Optional[str] = None
    utcOffset: Optional[int] = None
    endPointLatitude: Optional[float] = None
    endPointLongitude: Optional[float] = None
    stripePaymentIntentId: Optional[str] = None  # Added support for 3DS intents

    class Config:
        extra = "ignore"


# ---- Core Core API Proxies ----

@router.post("/distance")
async def proxy_distance(req: DistanceRequest):
    """Calculate trip pricing between two or more points."""
    try:
        coords = [{"latitude": c.latitude, "longitude": c.longitude} for c in req.coordinates]
        resp = await (await get_http_client()).post("/api/Distance", params={"radius": req.radius}, json=coords)
        resp.raise_for_status()
        return resp.json()
    except httpx.HTTPStatusError as e:
        logger.error(f"C# Distance Error: {e.response.status_code} - {e.response.text}")
        raise HTTPException(status_code=e.response.status_code, detail="Pricing calculation error")
    except Exception as e:
        logger.error(f"Proxy distance connection error: {e}")
        raise HTTPException(status_code=502, detail="Failed to reach core service backend")


@router.post("/preorder-distance")
async def proxy_preorder_distance(req: PreorderRequest):
    """Get fixed pricing for preorder between two points."""
    try:
        coords = [{"latitude": c.latitude, "longitude": c.longitude} for c in req.coordinates]
        resp = await (await get_http_client()).post("/api/PreorderDistance/driverTypesTwo", json=coords)
        resp.raise_for_status()
        return resp.json()
    except Exception as e:
        logger.error(f"Proxy preorder error: {e}")
        raise HTTPException(status_code=502, detail="Failed to reach core service backend")


@router.get("/trip-types")
async def proxy_trip_types():
    """Get available vehicle/trip types."""
    try:
        resp = await (await get_http_client()).get("/api/TripsPrice/gettypes")
        resp.raise_for_status()
        return resp.json()
    except Exception as e:
        logger.error(f"Proxy trip-types error: {e}")
        raise HTTPException(status_code=502, detail="Failed to reach core service backend")


@router.get("/vehicle-image/{image_path:path}")
async def proxy_vehicle_image(image_path: str):
    """Proxy vehicle images from C# backend with local caching header optimizations."""
    try:
        resp = await (await get_http_client()).get(f"/api/File/{image_path}")
        resp.raise_for_status()
        return Response(
            content=resp.content,
            media_type=resp.headers.get("content-type", "image/png"),
            headers={"Cache-Control": "public, max-age=86400"},
        )
    except Exception as e:
        logger.error(f"Proxy image extraction error: {e}")
        raise HTTPException(status_code=404, detail="Image asset not available")


@router.post("/driver-types")
async def proxy_driver_types(coord: Coordinate):
    """Get available driver/vehicle types near a location."""
    try:
        resp = await (await get_http_client()).post(
            "/api/Distance/driverTypesWithStatus",
            json={"latitude": coord.latitude, "longitude": coord.longitude},
        )
        resp.raise_for_status()
        return resp.json()
    except Exception as e:
        logger.error(f"Proxy driver-types error: {e}")
        raise HTTPException(status_code=502, detail="Failed to reach core service backend")


# ---- Auth Proxy Endpoints ----

@router.post("/auth/google-login")
async def proxy_google_login(req: GoogleLoginRequest):
    """Verify Google ID token, then manage automatic sign-in or account creation."""
    # Step 1: Verify Google token (accept both web and mobile client IDs)
    try:
        try:
            idinfo = google_id_token.verify_oauth2_token(
                req.idToken, google_requests.Request(), GOOGLE_CLIENT_ID
            )
        except Exception:
            idinfo = google_id_token.verify_oauth2_token(
                req.idToken, google_requests.Request(), GOOGLE_CLIENT_ID_MOBILE
            )
    except Exception as e:
        logger.error(f"Google token verification failed: {e}")
        raise HTTPException(status_code=401, detail="Invalid Google token verification")

    email = idinfo.get("email", "")
    first_name = idinfo.get("given_name", "")
    last_name = idinfo.get("family_name", "")

    if not email:
        raise HTTPException(status_code=400, detail="Identity mapping failed: Email missing from token")

    default_headers = {"Content-Type": "application/json", "Origin": "https://zont.cab", "Referer": "https://zont.cab/"}

    # Step 1: Try native C# googleLogin
    try:
        resp = await (await get_http_client()).post("/api/Client/googleLogin", json={"idToken": req.idToken}, headers=default_headers)
        if resp.status_code == 200:
            data = resp.json()
            token = data.get("accessToken")
            if token:
                try:
                    profile_resp = await (await get_http_client()).get("/api/Client", headers={"Authorization": f"Bearer {token}", **default_headers})
                    if profile_resp.status_code == 200:
                        profile = profile_resp.json()
                        data["firstName"] = profile.get("firstName", first_name)
                        data["lastName"] = profile.get("lastName", last_name)
                    else:
                        data["firstName"], data["lastName"] = first_name, last_name
                except Exception:
                    data["firstName"], data["lastName"] = first_name, last_name
                return data
    except Exception as e:
        logger.warning(f"C# googleLogin failed, using fallback: {e}")

    # Step 2: Check if we have a stored Google password for this user
    if _google_db is not None:
        stored = await _google_db.google_auth.find_one({"email": email}, {"_id": 0})
        if stored and stored.get("password"):
            login_resp = await (await get_http_client()).post(
                "/api/Login/client",
                json={"username": email, "password": stored["password"]},
                headers=default_headers,
            )
            if login_resp.status_code == 200:
                data = login_resp.json()
                data["firstName"] = first_name
                data["lastName"] = last_name
                return data

    # Step 3: Try register (new user)
    random_pass = ''.join(secrets.choice(string.ascii_letters + string.digits + "!@#$") for _ in range(16))
    reg_resp = await (await get_http_client()).post(
        "/api/Client",
        json={
            "firstName": first_name, "lastName": last_name, "email": email,
            "phoneNumber": "", "password": random_pass, "gender": "male", "dateOfBirth": "01/01/2000",
        },
        headers=default_headers,
    )
    if reg_resp.status_code == 200:
        # Store password in MongoDB for future Google logins
        if _google_db is not None:
            await _google_db.google_auth.update_one(
                {"email": email},
                {"$set": {"email": email, "password": random_pass, "provider": "google", "firstName": first_name, "lastName": last_name}},
                upsert=True,
            )
        login_resp = await (await get_http_client()).post(
            "/api/Login/client",
            json={"username": email, "password": random_pass},
            headers=default_headers,
        )
        if login_resp.status_code == 200:
            data = login_resp.json()
            data["firstName"], data["lastName"] = first_name, last_name
            return data

    # Step 4: Email exists in C# but no stored password — cannot auto-login
    raise HTTPException(
        status_code=400,
        detail="This email is already registered. Please sign in with your email and password."
    )


@router.post("/auth/facebook-login")
async def proxy_facebook_login(req: FacebookLoginRequest):
    """Verify Facebook token correctly avoiding raw string delimiters, handling user initialization."""
    # Fixed query parsing structural bugs by enforcing dict parameters
    try:
        verify_resp = await (await get_http_client()).get(
            "https://graph.facebook.com/debug_token",
            params={"input_token": req.accessToken, "access_token": f"{FACEBOOK_APP_ID}|{FACEBOOK_APP_SECRET}"}
        )
        verify_data = verify_resp.json().get("data", {})
        if verify_resp.status_code != 200 or not verify_data.get("is_valid") or str(verify_data.get("user_id")) != str(req.userID):
            raise HTTPException(status_code=401, detail="Facebook security token verification mismatch.")
        
        me_resp = await (await get_http_client()).get(
            "https://graph.facebook.com/v25.0/me",
            params={"fields": "id,first_name,last_name,email", "access_token": req.accessToken}
        )
        fb_user = me_resp.json()
    except Exception as e:
        logger.error(f"Facebook authentication loop failure: {e}")
        raise HTTPException(status_code=401, detail="Graph API handshake rejected.")

    email = fb_user.get("email", "")
    first_name = fb_user.get("first_name", "")
    last_name = fb_user.get("last_name", "")

    if not email:
        raise HTTPException(status_code=400, detail="No email profile linked with this Facebook Account.")

    default_headers = {"Content-Type": "application/json", "Origin": "https://zont.cab", "Referer": "https://zont.cab/"}

    try:
        fb_resp = await (await get_http_client()).post("/api/Client/facebookLogin", json={"userId": req.userID, "facebookAccessToken": req.accessToken}, headers=default_headers)
        if fb_resp.status_code == 200:
            data = fb_resp.json()
            token = data.get("accessToken")
            if token:
                profile_resp = await (await get_http_client()).get("/api/Client", headers={"Authorization": f"Bearer {token}", "Origin": "https://zont.cab"})
                if profile_resp.status_code == 200:
                    profile = profile_resp.json()
                    data["firstName"] = profile.get("firstName", first_name)
                    data["lastName"] = profile.get("lastName", last_name)
            return data
    except Exception as e:
        logger.warning(f"Native Facebook integration unreachable, processing classic fallback routing: {e}")

    random_pass = ''.join(secrets.choice(string.ascii_letters + string.digits + "!@#$") for _ in range(16))

    # Check stored password for existing Facebook users
    if _google_db is not None:
        stored = await _google_db.google_auth.find_one({"email": email}, {"_id": 0})
        if stored and stored.get("password"):
            login_resp = await (await get_http_client()).post(
                "/api/Login/client",
                json={"username": email, "password": stored["password"]},
                headers=default_headers,
            )
            if login_resp.status_code == 200:
                data = login_resp.json()
                data["firstName"], data["lastName"] = first_name, last_name
                return data

    reg_resp = await (await get_http_client()).post("/api/Client", json={"firstName": first_name, "lastName": last_name, "email": email, "phoneNumber": "", "password": random_pass, "gender": "male", "dateOfBirth": "01/01/2000"}, headers=default_headers)

    if reg_resp.status_code == 200:
        if _google_db is not None:
            await _google_db.google_auth.update_one(
                {"email": email},
                {"$set": {"email": email, "password": random_pass, "provider": "facebook", "firstName": first_name, "lastName": last_name}},
                upsert=True,
            )
        login_resp = await (await get_http_client()).post("/api/Login/client", json={"username": email, "password": random_pass}, headers=default_headers)
        if login_resp.status_code == 200:
            data = login_resp.json()
            data["firstName"], data["lastName"] = first_name, last_name
            return data

    raise HTTPException(status_code=400, detail="This email is already registered. Please sign in with your email and password.")


@router.post("/auth/register-phone")
async def proxy_register_phone(req: RegisterPhoneRequest):
    try:
        resp = await (await get_http_client()).post("/api/Client/registerPhone", json={"phone": req.phone})
        if resp.status_code == 200:
            return resp.json()
        raise HTTPException(status_code=resp.status_code, detail=resp.json() if resp.text else "Registration failed")
    except HTTPException: raise
    except Exception as e:
        logger.error(f"Register phone network error: {e}")
        raise HTTPException(status_code=502, detail="Failed to connect to authentication server")


@router.post("/auth/verify-phone")
async def proxy_verify_phone(req: VerifyPhoneRequest):
    try:
        resp = await (await get_http_client()).post("/api/Verification/clientVerifyPhone", json={"phoneNumber": req.phoneNumber, "verificationCode": req.verificationCode})
        if resp.status_code == 200:
            return {"success": True}
        raise HTTPException(status_code=resp.status_code, detail=resp.json() if resp.text else "Verification rejected")
    except HTTPException: raise
    except Exception as e:
        logger.error(f"Verify phone exception: {e}")
        raise HTTPException(status_code=502, detail="Verification system unreachable")


@router.post("/auth/register")
async def proxy_register_client(req: RegisterClientRequest):
    payload = {
        "firstName": req.firstName, "lastName": req.lastName, "email": req.email or "",
        "phoneNumber": req.phoneNumber, "password": req.password, "gender": req.gender or "male",
        "dateOfBirth": "01/01/2000", "referalCode": "", "bankCards": None
    }
    try:
        resp = await (await get_http_client()).post("/api/Client", json=payload, headers={"Content-Type": "application/json", "Origin": "https://zont.cab", "Referer": "https://zont.cab/"})
        if resp.status_code == 200:
            return resp.json() if resp.text else {"success": True}
        raise HTTPException(status_code=resp.status_code, detail=resp.json() if resp.text else "Registration rejected")
    except HTTPException: raise
    except Exception as e:
        logger.error(f"Register core server failure: {e}")
        raise HTTPException(status_code=502, detail="Identity registry service offline")


@router.post("/auth/login")
async def proxy_login(req: LoginRequest):
    try:
        resp = await (await get_http_client()).post("/api/Login/client", json={"username": req.username, "password": req.password})
        if resp.status_code == 200:
            data = resp.json()
            token = data.get("accessToken")
            if token:
                try:
                    profile_resp = await (await get_http_client()).get("/api/Client", headers={"Authorization": f"Bearer {token}", "Origin": "https://zont.cab", "Referer": "https://zont.cab/"})
                    if profile_resp.status_code == 200:
                        profile = profile_resp.json()
                        data["firstName"] = profile.get("firstName", "")
                        data["lastName"] = profile.get("lastName", "")
                except Exception:
                    pass
            return data
        raise HTTPException(status_code=resp.status_code, detail=resp.json() if resp.text else "Authentication details invalid")
    except HTTPException: raise
    except Exception as e:
        logger.error(f"Identity verification backend drop: {e}")
        raise HTTPException(status_code=502, detail="Identity verification service offline")


@router.post("/auth/forgot-password")
async def proxy_forgot_password(req: ForgotPasswordRequest, request: Request):
    origin = request.headers.get("origin", "")
    host = origin.replace("https://", "").replace("http://", "") if "preview.emergentagent.com" in origin else "zont.cab"
    try:
        resp = await (await get_http_client()).get(f"/api/Account/{req.email}", params={"host": host}, headers={"Origin": "https://zont.cab"})
        if resp.status_code == 200:
            return {"success": True, "message": "Password reset dispatch link issued"}
        raise HTTPException(status_code=resp.status_code, detail=resp.json() if resp.text else "Failed to dispatch reset mail")
    except HTTPException: raise
    except Exception as e:
        logger.error(f"Password recovery exception: {e}")
        raise HTTPException(status_code=502, detail="Mail dispatch service offline")


@router.post("/auth/reset-password")
async def proxy_reset_password(req: ResetPasswordRequest):
    try:
        resp = await (await get_http_client()).post("/api/Account", json={"forgotPasswordToken": req.forgotPasswordToken, "newPassword": req.newPassword}, headers={"Origin": "https://zont.cab", "Content-Type": "application/json"})
        if resp.status_code == 200:
            return {"success": True, "message": "Password updated successfully"}
        raise HTTPException(status_code=resp.status_code, detail=resp.json() if resp.text else "Token invalid or expired")
    except HTTPException: raise
    except Exception as e:
        logger.error(f"Password reset exception: {e}")
        raise HTTPException(status_code=502, detail="Account management pipeline unreached")


@router.get("/auth/send-verification")
async def proxy_send_verification(email: str):
    try:
        resp = await (await get_http_client()).get("/api/Verification/clientVerifyEmail", params={"email": email, "host": "zont.cab"}, headers={"Origin": "https://zont.cab"})
        if resp.status_code == 200:
            return {"success": True, "message": "Verification email dispatched"}
        raise HTTPException(status_code=resp.status_code, detail=resp.json() if resp.text else "Failed to dispatch email verification")
    except HTTPException: raise
    except Exception as e:
        logger.error(f"Verification dispatcher execution failure: {e}")
        raise HTTPException(status_code=502, detail="Verification system unreachable")


@router.get("/auth/verify/{code}")
async def proxy_verify_code(code: str):
    try:
        resp = await (await get_http_client()).get(f"/api/Verification/verify/{code}", headers={"Origin": "https://zont.cab"})
        if resp.status_code == 200:
            return {"success": True, **(resp.json() if resp.text else {})}
        raise HTTPException(status_code=resp.status_code, detail=resp.json() if resp.text else "Activation code invalid")
    except HTTPException: raise
    except Exception as e:
        logger.error(f"Activation engine link validation dropped: {e}")
        raise HTTPException(status_code=502, detail="Verification service unreachable")


# ---- Booking & Financial Card Assets (Stripe / 3DS Core Mappings) ----

@router.get("/booking/setup-intent")
@router.post("/booking/setup-intent")
@router.get("/client/add-card")
@router.post("/client/add-card")
async def proxy_client_add_card_unified(request: Request):
    """Unified endpoint to extract SetupIntent token metadata safely for checkout flows."""
    auth_header = request.headers.get("Authorization")
    if not auth_header:
        raise HTTPException(status_code=401, detail="Authorization credentials missing")
    try:
        resp = await (await get_http_client()).get("/api/Client/addCard", headers={"Authorization": auth_header, "Origin": "https://zont.cab", "Referer": "https://zont.cab/"})
        body_text = resp.text
        logger.info(f"C# payment payload callback trace status={resp.status_code}")
        
        try:
            data = json.loads(body_text) if body_text.strip() else {}
        except Exception:
            raise HTTPException(status_code=502, detail="Malformed structure received from billing service")

        if resp.status_code == 200 and data.get("client_secret"):
            return {"clientSecret": data["client_secret"]}
        if resp.status_code == 401:
            raise HTTPException(status_code=401, detail="Session token expired. Please log in again.")
        raise HTTPException(status_code=resp.status_code, detail=data or "Payment initialization error")
    except HTTPException: raise
    except Exception as e:
        logger.error(f"Stripe processing interface failure: {e}")
        raise HTTPException(status_code=502, detail="Financial gateway link offline")


@router.get("/client/profile")
async def proxy_client_profile(request: Request):
    auth_header = request.headers.get("Authorization")
    if not auth_header:
        raise HTTPException(status_code=401, detail="Authorization credentials missing")
    try:
        resp = await (await get_http_client()).get("/api/Client", headers={"Authorization": auth_header, "Origin": "https://zont.cab", "Referer": "https://zont.cab/"})
        if resp.status_code == 200:
            return resp.json()
        raise HTTPException(status_code=resp.status_code, detail="Unable to retrieve customer profile")
    except HTTPException: raise
    except Exception as e:
        logger.error(f"Profile mapping connection error: {e}")
        raise HTTPException(status_code=502, detail="Data layer unreachable")


@router.get("/client/cards")
async def proxy_client_cards(request: Request):
    auth_header = request.headers.get("Authorization")
    if not auth_header:
        raise HTTPException(status_code=401, detail="Authorization credentials missing")
    try:
        resp = await (await get_http_client()).get("/api/Client/cards", headers={"Authorization": auth_header, "Origin": "https://zont.cab", "Referer": "https://zont.cab/"})
        if resp.status_code == 200:
            cards_raw = resp.json()
            return [
                {
                    "id": c.get("id"),
                    "brand": c.get("card", {}).get("brand", "unknown"),
                    "last4": c.get("card", {}).get("last4", "****"),
                    "exp_month": c.get("card", {}).get("exp_month"),
                    "exp_year": c.get("card", {}).get("exp_year"),
                }
                for c in cards_raw
            ]
        return []
    except Exception as e:
        logger.error(f"Saved card profile mapping lookup failed: {e}")
        return []


@router.delete("/client/cards/{card_id}")
async def proxy_delete_card(card_id: str, request: Request):
    auth_header = request.headers.get("Authorization")
    if not auth_header:
        raise HTTPException(status_code=401, detail="Authorization credentials missing")
    try:
        resp = await (await get_http_client()).delete(f"/api/Client/cards/{card_id}", headers={"Authorization": auth_header, "Origin": "https://zont.cab", "Referer": "https://zont.cab/"})
        if resp.status_code in (200, 204):
            return {"ok": True}
        raise HTTPException(status_code=resp.status_code, detail="Unable to drop specified payment profile")
    except HTTPException: raise
    except Exception as e:
        logger.error(f"Card disposal exception: {e}")
        raise HTTPException(status_code=502, detail="Financial gateway interface offline")


@router.post("/booking/create")
async def proxy_create_booking(req: AuctionAddRequest, request: Request):
    """Create a new booking dispatch or auction transaction with destination parsing logic."""
    auth_header = request.headers.get("Authorization")
    if not auth_header:
        raise HTTPException(status_code=401, detail="Authorization credentials missing")

    try:
        payload = req.dict(exclude_none=True)
        
        # Enforce C# distance matching conventions
        if payload.get("tripType") in ("Transfer", "Hourly", "transfer", "hourly"):
            payload["tripType"] = "distance"
            
        dest = payload.get("destination", "")
        end_lat = payload.pop("endPointLatitude", None)
        end_lng = payload.pop("endPointLongitude", None)
        
        # Validate if string is an address instead of precise structural coordinate string mapping
        if dest and not all(c in "0123456789.,-+ " for c in dest):
            if end_lat and end_lng:
                payload["destination"] = f"{end_lat},{end_lng}"
                
        logger.info(f"C# addAuction execution context initialized")
        
        # Long-lived timeout handling to catch delayed asynchronous transaction locks
        resp = await (await get_http_client()).post(
            "/api/Auction/addAuction", 
            json=payload, 
            headers={"Authorization": auth_header},
            timeout=45.0
        )
        if resp.status_code in (200, 201):
            return resp.json() if resp.text else {"success": True}
        raise HTTPException(status_code=resp.status_code, detail=resp.json() if resp.text else "Dispatch execution error rejected by core backend")
    except HTTPException: raise
    except Exception as e:
        logger.error(f"Booking pipeline validation system failure: {e}")
        raise HTTPException(status_code=502, detail="Dispatch execution engine unreached")



# ============================================================================
# CLIENT BOOKINGS — Restored 2026-05-29 (was removed in commit c7ef5b2)
# Used by /pages/MyBookings.js to display client's upcoming/past reservations
# ============================================================================

@router.get("/booking/upcoming")
async def proxy_upcoming_auctions(request: Request):
    """Get upcoming auctions/bookings for the logged-in client."""
    auth_header = request.headers.get("Authorization")
    if not auth_header:
        raise HTTPException(status_code=401, detail="Authorization required")

    try:
        resp = await (await get_http_client()).get(
            "/api/Auction/client/upcomingAuctions",
            headers={
                "Authorization": auth_header,
                "Origin": "https://zont.cab",
            },
        )
        resp.raise_for_status()
        return resp.json()
    except httpx.HTTPStatusError as e:
        raise HTTPException(status_code=e.response.status_code, detail="C# API error")
    except Exception as e:
        logger.error(f"Proxy upcoming auctions error: {e}")
        raise HTTPException(status_code=502, detail="Failed to reach C# backend")


@router.delete("/booking/cancel/{auction_id}")
async def proxy_cancel_auction(auction_id: str, request: Request):
    """Cancel a booking/auction in the C# backend."""
    auth_header = request.headers.get("Authorization")
    if not auth_header:
        raise HTTPException(status_code=401, detail="Authorization required")
    try:
        resp = await (await get_http_client()).delete(
            f"/api/Auction/cancel/{auction_id}",
            headers={
                "Authorization": auth_header,
                "Origin": "https://zont.cab",
                "Referer": "https://zont.cab/",
            },
        )
        if resp.status_code in (200, 204):
            return {"ok": True, "message": "Reservation annulee"}
        if resp.status_code == 404:
            raise HTTPException(status_code=404, detail="Reservation introuvable")
        body = resp.text
        try:
            data = json.loads(body) if body.strip() else {}
        except (json.JSONDecodeError, ValueError):
            data = {"error": body}
        raise HTTPException(status_code=resp.status_code, detail=data)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Cancel auction error: {e}")
        raise HTTPException(status_code=502, detail="Erreur serveur")
