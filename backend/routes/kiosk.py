"""Kiosk API for hotel lobby self-service booking terminals."""
from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timezone
import httpx
import logging
import secrets
import string
import os
import stripe
import qrcode
import io
import base64

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/kiosk", tags=["kiosk"])

CSHARP_API = "https://api.zont.cab"
TIMEOUT = 15.0
STRIPE_SECRET = os.environ.get("STRIPE_LIVE_SECRET_KEY", "")
stripe.api_key = STRIPE_SECRET

db = None

def set_db(database):
    global db
    db = database


# ---------- Models ----------

class KioskCustomPriceRequest(BaseModel):
    destinationLat: float
    destinationLng: float
    destinationAddress: str
    destinationName: str


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


class KioskHourlyPriceRequest(BaseModel):
    hours: int


# Cache for C# TripsPrice grid (refreshed every 1h)
_trips_price_cache = {"data": None, "fetched_at": None}


async def fetch_csharp_trips_price():
    """Fetch authoritative hourly pricing grid from C# admin (per-vehicle perMinuteForTime + baseFare).
    Cached in memory for 1h to avoid hammering C#.
    """
    from datetime import datetime as _dt, timezone as _tz, timedelta as _td
    now = _dt.now(_tz.utc)
    if _trips_price_cache["data"] and _trips_price_cache["fetched_at"] \
            and (now - _trips_price_cache["fetched_at"]) < _td(hours=1):
        return _trips_price_cache["data"]

    company_user = os.environ.get("CSHARP_COMPANY_USERNAME", "Nandetiri1@gmail.com")
    company_pwd = os.environ.get("CSHARP_COMPANY_PASSWORD", "12345678")
    async with httpx.AsyncClient(timeout=TIMEOUT) as client:
        login = await client.post(
            f"{CSHARP_API}/api/Login/company",
            json={"username": company_user, "password": company_pwd},
            headers={"Content-Type": "application/json"},
        )
        if login.status_code != 200:
            raise HTTPException(502, "C# company auth failed")
        token = login.json().get("accessToken", "")
        resp = await client.get(
            f"{CSHARP_API}/api/TripsPrice",
            headers={"Authorization": f"Bearer {token}", "Accept": "application/json"},
        )
        if resp.status_code != 200:
            raise HTTPException(502, "C# TripsPrice unreachable")
        data = resp.json()

    _trips_price_cache["data"] = data
    _trips_price_cache["fetched_at"] = now
    return data


@router.post("/{slug}/hourly-price")
async def get_kiosk_hourly_price(slug: str, req: KioskHourlyPriceRequest):
    """Compute disposal (chauffeur-by-hour) pricing from C# TripsPrice grid.

    Formula: price = baseFare + (perMinuteForTime * hours * 60)
    Bounded by minimum amount.
    Image paths are enriched from /driverTypesTwo (which does include imagePath).
    """
    if db is None:
        raise HTTPException(500, "Database not available")
    if req.hours < 1 or req.hours > 24:
        raise HTTPException(400, "Hours must be between 1 and 24")
    hotel = await db.kiosk_hotels.find_one({"slug": slug}, {"_id": 0})
    if not hotel:
        raise HTTPException(404, "Hotel not found")

    grid = await fetch_csharp_trips_price()

    # Fetch imagePath from driverTypesTwo (Paris route as reference)
    image_map = {}
    try:
        hotel_coords = {"latitude": hotel["lat"], "longitude": hotel["lng"]}
        paris_coords = {"latitude": 48.8566, "longitude": 2.3522}
        async with httpx.AsyncClient(timeout=TIMEOUT) as client:
            r = await client.post(
                f"{CSHARP_API}/api/PreorderDistance/driverTypesTwo",
                json=[hotel_coords, paris_coords],
            )
            if r.status_code == 200:
                for v in r.json() or []:
                    tt = (v.get("tripType") or "").strip()
                    if tt and v.get("imagePath"):
                        image_map[tt] = v["imagePath"]
    except Exception as e:
        logger.warning(f"imagePath enrichment failed: {e}")

    minutes = req.hours * 60
    DISPLAY_ORDER = ["Standard Car", "Shuttle private 8 pers.", "Luxury Sedan", "Luxury Van"]
    vehicles = []
    for v in grid:
        trip_type = (v.get("tripTypes") or "").strip()
        if trip_type not in DISPLAY_ORDER:
            continue
        base = float(v.get("baseFare") or 0)
        per_min = float(v.get("perMinuteForTime") or 0)
        minimum = float(v.get("minimum") or 0)
        price = base + (per_min * minutes)
        if minimum > price:
            price = minimum
        vehicles.append({
            "tripType": trip_type,
            "minAmount": round(price),
            "maxAmount": round(price),
            "duration": minutes,
            "distance": 0,
            "passenger": v.get("passenger", 0),
            "luggage": v.get("luggage", 0),
            "imagePath": image_map.get(trip_type, "") or "",
            "description": v.get("description", "") or "",
        })
    vehicles.sort(key=lambda x: DISPLAY_ORDER.index(x["tripType"]) if x["tripType"] in DISPLAY_ORDER else 99)

    return {
        "name": f"Chauffeur a disposition ({req.hours}h)",
        "address": "Region parisienne",
        "lat": hotel["lat"],
        "lng": hotel["lng"],
        "hours": req.hours,
        "vehicles": vehicles,
        "cheapest": min((v["minAmount"] for v in vehicles), default=0),
    }


