"""Proxy routes to forward requests to the C# backend at api.zont.cab"""
from fastapi import APIRouter, Request, HTTPException, Response
from pydantic import BaseModel
from typing import List, Optional, Any, Dict
from contextlib import asynccontextmanager
import httpx
import logging
import json
import os
import stripe as stripe_lib
import jwt
from jwt import PyJWKClient

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

CSHARP_API = "https://api.zont.cab"
TIMEOUT = 15.0
STRIPE_LIVE_KEY = os.environ.get("STRIPE_LIVE_SECRET_KEY")

# ─── Apple Sign In configuration ───
APPLE_JWKS_URL = "https://appleid.apple.com/auth/keys"
APPLE_ISSUER = "https://appleid.apple.com"
# Allowed audiences (bundle IDs / service IDs) — token is valid if `aud` matches ANY of these
APPLE_AUDIENCES = [
    "com.zont.r",       # React Native iOS app
    "com.zont.cab",     # Web Service ID (if configured later)
]
# Our own JWT secret for issuing access tokens to Apple-authenticated users
ZONT_JWT_SECRET = os.environ.get("JWT_SECRET", "zont-admin-secret-key-2025")
ZONT_JWT_ALG = "HS256"
ZONT_JWT_EXP_SECONDS = 60 * 60 * 24 * 30  # 30 days

# Lazy-init JWKS client (caches Apple's public keys)
_apple_jwks_client: PyJWKClient | None = None

def _get_apple_jwks_client() -> PyJWKClient:
    global _apple_jwks_client
    if _apple_jwks_client is None:
        _apple_jwks_client = PyJWKClient(APPLE_JWKS_URL, cache_keys=True, lifespan=3600)
    return _apple_jwks_client

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

class AppleLoginRequest(BaseModel):
    identityToken: str
    # Optional fields sent on FIRST sign-in only (Apple security model)
    firstName: str | None = None
    lastName: str | None = None
    email: str | None = None

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



@router.post("/booking/setup-intent")
async def create_setup_intent(request: Request):
    """Get a SetupIntent from the C# API for 3DS card authentication."""
    auth_header = request.headers.get("Authorization")
    if not auth_header:
        raise HTTPException(status_code=401, detail="Authorization required")

    try:
        async with httpx.AsyncClient(timeout=TIMEOUT) as client:
            resp = await client.get(
                f"{CSHARP_API}/api/Client/addCard",
                headers={
                    "Authorization": auth_header,
                    "Origin": "https://zont.cab",
                },
            )
            body_text = resp.text
            try:
                data = json.loads(body_text) if body_text.strip() else {}
            except (json.JSONDecodeError, ValueError):
                raise HTTPException(status_code=502, detail="Invalid response from C# API")

            if resp.status_code == 200 and data.get("client_secret"):
                return {"clientSecret": data["client_secret"]}
            raise HTTPException(status_code=resp.status_code, detail=data)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"SetupIntent error: {e}")
        raise HTTPException(status_code=502, detail="Failed to create setup intent")



@router.post("/booking/create")
async def proxy_create_booking(req: AuctionAddRequest, request: Request):
    """Create a new booking/auction in the C# backend."""
    auth_header = request.headers.get("Authorization")
    if not auth_header:
        raise HTTPException(status_code=401, detail="Authorization required")

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


def _normalize_client_cards(payload):
    """Normalize C# /api/Client/cards response into a flat list of dicts."""
    if isinstance(payload, list):
        return payload
    if isinstance(payload, dict):
        for key in ("data", "cards", "paymentMethods", "PaymentMethods", "result"):
            value = payload.get(key)
            if isinstance(value, list):
                return value
    return []


def _client_card_id(card: dict) -> Optional[str]:
    """Stripe payment method id used by mobile DELETE /api/Client/cards/{cardId}."""
    if not isinstance(card, dict):
        return None
    nested = card.get("card") if isinstance(card.get("card"), dict) else {}
    for key in ("id", "Id", "paymentMethodId", "payment_method_id", "PaymentMethodId"):
        value = card.get(key) or nested.get(key)
        if value:
            return str(value)
    return None


