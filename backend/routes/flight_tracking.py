import os
import httpx
from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, Query, HTTPException
from pymongo import MongoClient

router = APIRouter()

MONGO_URL = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = os.environ.get("DB_NAME", "test_database")
client = MongoClient(MONGO_URL)
db = client[DB_NAME]

AVIATIONSTACK_KEY = os.environ.get("AVIATIONSTACK_API_KEY", "")
AVIATIONSTACK_URL = "http://api.aviationstack.com/v1/flights"
CACHE_TTL_MINUTES = 60


def parse_flight_data(data: dict) -> dict:
    """Parse Aviationstack response into simplified format."""
    dep = data.get("departure") or {}
    arr = data.get("arrival") or {}
    flight = data.get("flight") or {}
    live = data.get("live") or {}

    delay = arr.get("delay") or dep.get("delay") or 0
    status_raw = (data.get("flight_status") or "unknown").lower()

    if status_raw == "cancelled":
        status = "cancelled"
    elif status_raw in ("active", "en-route"):
        status = "en-route"
    elif status_raw == "landed":
        status = "landed"
    elif delay and int(delay) > 0:
        status = "delayed"
    elif status_raw == "scheduled":
        status = "on-time"
    else:
        status = status_raw

    return {
        "flightNumber": flight.get("iata") or "",
        "status": status,
        "statusRaw": status_raw,
        "departureAirport": dep.get("airport") or "",
        "departureIata": dep.get("iata") or "",
        "arrivalAirport": arr.get("airport") or "",
        "arrivalIata": arr.get("iata") or "",
        "scheduledDeparture": dep.get("scheduled") or "",
        "scheduledArrival": arr.get("scheduled") or "",
        "estimatedArrival": arr.get("estimated") or "",
        "actualArrival": arr.get("actual") or "",
        "delayMinutes": int(delay) if delay else 0,
        "terminal": dep.get("terminal") or "",
        "gate": dep.get("gate") or "",
        "baggage": arr.get("baggage") or "",
        "lastUpdated": live.get("updated") or datetime.now(timezone.utc).isoformat(),
    }


@router.get("/api/flight-status")
async def get_flight_status(flight: str = Query(..., description="IATA flight code, e.g. AF123")):
    flight_code = flight.strip().upper()
    if not flight_code or len(flight_code) < 3:
        raise HTTPException(status_code=400, detail="Invalid flight number")

    # Check cache first
    cached = db.flight_cache.find_one(
        {"flightNumber": flight_code},
        {"_id": 0}
    )
    if cached:
        cached_at = cached.get("cachedAt")
        if cached_at and isinstance(cached_at, str):
            cached_at = datetime.fromisoformat(cached_at.replace("Z", "+00:00"))
        if cached_at and (datetime.now(timezone.utc) - cached_at) < timedelta(minutes=CACHE_TTL_MINUTES):
            return {**cached, "fromCache": True}

    # Call Aviationstack API
    if not AVIATIONSTACK_KEY:
        raise HTTPException(status_code=500, detail="Aviationstack API key not configured")

    try:
        async with httpx.AsyncClient(timeout=15) as http:
            resp = await http.get(AVIATIONSTACK_URL, params={
                "access_key": AVIATIONSTACK_KEY,
                "flight_iata": flight_code,
            })
            resp.raise_for_status()
            body = resp.json()
    except httpx.TimeoutException:
        raise HTTPException(status_code=504, detail="Aviationstack API timeout")
    except Exception as e:
        # If API fails but we have stale cache, return it
        if cached:
            return {**cached, "fromCache": True, "stale": True}
        raise HTTPException(status_code=502, detail=f"Aviationstack API error: {str(e)}")

    # Check for API errors
    if "error" in body:
        err = body["error"]
        code = err.get("code", "")
        if code == "usage_limit_reached":
            if cached:
                return {**cached, "fromCache": True, "stale": True, "quotaExceeded": True}
            raise HTTPException(status_code=429, detail="Quota API depassé (100 requêtes/mois). Réessayez le mois prochain.")
        raise HTTPException(status_code=400, detail=err.get("info", "API error"))

    flights = body.get("data") or []
    if not flights:
        raise HTTPException(status_code=404, detail=f"Vol {flight_code} non trouvé")

    # Parse the most recent flight data
    result = parse_flight_data(flights[0])
    result["cachedAt"] = datetime.now(timezone.utc).isoformat()

    # Save to cache (upsert)
    db.flight_cache.update_one(
        {"flightNumber": flight_code},
        {"$set": result},
        upsert=True
    )

    return {**result, "fromCache": False}


@router.get("/api/flight-status/quota")
async def get_quota_info():
    """Return cache stats and usage info."""
    total_cached = db.flight_cache.count_documents({})
    fresh_count = db.flight_cache.count_documents({
        "cachedAt": {"$gte": (datetime.now(timezone.utc) - timedelta(minutes=CACHE_TTL_MINUTES)).isoformat()}
    })
    return {
        "totalCached": total_cached,
        "freshCached": fresh_count,
        "cacheTtlMinutes": CACHE_TTL_MINUTES,
        "monthlyLimit": 100,
        "note": "Plan gratuit Aviationstack: 100 requêtes/mois"
    }
