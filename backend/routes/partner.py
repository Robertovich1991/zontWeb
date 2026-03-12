"""Partner authentication and rides management routes."""
from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from passlib.context import CryptContext
from datetime import datetime, timezone, timedelta
from typing import Optional, List
import jwt
import os
import uuid
import httpx
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/partner", tags=["partner"])
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
SECRET_KEY = os.environ.get("JWT_SECRET", "zont-admin-secret-key-2025")
CSHARP_API = "https://api.zont.cab"
TIMEOUT = httpx.Timeout(15.0)


# ---- Models ----

class PartnerLogin(BaseModel):
    email: str
    password: str

class PartnerOut(BaseModel):
    id: str
    email: str
    name: str
    phone: str
    company: str
    status: str

class RideCreate(BaseModel):
    pickup_address: str
    pickup_lat: Optional[float] = None
    pickup_lng: Optional[float] = None
    dropoff_address: str
    dropoff_lat: Optional[float] = None
    dropoff_lng: Optional[float] = None
    vehicle_category_id: str
    vehicle_category_name: str
    proposed_price: float
    currency: str = "EUR"
    passenger_name: Optional[str] = ""
    passenger_phone: Optional[str] = ""
    pickup_datetime: Optional[str] = ""
    notes: Optional[str] = ""
    flight_number: Optional[str] = ""

class RideUpdate(BaseModel):
    status: Optional[str] = None
    admin_notes: Optional[str] = None


def create_partner_token(data: dict):
    expire = datetime.now(timezone.utc) + timedelta(days=7)
    return jwt.encode({**data, "exp": expire, "type": "partner"}, SECRET_KEY, algorithm="HS256")


async def get_current_partner(request: Request):
    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")
    token = auth.split(" ")[1]
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        if payload.get("type") != "partner":
            raise HTTPException(status_code=403, detail="Not a partner token")
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")


# ---- Partner Auth ----

@router.post("/auth/login")
async def partner_login(req: PartnerLogin, request: Request):
    db = request.app.state.db
    partner = await db.partners.find_one({"email": req.email}, {"_id": 0})
    if not partner or not pwd_context.verify(req.password, partner["password_hash"]):
        raise HTTPException(status_code=401, detail="Identifiants incorrects")
    if partner.get("status") != "active":
        raise HTTPException(status_code=403, detail="Compte desactive")
    token = create_partner_token({
        "sub": partner["id"], "email": partner["email"],
        "name": partner["name"], "company": partner.get("company", "")
    })
    await db.partners.update_one({"id": partner["id"]}, {"$set": {"last_login": datetime.now(timezone.utc).isoformat()}})
    return {
        "token": token,
        "partner": {
            "id": partner["id"], "email": partner["email"],
            "name": partner["name"], "phone": partner.get("phone", ""),
            "company": partner.get("company", ""), "status": partner["status"]
        }
    }


@router.get("/auth/me")
async def partner_me(request: Request):
    user = await get_current_partner(request)
    db = request.app.state.db
    partner = await db.partners.find_one({"id": user["sub"]}, {"_id": 0, "password_hash": 0})
    if not partner:
        raise HTTPException(status_code=404, detail="Partner not found")
    return partner


# ---- Vehicle Categories (from C#) ----

@router.get("/vehicle-categories")
async def get_vehicle_categories(request: Request):
    await get_current_partner(request)
    try:
        async with httpx.AsyncClient(timeout=TIMEOUT) as client:
            resp = await client.get(f"{CSHARP_API}/api/TripsPrice/gettypes")
            resp.raise_for_status()
            data = resp.json()
            # Normalize: C# returns a list of strings
            if isinstance(data, list) and len(data) > 0 and isinstance(data[0], str):
                return [{"id": str(i), "name": name.strip()} for i, name in enumerate(data)]
            return data
    except Exception as e:
        logger.error(f"Vehicle categories error: {e}")
        raise HTTPException(status_code=502, detail="Failed to fetch vehicle categories")


