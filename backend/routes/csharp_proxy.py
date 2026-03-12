"""Proxy routes to forward requests to the C# backend at api.zont.cab"""
from fastapi import APIRouter, Request, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import httpx
import logging
import json

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/proxy", tags=["proxy"])

CSHARP_API = "https://api.zont.cab"
TIMEOUT = 15.0


class Coordinate(BaseModel):
    latitude: float
    longitude: float


class DistanceRequest(BaseModel):
    coordinates: List[Coordinate]
    radius: Optional[int] = 50


class PreorderRequest(BaseModel):
    coordinates: List[Coordinate]


@router.post("/distance")
async def proxy_distance(req: DistanceRequest):
    """Calculate trip pricing between two or more points."""
    try:
        coords = [{"latitude": c.latitude, "longitude": c.longitude} for c in req.coordinates]
        async with httpx.AsyncClient(timeout=TIMEOUT) as client:
            resp = await client.post(
                f"{CSHARP_API}/api/Distance",
                params={"radius": req.radius},
                json=coords,
            )
            resp.raise_for_status()
            return resp.json()
    except httpx.HTTPStatusError as e:
        logger.error(f"C# API error: {e.response.status_code} - {e.response.text}")
        raise HTTPException(status_code=e.response.status_code, detail="C# API error")
    except Exception as e:
        logger.error(f"Proxy distance error: {e}")
        raise HTTPException(status_code=502, detail="Failed to reach C# backend")


@router.post("/preorder-distance")
async def proxy_preorder_distance(req: PreorderRequest):
    """Get fixed pricing for preorder between two points."""
    try:
        coords = [{"latitude": c.latitude, "longitude": c.longitude} for c in req.coordinates]
        async with httpx.AsyncClient(timeout=TIMEOUT) as client:
            resp = await client.post(
                f"{CSHARP_API}/api/PreorderDistance/driverTypesTwo",
                json=coords,
            )
            resp.raise_for_status()
            return resp.json()
    except httpx.HTTPStatusError as e:
        logger.error(f"C# API error: {e.response.status_code} - {e.response.text}")
        raise HTTPException(status_code=e.response.status_code, detail="C# API error")
    except Exception as e:
        logger.error(f"Proxy preorder error: {e}")
        raise HTTPException(status_code=502, detail="Failed to reach C# backend")


@router.get("/trip-types")
async def proxy_trip_types():
    """Get available vehicle/trip types."""
    try:
        async with httpx.AsyncClient(timeout=TIMEOUT) as client:
            resp = await client.get(f"{CSHARP_API}/api/TripsPrice/gettypes")
            resp.raise_for_status()
            return resp.json()
    except Exception as e:
        logger.error(f"Proxy trip-types error: {e}")
        raise HTTPException(status_code=502, detail="Failed to reach C# backend")


@router.get("/vehicle-image/{image_path:path}")
async def proxy_vehicle_image(image_path: str):
    """Proxy vehicle images from C# backend."""
    try:
        async with httpx.AsyncClient(timeout=TIMEOUT) as client:
            resp = await client.get(f"{CSHARP_API}/api/File/{image_path}")
            resp.raise_for_status()
            from fastapi.responses import Response
            return Response(
                content=resp.content,
                media_type=resp.headers.get("content-type", "image/png"),
                headers={"Cache-Control": "public, max-age=86400"},
            )
    except Exception as e:
        logger.error(f"Proxy image error: {e}")
        raise HTTPException(status_code=502, detail="Image not available")


@router.post("/driver-types")
async def proxy_driver_types(coord: Coordinate):
    """Get available driver/vehicle types near a location."""
    try:
        async with httpx.AsyncClient(timeout=TIMEOUT) as client:
            resp = await client.post(
                f"{CSHARP_API}/api/Distance/driverTypesWithStatus",
                json={"latitude": coord.latitude, "longitude": coord.longitude},
            )
            resp.raise_for_status()
            return resp.json()
    except Exception as e:
        logger.error(f"Proxy driver-types error: {e}")
        raise HTTPException(status_code=502, detail="Failed to reach C# backend")


# ---- Auth Proxy Endpoints ----

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


