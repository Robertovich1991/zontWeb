"""Comfort Cars partner API — read-only REST access to Comfort Cars reservations.

Reads the C# dispatch auctions (same data as the admin 'auctions' panel) using a
company-level token, keeps only rides assigned to Comfort Cars, and exposes them
as a clean JSON REST API protected by a per-partner API key (header X-API-Key).

Admin-only endpoints (behind the admin JWT) let staff view/rotate the API key and
configure which company name identifies Comfort Cars.
"""
import os
import time
import asyncio
import logging
import secrets
from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Request, HTTPException, Query, Header, Depends
from pydantic import BaseModel

from routes.fleet_shared import get_shared_client, csharp_get, parse_csharp_date, CSHARP_API
from middleware.auth import get_current_admin

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/partners/comfort-cars", tags=["comfort-cars-api"])
admin_router = APIRouter(prefix="/api/admin/comfort-cars", tags=["comfort-cars-admin"])

db = None


def set_db(database):
    global db
    db = database


# ── Config ────────────────────────────────────────────────────────────
DEFAULT_COMPANY_MATCH = "comfort cars"
PUBLIC_BASE_PATH = "/api/partners/comfort-cars"

_COMPANY_CREDS = {
    "username": os.environ.get("CSHARP_COMPANY_USERNAME", ""),
    "password": os.environ.get("CSHARP_COMPANY_PASSWORD", ""),
}

# Raw C# auction status -> normalized, documented status value
RAW_TO_NORMALIZED = {
    "New": "pending",
    "ApprovedByAdmin": "confirmed",
    "Confirmed": "confirmed",
    "Took": "assigned",
    "Started": "in_progress",
    "Completed": "completed",
    "CancelledByClient": "cancelled",
    "CancelledByDriver": "cancelled",
    "Cancelled": "cancelled",
    "DontApprovedByDriver": "cancelled",
}
NORMALIZED_STATUSES = ["pending", "confirmed", "assigned", "in_progress", "completed", "cancelled"]

# In-memory cache of the formatted Comfort Cars list (keeps pagination cheap)
_list_cache = {"ts": 0.0, "match": None, "data": None}
LIST_CACHE_TTL = 60  # seconds


# ── Settings (stored in Mongo kv_store) ───────────────────────────────
async def _get_setting(key, default=None):
    doc = await db.kv_store.find_one({"key": key}, {"_id": 0})
    return doc.get("value") if doc else default


async def _set_setting(key, value):
    await db.kv_store.update_one(
        {"key": key}, {"$set": {"key": key, "value": value}}, upsert=True
    )


async def get_api_key() -> str:
    """Return the Comfort Cars API key, generating one on first use."""
    key = await _get_setting("comfort_cars_api_key")
    if not key:
        key = "cc_" + secrets.token_urlsafe(32)
        await _set_setting("comfort_cars_api_key", key)
        await _set_setting("comfort_cars_api_key_rotated_at", datetime.now(timezone.utc).isoformat())
    return key


async def get_company_match() -> str:
    return (await _get_setting("comfort_cars_company_match")) or DEFAULT_COMPANY_MATCH


# ── API key auth dependency ───────────────────────────────────────────
async def require_api_key(x_api_key: Optional[str] = Header(None, alias="X-API-Key")):
    expected = await get_api_key()
    if not x_api_key or not secrets.compare_digest(str(x_api_key), str(expected)):
        raise HTTPException(401, "Invalid or missing API key. Provide header 'X-API-Key'.")
    return True


# ── C# dispatch access ────────────────────────────────────────────────
async def _get_company_token() -> str:
    client = get_shared_client()
    try:
        resp = await client.post(f"{CSHARP_API}/api/Login/company", json=_COMPANY_CREDS)
        if resp.status_code == 200:
            return resp.json().get("accessToken", "")
        logger.warning(f"Comfort Cars: company login -> {resp.status_code}")
    except Exception as e:
        logger.warning(f"Comfort Cars: company login failed: {e}")
    return ""


async def _safe_fetch(token: str, aid: int):
    try:
        r = await csharp_get(f"/api/Auction/company/auctions/{aid}", token, use_cache=True)
        if isinstance(r, dict) and r.get("id"):
            return r
    except Exception:
        return None
    return None


