"""Super Admin - All C# reservations viewer."""
import asyncio
import logging
from fastapi import APIRouter, Request
from routes.fleet_shared import get_shared_client, parse_csharp_date, CSHARP_API

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/admin/reservations", tags=["admin-reservations"])

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
            timeout=5,
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
async def get_all_reservations(request: Request, max_id: int = 200):
    """Scan all C# auctions by ID and return formatted list."""
    token = await _get_company_token()
    if not token:
        return {"reservations": [], "error": "Auth failed"}

    client = get_shared_client()

    # Scan IDs 1 to max_id concurrently in batches to avoid overloading
    batch_size = 50
    reservations = []
    consecutive_misses = 0

    for batch_start in range(1, max_id + 1, batch_size):
        batch_end = min(batch_start + batch_size, max_id + 1)
        tasks = [_fetch_auction(client, token, i) for i in range(batch_start, batch_end)]
        results = await asyncio.gather(*tasks)

        batch_found = 0
        for r in results:
            if r:
                reservations.append(_format_reservation(r))
                batch_found += 1

        # Stop early if a full batch returns nothing (no more reservations)
        if batch_found == 0:
            consecutive_misses += 1
            if consecutive_misses >= 2:
                break
        else:
            consecutive_misses = 0

    reservations.sort(key=lambda x: x.get("id", 0), reverse=True)
    return {"reservations": reservations, "total": len(reservations)}