@router.post("/auth/register-phone")
async def proxy_register_phone(req: RegisterPhoneRequest):
    """Step 1: Register phone number and get verification code."""
    try:
        async with httpx.AsyncClient(timeout=TIMEOUT) as client:
            resp = await client.post(
                f"{CSHARP_API}/api/Client/registerPhone",
                json={"phone": req.phone},
            )
            if resp.status_code == 200:
                return resp.json()
            raise HTTPException(status_code=resp.status_code, detail=resp.json() if resp.text else "Registration failed")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Register phone error: {e}")
        raise HTTPException(status_code=502, detail="Failed to reach C# backend")


@router.post("/auth/verify-phone")
async def proxy_verify_phone(req: VerifyPhoneRequest):
    """Step 2: Verify phone with SMS code."""
    try:
        async with httpx.AsyncClient(timeout=TIMEOUT) as client:
            resp = await client.post(
                f"{CSHARP_API}/api/Verification/clientVerifyPhone",
                json={"phoneNumber": req.phoneNumber, "verificationCode": req.verificationCode},
            )
            if resp.status_code == 200:
                return {"success": True}
            error_data = resp.json() if resp.text else {"error": "Verification failed"}
            raise HTTPException(status_code=resp.status_code, detail=error_data)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Verify phone error: {e}")
        raise HTTPException(status_code=502, detail="Failed to reach C# backend")


@router.post("/auth/register")
async def proxy_register_client(req: RegisterClientRequest):
    """Create client account via C# API."""
    try:
        payload = {
            "firstName": req.firstName,
            "lastName": req.lastName,
            "email": req.email or "",
            "phoneNumber": req.phoneNumber,
            "password": req.password,
            "gender": req.gender or "male",
            "dateOfBirth": "01/01/2000",
            "referalCode": "",
            "bankCards": None,
        }
        async with httpx.AsyncClient(timeout=TIMEOUT) as client:
            resp = await client.post(
                f"{CSHARP_API}/api/Client",
                json=payload,
                headers={
                    "Content-Type": "application/json",
                    "Origin": "https://zont.cab",
                    "Referer": "https://zont.cab/",
                },
            )
            if resp.status_code == 200:
                return resp.json() if resp.text else {"success": True}
            error_data = resp.json() if resp.text else {"error": "Registration failed"}
            raise HTTPException(status_code=resp.status_code, detail=error_data)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Register client error: {e}")
        raise HTTPException(status_code=502, detail="Failed to reach C# backend")


@router.post("/auth/login")
async def proxy_login(req: LoginRequest):
    """Login client via C# API."""
    try:
        async with httpx.AsyncClient(timeout=TIMEOUT) as client:
            resp = await client.post(
                f"{CSHARP_API}/api/Login/client",
                json={"username": req.username, "password": req.password},
            )
            if resp.status_code == 200:
                data = resp.json()
                return data
            error_data = resp.json() if resp.text else {"error": "Login failed"}
            raise HTTPException(status_code=resp.status_code, detail=error_data)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Login error: {e}")
        raise HTTPException(status_code=502, detail="Failed to reach C# backend")



class ForgotPasswordRequest(BaseModel):
    email: str


class ResetPasswordRequest(BaseModel):
    forgotPasswordToken: str
    newPassword: str


@router.post("/auth/forgot-password")
async def proxy_forgot_password(req: ForgotPasswordRequest, request: Request):
    """Send password reset email to client."""
    try:
        # Use the current site's host so the reset link points here, not the old site
        origin = request.headers.get("origin", "")
        if "preview.emergentagent.com" in origin:
            # Extract just the hostname from the origin
            host = origin.replace("https://", "").replace("http://", "")
        else:
            host = "zont.cab"
        async with httpx.AsyncClient(timeout=TIMEOUT) as client:
            resp = await client.get(
                f"{CSHARP_API}/api/Account/{req.email}",
                params={"host": host},
                headers={"Origin": "https://zont.cab"},
            )
            if resp.status_code == 200:
                return {"success": True, "message": "Password reset email sent"}
            error_data = resp.json() if resp.text else {"error": "Failed to send reset email"}
            raise HTTPException(status_code=resp.status_code, detail=error_data)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Forgot password error: {e}")
        raise HTTPException(status_code=502, detail="Failed to reach C# backend")


@router.post("/auth/reset-password")
async def proxy_reset_password(req: ResetPasswordRequest):
    """Reset password with token received by email."""
    try:
        async with httpx.AsyncClient(timeout=TIMEOUT) as client:
            resp = await client.post(
                f"{CSHARP_API}/api/Account",
                json={"forgotPasswordToken": req.forgotPasswordToken, "newPassword": req.newPassword},
                headers={"Origin": "https://zont.cab", "Content-Type": "application/json"},
            )
            if resp.status_code == 200:
                return {"success": True, "message": "Password reset successfully"}
            error_data = resp.json() if resp.text else {"error": "Failed to reset password"}
            raise HTTPException(status_code=resp.status_code, detail=error_data)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Reset password error: {e}")
        raise HTTPException(status_code=502, detail="Failed to reach C# backend")