async def _scan_raw(token: str) -> list:
    """Scan auction IDs 1..(known_max+20) via the detail endpoint (the C# list
    endpoint is unreliable). Reuses/updates the shared reservations_max_id marker."""
    last = await db.kv_store.find_one({"key": "reservations_max_id"}, {"_id": 0})
    known_max = last.get("value", 63) if last else 63
    scan_up_to = known_max + 20
    out = []
    actual_max = 0
    batch = 20
    for start in range(1, scan_up_to + 1, batch):
        end = min(start + batch, scan_up_to + 1)
        results = await asyncio.gather(*[_safe_fetch(token, i) for i in range(start, end)])
        for r in results:
            if r:
                out.append(r)
                if r.get("id", 0) > actual_max:
                    actual_max = r["id"]
    if actual_max > 0:
        await db.kv_store.update_one(
            {"key": "reservations_max_id"},
            {"$set": {"key": "reservations_max_id", "value": actual_max}},
            upsert=True,
        )
    return out


def _company_name(a: dict) -> str:
    c = a.get("company") or {}
    return (c.get("companyName") or f"{c.get('firstName', '')} {c.get('lastName', '')}".strip())


def _is_comfort(a: dict, match: str) -> bool:
    return match in _company_name(a).lower()


def _format(a: dict) -> dict:
    c = a.get("client") or {}
    d = a.get("driver") or {}
    sdt = parse_csharp_date(a.get("startDate"))
    raw_status = a.get("status", "") or ""
    return {
        "id": a.get("id"),
        "status": RAW_TO_NORMALIZED.get(raw_status, "unknown"),
        "statusRaw": raw_status,
        "date": sdt.strftime("%Y-%m-%d") if sdt else "",
        "time": sdt.strftime("%H:%M") if sdt else "",
        "startDate": a.get("startDate", ""),
        "pickupAddress": a.get("startAddress", ""),
        "dropoffAddress": a.get("endAddress", ""),
        "vehicleType": (a.get("carType") or "").strip(),
        "tripType": a.get("tripType", ""),
        "distanceKm": a.get("distance", 0),
        "amount": a.get("totalAmount", 0),
        "currentPrice": a.get("currentPrice", 0),
        "currency": "EUR",
        "isFixedPrice": a.get("isFixedPrice", False),
        "paymentSuccessful": a.get("paymentSuccessful", False),
        "client": {
            "firstName": c.get("firstName", ""),
            "lastName": c.get("lastName", ""),
            "phone": c.get("phoneNumber", ""),
        },
        "driver": {
            "firstName": d.get("firstName", ""),
            "lastName": d.get("lastName", ""),
        } if d.get("id") else None,
        "company": _company_name(a),
        "comments": a.get("additionalComments", ""),
    }


async def _get_comfort_list() -> list:
    match = (await get_company_match()).lower().strip()
    now = time.time()
    if (
        _list_cache["data"] is not None
        and _list_cache["match"] == match
        and (now - _list_cache["ts"]) < LIST_CACHE_TTL
    ):
        return _list_cache["data"]
    token = await _get_company_token()
    if not token:
        raise HTTPException(502, "Dispatch system unavailable (authentication failed)")
    raw = await _scan_raw(token)
    items = [_format(a) for a in raw if _is_comfort(a, match)]
    items.sort(key=lambda x: x.get("id", 0), reverse=True)
    _list_cache.update({"ts": now, "match": match, "data": items})
    return items


# ── Public partner endpoints ──────────────────────────────────────────
@router.get("/reservations")
async def list_reservations(
    _: bool = Depends(require_api_key),
    date_from: Optional[str] = Query(None, description="Ride date >= (YYYY-MM-DD)"),
    date_to: Optional[str] = Query(None, description="Ride date <= (YYYY-MM-DD)"),
    status: Optional[str] = Query(None, description="Normalized status filter"),
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=200),
):
    # Validate params up-front (fast, before touching the dispatch system)
    if status:
        s = status.lower().strip()
        if s not in NORMALIZED_STATUSES:
            raise HTTPException(400, f"Invalid status '{status}'. Allowed: {', '.join(NORMALIZED_STATUSES)}")
    else:
        s = None
    for label, val in (("date_from", date_from), ("date_to", date_to)):
        if val:
            try:
                datetime.strptime(val, "%Y-%m-%d")
            except ValueError:
                raise HTTPException(400, f"Invalid {label} '{val}', expected format YYYY-MM-DD")

    items = await _get_comfort_list()

    if s:
        items = [r for r in items if r["status"] == s]

    if date_from or date_to:
        def _in_range(r):
            d = r.get("date")
            if not d:
                return False
            if date_from and d < date_from:
                return False
            if date_to and d > date_to:
                return False
            return True

        items = [r for r in items if _in_range(r)]

    total = len(items)
    total_pages = (total + page_size - 1) // page_size if total else 0
    start = (page - 1) * page_size
    page_items = items[start:start + page_size]
    return {
        "data": page_items,
        "pagination": {
            "page": page,
            "page_size": page_size,
            "total": total,
            "total_pages": total_pages,
        },
    }


