"""Fleet Driver Profile - Ride history and forfait management."""
from fastapi import APIRouter, Request, HTTPException
from pydantic import BaseModel
from datetime import datetime, timedelta
from typing import Optional
import asyncio
import logging
import calendar

from routes.fleet_shared import (
    get_token, get_company_id, get_db, csharp_get,
    parse_csharp_date,
)

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/fleet/drivers", tags=["fleet-driver-profile"])


@router.get("/{driver_id}/rides")
async def get_driver_rides(driver_id: str, request: Request, month: str = ""):
    token = get_token(request)
    company_id = get_company_id(request)
    db = get_db(request)

    # Parse month filter (YYYY-MM)
    try:
        if month:
            year, mon = int(month.split("-")[0]), int(month.split("-")[1])
        else:
            now = datetime.now()
            year, mon = now.year, now.month
    except (ValueError, IndexError):
        now = datetime.now()
        year, mon = now.year, now.month

    _, last_day = calendar.monthrange(year, mon)
    date_start = f"{year}-{str(mon).zfill(2)}-01"
    date_end = f"{year}-{str(mon).zfill(2)}-{str(last_day).zfill(2)}"

    rides = []

    # Parallel fetch: Zont trips + Zont auctions + Company bookings + Forfaits
    (
        zont_trips,
        zont_bookings,
        company_raw,
        forfaits_raw,
    ) = await asyncio.gather(
        csharp_get("/api/Trip/driver?count=200&pageNumber=1", token),
        csharp_get("/api/Auction/company/auctions?count=200&pageNumber=1&isDescending=true", token),
        db.fleet_reservations.find(
            {"companyId": company_id, "driver.id": driver_id, "date": {"$gte": date_start, "$lte": date_end}},
            {"_id": 0},
        ).to_list(200),
        db.driver_forfaits.find(
            {"driverId": driver_id, "companyId": company_id, "month": f"{year}-{str(mon).zfill(2)}"},
            {"_id": 0},
        ).to_list(500),
    )

    # 1. Zont trips
    for t in (zont_trips if isinstance(zont_trips, list) else []):
        trip_driver = t.get("driver") or {}
        if trip_driver.get("id") != driver_id:
            continue
        start_dt = parse_csharp_date(t.get("startDate"))
        if not start_dt:
            continue
        booking_date = start_dt.strftime("%Y-%m-%d")
        if booking_date < date_start or booking_date > date_end:
            continue
        end_dt = parse_csharp_date(t.get("endDate"))
        creator = t.get("creator") or {}
        client_name = f"{creator.get('firstName', '')} {creator.get('lastName', '')}".strip()
        rides.append({
            "id": f"zont-trip-{t.get('id')}",
            "source": "zont",
            "type": t.get("carType") or "Transfer",
            "status": t.get("status", ""),
            "date": booking_date,
            "time": start_dt.strftime("%H:%M"),
            "endTime": end_dt.strftime("%H:%M") if end_dt and end_dt.year > 1 else "",
            "pickupAddress": t.get("startAddress", ""),
            "dropoffAddress": t.get("endAddress", ""),
            "clientName": client_name,
            "passengers": len(t.get("tripClients", [])) or 1,
            "price": t.get("totalAmount", 0),
            "forfait": 0,
        })

    # 2. Zont auctions dispatched to this driver
    zont_trip_ids = {r["id"] for r in rides}
    for a in (zont_bookings if isinstance(zont_bookings, list) else []):
        if not a.get("driver") or a["driver"].get("id") != driver_id:
            continue
        start_dt = parse_csharp_date(a.get("startDate"))
        if not start_dt:
            continue
        booking_date = start_dt.strftime("%Y-%m-%d")
        if booking_date < date_start or booking_date > date_end:
            continue
        auction_id = f"zont-auction-{a.get('id')}"
        if auction_id in zont_trip_ids:
            continue
        end_dt = parse_csharp_date(a.get("endDate"))
        rides.append({
            "id": auction_id,
            "source": "zont",
            "type": a.get("tripType") or "Transfer",
            "status": a.get("status", ""),
            "date": booking_date,
            "time": start_dt.strftime("%H:%M"),
            "endTime": end_dt.strftime("%H:%M") if end_dt else "",
            "pickupAddress": a.get("startAddress", ""),
            "dropoffAddress": a.get("endAddress", ""),
            "clientName": "",
            "passengers": a.get("passengerCount", 0),
            "price": a.get("totalAmount", 0),
            "forfait": 0,
        })

    # 3. Company bookings (already fetched in parallel above)
    for b in company_raw:
        time_str = b.get("time", "00:00")
        start_dt = parse_csharp_date(f"{b['date']}T{time_str}")
        hours = b.get("hours", 0)
        end_dt = None
        if start_dt and hours > 0:
            end_dt = start_dt + timedelta(hours=hours)
        elif start_dt:
            end_dt = start_dt + timedelta(hours=1, minutes=30)
        rides.append({
            "id": f"company-{b.get('id', '')}",
            "source": "company",
            "type": b.get("type", "transfer"),
            "status": b.get("status", ""),
            "date": b.get("date", ""),
            "time": time_str,
            "endTime": end_dt.strftime("%H:%M") if end_dt else "",
            "pickupAddress": b.get("pickupAddress", ""),
            "dropoffAddress": b.get("dropoffAddress", ""),
            "clientName": b.get("clientName", ""),
            "passengers": b.get("passengers", 0),
            "price": b.get("price", 0),
            "forfait": 0,
        })

    # 4. Apply saved forfaits (already fetched in parallel above)
    forfait_map = {f["rideId"]: f["amount"] for f in forfaits_raw}

    for ride in rides:
        ride["forfait"] = forfait_map.get(ride["id"], 0)

    # Sort by date then time
    rides.sort(key=lambda r: f"{r['date']}T{r['time']}")

    total_forfait = sum(r["forfait"] for r in rides)
    total_price = sum(r["price"] for r in rides)

    return {
        "driverId": driver_id,
        "month": f"{year}-{str(mon).zfill(2)}",
        "dateStart": date_start,
        "dateEnd": date_end,
        "rides": rides,
        "totalRides": len(rides),
        "totalPrice": round(total_price, 2),
        "totalForfait": round(total_forfait, 2),
    }


class ForfaitRequest(BaseModel):
    amount: float


@router.put("/{driver_id}/rides/{ride_id}/forfait")
async def set_ride_forfait(driver_id: str, ride_id: str, data: ForfaitRequest, request: Request):
    get_token(request)
    company_id = get_company_id(request)
    db = get_db(request)

    # Extract month from ride_id context — we need to find the ride date
    # For simplicity, store with current lookup month
    month: Optional[str] = request.query_params.get("month", "")
    if not month:
        now = datetime.now()
        month = f"{now.year}-{str(now.month).zfill(2)}"

    await db.driver_forfaits.update_one(
        {"driverId": driver_id, "rideId": ride_id, "companyId": company_id, "month": month},
        {"$set": {"amount": data.amount}},
        upsert=True,
    )
    return {"success": True, "rideId": ride_id, "amount": data.amount}