@router.get("/auth/send-verification")
async def proxy_send_verification(email: str):
    """Send email verification to client after registration."""
    try:
        async with httpx.AsyncClient(timeout=TIMEOUT) as client:
            resp = await client.get(
                f"{CSHARP_API}/api/Verification/clientVerifyEmail",
                params={"email": email, "host": "zont.cab"},
                headers={"Origin": "https://zont.cab"},
            )
            if resp.status_code == 200:
                return {"success": True, "message": "Verification email sent"}
            error_data = resp.json() if resp.text else {"error": "Failed to send verification"}
            raise HTTPException(status_code=resp.status_code, detail=error_data)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Send verification error: {e}")
        raise HTTPException(status_code=502, detail="Failed to reach C# backend")


@router.get("/auth/verify/{code}")
async def proxy_verify_code(code: str):
    """Verify email with the code received by email."""
    try:
        async with httpx.AsyncClient(timeout=TIMEOUT) as client:
            resp = await client.get(
                f"{CSHARP_API}/api/Verification/verify/{code}",
                headers={"Origin": "https://zont.cab"},
            )
            if resp.status_code == 200:
                data = resp.json() if resp.text else {}
                return {"success": True, **data}
            error_data = resp.json() if resp.text else {"error": "Invalid code"}
            raise HTTPException(status_code=resp.status_code, detail=error_data)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Verify code error: {e}")
        raise HTTPException(status_code=502, detail="Failed to reach C# backend")


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


@router.post("/booking/create")
async def proxy_create_booking(req: AuctionAddRequest, request: Request):
    """Create a new booking/auction in the C# backend."""
    auth_header = request.headers.get("Authorization")
    if not auth_header:
        raise HTTPException(status_code=401, detail="Authorization required")

    try:
        payload = req.dict(exclude_none=True)
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(
                f"{CSHARP_API}/api/Auction/addAuction",
                json=payload,
                headers={
                    "Authorization": auth_header,
                    "Content-Type": "application/json",
                    "Origin": "https://zont.cab",
                },
            )
            body_text = resp.text
            logger.info(f"C# addAuction response: status={resp.status_code} body={body_text[:500]}")

            try:
                data = json.loads(body_text) if body_text.strip() else {}
            except (json.JSONDecodeError, ValueError):
                data = {"raw": body_text}

            # Check for 3DS / requires_action in the response
            client_secret = None
            requires_action = False
            if isinstance(data, dict):
                client_secret = data.get("client_secret") or data.get("clientSecret")
                status = data.get("status", "")
                requires_action = status == "requires_action" or "requires_action" in str(data)
                # Check nested payment_intent
                pi = data.get("payment_intent") or data.get("paymentIntent") or {}
                if isinstance(pi, dict):
                    client_secret = client_secret or pi.get("client_secret")
                    requires_action = requires_action or pi.get("status") == "requires_action"

            if resp.status_code in (200, 201):
                result = {"success": True, "data": data}
                if client_secret:
                    result["clientSecret"] = client_secret
                    result["requiresAction"] = True
                return result

            # For non-200 responses that need 3DS
            if client_secret or requires_action:
                return {
                    "success": False,
                    "requiresAction": True,
                    "clientSecret": client_secret,
                    "data": data,
                }

            error_msg = data if isinstance(data, dict) else {"error": str(data) or "Booking failed"}
            logger.error(f"C# booking error: {resp.status_code} - {error_msg}")
            raise HTTPException(status_code=resp.status_code, detail=error_msg)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Proxy booking error: {e}")
        raise HTTPException(status_code=502, detail="Failed to reach C# backend")


@router.get("/booking/upcoming")
async def proxy_upcoming_auctions(request: Request):
    """Get upcoming auctions for the logged-in client."""
    auth_header = request.headers.get("Authorization")
    if not auth_header:
        raise HTTPException(status_code=401, detail="Authorization required")

    try:
        async with httpx.AsyncClient(timeout=TIMEOUT) as client:
            resp = await client.get(
                f"{CSHARP_API}/api/Auction/client/upcomingAuctions",
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
