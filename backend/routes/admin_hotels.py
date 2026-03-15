from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime, timezone
import uuid
import jwt
import os
from passlib.context import CryptContext

router = APIRouter(prefix="/api/admin/hotels", tags=["admin-hotels"])
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
SECRET_KEY = os.environ.get("JWT_SECRET", "zont-admin-secret-key-2025")

# ── Auth helper ──
async def require_admin(request: Request):
    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
        raise HTTPException(401, "Token requis")
    try:
        payload = jwt.decode(auth[7:], SECRET_KEY, algorithms=["HS256"])
        if payload.get("role") not in ("admin", "manager"):
            raise HTTPException(403, "Acces refuse")
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(401, "Token expire")
    except jwt.InvalidTokenError:
        raise HTTPException(401, "Token invalide")

# ── Models ──
class HotelCreate(BaseModel):
    name: str
    hotel_group: str = ""
    address: str = ""
    city: str = ""
    postal_code: str = ""
    country: str = "France"
    rooms: int = 0
    contact_name: str = ""
    contact_role: str = ""
    contact_phone: str = ""
    contact_email: str = ""
    commission_rate: float = 15.0
    zont_commission_rate: float = 10.0
    status: str = "active"
    kiosks_planned: int = 0
    notes: str = ""

class HotelUpdate(BaseModel):
    name: Optional[str] = None
    hotel_group: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    postal_code: Optional[str] = None
    country: Optional[str] = None
    rooms: Optional[int] = None
    contact_name: Optional[str] = None
    contact_role: Optional[str] = None
    contact_phone: Optional[str] = None
    contact_email: Optional[str] = None
    commission_rate: Optional[float] = None
    zont_commission_rate: Optional[float] = None
    status: Optional[str] = None
    kiosks_planned: Optional[int] = None
    notes: Optional[str] = None

class KioskCreate(BaseModel):
    hotel_id: str
    name: str = ""
    location: str = ""

class HotelBookingCreate(BaseModel):
    hotel_id: str
    kiosk_id: Optional[str] = None
    client_name: str = ""
    client_phone: str = ""
    client_email: str = ""
    client_language: str = "fr"
    service_type: str = "transfer"
    pickup_address: str = ""
    dropoff_address: str = ""
    ride_date: str = ""
    ride_time: str = ""
    vehicle_type: str = "sedan"
    total_price: float = 0
    payment_method: str = "card"

# ── Hotels CRUD ──
@router.get("")
async def list_hotels(request: Request):
    await require_admin(request)
    db = request.app.state.db
    hotels = await db.hotels.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)
    # Enrich with booking stats
    for h in hotels:
        stats = await db.hotel_bookings.aggregate([
            {"$match": {"hotel_id": h["id"], "status": {"$in": ["completed", "confirmed", "assigned"]}}},
            {"$group": {"_id": None, "count": {"$sum": 1}, "revenue": {"$sum": "$total_price"}}},
        ]).to_list(1)
        s = stats[0] if stats else {"count": 0, "revenue": 0}
        h["total_bookings"] = s["count"]
        h["total_revenue"] = round(s["revenue"], 2)
        h["hotel_commission_total"] = round(s["revenue"] * h.get("commission_rate", 0) / 100, 2)
        h["zont_commission_total"] = round(s["revenue"] * h.get("zont_commission_rate", 0) / 100, 2)
        # Kiosk count
        h["kiosks_count"] = await db.kiosks.count_documents({"hotel_id": h["id"]})
        h["kiosks_online"] = await db.kiosks.count_documents({"hotel_id": h["id"], "status": "online"})
    return hotels

@router.post("")
async def create_hotel(data: HotelCreate, request: Request):
    await require_admin(request)
    db = request.app.state.db
    hotel_id = str(uuid.uuid4())[:8]
    now = datetime.now(timezone.utc).isoformat()
    doc = {
        "id": hotel_id,
        **data.model_dump(),
        "created_at": now,
        "updated_at": now,
    }
    await db.hotels.insert_one(doc)
    # Auto-create hotel admin user
    if data.contact_email:
        existing = await db.hotel_users.find_one({"email": data.contact_email})
        if not existing:
            pwd = f"hotel{hotel_id}"
            user_doc = {
                "id": str(uuid.uuid4()),
                "hotel_id": hotel_id,
                "email": data.contact_email,
                "password_hash": pwd_context.hash(pwd),
                "name": data.contact_name or data.name,
                "role": "hotel_admin",
                "created_at": now,
            }
            await db.hotel_users.insert_one(user_doc)
    doc.pop("_id", None)
    return doc