@router.get("/reservations/{reservation_id}")
async def get_reservation(reservation_id: int, _: bool = Depends(require_api_key)):
    items = await _get_comfort_list()
    for r in items:
        if r["id"] == reservation_id:
            return r
    raise HTTPException(404, "Reservation not found for Comfort Cars")


@router.get("/docs")
async def api_docs(request: Request):
    """Self-describing API reference (public, no key required)."""
    base = str(request.base_url).rstrip("/") + PUBLIC_BASE_PATH
    return {
        "name": "Comfort Cars Reservations API",
        "version": "1.0",
        "description": "Read-only REST API returning Comfort Cars reservations from the Zont dispatch system.",
        "baseUrl": base,
        "authentication": {
            "type": "API key",
            "header": "X-API-Key",
            "note": "The key is generated by Zont and shared privately. Missing/invalid key -> 401.",
        },
        "endpoints": [
            {
                "method": "GET",
                "path": "/reservations",
                "description": "List Comfort Cars reservations (newest first).",
                "query": {
                    "date_from": "optional, YYYY-MM-DD, filters on the ride date (>=)",
                    "date_to": "optional, YYYY-MM-DD, filters on the ride date (<=)",
                    "status": f"optional, one of: {', '.join(NORMALIZED_STATUSES)}",
                    "page": "optional, integer >= 1 (default 1)",
                    "page_size": "optional, 1..200 (default 50)",
                },
                "response": {
                    "data": "array of reservation objects",
                    "pagination": {"page": "int", "page_size": "int", "total": "int", "total_pages": "int"},
                },
            },
            {
                "method": "GET",
                "path": "/reservations/{id}",
                "description": "Get a single reservation by id (only if it belongs to Comfort Cars, else 404).",
            },
        ],
        "reservationObject": {
            "id": "integer",
            "status": f"normalized status ({', '.join(NORMALIZED_STATUSES)})",
            "statusRaw": "original dispatch status string",
            "date": "YYYY-MM-DD (ride date)",
            "time": "HH:MM (ride time)",
            "startDate": "original ISO datetime from dispatch",
            "pickupAddress": "string",
            "dropoffAddress": "string",
            "vehicleType": "string",
            "tripType": "string",
            "distanceKm": "number",
            "amount": "number (total)",
            "currentPrice": "number",
            "currency": "EUR",
            "isFixedPrice": "boolean",
            "paymentSuccessful": "boolean",
            "client": {"firstName": "string", "lastName": "string", "phone": "string"},
            "driver": "object {firstName,lastName} or null if not assigned",
            "company": "string (company name)",
            "comments": "string",
        },
        "statuses": NORMALIZED_STATUSES,
        "errors": {
            "400": "Invalid parameter (bad date format or unknown status)",
            "401": "Missing or invalid API key",
            "404": "Reservation not found for Comfort Cars",
            "502": "Dispatch system temporarily unavailable",
        },
        "examples": {
            "curl_list": f"curl -H 'X-API-Key: YOUR_KEY' '{base}/reservations?status=completed&date_from=2026-06-01&page=1&page_size=50'",
            "curl_detail": f"curl -H 'X-API-Key: YOUR_KEY' '{base}/reservations/123'",
        },
    }


# ── Admin endpoints (JWT) ─────────────────────────────────────────────
class CompanyMatchIn(BaseModel):
    companyMatch: str


@admin_router.get("/settings")
async def admin_get_settings(request: Request):
    await get_current_admin(request)
    key = await get_api_key()
    match = await get_company_match()
    rotated = await _get_setting("comfort_cars_api_key_rotated_at")
    base = str(request.base_url).rstrip("/") + PUBLIC_BASE_PATH
    return {
        "apiKey": key,
        "companyMatch": match,
        "baseUrl": base,
        "docsUrl": base + "/docs",
        "rotatedAt": rotated,
        "normalizedStatuses": NORMALIZED_STATUSES,
    }


@admin_router.post("/rotate-key")
async def admin_rotate_key(request: Request):
    await get_current_admin(request)
    key = "cc_" + secrets.token_urlsafe(32)
    await _set_setting("comfort_cars_api_key", key)
    await _set_setting("comfort_cars_api_key_rotated_at", datetime.now(timezone.utc).isoformat())
    return {"apiKey": key}


@admin_router.put("/company-match")
async def admin_set_company_match(body: CompanyMatchIn, request: Request):
    await get_current_admin(request)
    val = (body.companyMatch or "").strip()
    if not val:
        raise HTTPException(400, "companyMatch cannot be empty")
    await _set_setting("comfort_cars_company_match", val)
    _list_cache["data"] = None  # invalidate cache so next call uses new match
    return {"companyMatch": val}
