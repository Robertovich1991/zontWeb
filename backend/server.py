from fastapi import FastAPI, APIRouter, Request, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import Response
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from starlette.types import ASGIApp, Receive, Scope, Send
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
from datetime import datetime, timezone
import uuid


# Lightweight ASGI middleware for cache headers (NOT BaseHTTPMiddleware)
class CacheHeaderMiddleware:
    """Sets long cache headers for static assets (JS, CSS, images, fonts)."""
    LONG_CACHE = "public, max-age=31536000, immutable"
    MEDIUM_CACHE = "public, max-age=2592000"
    STATIC_EXTS = {'.js', '.css', '.map'}
    IMAGE_EXTS = {'.png', '.jpg', '.jpeg', '.webp', '.svg', '.ico', '.gif', '.avif'}
    FONT_EXTS = {'.woff', '.woff2', '.ttf', '.eot'}

    def __init__(self, app: ASGIApp):
        self.app = app

    async def __call__(self, scope: Scope, receive: Receive, send: Send):
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return

        path = scope.get("path", "")
        ext = Path(path).suffix.lower()

        # Determine cache policy based on extension
        cache_value = None
        if ext in self.STATIC_EXTS or ext in self.FONT_EXTS:
            cache_value = self.LONG_CACHE
        elif ext in self.IMAGE_EXTS:
            cache_value = self.LONG_CACHE
        elif path.startswith("/api/uploads/"):
            cache_value = self.MEDIUM_CACHE

        if cache_value is None:
            await self.app(scope, receive, send)
            return

        async def send_with_cache(message):
            if message["type"] == "http.response.start":
                headers = list(message.get("headers", []))
                headers.append((b"cache-control", cache_value.encode()))
                message["headers"] = headers
            await send(message)

        await self.app(scope, receive, send_with_cache)


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()
app.state.db = db


@app.get("/health")
@app.get("/api/health")
async def health_check():
    return {"status": "ok"}

# Add cache headers for static assets (lightweight ASGI middleware, NOT BaseHTTPMiddleware)
app.add_middleware(CacheHeaderMiddleware)

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Define Models
class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")  # Ignore MongoDB's _id field
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StatusCheckCreate(BaseModel):
    client_name: str

class LeadCreate(BaseModel):
    name: str
    company: str
    email: str
    phone: Optional[str] = ""
    message: Optional[str] = ""
    source_page: Optional[str] = ""