@router.get("/dashboard")
async def hotel_dashboard_stats(request: Request):
    await require_admin(request)
    db = request.app.state.db
    now = datetime.now(timezone.utc)
    month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0).isoformat()
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0).isoformat()

    total_hotels = await db.hotels.count_documents({})
    active_hotels = await db.hotels.count_documents({"status": "active"})
    total_kiosks = await db.kiosks.count_documents({})
    kiosks_online = await db.kiosks.count_documents({"status": "online"})
    bookings_today = await db.hotel_bookings.count_documents({"created_at": {"$gte": today_start}})
    bookings_month = await db.hotel_bookings.count_documents({"created_at": {"$gte": month_start}})

    rev_agg = await db.hotel_bookings.aggregate([
        {"$match": {"status": {"$in": ["completed", "confirmed", "assigned"]}}},
        {"$group": {"_id": None, "total": {"$sum": "$total_price"}, "count": {"$sum": 1}}},
    ]).to_list(1)
    rev = rev_agg[0] if rev_agg else {"total": 0, "count": 0}

    # Calculate commissions from all hotels
    hotels = await db.hotels.find({}, {"_id": 0, "id": 1, "commission_rate": 1, "zont_commission_rate": 1}).to_list(500)
    hotel_map = {h["id"]: h for h in hotels}

    commission_agg = await db.hotel_bookings.aggregate([
        {"$match": {"status": {"$in": ["completed", "confirmed", "assigned"]}}},
        {"$group": {"_id": "$hotel_id", "revenue": {"$sum": "$total_price"}}},
    ]).to_list(500)

    total_hotel_commissions = 0
    total_zont_commissions = 0
    for c in commission_agg:
        h = hotel_map.get(c["_id"], {})
        total_hotel_commissions += c["revenue"] * h.get("commission_rate", 0) / 100
        total_zont_commissions += c["revenue"] * h.get("zont_commission_rate", 0) / 100

    # Monthly revenue for chart (last 6 months)
    monthly_rev = await db.hotel_bookings.aggregate([
        {"$match": {"status": {"$in": ["completed", "confirmed", "assigned"]}}},
        {"$addFields": {"month": {"$substr": ["$created_at", 0, 7]}}},
        {"$group": {"_id": "$month", "revenue": {"$sum": "$total_price"}, "count": {"$sum": 1}}},
        {"$sort": {"_id": -1}},
        {"$limit": 6},
    ]).to_list(6)

    return {
        "total_hotels": total_hotels,
        "active_hotels": active_hotels,
        "total_kiosks": total_kiosks,
        "kiosks_online": kiosks_online,
        "bookings_today": bookings_today,
        "bookings_month": bookings_month,
        "total_revenue": round(rev["total"], 2),
        "total_bookings": rev["count"],
        "total_hotel_commissions": round(total_hotel_commissions, 2),
        "total_zont_commissions": round(total_zont_commissions, 2),
        "monthly_revenue": list(reversed(monthly_rev)),
    }

@router.get("/{hotel_id}")
async def get_hotel(hotel_id: str, request: Request):
    await require_admin(request)
    db = request.app.state.db
    hotel = await db.hotels.find_one({"id": hotel_id}, {"_id": 0})
    if not hotel:
        raise HTTPException(404, "Hotel introuvable")
    # Enrich
    stats = await db.hotel_bookings.aggregate([
        {"$match": {"hotel_id": hotel_id, "status": {"$in": ["completed", "confirmed", "assigned"]}}},
        {"$group": {"_id": None, "count": {"$sum": 1}, "revenue": {"$sum": "$total_price"}}},
    ]).to_list(1)
    s = stats[0] if stats else {"count": 0, "revenue": 0}
    hotel["total_bookings"] = s["count"]
    hotel["total_revenue"] = round(s["revenue"], 2)
    hotel["hotel_commission_total"] = round(s["revenue"] * hotel.get("commission_rate", 0) / 100, 2)
    hotel["zont_commission_total"] = round(s["revenue"] * hotel.get("zont_commission_rate", 0) / 100, 2)
    hotel["kiosks"] = await db.kiosks.find({"hotel_id": hotel_id}, {"_id": 0}).to_list(50)
    hotel["recent_bookings"] = await db.hotel_bookings.find({"hotel_id": hotel_id}, {"_id": 0}).sort("created_at", -1).to_list(20)
    return hotel