@router.post("/{slug}/custom-price")
async def get_kiosk_custom_price(slug: str, req: KioskCustomPriceRequest):
    """Fetch real-time prices for a custom destination entered via Google Places."""
    if db is None:
        raise HTTPException(500, "Database not available")
    hotel = await db.kiosk_hotels.find_one({"slug": slug}, {"_id": 0})
    if not hotel:
        raise HTTPException(404, "Hotel not found")

    hotel_coords = {"latitude": hotel["lat"], "longitude": hotel["lng"]}
    dest_coords = {"latitude": req.destinationLat, "longitude": req.destinationLng}

    try:
        async with httpx.AsyncClient(timeout=TIMEOUT) as client:
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
                return {
                    "name": req.destinationName,
                    "address": req.destinationAddress,
                    "lat": req.destinationLat,
                    "lng": req.destinationLng,
                    "vehicles": vehicles,
                    "cheapest": min((v["minAmount"] for v in vehicles), default=0),
                }
            raise HTTPException(502, "Pricing service unavailable")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Custom kiosk pricing error: {e}")
        raise HTTPException(502, "Failed to get pricing")


@router.post("/book")
async def create_kiosk_booking(req: KioskBookingRequest):
    """Create a kiosk booking with Stripe payment link + QR code."""
    if db is None:
        raise HTTPException(500, "Database not available")

    hotel = await db.kiosk_hotels.find_one({"slug": req.hotelSlug}, {"_id": 0})
    if not hotel:
        raise HTTPException(404, "Hotel not found")

    reference = gen_reference()
    price_cents = int(req.price * 100)

    # Create Stripe Checkout Session
    frontend_url = os.environ.get("FRONTEND_URL", "https://www.zont.cab")
    try:
        session = stripe.checkout.Session.create(
            payment_method_types=["card"],
            line_items=[{
                "price_data": {
                    "currency": "eur",
                    "unit_amount": price_cents,
                    "product_data": {
                        "name": f"Transfer {hotel['name']} → {req.destination}",
                        "description": f"{req.vehicleType} | {req.date} {req.time} | Ref: {reference}",
                    },
                },
                "quantity": 1,
            }],
            mode="payment",
            success_url=f"{frontend_url}/kiosk/{req.hotelSlug}?paid={reference}",
            cancel_url=f"{frontend_url}/kiosk/{req.hotelSlug}?cancelled={reference}",
            metadata={
                "kiosk_reference": reference,
                "hotel_slug": req.hotelSlug,
                "client_name": req.clientName,
                "client_phone": req.clientPhone,
            },
            expires_at=int((datetime.now(timezone.utc).timestamp()) + 1800),  # 30 min expiry
        )
    except Exception as e:
        logger.error(f"Stripe session creation failed: {e}")
        raise HTTPException(502, "Payment service unavailable")

    # Generate QR code as base64 — black on white for maximum camera compatibility
    qr_data = session.url
    qr = qrcode.QRCode(version=1, error_correction=qrcode.constants.ERROR_CORRECT_H, box_size=10, border=4)
    qr.add_data(qr_data)
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white")
    buffer = io.BytesIO()
    img.save(buffer, format="PNG")
    qr_base64 = base64.b64encode(buffer.getvalue()).decode()

    # Store booking in MongoDB with pending status
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
        "status": "awaiting_payment",
        "stripeSessionId": session.id,
        "paymentUrl": session.url,
        "createdAt": datetime.now(timezone.utc).isoformat(),
    }

    await db.kiosk_bookings.insert_one(booking)
    booking.pop("_id", None)

    return {
        "reference": reference,
        "paymentUrl": session.url,
        "qrCode": f"data:image/png;base64,{qr_base64}",
        "booking": booking,
    }