@router.get("/client/cards")
async def proxy_client_cards(request: Request):
    auth_header = request.headers.get("Authorization")
    if not auth_header:
        raise HTTPException(status_code=401, detail="Authorization credentials missing")
    try:
        resp = await (await get_http_client()).get(
            "/api/Client/cards",
            headers={
                "Authorization": auth_header,
                "Accept": "application/json",
                "Origin": "https://zont.cab",
                "Referer": "https://zont.cab/",
            },
        )
        if resp.status_code == 200:
            cards_raw = _normalize_client_cards(resp.json())
            mapped = []
            for c in cards_raw:
                if not isinstance(c, dict):
                    continue
                card_info = c.get("card") if isinstance(c.get("card"), dict) else {}
                card_id = _client_card_id(c)
                if not card_id:
                    continue
                mapped.append({
                    "id": card_id,
                    "brand": card_info.get("brand") or card_info.get("Brand") or c.get("brand") or "unknown",
                    "last4": card_info.get("last4") or card_info.get("Last4") or c.get("last4") or "****",
                    "exp_month": card_info.get("exp_month") or card_info.get("ExpMonth") or c.get("exp_month"),
                    "exp_year": card_info.get("exp_year") or card_info.get("ExpYear") or c.get("exp_year"),
                })
            return mapped
        return []
    except Exception as e:
        logger.error(f"Saved card profile mapping lookup failed: {e}")
        return []


@router.delete("/client/cards/{card_id}")
async def proxy_delete_card(card_id: str, request: Request):
    """Proxy mobile delete: DELETE https://api.zont.cab/api/Client/cards/{cardId}"""
    auth_header = request.headers.get("Authorization")
    if not auth_header:
        raise HTTPException(status_code=401, detail="Authorization credentials missing")
    if not card_id or not card_id.strip():
        raise HTTPException(status_code=400, detail="cardId is required")
    try:
        # Match mobile app headers exactly (Content-Type required by C# API)
        headers = {
            "Authorization": auth_header,
            "Content-Type": "application/json",
            "Accept": "application/json",
            "Origin": "https://zont.cab",
            "Referer": "https://zont.cab/",
        }
        resp = await (await get_http_client()).request(
            "DELETE",
            f"/api/Client/cards/{card_id}",
            headers=headers,
            content=b"",
        )
        if resp.status_code in (200, 201, 204):
            return {"ok": True}
        detail = "Unable to delete payment card"
        try:
            body = resp.json()
            if isinstance(body, dict):
                detail = body.get("detail") or body.get("message") or body.get("title") or detail
            elif isinstance(body, str) and body.strip():
                detail = body.strip()
        except Exception:
            text = (resp.text or "").strip()
            if text:
                detail = text[:300]
        logger.error(f"C# delete card failed status={resp.status_code} card_id={card_id} detail={detail}")
        raise HTTPException(status_code=resp.status_code, detail=detail)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Card disposal exception: {e}")
        raise HTTPException(status_code=502, detail="Financial gateway interface offline")


@router.post("/booking/create")
async def proxy_create_booking(request: Request):
    """Create a booking on C# /api/Auction/addAuction. Forwards body unchanged and returns C# error JSON."""
    auth_header = request.headers.get("Authorization")
    if not auth_header:
        raise HTTPException(status_code=401, detail="Authorization credentials missing")

    # Parse raw body — do NOT filter fields so hourly (timing), transfer, disposal all pass through
    try:
        payload = await request.json()
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON body")

    if not isinstance(payload, dict):
        raise HTTPException(status_code=400, detail="Body must be a JSON object")

    trip_type = str(payload.get("tripType", "")).lower()

    # Only rewrite legacy transfer/hourly aliases → "distance". Keep "timing" (hourly) untouched.
    if trip_type in ("transfer", "hourly"):
        payload["tripType"] = "distance"

    # For "distance" trips, convert address destination → "lat,lng" string as C# expects
    if payload.get("tripType") == "distance":
        dest = payload.get("destination", "")
        end_lat = payload.pop("endPointLatitude", None)
        end_lng = payload.pop("endPointLongitude", None)
        if dest and not all(c in "0123456789.,-+ " for c in str(dest)):
            if end_lat is not None and end_lng is not None:
                payload["destination"] = f"{end_lat},{end_lng}"

    logger.info(f"C# addAuction forward tripType={payload.get('tripType')} carType={payload.get('carType')}")

    try:
        resp = await (await get_http_client()).post(
            "/api/Auction/addAuction",
            json=payload,
            headers={
                "Authorization": auth_header,
                "Content-Type": "application/json",
                "Origin": "https://zont.cab",
                "Referer": "https://zont.cab/",
            },
            timeout=45.0,
        )
    except Exception as e:
        logger.error(f"Booking proxy connection error: {e}")
        raise HTTPException(status_code=502, detail={"error": "backend_unreachable", "message": str(e)})

    if resp.status_code in (200, 201):
        return resp.json() if resp.text else {"success": True}

    # Surface the real C# error body so the client can see what went wrong
    try:
        err_body = resp.json() if resp.text else {"message": "Empty response"}
    except (json.JSONDecodeError, ValueError):
        err_body = {"message": resp.text or "Unknown error"}
    logger.warning(f"C# addAuction rejected status={resp.status_code} body={err_body}")
    raise HTTPException(status_code=resp.status_code, detail=err_body)



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
