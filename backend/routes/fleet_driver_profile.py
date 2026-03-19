"""Fleet Driver Profile - Ride history and forfait management."""
from fastapi import APIRouter, Request, HTTPException
from pydantic import BaseModel
from datetime import datetime, timedelta
from typing import Optional
import logging
import calendar

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/fleet/drivers", tags=["fleet-driver-profile"])

CSHARP_API = "https://api.zont.cab"
TIMEOUT = 15.0


def get_token(request: Request) -> str:
    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
        raise HTTPException(401, "Token requis")
    return auth.split(" ", 1)[1]


def get_company_id(request: Request) -> str:
    token = request.headers.get("Authorization", "").replace("Bearer ", "")
    if not token:
        raise HTTPException(401, "Non authentifie")
    import base64
    import json
    try:
        payload = token.split(".")[1]
        payload += "=" * (4 - len(payload) % 4)
        data = json.loads(base64.b64decode(payload))
        return data.get("http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier", "")
    except Exception:
        raise HTTPException(401, "Token invalide")


def get_db(request: Request):
    return request.app.state.db


async def csharp_get(path: str, token: str):
    import httpx
    async with httpx.AsyncClient(timeout=TIMEOUT) as client:
        resp = await client.get(
            f"{CSHARP_API}{path}",
            headers={"Authorization": f"Bearer {token}"},
        )
        if resp.status_code != 200:
            return []
        return resp.json()


def parse_csharp_date(date_str):
    if not date_str:
        return None
    for fmt in ("%Y-%m-%dT%H:%M:%S", "%Y-%m-%dT%H:%M:%S.%f", "%Y-%m-%dT%H:%M", "%Y-%m-%d %H:%M:%S", "%Y-%m-%d %H:%M", "%Y-%m-%d"):
        try:
            return datetime.strptime(date_str.split("+")[0].split("Z")[0], fmt)
        except (ValueError, AttributeError):
            continue
    return None


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

    # 1. Get Zont bookings assigned to this driver
    zont_bookings = await csharp_get(
        "/api/Auction/company/auctions?count=200&pageNumber=1&isDescending=true", token
    )
    for a in (zont_bookings if isinstance(zont_bookings, list) else []):
        if not a.get("driver") or a["driver"].get("id") != driver_id:
            continue
        start_dt = parse_csharp_date(a.get("startDate"))
        if not start_dt:
            continue
        booking_date = start_dt.strftime("%Y-%m-%d")
        if booking_date < date_start or booking_date > date_end:
            continue
        end_dt = parse_csharp_date(a.get("endDate"))
        rides.append({
            "id": f"zont-{a.get('id')}",
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

    # 2. Get company bookings assigned to this driver (MongoDB)
    mongo_query = {
        "companyId": company_id,
        "driver.id": driver_id,
        "date": {"$gte": date_start, "$lte": date_end},
    }
    company_raw = await db.fleet_reservations.find(mongo_query, {"_id": 0}).to_list(200)
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

    # 3. Load saved forfaits from MongoDB
    forfaits_raw = await db.driver_forfaits.find(
        {"driverId": driver_id, "companyId": company_id, "month": f"{year}-{str(mon).zfill(2)}"},
        {"_id": 0},
    ).to_list(500)
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