@router.post("/webhook/stripe")
async def kiosk_stripe_webhook(request: Request):
    """Handle Stripe webhook for kiosk payment confirmation → dispatch to C#."""
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature", "")
    
    # For now, parse without signature verification (add webhook secret later)
    try:
        event = stripe.Event.construct_from(
            stripe.util.convert_to_dict(stripe.util.convert_to_stripe_object(
                __import__('json').loads(payload)
            )),
            stripe.api_key,
        )
    except Exception:
        try:
            event_data = __import__('json').loads(payload)
            event = type('Event', (), {'type': event_data.get('type'), 'data': type('Data', (), {'object': event_data.get('data', {}).get('object', {})})()})()
        except Exception as e:
            logger.error(f"Stripe webhook parse error: {e}")
            raise HTTPException(400, "Invalid payload")

    if event.type == "checkout.session.completed":
        session = event.data.object
        ref = session.get("metadata", {}).get("kiosk_reference") if isinstance(session, dict) else getattr(session, 'metadata', {}).get("kiosk_reference")
        
        if ref and db is not None:
            # Update booking status to paid
            booking = await db.kiosk_bookings.find_one({"reference": ref}, {"_id": 0})
            if booking:
                await db.kiosk_bookings.update_one(
                    {"reference": ref},
                    {"$set": {"status": "paid", "paidAt": datetime.now(timezone.utc).isoformat()}}
                )
                logger.info(f"Kiosk booking {ref} paid. Dispatching to C#...")
                
                # Dispatch to C# as confirmed mission
                try:
                    await dispatch_to_csharp(booking)
                    await db.kiosk_bookings.update_one(
                        {"reference": ref},
                        {"$set": {"status": "dispatched", "dispatchedAt": datetime.now(timezone.utc).isoformat()}}
                    )
                    logger.info(f"Kiosk booking {ref} dispatched to C#")
                except Exception as e:
                    logger.error(f"C# dispatch failed for {ref}: {e}")
                    await db.kiosk_bookings.update_one(
                        {"reference": ref},
                        {"$set": {"status": "paid_dispatch_failed", "dispatchError": str(e)}}
                    )

    return {"received": True}


async def dispatch_to_csharp(booking):
    """Send a paid kiosk booking to C# as a confirmed mission."""
    # Login as company to get token
    async with httpx.AsyncClient(timeout=TIMEOUT) as client:
        login_resp = await client.post(
            f"{CSHARP_API}/api/Login/company",
            json={"username": "Nandetiri1@gmail.com", "password": "12345678"},
            headers={"Content-Type": "application/json"},
        )
        if login_resp.status_code != 200:
            raise Exception("C# company login failed")
        token = login_resp.json().get("accessToken", "")

        # Format date for C#: DD/MM/YYYY HH:mm:ss
        date_parts = booking.get("date", "").split("-")
        time_str = booking.get("time", "00:00")
        if len(date_parts) == 3:
            cs_date = f"{date_parts[2]}/{date_parts[1]}/{date_parts[0]} {time_str}:00"
        else:
            cs_date = f"{booking['date']} {time_str}:00"

        # Create auction/booking on C#
        auction_payload = {
            "startAddress": booking.get("pickup", ""),
            "endAddress": booking.get("destinationAddress", booking.get("destination", "")),
            "startPointLatitude": booking.get("pickupLat", 0),
            "startPointLongitude": booking.get("pickupLng", 0),
            "startDate": cs_date,
            "clientPrice": booking.get("price", 0),
            "carType": booking.get("vehicleType", ""),
            "tripType": "distance",
            "clientName": booking.get("clientName", ""),
            "clientPhone": booking.get("clientPhone", ""),
            "passengerCount": booking.get("passengers", 1),
            "description": f"Kiosk booking from {booking.get('hotelName', '')} - Ref: {booking.get('reference', '')}",
        }

        resp = await client.post(
            f"{CSHARP_API}/api/Auction/company",
            json=auction_payload,
            headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
        )
        if resp.status_code not in (200, 201):
            raise Exception(f"C# auction creation failed: {resp.status_code} {resp.text[:200]}")
        logger.info(f"C# auction created for kiosk booking {booking.get('reference')}")


@router.get("/{slug}/bookings")
async def get_kiosk_bookings(slug: str, limit: int = 50):
    """Get recent kiosk bookings for a hotel (for hotel admin dashboard)."""
    if db is None:
        raise HTTPException(500, "Database not available")
    cursor = db.kiosk_bookings.find({"hotelSlug": slug}, {"_id": 0}).sort("createdAt", -1).limit(limit)
    return await cursor.to_list(length=limit)
