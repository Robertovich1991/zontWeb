"""Fleet Planning - Aggregates Zont + Company bookings for driver timeline.
Optimized: parallel C# calls, shared client, caching, reduced scan range."""
from fastapi import APIRouter, Request, HTTPException
from pydantic import BaseModel
from datetime import datetime, timedelta
import asyncio
import logging

from routes.fleet_shared import (
    get_token, get_company_id, get_db, csharp_get,
    parse_csharp_date, estimate_end_time, scan_auctions,
)

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/fleet/planning", tags=["fleet-planning"])


@router.get("")
async def get_planning(request: Request, date: str = "", view: str = "day"):
    token = get_token(request)
    company_id = get_company_id(request)
    db = get_db(request)

    # Parse target date
    try:
        target_date = datetime.strptime(date, "%Y-%m-%d") if date else datetime.now()
    except ValueError:
        target_date = datetime.now()

    if view == "month":
        import calendar
        year, month = target_date.year, target_date.month
        _, last_day = calendar.monthrange(year, month)
        date_start = f"{year}-{str(month).zfill(2)}-01"
        date_end = f"{year}-{str(month).zfill(2)}-{str(last_day).zfill(2)}"
    elif view == "week":
        start_of_week = target_date - timedelta(days=target_date.weekday())
        date_start = start_of_week.strftime("%Y-%m-%d")
        date_end = (start_of_week + timedelta(days=6)).strftime("%Y-%m-%d")
    else:
        date_start = target_date.strftime("%Y-%m-%d")
        date_end = date_start

    # ── PHASE 1: Parallel fetch (drivers + auctions + trips + MongoDB) ──
    mongo_assigned_query = {
        "companyId": company_id,
        "driver": {"$ne": None},
        "date": {"$gte": date_start, "$lte": date_end},
    }
    mongo_unassigned_query = {
        "companyId": company_id,
        "$or": [{"driver": None}, {"driver": {"$exists": False}}],
        "date": {"$gte": date_start, "$lte": date_end},
        "status": {"$nin": ["cancelled", "completed"]},
    }
    rest_days_query = {
        "companyId": company_id,
        "date": {"$gte": date_start, "$lte": date_end},
    }

    # Launch ALL data fetches in parallel
    (
        drivers_raw,
        zont_bookings,
        zont_trips,
        company_assigned_raw,
        company_unassigned_raw,
        rest_days_raw,
    ) = await asyncio.gather(
        csharp_get("/api/Driver/company/getdriver", token),
        csharp_get("/api/Auction/company/auctions?count=100&pageNumber=1&isDescending=true", token),
        csharp_get("/api/Trip/driver?count=200&pageNumber=1", token),
        db.fleet_reservations.find(mongo_assigned_query, {"_id": 0}).to_list(200),
        db.fleet_reservations.find(mongo_unassigned_query, {"_id": 0}).to_list(200),
        db.driver_rest_days.find(rest_days_query, {"_id": 0}).to_list(500),
    )

    # ── Parse drivers ──
    drivers = []
    for d in (drivers_raw if isinstance(drivers_raw, list) else []):
        drivers.append({
            "id": d.get("id", ""),
            "firstName": d.get("firstName", ""),
            "lastName": d.get("lastName", ""),
            "isActivated": d.get("isActivated", False),
            "isOnline": d.get("isOnline", False),
            "phone": d.get("phoneNumber", ""),
        })

    # ── Parse Zont auctions (assigned to drivers) ──
    zont_events = []
    known_auction_ids = set()
    for a in (zont_bookings if isinstance(zont_bookings, list) else []):
        aid = a.get("id")
        if aid:
            known_auction_ids.add(aid)
        if not a.get("driver"):
            continue
        start_dt = parse_csharp_date(a.get("startDate"))
        if not start_dt:
            continue
        booking_date = start_dt.strftime("%Y-%m-%d")
        if booking_date < date_start or booking_date > date_end:
            continue
        end_dt = parse_csharp_date(a.get("endDate")) or estimate_end_time(start_dt)
        zont_events.append({
            "id": f"zont-{aid}",
            "driverId": a["driver"].get("id", ""),
            "source": "zont",
            "type": (a.get("tripType") or "Transfer"),
            "status": a.get("status", ""),
            "startTime": start_dt.strftime("%Y-%m-%dT%H:%M"),
            "endTime": end_dt.strftime("%Y-%m-%dT%H:%M") if end_dt else "",
            "pickupAddress": a.get("startAddress", ""),
            "dropoffAddress": a.get("endAddress", ""),
            "clientName": "",
            "price": a.get("totalAmount", 0),
        })

    # ── PHASE 2: Scan for hidden auctions (reduced range) ──
    extra_auctions = await scan_auctions(token, company_id, known_auction_ids)
    seen_event_ids = {e["id"] for e in zont_events}
    for a in extra_auctions:
        eid = f"zont-{a.get('id')}"
        if eid in seen_event_ids:
            continue
        if not a.get("driver"):
            continue  # Unassigned handled below
        start_dt = parse_csharp_date(a.get("startDate"))
        if not start_dt:
            continue
        booking_date = start_dt.strftime("%Y-%m-%d")
        if booking_date < date_start or booking_date > date_end:
            continue
        end_dt = parse_csharp_date(a.get("endDate")) or estimate_end_time(start_dt)
        driver = a.get("driver") or {}
        zont_events.append({
            "id": eid,
            "driverId": driver.get("id", ""),
            "source": "zont",
            "type": (a.get("tripType") or "Transfer"),
            "status": a.get("status", ""),
            "startTime": start_dt.strftime("%Y-%m-%dT%H:%M"),
            "endTime": end_dt.strftime("%Y-%m-%dT%H:%M") if end_dt else "",
            "pickupAddress": a.get("startAddress", ""),
            "dropoffAddress": a.get("endAddress", ""),
            "clientName": "",
            "price": a.get("totalAmount", 0),
        })
        seen_event_ids.add(eid)

    # ── Parse Zont completed trips ──
    for t in (zont_trips if isinstance(zont_trips, list) else []):
        trip_driver = t.get("driver") or {}
        if not trip_driver.get("id"):
            continue
        start_dt = parse_csharp_date(t.get("startDate"))
        if not start_dt:
            continue
        trip_date = start_dt.strftime("%Y-%m-%d")
        if trip_date < date_start or trip_date > date_end:
            continue
        end_dt = parse_csharp_date(t.get("endDate"))
        if not end_dt or (end_dt and end_dt.year <= 1):
            end_dt = estimate_end_time(start_dt)
        trip_id = f"zont-trip-{t.get('id')}"
        if trip_id in seen_event_ids:
            continue
        creator = t.get("creator") or {}
        client_name = f"{creator.get('firstName', '')} {creator.get('lastName', '')}".strip()
        zont_events.append({
            "id": trip_id,
            "driverId": trip_driver.get("id", ""),
            "source": "zont",
            "type": t.get("carType") or "Transfer",
            "status": t.get("status", ""),
            "startTime": start_dt.strftime("%Y-%m-%dT%H:%M"),
            "endTime": end_dt.strftime("%Y-%m-%dT%H:%M") if end_dt else "",
            "pickupAddress": t.get("startAddress", ""),
            "dropoffAddress": t.get("endAddress", ""),
            "clientName": client_name,
            "price": t.get("totalAmount", 0),
        })

    # ── Parse company bookings (MongoDB - already fetched) ──
    company_events = []
    for b in company_assigned_raw:
        time_str = b.get("time", "00:00")
        start_dt = parse_csharp_date(f"{b['date']}T{time_str}")
        if not start_dt:
            continue
        hours = b.get("hours", 0)
        end_dt = start_dt + timedelta(hours=hours) if hours and hours > 0 else estimate_end_time(start_dt, b.get("type", "transfer"))
        company_events.append({
            "id": f"company-{b.get('id', '')}",
            "driverId": b.get("driver", {}).get("id", ""),
            "source": "company",
            "type": b.get("type", "transfer"),
            "status": b.get("status", ""),
            "startTime": start_dt.strftime("%Y-%m-%dT%H:%M"),
            "endTime": end_dt.strftime("%Y-%m-%dT%H:%M") if end_dt else "",
            "pickupAddress": b.get("pickupAddress", ""),
            "dropoffAddress": b.get("dropoffAddress", ""),
            "clientName": b.get("clientName", ""),
            "price": b.get("price", 0),
        })

    # ── Unassigned bookings ──
    unassigned_bookings = []
    for b in company_unassigned_raw:
        time_str = b.get("time", "00:00")
        start_dt = parse_csharp_date(f"{b['date']}T{time_str}")
        hours = b.get("hours", 0)
        end_dt = None
        if start_dt:
            end_dt = start_dt + timedelta(hours=hours) if hours and hours > 0 else estimate_end_time(start_dt, b.get("type", "transfer"))
        unassigned_bookings.append({
            "id": b.get("id", ""),
            "source": "company",
            "type": b.get("type", "transfer"),
            "status": b.get("status", "new"),
            "date": b.get("date", ""),
            "time": time_str,
            "startTime": start_dt.strftime("%Y-%m-%dT%H:%M") if start_dt else "",
            "endTime": end_dt.strftime("%Y-%m-%dT%H:%M") if end_dt else "",
            "pickupAddress": b.get("pickupAddress", ""),
            "dropoffAddress": b.get("dropoffAddress", ""),
            "clientName": b.get("clientName", ""),
            "passengerName": b.get("passengerName", ""),
            "flightNumber": b.get("flightNumber", ""),
            "passengers": b.get("passengers", 0),
            "hours": hours,
            "price": b.get("price", 0),
            "comment": b.get("comment", ""),
        })

    # Add unassigned Zont auctions
    for a in extra_auctions:
        if a.get("driver"):
            continue
        start_dt = parse_csharp_date(a.get("startDate"))
        if not start_dt:
            continue
        booking_date = start_dt.strftime("%Y-%m-%d")
        if booking_date < date_start or booking_date > date_end:
            continue
        end_dt = parse_csharp_date(a.get("endDate")) or estimate_end_time(start_dt)
        client = a.get("client") or {}
        client_name = f"{client.get('firstName', '')} {client.get('lastName', '')}".strip()
        unassigned_bookings.append({
            "id": f"zont-{a.get('id')}",
            "source": "zont",
            "type": a.get("tripType") or a.get("carType") or "Transfer",
            "status": a.get("status", ""),
            "date": booking_date,
            "time": start_dt.strftime("%H:%M"),
            "startTime": start_dt.strftime("%Y-%m-%dT%H:%M"),
            "endTime": end_dt.strftime("%Y-%m-%dT%H:%M") if end_dt else "",
            "pickupAddress": a.get("startAddress", ""),
            "dropoffAddress": a.get("endAddress", ""),
            "clientName": client_name,
            "passengerName": "",
            "flightNumber": "",
            "passengers": a.get("passengerCount", 0),
            "hours": 0,
            "price": a.get("totalAmount", 0),
            "comment": a.get("additionalComments", ""),
            "auctionId": a.get("id"),
        })

    unassigned_bookings.sort(key=lambda x: x.get("time", ""))

    # ── Build planning per driver ──
    all_events = zont_events + company_events
    now_str = datetime.now().strftime("%Y-%m-%dT%H:%M")
    planning = []
    for driver in drivers:
        driver_events = [e for e in all_events if e["driverId"] == driver["id"]]
        driver_events.sort(key=lambda e: e["startTime"])
        is_busy = any(e["startTime"] <= now_str <= e["endTime"] for e in driver_events if e["endTime"])

        if not driver["isActivated"]:
            status = "offline"
        elif is_busy:
            status = "busy"
        else:
            status = "available"

        planning.append({**driver, "status": status, "events": driver_events})

    # ── Rest days (already fetched) ──
    rest_days = {}
    for rd in rest_days_raw:
        did = rd.get("driverId", "")
        if did not in rest_days:
            rest_days[did] = []
        rest_days[did].append(rd.get("date", ""))
    for p in planning:
        p["restDays"] = rest_days.get(p["id"], [])

    return {
        "dateStart": date_start,
        "dateEnd": date_end,
        "view": view,
        "drivers": planning,
        "unassigned": unassigned_bookings,
    }