# ---- Rides CRUD ----

@router.post("/rides")
async def create_ride(ride: RideCreate, request: Request):
    user = await get_current_partner(request)
    db = request.app.state.db
    ride_doc = {
        "id": str(uuid.uuid4()),
        "partner_id": user["sub"],
        "partner_name": user.get("name", ""),
        "partner_company": user.get("company", ""),
        **ride.model_dump(),
        "status": "pending",
        "admin_notes": "",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.partner_rides.insert_one(ride_doc)
    ride_doc.pop("_id", None)
    return ride_doc


@router.get("/rides")
async def get_my_rides(request: Request):
    user = await get_current_partner(request)
    db = request.app.state.db
    rides = await db.partner_rides.find(
        {"partner_id": user["sub"]}, {"_id": 0}
    ).sort("created_at", -1).to_list(200)
    return rides


@router.get("/rides/{ride_id}")
async def get_ride(ride_id: str, request: Request):
    user = await get_current_partner(request)
    db = request.app.state.db
    ride = await db.partner_rides.find_one(
        {"id": ride_id, "partner_id": user["sub"]}, {"_id": 0}
    )
    if not ride:
        raise HTTPException(status_code=404, detail="Ride not found")
    return ride


# ---- Admin endpoints for partners & rides ----

@router.get("/admin/partners")
async def admin_list_partners(request: Request):
    from middleware.auth import require_admin
    await require_admin(request)
    db = request.app.state.db
    partners = await db.partners.find({}, {"_id": 0, "password_hash": 0}).sort("created_at", -1).to_list(500)
    return partners


@router.post("/admin/partners")
async def admin_create_partner(request: Request):
    from middleware.auth import require_admin
    await require_admin(request)
    db = request.app.state.db
    body = await request.json()
    existing = await db.partners.find_one({"email": body["email"]})
    if existing:
        raise HTTPException(status_code=400, detail="Email deja utilise")
    partner_doc = {
        "id": str(uuid.uuid4()),
        "email": body["email"],
        "password_hash": pwd_context.hash(body["password"]),
        "name": body.get("name", ""),
        "phone": body.get("phone", ""),
        "company": body.get("company", ""),
        "status": "active",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "last_login": None,
    }
    await db.partners.insert_one(partner_doc)
    partner_doc.pop("_id", None)
    partner_doc.pop("password_hash", None)
    return partner_doc


@router.put("/admin/partners/{partner_id}")
async def admin_update_partner(partner_id: str, request: Request):
    from middleware.auth import require_admin
    await require_admin(request)
    db = request.app.state.db
    body = await request.json()
    update = {}
    for field in ["name", "phone", "company", "status"]:
        if field in body:
            update[field] = body[field]
    if "password" in body and body["password"]:
        update["password_hash"] = pwd_context.hash(body["password"])
    if not update:
        raise HTTPException(status_code=400, detail="Nothing to update")
    result = await db.partners.update_one({"id": partner_id}, {"$set": update})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Partner not found")
    return {"success": True}


@router.delete("/admin/partners/{partner_id}")
async def admin_delete_partner(partner_id: str, request: Request):
    from middleware.auth import require_admin
    await require_admin(request)
    db = request.app.state.db
    result = await db.partners.delete_one({"id": partner_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Partner not found")
    return {"success": True}


@router.get("/admin/rides")
async def admin_list_rides(request: Request):
    from middleware.auth import require_admin
    await require_admin(request)
    db = request.app.state.db
    rides = await db.partner_rides.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)
    return rides


@router.put("/admin/rides/{ride_id}")
async def admin_update_ride(ride_id: str, update: RideUpdate, request: Request):
    from middleware.auth import require_admin
    await require_admin(request)
    db = request.app.state.db
    changes = {k: v for k, v in update.model_dump().items() if v is not None}
    changes["updated_at"] = datetime.now(timezone.utc).isoformat()
    result = await db.partner_rides.update_one({"id": ride_id}, {"$set": changes})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Ride not found")
    return {"success": True}
