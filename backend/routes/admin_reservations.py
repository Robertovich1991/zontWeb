"""Super Admin - All C# reservations viewer."""
import asyncio
import logging
from fastapi import APIRouter, Request
from routes.fleet_shared import get_shared_client, parse_csharp_date, CSHARP_API

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/admin/reservations", tags=["admin-reservations"])

db = None

def set_db(database):
    global db
    db = database

# Use a known company token to scan auctions (C# has no admin-level get-all endpoint)
_COMPANY_CREDS = {"username": "Nandetiri1@gmail.com", "password": "12345678"}


async def _get_company_token():
    client = get_shared_client()
    resp = await client.post(
        f"{CSHARP_API}/api/Login/company",
        json=_COMPANY_CREDS,
    )
    if resp.status_code == 200:
        return resp.json().get("accessToken", "")
    return ""


async def _fetch_auction(client, token, aid):
    try:
        resp = await client.get(
            f"{CSHARP_API}/api/Auction/company/auctions/{aid}",
            headers={"Authorization": f"Bearer {token}"},
            timeout=10,
        )
        if resp.status_code == 200:
            d = resp.json()
            if d.get("id"):
                return d
    except Exception:
        pass
    return None


def _format_reservation(a):
    client = a.get("client") or {}
    driver = a.get("driver") or {}
    company = a.get("company") or {}
    start_dt = parse_csharp_date(a.get("startDate"))
    return {
        "id": a.get("id"),
        "status": a.get("status", ""),
        "totalAmount": a.get("totalAmount", 0),
        "currentPrice": a.get("currentPrice", 0),
        "startDate": a.get("startDate", ""),
        "date": start_dt.strftime("%Y-%m-%d") if start_dt else "",
        "time": start_dt.strftime("%H:%M") if start_dt else "",
        "startAddress": a.get("startAddress", ""),
        "endAddress": a.get("endAddress", ""),
        "distance": a.get("distance", 0),
        "carType": (a.get("carType") or "").strip(),
        "tripType": a.get("tripType", ""),
        "isFixedPrice": a.get("isFixedPrice", False),
        "paymentSuccessful": a.get("paymentSuccessful", False),
        "client": {
            "firstName": client.get("firstName", ""),
            "lastName": client.get("lastName", ""),
            "email": client.get("email", ""),
            "phone": client.get("phoneNumber", ""),
        },
        "driver": {
            "firstName": driver.get("firstName", ""),
            "lastName": driver.get("lastName", ""),
        } if driver.get("id") else None,
        "company": {
            "name": company.get("companyName") or f"{company.get('firstName', '')} {company.get('lastName', '')}".strip(),
        } if company.get("id") else None,
        "additionalComments": a.get("additionalComments", ""),
    }


@router.get("")
async def get_all_reservations(request: Request):
    """Scan all C# auctions by ID in batches. Stores last known max_id in MongoDB."""
    token = await _get_company_token()
    if not token:
        return {"reservations": [], "error": "Auth failed"}

    client = get_shared_client()

    # Get last known max_id from MongoDB
    last_scan = await db.kv_store.find_one({"key": "reservations_max_id"}, {"_id": 0}) if db is not None else None
    known_max = last_scan.get("value", 63) if last_scan else 63

    # Scan full range: 1 to known_max + 20, in batches of 20
    scan_up_to = known_max + 20
    reservations = []
    actual_max = 0

    batch_size = 20
    for batch_start in range(1, scan_up_to + 1, batch_size):
        batch_end = min(batch_start + batch_size, scan_up_to + 1)
        tasks = [_fetch_auction(client, token, i) for i in range(batch_start, batch_end)]
        results = await asyncio.gather(*tasks)
        for r in results:
            if r:
                reservations.append(_format_reservation(r))
                rid = r.get("id", 0)
                if rid > actual_max:
                    actual_max = rid

    # Update stored max_id
    if db is not None and actual_max > 0:
        await db.kv_store.update_one(
            {"key": "reservations_max_id"},
            {"$set": {"key": "reservations_max_id", "value": actual_max}},
            upsert=True
        )

    reservations.sort(key=lambda x: x.get("id", 0), reverse=True)
    return {"reservations": reservations, "total": len(reservations)}