class ConflictCheckRequest(BaseModel):
    driverId: str
    startTime: str
    endTime: str
    excludeBookingId: str = ""


@router.post("/check-conflict")
async def check_conflict(data: ConflictCheckRequest, request: Request):
    token = get_token(request)
    company_id = get_company_id(request)
    db = get_db(request)

    try:
        new_start = datetime.strptime(data.startTime, "%Y-%m-%dT%H:%M")
        new_end = datetime.strptime(data.endTime, "%Y-%m-%dT%H:%M")
    except ValueError:
        raise HTTPException(400, "Format date invalide (YYYY-MM-DDTHH:MM)")

    date_str = new_start.strftime("%Y-%m-%d")

    # Parallel: check Zont + company bookings
    zont_task = csharp_get(
        "/api/Auction/company/auctions?count=100&pageNumber=1&isDescending=true", token
    )
    company_task = db.fleet_reservations.find(
        {"companyId": company_id, "driver.id": data.driverId, "date": date_str, "status": {"$nin": ["cancelled"]}},
        {"_id": 0},
    ).to_list(100)

    zont_bookings, company_bookings = await asyncio.gather(zont_task, company_task)

    for a in (zont_bookings if isinstance(zont_bookings, list) else []):
        if not a.get("driver") or a["driver"].get("id") != data.driverId:
            continue
        if data.excludeBookingId and f"zont-{a.get('id')}" == data.excludeBookingId:
            continue
        start_dt = parse_csharp_date(a.get("startDate"))
        if not start_dt:
            continue
        end_dt = parse_csharp_date(a.get("endDate")) or estimate_end_time(start_dt)
        if start_dt < new_end and end_dt > new_start:
            return {
                "conflict": True,
                "message": "Ce chauffeur est deja occupe sur ce creneau (reservation Zont)",
                "conflictWith": {
                    "id": f"zont-{a.get('id')}",
                    "startTime": start_dt.strftime("%Y-%m-%dT%H:%M"),
                    "endTime": end_dt.strftime("%Y-%m-%dT%H:%M") if end_dt else "",
                },
            }

    for b in company_bookings:
        if data.excludeBookingId and f"company-{b.get('id')}" == data.excludeBookingId:
            continue
        time_str = b.get("time", "00:00")
        start_dt = parse_csharp_date(f"{b['date']}T{time_str}")
        if not start_dt:
            continue
        hours = b.get("hours", 0)
        end_dt = start_dt + timedelta(hours=hours) if hours > 0 else estimate_end_time(start_dt, b.get("type"))
        if start_dt < new_end and end_dt > new_start:
            return {
                "conflict": True,
                "message": "Ce chauffeur est deja occupe sur ce creneau (reservation societe)",
                "conflictWith": {
                    "id": f"company-{b.get('id')}",
                    "startTime": start_dt.strftime("%Y-%m-%dT%H:%M"),
                    "endTime": end_dt.strftime("%Y-%m-%dT%H:%M") if end_dt else "",
                },
            }

    return {"conflict": False, "message": "Chauffeur disponible"}


# ─── Rest Days ───

class RestDayRequest(BaseModel):
    driverId: str
    date: str  # YYYY-MM-DD


@router.post("/rest-day")
async def add_rest_day(data: RestDayRequest, request: Request):
    get_token(request)
    company_id = get_company_id(request)
    db = get_db(request)

    await db.driver_rest_days.update_one(
        {"companyId": company_id, "driverId": data.driverId, "date": data.date},
        {"$set": {"companyId": company_id, "driverId": data.driverId, "date": data.date}},
        upsert=True,
    )
    return {"success": True, "date": data.date}


@router.delete("/rest-day")
async def remove_rest_day(request: Request, driverId: str = "", date: str = ""):
    get_token(request)
    company_id = get_company_id(request)
    db = get_db(request)

    await db.driver_rest_days.delete_one(
        {"companyId": company_id, "driverId": driverId, "date": date}
    )
    return {"success": True}
