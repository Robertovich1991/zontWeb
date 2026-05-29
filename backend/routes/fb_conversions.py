"""
Facebook Conversions API (Server-Side Events)
Fire-and-forget async calls to Meta Graph API for event deduplication with the frontend Pixel.
"""
import hashlib
import httpx
import logging
import asyncio
import os
import time
import uuid
from fastapi import APIRouter, Request
from pydantic import BaseModel
from typing import Optional

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/fb", tags=["facebook"])

PIXEL_ID = os.environ.get("FB_PIXEL_ID", "")
ACCESS_TOKEN = os.environ.get("FB_CAPI_TOKEN", "")
GRAPH_URL = f"https://graph.facebook.com/v25.0/{PIXEL_ID}/events"

# --------------- Hashing helpers ---------------

def _hash(value: str) -> str:
    if not value:
        return ""
    return hashlib.sha256(value.strip().lower().encode()).hexdigest()


def _hash_phone(phone: str) -> str:
    if not phone:
        return ""
    digits = "".join(c for c in phone if c.isdigit())
    return hashlib.sha256(digits.encode()).hexdigest()


def build_user_data(
    email: str = "",
    phone: str = "",
    first_name: str = "",
    last_name: str = "",
    ip: str = "",
    user_agent: str = "",
    fbp: str = "",
    fbc: str = "",
) -> dict:
    ud = {}
    if email:
        ud["em"] = [_hash(email)]
    if phone:
        ud["ph"] = [_hash_phone(phone)]
    if first_name:
        ud["fn"] = [_hash(first_name)]
    if last_name:
        ud["ln"] = [_hash(last_name)]
    if ip:
        ud["client_ip_address"] = ip
    if user_agent:
        ud["client_user_agent"] = user_agent
    if fbp:
        ud["fbp"] = fbp
    if fbc:
        ud["fbc"] = fbc
    return ud


# --------------- Core send ---------------

async def send_event(
    event_name: str,
    user_data: dict,
    custom_data: dict | None = None,
    event_source_url: str = "https://www.zont.cab",
    event_id: str | None = None,
):
    if not PIXEL_ID or not ACCESS_TOKEN:
        logger.warning("FB CAPI: missing PIXEL_ID or ACCESS_TOKEN, skipping.")
        return

    evt = {
        "event_name": event_name,
        "event_time": int(time.time()),
        "event_id": event_id or str(uuid.uuid4()),
        "event_source_url": event_source_url,
        "action_source": "website",
        "user_data": user_data,
    }
    if custom_data:
        evt["custom_data"] = custom_data

    payload = {"data": [evt], "access_token": ACCESS_TOKEN}

    try:
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.post(
                GRAPH_URL,
                json=payload,
                headers={"Content-Type": "application/json"},
            )
            if resp.status_code in (200, 201):
                logger.info(f"FB CAPI [{event_name}] sent OK: {resp.json()}")
            else:
                logger.error(f"FB CAPI [{event_name}] error {resp.status_code}: {resp.text[:300]}")
    except Exception as e:
        logger.error(f"FB CAPI [{event_name}] network error: {e}")


def fire_and_forget(
    event_name: str,
    user_data: dict,
    custom_data: dict | None = None,
    event_source_url: str = "https://www.zont.cab",
    event_id: str | None = None,
):
    try:
        loop = asyncio.get_running_loop()
        loop.create_task(
            send_event(event_name, user_data, custom_data, event_source_url, event_id)
        )
    except RuntimeError:
        logger.warning("FB CAPI: no running loop, skipping fire_and_forget.")


# --------------- Generic frontend→server tracking endpoint ---------------

class TrackEventBody(BaseModel):
    event_name: str
    event_id: Optional[str] = None
    event_source_url: Optional[str] = "https://www.zont.cab"
    email: Optional[str] = ""
    phone: Optional[str] = ""
    fbp: Optional[str] = ""
    fbc: Optional[str] = ""
    value: Optional[float] = None
    currency: Optional[str] = "EUR"
    content_name: Optional[str] = ""
    content_category: Optional[str] = ""
    search_string: Optional[str] = ""
    num_items: Optional[int] = None
    order_id: Optional[str] = ""


PRODUCTION_DOMAINS = {"www.zont.cab", "zont.cab"}


@router.post("/track")
async def track_event(body: TrackEventBody, request: Request):
    """Generic endpoint: frontend sends an event here for server-side deduplication."""
    # Only process events from production domain
    source_url = body.event_source_url or ""
    from urllib.parse import urlparse
    parsed = urlparse(source_url)
    if parsed.hostname not in PRODUCTION_DOMAINS:
        return {"status": "skipped", "reason": "non-production domain"}

    ip = request.headers.get("x-forwarded-for", request.client.host if request.client else "")
    if ip and "," in ip:
        ip = ip.split(",")[0].strip()
    ua = request.headers.get("user-agent", "")

    user_data = build_user_data(
        email=body.email,
        phone=body.phone,
        ip=ip,
        user_agent=ua,
        fbp=body.fbp,
        fbc=body.fbc,
    )

    custom_data = {}
    if body.value is not None:
        custom_data["value"] = body.value
        custom_data["currency"] = body.currency or "EUR"
    if body.content_name:
        custom_data["content_name"] = body.content_name
    if body.content_category:
        custom_data["content_category"] = body.content_category
    if body.search_string:
        custom_data["search_string"] = body.search_string
    if body.num_items is not None:
        custom_data["num_items"] = body.num_items
    if body.order_id:
        custom_data["order_id"] = body.order_id

    fire_and_forget(
        event_name=body.event_name,
        user_data=user_data,
        custom_data=custom_data if custom_data else None,
        event_source_url=body.event_source_url or "https://www.zont.cab",
        event_id=body.event_id,
    )

    return {"success": True, "event_id": body.event_id}