@router.put("/{hotel_id}")
async def update_hotel(hotel_id: str, data: HotelUpdate, request: Request):
    await require_admin(request)
    db = request.app.state.db
    updates = {k: v for k, v in data.model_dump().items() if v is not None}
    if not updates:
        raise HTTPException(400, "Rien a mettre a jour")
    updates["updated_at"] = datetime.now(timezone.utc).isoformat()
    result = await db.hotels.update_one({"id": hotel_id}, {"$set": updates})
    if result.matched_count == 0:
        raise HTTPException(404, "Hotel introuvable")
    return await db.hotels.find_one({"id": hotel_id}, {"_id": 0})

@router.delete("/{hotel_id}")
async def delete_hotel(hotel_id: str, request: Request):
    await require_admin(request)
    db = request.app.state.db
    result = await db.hotels.delete_one({"id": hotel_id})
    if result.deleted_count == 0:
        raise HTTPException(404, "Hotel introuvable")
    return {"ok": True}

# ── Kiosks ──
@router.post("/kiosks/create")
async def create_kiosk(data: KioskCreate, request: Request):
    await require_admin(request)
    db = request.app.state.db
    hotel = await db.hotels.find_one({"id": data.hotel_id})
    if not hotel:
        raise HTTPException(404, "Hotel introuvable")
    kiosk_doc = {
        "id": str(uuid.uuid4())[:8],
        "hotel_id": data.hotel_id,
        "name": data.name or f"Borne-{data.hotel_id[:4]}",
        "location": data.location,
        "status": "online",
        "installed_at": datetime.now(timezone.utc).isoformat(),
        "last_sync": datetime.now(timezone.utc).isoformat(),
        "total_bookings": 0,
    }
    await db.kiosks.insert_one(kiosk_doc)
    kiosk_doc.pop("_id", None)
    return kiosk_doc

@router.get("/kiosks/all")
async def list_kiosks(request: Request):
    await require_admin(request)
    db = request.app.state.db
    kiosks = await db.kiosks.find({}, {"_id": 0}).to_list(500)
    # Add hotel name
    hotel_ids = list(set(k["hotel_id"] for k in kiosks))
    hotels = await db.hotels.find({"id": {"$in": hotel_ids}}, {"_id": 0, "id": 1, "name": 1}).to_list(500)
    hmap = {h["id"]: h["name"] for h in hotels}
    for k in kiosks:
        k["hotel_name"] = hmap.get(k["hotel_id"], "Inconnu")
    return kiosks

# ── Hotel Bookings ──
@router.get("/bookings/all")
async def list_hotel_bookings(request: Request):
    await require_admin(request)
    db = request.app.state.db
    bookings = await db.hotel_bookings.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)
    # Add hotel name and commissions
    hotel_ids = list(set(b["hotel_id"] for b in bookings))
    hotels = await db.hotels.find({"id": {"$in": hotel_ids}}, {"_id": 0, "id": 1, "name": 1, "commission_rate": 1, "zont_commission_rate": 1}).to_list(500)
    hmap = {h["id"]: h for h in hotels}
    for b in bookings:
        h = hmap.get(b["hotel_id"], {})
        b["hotel_name"] = h.get("name", "Inconnu")
        rate_h = h.get("commission_rate", 0)
        rate_z = h.get("zont_commission_rate", 0)
        price = b.get("total_price", 0)
        b["hotel_commission"] = round(price * rate_h / 100, 2)
        b["zont_commission"] = round(price * rate_z / 100, 2)
        b["driver_amount"] = round(price - b["hotel_commission"] - b["zont_commission"], 2)
    return bookings

@router.post("/bookings/create")
async def create_hotel_booking(data: HotelBookingCreate, request: Request):
    await require_admin(request)
    db = request.app.state.db
    hotel = await db.hotels.find_one({"id": data.hotel_id}, {"_id": 0})
    if not hotel:
        raise HTTPException(404, "Hotel introuvable")
    now = datetime.now(timezone.utc).isoformat()
    booking_doc = {
        "id": f"HB-{str(uuid.uuid4())[:8]}",
        **data.model_dump(),
        "status": "pending",
        "hotel_commission_rate": hotel.get("commission_rate", 0),
        "zont_commission_rate": hotel.get("zont_commission_rate", 0),
        "created_at": now,
        "updated_at": now,
    }
    await db.hotel_bookings.insert_one(booking_doc)
    booking_doc.pop("_id", None)
    return booking_doc

