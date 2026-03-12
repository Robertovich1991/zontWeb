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


class ReviewCreate(BaseModel):
    rating: int  # 1-5
    comment: str = ""


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


class RouteRequest(BaseModel):
    origin: str
    destination: str


@router.post("/calculate-route")
async def calculate_route(req: RouteRequest, request: Request):
    """Calculate distance and duration between two addresses using Google Directions API."""
    await get_current_partner(request)
    google_key = os.environ.get("GOOGLE_MAPS_KEY", "")
    if not google_key:
        raise HTTPException(status_code=500, detail="Google Maps API key not configured")
    try:
        async with httpx.AsyncClient(timeout=TIMEOUT) as client:
            resp = await client.get(
                "https://maps.googleapis.com/maps/api/directions/json",
                params={"origin": req.origin, "destination": req.destination, "key": google_key},
            )
            data = resp.json()
            if data.get("status") != "OK" or not data.get("routes"):
                return {"status": "error", "message": "Route not found"}
            leg = data["routes"][0]["legs"][0]
            return {
                "status": "ok",
                "distance": leg["distance"]["text"],
                "distance_meters": leg["distance"]["value"],
                "duration": leg["duration"]["text"],
                "duration_seconds": leg["duration"]["value"],
                "start_address": leg["start_address"],
                "end_address": leg["end_address"],
                "overview_polyline": data["routes"][0].get("overview_polyline", {}).get("points", ""),
            }
    except Exception as e:
        logger.error(f"Route calculation error: {e}")
        raise HTTPException(status_code=502, detail="Failed to calculate route")


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


@router.get("/available-rides")
async def get_available_rides(request: Request):
    """Get pending rides from OTHER partners (visible to all authenticated partners)."""
    user = await get_current_partner(request)
    db = request.app.state.db
    rides = await db.partner_rides.find(
        {"status": "pending", "partner_id": {"$ne": user["sub"]}}, {"_id": 0}
    ).sort("created_at", -1).to_list(100)
    return rides


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


# ---- Reviews ----

@router.post("/rides/{ride_id}/review")
async def create_review(ride_id: str, review: ReviewCreate, request: Request):
    """Rate a driver after a completed ride. 1-4 stars require a comment."""
    user = await get_current_partner(request)
    db = request.app.state.db

    ride = await db.partner_rides.find_one({"id": ride_id, "partner_id": user["sub"]}, {"_id": 0})
    if not ride:
        raise HTTPException(status_code=404, detail="Ride not found")
    if ride["status"] != "completed":
        raise HTTPException(status_code=400, detail="La course doit etre terminee pour laisser un avis")

    existing = await db.reviews.find_one({"ride_id": ride_id})
    if existing:
        raise HTTPException(status_code=400, detail="Avis deja laisse pour cette course")

    if review.rating < 1 or review.rating > 5:
        raise HTTPException(status_code=400, detail="La note doit etre entre 1 et 5")
    if review.rating < 5 and not review.comment.strip():
        raise HTTPException(status_code=400, detail="Un commentaire est obligatoire pour une note inferieure a 5 etoiles")

    review_doc = {
        "id": str(uuid.uuid4()),
        "ride_id": ride_id,
        "partner_id": user["sub"],
        "partner_name": user.get("name", ""),
        "rating": review.rating,
        "comment": review.comment.strip(),
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.reviews.insert_one(review_doc)
    review_doc.pop("_id", None)

    # Update ride with review info
    await db.partner_rides.update_one({"id": ride_id}, {"$set": {
        "reviewed": True, "review_rating": review.rating,
    }})

    return review_doc


@router.get("/rides/{ride_id}/review")
async def get_ride_review(ride_id: str, request: Request):
    """Get review for a specific ride."""
    await get_current_partner(request)
    db = request.app.state.db
    review = await db.reviews.find_one({"ride_id": ride_id}, {"_id": 0})
    if not review:
        raise HTTPException(status_code=404, detail="No review found")
    return review


@router.get("/reviews/my")
async def get_my_reviews(request: Request):
    """Get all reviews left by the current partner."""
    user = await get_current_partner(request)
    db = request.app.state.db
    reviews = await db.reviews.find({"partner_id": user["sub"]}, {"_id": 0}).sort("created_at", -1).to_list(200)
    return reviews


@router.get("/reviews/stats/{partner_id}")
async def get_partner_review_stats(partner_id: str, request: Request):
    """Get review stats for a partner (average rating, total reviews)."""
    await get_current_partner(request)
    db = request.app.state.db
    reviews = await db.reviews.find({"partner_id": partner_id}, {"_id": 0}).to_list(500)
    if not reviews:
        return {"average_rating": 0, "total_reviews": 0, "ratings": {}}
    total = len(reviews)
    avg = sum(r["rating"] for r in reviews) / total
    ratings = {}
    for i in range(1, 6):
        ratings[str(i)] = len([r for r in reviews if r["rating"] == i])
    return {"average_rating": round(avg, 1), "total_reviews": total, "ratings": ratings}


@router.get("/admin/reviews")
async def admin_list_reviews(request: Request):
    """List all reviews (admin only)."""
    from middleware.auth import require_admin
    await require_admin(request)
    db = request.app.state.db
    reviews = await db.reviews.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)
    return reviews