class Lead(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    company: str
    email: str
    phone: str = ""
    message: str = ""
    source_page: str = ""
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    status: str = "new"

# Add your routes to the router instead of directly to app
@api_router.get("/")
async def root():
    return {"message": "Hello World"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.model_dump()
    status_obj = StatusCheck(**status_dict)
    
    # Convert to dict and serialize datetime to ISO string for MongoDB
    doc = status_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    
    _ = await db.status_checks.insert_one(doc)
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    # Exclude MongoDB's _id field from the query results
    status_checks = await db.status_checks.find({}, {"_id": 0}).to_list(1000)
    
    # Convert ISO string timestamps back to datetime objects
    for check in status_checks:
        if isinstance(check['timestamp'], str):
            check['timestamp'] = datetime.fromisoformat(check['timestamp'])
    
    return status_checks

@api_router.post("/leads", response_model=Lead)
async def create_lead(input: LeadCreate, request: Request):
    lead = Lead(**input.model_dump())
    doc = lead.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    await db.leads.insert_one(doc)

    # Facebook Conversions API: Lead event
    from routes.fb_conversions import fire_and_forget as fb_fire, build_user_data as fb_user_data
    fb_ip = request.headers.get("x-forwarded-for", request.client.host if request.client else "")
    if fb_ip and "," in fb_ip:
        fb_ip = fb_ip.split(",")[0].strip()
    fb_ua = request.headers.get("user-agent", "")
    fb_ud = fb_user_data(email=input.email, phone=input.phone or "", ip=fb_ip, user_agent=fb_ua)
    fb_fire(
        event_name="Lead",
        user_data=fb_ud,
        custom_data={"content_name": input.source_page or "B2B Form", "content_category": "Lead"},
        event_source_url="https://www.zont.cab/b2b",
    )

    return lead

@api_router.get("/leads", response_model=List[Lead])
async def get_leads():
    leads = await db.leads.find({}, {"_id": 0}).sort("timestamp", -1).to_list(1000)
    for lead in leads:
        if isinstance(lead.get('timestamp'), str):
            lead['timestamp'] = datetime.fromisoformat(lead['timestamp'])
    return leads

class LeadStatusUpdate(BaseModel):
    status: str

@api_router.put("/admin/leads/{lead_id}/status")
async def update_lead_status(lead_id: str, data: LeadStatusUpdate):
    result = await db.leads.update_one({"id": lead_id}, {"$set": {"status": data.status}})
    if result.matched_count == 0:
        raise HTTPException(404, "Lead introuvable")
    return {"success": True}

@api_router.delete("/admin/leads/{lead_id}")
async def delete_lead(lead_id: str):
    result = await db.leads.delete_one({"id": lead_id})
    if result.deleted_count == 0:
        raise HTTPException(404, "Lead introuvable")
    return {"success": True}


# Include the router in the main app
app.include_router(api_router)

# Admin routes
from routes.admin_auth import router as auth_router
from routes.admin_pages import router as pages_router
from routes.admin_places import router as places_router
from routes.admin_cms import router as cms_router
from routes.admin_upload import router as upload_router
from routes.public_cms import router as public_router
from routes.company import router as company_router
from routes.csharp_proxy import router as proxy_router, set_proxy_db
set_proxy_db(db)
from routes.partner import router as partner_router
from routes.partner_payment import router as partner_payment_router
from routes.admin_hotels import router as admin_hotels_router
from routes.hotel_portal import router as hotel_portal_router

app.include_router(auth_router)
app.include_router(pages_router)
app.include_router(places_router)
app.include_router(cms_router)
app.include_router(upload_router)
app.include_router(public_router)
app.include_router(company_router)
app.include_router(proxy_router)
app.include_router(partner_router)
app.include_router(partner_payment_router)
app.include_router(admin_hotels_router)
app.include_router(hotel_portal_router)
from routes.fleet_portal import router as fleet_router
app.include_router(fleet_router)
from routes.fleet_my_bookings import router as fleet_my_bookings_router
app.include_router(fleet_my_bookings_router)
from routes.fleet_planning import router as fleet_planning_router
from routes.fleet_sheet_import import router as fleet_sheet_import_router
app.include_router(fleet_planning_router)
app.include_router(fleet_sheet_import_router)
from routes.fleet_driver_profile import router as fleet_driver_profile_router
app.include_router(fleet_driver_profile_router)
from routes.fleet_gps import router as fleet_gps_router
app.include_router(fleet_gps_router)
from routes.stripe_terminal import router as stripe_terminal_router
app.include_router(stripe_terminal_router, prefix="/api")
from routes.gps_admin import router as gps_admin_router
app.include_router(gps_admin_router)
from routes.driver_portal import router as driver_portal_router
app.include_router(driver_portal_router)
from routes.admin_reservations import router as admin_reservations_router, set_db as set_reservations_db
set_reservations_db(db)
app.include_router(admin_reservations_router)

from routes.flight_tracking import router as flight_tracking_router
app.include_router(flight_tracking_router)

from routes.promo import router as promo_router
app.include_router(promo_router)

from routes.ai_booking import router as ai_booking_router
app.include_router(ai_booking_router)

from routes.kiosk import router as kiosk_router, set_db as kiosk_set_db, ensure_demo_hotel
kiosk_set_db(db)
app.include_router(kiosk_router)

from routes.reviews import router as reviews_router
app.include_router(reviews_router)

from routes.fb_conversions import router as fb_router
app.include_router(fb_router)



# Serve uploaded files
UPLOAD_DIR = ROOT_DIR / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)
app.mount("/api/uploads", StaticFiles(directory=str(UPLOAD_DIR)), name="uploads")

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.post("/api/webhook/stripe")
async def stripe_webhook(request: Request):
    """Handle Stripe webhooks."""
    try:
        body = await request.body()
        sig = request.headers.get("Stripe-Signature")
        from emergentintegrations.payments.stripe.checkout import StripeCheckout
        api_key = os.environ.get("STRIPE_API_KEY")
        host_url = str(request.base_url).rstrip("/")
        stripe_checkout = StripeCheckout(api_key=api_key, webhook_url=f"{host_url}/api/webhook/stripe")
        webhook_response = await stripe_checkout.handle_webhook(body, sig)
        if webhook_response.payment_status == "paid" and webhook_response.metadata.get("type") == "card_setup":
            partner_id = webhook_response.metadata.get("partner_id")
            if partner_id:
                db = app.state.db
                await db.partners.update_one({"id": partner_id}, {"$set": {"has_card": True, "card_added_at": datetime.now(timezone.utc).isoformat()}})
                await db.payment_transactions.update_one({"session_id": webhook_response.session_id}, {"$set": {"payment_status": "paid", "status": "completed"}})
        return {"status": "ok"}
    except Exception as e:
        logger.error(f"Stripe webhook error: {e}")
        return {"status": "error"}


@app.on_event("startup")
async def startup_event():
    """Create MongoDB indexes and initialize shared resources."""
    try:
        logger.info("Creating MongoDB indexes...")
        # Fleet reservations: most common queries
        await db.fleet_reservations.create_index([("companyId", 1), ("date", 1)])
        await db.fleet_reservations.create_index([("companyId", 1), ("driver.id", 1), ("date", 1)])
        await db.fleet_reservations.create_index([("companyId", 1), ("status", 1)])
        # Rest days
        await db.driver_rest_days.create_index([("companyId", 1), ("date", 1)])
        await db.driver_rest_days.create_index([("companyId", 1), ("driverId", 1), ("date", 1)], unique=True)
        # Forfaits
        await db.driver_forfaits.create_index([("driverId", 1), ("companyId", 1), ("month", 1)])
        await db.driver_forfaits.create_index([("driverId", 1), ("rideId", 1), ("companyId", 1)], unique=True)
        # GPS indexes
        await db.gps_devices.create_index([("companyId", 1)])
        await db.gps_devices.create_index([("imei", 1), ("companyId", 1)], unique=True)
        await db.gps_positions.create_index([("imei", 1)], unique=True)
        await db.gps_history.create_index([("imei", 1), ("timestamp", 1)])
        await db.gps_history.create_index([("receivedAt", 1)], expireAfterSeconds=2592000)  # 30 days TTL
        # GPS Admin indexes
        await db.gps_admin_users.create_index([("email", 1)], unique=True)
        await db.gps_companies.create_index([("companyId", 1)], unique=True)
        # Promo codes
        await db.promo_codes.create_index([("code", 1)], unique=True)
        await db.promo_codes.create_index([("email", 1)])
        await db.promo_codes.create_index([("expires_at", 1)])
        # Kiosk indexes
        await db.kiosk_hotels.create_index([("slug", 1)], unique=True)
        await db.kiosk_bookings.create_index([("hotelSlug", 1), ("createdAt", -1)])
        await db.kiosk_bookings.create_index([("reference", 1)], unique=True)
        # Social auth
        await db.google_auth.create_index([("email", 1)], unique=True)
        # Seed demo hotel
        await ensure_demo_hotel()
        logger.info("MongoDB indexes created.")
    except Exception as e:
        logger.error(f"Startup index creation failed (non-blocking): {e}")


@app.on_event("shutdown")
async def shutdown_db_client():
    from routes.fleet_shared import close_shared_client
    await close_shared_client()
    client.close()