# ── Seed demo data ──
@router.post("/seed")
async def seed_demo_data(request: Request):
    await require_admin(request)
    db = request.app.state.db
    existing = await db.hotels.count_documents({})
    if existing > 0:
        return {"message": f"{existing} hotels deja presents, seed ignore"}

    now = datetime.now(timezone.utc).isoformat()
    import random

    demo_hotels = [
        {"name": "Hotel Le Bristol Paris", "hotel_group": "Oetker Collection", "city": "Paris", "country": "France", "rooms": 190, "contact_name": "Jean Martin", "contact_email": "admin@bristol.fr", "commission_rate": 15, "zont_commission_rate": 10, "address": "112 Rue du Faubourg Saint-Honore", "postal_code": "75008"},
        {"name": "Hotel Negresco Nice", "hotel_group": "Independant", "city": "Nice", "country": "France", "rooms": 96, "contact_name": "Marie Dupont", "contact_email": "admin@negresco.fr", "commission_rate": 12, "zont_commission_rate": 10, "address": "37 Promenade des Anglais", "postal_code": "06000"},
        {"name": "W Barcelona", "hotel_group": "Marriott", "city": "Barcelone", "country": "Espagne", "rooms": 473, "contact_name": "Carlos Garcia", "contact_email": "admin@wbarcelona.es", "commission_rate": 18, "zont_commission_rate": 10, "address": "Plaça de la Rosa dels Vents", "postal_code": "08039"},
    ]

    services = ["Transfer aeroport", "Transfer gare", "Mise a disposition", "Transfer interurbain"]
    statuses = ["pending", "confirmed", "assigned", "completed", "completed", "completed", "cancelled"]
    vehicles = ["sedan", "van", "premium", "minibus"]

    for h_data in demo_hotels:
        hotel_id = str(uuid.uuid4())[:8]
        hotel_doc = {"id": hotel_id, **h_data, "status": "active", "contact_role": "Directeur", "contact_phone": "+33600000000", "kiosks_planned": 2, "notes": "", "created_at": now, "updated_at": now}
        await db.hotels.insert_one(hotel_doc)

        # Create hotel admin
        await db.hotel_users.insert_one({
            "id": str(uuid.uuid4()), "hotel_id": hotel_id, "email": h_data["contact_email"],
            "password_hash": pwd_context.hash(f"hotel{hotel_id}"),
            "name": h_data["contact_name"], "role": "hotel_admin", "created_at": now,
        })

        # Create kiosk
        await db.kiosks.insert_one({
            "id": str(uuid.uuid4())[:8], "hotel_id": hotel_id,
            "name": f"Borne Lobby - {h_data['name'][:15]}", "location": "Lobby principal",
            "status": "online", "installed_at": now, "last_sync": now, "total_bookings": 0,
        })

        # Create demo bookings (15-30 per hotel)
        num_bookings = random.randint(15, 30)
        for j in range(num_bookings):
            days_ago = random.randint(0, 90)
            bk_date = datetime(2026, 3, 15, tzinfo=timezone.utc).replace(day=max(1, 15 - days_ago % 28), month=max(1, 3 - days_ago // 30))
            price = round(random.uniform(35, 250), 2)
            status = random.choice(statuses)
            await db.hotel_bookings.insert_one({
                "id": f"HB-{str(uuid.uuid4())[:8]}", "hotel_id": hotel_id, "kiosk_id": None,
                "client_name": f"Client {j+1}", "client_phone": f"+336{random.randint(10000000,99999999)}",
                "client_email": f"client{j+1}@email.com", "client_language": random.choice(["fr", "en", "ru"]),
                "service_type": random.choice(services), "pickup_address": f"Hotel {h_data['name']}",
                "dropoff_address": f"Aeroport {h_data['city']}", "ride_date": bk_date.strftime("%Y-%m-%d"),
                "ride_time": f"{random.randint(6,22)}:{random.choice(['00','15','30','45'])}",
                "vehicle_type": random.choice(vehicles), "total_price": price,
                "payment_method": "card", "status": status,
                "hotel_commission_rate": h_data["commission_rate"], "zont_commission_rate": 10,
                "created_at": bk_date.isoformat(), "updated_at": bk_date.isoformat(),
            })

    return {"message": "3 hotels + bornes + reservations de demo crees"}
