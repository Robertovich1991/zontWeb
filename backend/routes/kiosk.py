"""Kiosk API for hotel lobby self-service booking terminals."""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timezone
import httpx
import logging
import secrets
import string

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/kiosk", tags=["kiosk"])

CSHARP_API = "https://api.zont.cab"
TIMEOUT = 15.0

db = None

def set_db(database):
    global db
    db = database


# ---------- Models ----------

class KioskBookingRequest(BaseModel):
    hotelSlug: str
    clientName: str
    clientPhone: str
    destination: str
    destinationAddress: str
    date: str
    time: str
    vehicleType: str
    price: float
    passengers: int = 1


# ---------- Helpers ----------

def gen_reference():
    return "ZK-" + ''.join(secrets.choice(string.ascii_uppercase + string.digits) for _ in range(5))


POPULAR_DESTINATIONS = [
    {"name": "CDG Terminal 1", "address": "Aeroport Charles de Gaulle T1, 95700 Roissy-en-France", "lat": 49.0097, "lng": 2.5479, "icon": "plane"},
    {"name": "CDG Terminal 2", "address": "Aeroport Charles de Gaulle T2, 95700 Roissy-en-France", "lat": 49.0036, "lng": 2.5710, "icon": "plane"},
    {"name": "Orly Aeroport", "address": "Aeroport d'Orly, 94390 Orly", "lat": 48.7262, "lng": 2.3652, "icon": "plane"},
    {"name": "Gare de Lyon", "address": "Gare de Lyon, 75012 Paris", "lat": 48.8443, "lng": 2.3743, "icon": "train"},
    {"name": "Gare du Nord", "address": "Gare du Nord, 75010 Paris", "lat": 48.8809, "lng": 2.3553, "icon": "train"},
    {"name": "Disneyland Paris", "address": "Disneyland Paris, 77700 Marne-la-Vallee", "lat": 48.8674, "lng": 2.7836, "icon": "star"},
]


async def ensure_demo_hotel():
    """Create a demo hotel if none exist."""
    if db is None:
        return
    count = await db.kiosk_hotels.count_documents({})
    if count == 0:
        await db.kiosk_hotels.insert_one({
            "slug": "bristol",
            "name": "Hotel Le Bristol Paris",
            "address": "112 Rue du Faubourg Saint-Honore, 75008 Paris",
            "lat": 48.8718,
            "lng": 2.3161,
            "destinations": POPULAR_DESTINATIONS,
            "createdAt": datetime.now(timezone.utc).isoformat(),
        })
        logger.info("Demo kiosk hotel 'bristol' created")


# ---------- Endpoints ----------

@router.get("/{slug}")
async def get_hotel_kiosk(slug: str):
    """Get hotel info for kiosk display."""
    if db is None:
        raise HTTPException(500, "Database not available")
    hotel = await db.kiosk_hotels.find_one({"slug": slug}, {"_id": 0})
    if not hotel:
        raise HTTPException(404, "Hotel not found")
    return hotel


@router.post("/{slug}/prices")
async def get_kiosk_prices(slug: str):
    """Fetch real-time prices from C# API for all popular destinations."""
    if db is None:
        raise HTTPException(500, "Database not available")
    hotel = await db.kiosk_hotels.find_one({"slug": slug}, {"_id": 0})
    if not hotel:
        raise HTTPException(404, "Hotel not found")

    hotel_coords = {"latitude": hotel["lat"], "longitude": hotel["lng"]}
    results = []

    async with httpx.AsyncClient(timeout=TIMEOUT) as client:
        for dest in hotel.get("destinations", []):
            dest_coords = {"latitude": dest["lat"], "longitude": dest["lng"]}
            try:
                resp = await client.post(
                    f"{CSHARP_API}/api/PreorderDistance/driverTypesTwo",
                    json=[hotel_coords, dest_coords],
                )
                if resp.status_code == 200:
                    data = resp.json()
                    vehicles = []
                    if isinstance(data, list):
                        for v in data:
                            vehicles.append({
                                "tripType": (v.get("tripType") or "").strip(),
                                "minAmount": round(v.get("minAmount", 0)),
                                "maxAmount": round(v.get("maxAmount", 0)),
                                "duration": round(v.get("duration", 0)),
                                "distance": round(v.get("distance", 0)),
                                "passenger": v.get("passenger", 0),
                                "luggage": v.get("luggage", 0),
                                "imagePath": v.get("imagePath", ""),
                                "description": v.get("description", ""),
                            })
                    results.append({
                        **dest,
                        "vehicles": vehicles,
                        "cheapest": min((v["minAmount"] for v in vehicles), default=0),
                    })
                else:
                    logger.warning(f"C# pricing for {dest['name']}: HTTP {resp.status_code}")
                    results.append({**dest, "vehicles": [], "cheapest": 0})
            except Exception as e:
                logger.warning(f"C# pricing error for {dest['name']}: {e}")
                results.append({**dest, "vehicles": [], "cheapest": 0})

    return {"hotel": hotel, "destinations": results}


@router.post("/book")
async def create_kiosk_booking(req: KioskBookingRequest):
    """Create a kiosk booking (stored in MongoDB)."""
    if db is None:
        raise HTTPException(500, "Database not available")

    # Verify hotel exists
    hotel = await db.kiosk_hotels.find_one({"slug": req.hotelSlug}, {"_id": 0})
    if not hotel:
        raise HTTPException(404, "Hotel not found")

    reference = gen_reference()
    booking = {
        "reference": reference,
        "hotelSlug": req.hotelSlug,
        "hotelName": hotel["name"],
        "pickup": hotel["address"],
        "pickupLat": hotel["lat"],
        "pickupLng": hotel["lng"],
        "destination": req.destination,
        "destinationAddress": req.destinationAddress,
        "clientName": req.clientName,
        "clientPhone": req.clientPhone,
        "date": req.date,
        "time": req.time,
        "vehicleType": req.vehicleType,
        "price": req.price,
        "passengers": req.passengers,
        "status": "confirmed",
        "createdAt": datetime.now(timezone.utc).isoformat(),
    }

    await db.kiosk_bookings.insert_one(booking)
    booking.pop("_id", None)

    return {"reference": reference, "booking": booking}


@router.get("/{slug}/bookings")
async def get_kiosk_bookings(slug: str, limit: int = 50):
    """Get recent kiosk bookings for a hotel (for hotel admin dashboard)."""
    if db is None:
        raise HTTPException(500, "Database not available")
    cursor = db.kiosk_bookings.find({"hotelSlug": slug}, {"_id": 0}).sort("createdAt", -1).limit(limit)
    return await cursor.to_list(length=limit)
