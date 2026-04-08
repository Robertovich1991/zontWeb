"""Driver Portal - Dual auth (C# + local) and missions endpoints."""
from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from datetime import datetime
import logging

from routes.fleet_shared import (
    get_shared_client, csharp_get, parse_csharp_date,
    CSHARP_API, TIMEOUT,
)

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/driver", tags=["driver-portal"])


class DriverLoginRequest(BaseModel):
    username: str
    password: str


@router.post("/auth/login")
async def driver_login(data: DriverLoginRequest, request: Request):
    """Try C# driver login first, then fall back to local MongoDB."""
    db = request.app.state.db

    # 1. Try C# driver login
    try:
        client = get_shared_client()
        resp = await client.post(
            f"{CSHARP_API}/api/Login/driver",
            json={"username": data.username, "password": data.password},
        )
        if resp.status_code == 200:
            tokens = resp.json()
            access = tokens.get("accessToken", "")
            # Fetch driver profile
            profile_resp = await client.get(
                f"{CSHARP_API}/api/Driver/getdriver",
                headers={"Authorization": f"Bearer {access}"},
            )
            profile = profile_resp.json() if profile_resp.status_code == 200 else {}
            # Get company info from profile
            company = profile.get("company") or {}
            return {
                "accessToken": access,
                "refreshToken": tokens.get("refreshToken", ""),
                "driverType": "csharp",
                "driver": {
                    "id": profile.get("id", ""),
                    "firstName": profile.get("firstName", ""),
                    "lastName": profile.get("lastName", ""),
                    "email": profile.get("email", ""),
                    "phone": profile.get("phoneNumber", ""),
                    "rank": profile.get("rank", 0),
                    "isActivated": profile.get("isActivated", False),
                    "companyId": company.get("id", ""),
                    "companyName": company.get("companyName") or f"{company.get('firstName', '')} {company.get('lastName', '')}".strip(),
                },
            }
    except Exception as e:
        logger.debug(f"C# driver login failed for {data.username}: {e}")

    # 2. Fall back to local MongoDB driver
    local_driver = await db.local_drivers.find_one(
        {"email": data.username.lower()},
        {"_id": 0},
    )
    if local_driver and local_driver.get("password") == data.password:
        import secrets
        token = secrets.token_hex(32)
        # Store session
        await db.driver_sessions.update_one(
            {"driverId": local_driver["id"]},
            {"$set": {"token": token, "driverId": local_driver["id"], "companyId": local_driver.get("companyId", "")}},
            upsert=True,
        )
        return {
            "accessToken": token,
            "refreshToken": "",
            "driverType": "local",
            "driver": {
                "id": local_driver["id"],
                "firstName": local_driver.get("firstName", ""),
                "lastName": local_driver.get("lastName", ""),
                "email": local_driver.get("email", ""),
                "phone": local_driver.get("phone", ""),
                "rank": 0,
                "isActivated": True,
                "companyId": local_driver.get("companyId", ""),
                "companyName": local_driver.get("companyName", ""),
            },
        }

    raise HTTPException(400, "Email ou mot de passe incorrect")


def _get_driver_token(request: Request) -> str:
    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
        raise HTTPException(401, "Token requis")
    return auth.split(" ", 1)[1]


@router.get("/profile")
async def driver_profile(request: Request):
    token = _get_driver_token(request)
    driver_type = request.headers.get("X-Driver-Type", "csharp")

    if driver_type == "csharp":
        try:
            data = await csharp_get("/api/Driver/getdriver", token)
            if isinstance(data, dict) and data.get("id"):
                company = data.get("company") or {}
                return {
                    "id": data.get("id", ""),
                    "firstName": data.get("firstName", ""),
                    "lastName": data.get("lastName", ""),
                    "email": data.get("email", ""),
                    "phone": data.get("phoneNumber", ""),
                    "rank": data.get("rank", 0),
                    "isActivated": data.get("isActivated", False),
                    "companyName": company.get("companyName") or f"{company.get('firstName', '')} {company.get('lastName', '')}".strip(),
                    "vehicle": data.get("vehicle"),
                    "driverType": "csharp",
                }
        except HTTPException:
            raise
        return {}

    # Local driver
    db = request.app.state.db
    session = await db.driver_sessions.find_one({"token": token}, {"_id": 0})
    if not session:
        raise HTTPException(401, "Session invalide")
    driver = await db.local_drivers.find_one({"id": session["driverId"]}, {"_id": 0})
    if not driver:
        raise HTTPException(404, "Chauffeur introuvable")
    return {**driver, "driverType": "local"}


@router.get("/missions")
async def driver_missions(request: Request, tab: str = "scheduled"):
    """Get driver missions. tab=scheduled (future) or tab=history (past)."""
    token = _get_driver_token(request)
    driver_type = request.headers.get("X-Driver-Type", "csharp")
    db = request.app.state.db
    now = datetime.now()
    missions = []

    if driver_type == "csharp":
        # Get driver ID from token
        import base64, json
        try:
            payload = token.split(".")[1]
            payload += "=" * (4 - len(payload) % 4)
            token_data = json.loads(base64.b64decode(payload))
            driver_id = token_data.get("http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier", "")
        except Exception:
            driver_id = ""

        # Fetch Zont auctions (company endpoint works with driver+company token)
        auctions = await csharp_get("/api/Auction/company/auctions?count=100&pageNumber=1&isDescending=true", token)
        for a in (auctions if isinstance(auctions, list) else []):
            start_dt = parse_csharp_date(a.get("startDate"))
            if not start_dt:
                continue
            status = a.get("status", "")
            assigned_driver = a.get("driver") or {}
            is_assigned_to_me = assigned_driver.get("id") == driver_id

            # For scheduled: show ApprovedByAdmin offers (available) + assigned to me with future date
            # For history: show completed/cancelled ones assigned to me
            if tab == "scheduled":
                if start_dt <= now:
                    continue
                if status == "ApprovedByAdmin" and not assigned_driver.get("id"):
                    pass  # Available offer
                elif is_assigned_to_me and status in ("Took", "Confirmed", "Started"):
                    pass  # Assigned to me
                else:
                    continue
            else:  # history
                if not is_assigned_to_me:
                    continue
                if status not in ("Completed", "CancelledByDriver", "CancelledByClient", "Cancelled"):
                    continue

            missions.append({
                "id": f"zont-{a.get('id')}",
                "source": "zont",
                "auctionId": a.get("id"),
                "status": status,
                "date": start_dt.strftime("%Y-%m-%d"),
                "time": start_dt.strftime("%H:%M"),
                "startDate": a.get("startDate", ""),
                "startAddress": a.get("startAddress", ""),
                "endAddress": a.get("endAddress", ""),
                "clientName": f"{(a.get('client') or {}).get('firstName', '')} {(a.get('client') or {}).get('lastName', '')}".strip(),
                "currentPrice": a.get("currentPrice", 0),
                "carType": (a.get("carType") or "").strip(),
                "isFixedPrice": a.get("isFixedPrice", False),
                "offerEndTime": a.get("offerEndTime", ""),
                "driverAssigned": bool(assigned_driver.get("id")),
                "isMyMission": is_assigned_to_me,
                "distance": a.get("distance", 0),
            })

        # Also scan for hidden ApprovedByAdmin auctions
        if tab == "scheduled":
            known_ids = {a.get("id") for a in (auctions if isinstance(auctions, list) else [])}
            max_id = max(known_ids) if known_ids else 0
            if max_id > 0:
                import asyncio
                scan_range = range(max(1, max_id - 10), max_id + 40)
                async def check(aid):
                    if aid in known_ids:
                        return None
                    try:
                        detail = await csharp_get(f"/api/Auction/company/auctions/{aid}", token, use_cache=True)
                        if isinstance(detail, dict) and detail.get("id"):
                            s = detail.get("status", "")
                            sd = parse_csharp_date(detail.get("startDate"))
                            if s == "ApprovedByAdmin" and sd and sd > now and not (detail.get("driver") or {}).get("id"):
                                return detail
                    except Exception:
                        pass
                    return None
                results = await asyncio.gather(*[check(i) for i in scan_range])
                for a in results:
                    if a and f"zont-{a['id']}" not in {m['id'] for m in missions}:
                        sd = parse_csharp_date(a.get("startDate"))
                        missions.append({
                            "id": f"zont-{a['id']}",
                            "source": "zont",
                            "auctionId": a["id"],
                            "status": a.get("status", ""),
                            "date": sd.strftime("%Y-%m-%d") if sd else "",
                            "time": sd.strftime("%H:%M") if sd else "",
                            "startDate": a.get("startDate", ""),
                            "startAddress": a.get("startAddress", ""),
                            "endAddress": a.get("endAddress", ""),
                            "clientName": f"{(a.get('client') or {}).get('firstName', '')}".strip(),
                            "currentPrice": a.get("currentPrice", 0),
                            "carType": (a.get("carType") or "").strip(),
                            "isFixedPrice": a.get("isFixedPrice", False),
                            "offerEndTime": a.get("offerEndTime", ""),
                            "driverAssigned": False,
                            "isMyMission": False,
                            "distance": a.get("distance", 0),
                        })

        # Fetch company private missions assigned to this driver
        company_missions = await db.fleet_reservations.find(
            {"driver.id": driver_id},
            {"_id": 0},
        ).to_list(200)

        for b in company_missions:
            b_date = b.get("date", "")
            b_time = b.get("time", "00:00")
            b_dt = parse_csharp_date(f"{b_date}T{b_time}") if b_date else None
            if tab == "scheduled":
                if not b_dt or b_dt <= now:
                    continue
            else:
                if not b_dt or b_dt > now:
                    continue

            missions.append({
                "id": f"company-{b.get('id', '')}",
                "source": "company",
                "status": b.get("status", "assigned"),
                "date": b_date,
                "time": b_time,
                "startDate": f"{b_date} {b_time}",
                "startAddress": b.get("pickupAddress", ""),
                "endAddress": b.get("dropoffAddress", ""),
                "clientName": b.get("clientName", ""),
                "carType": b.get("vehicleType", ""),
                "driverAssigned": True,
                "isMyMission": True,
                "distance": 0,
            })

    else:
        # Local driver: only company missions assigned to them
        session = await db.driver_sessions.find_one({"token": token}, {"_id": 0})
        if not session:
            raise HTTPException(401, "Session invalide")
        driver_id = session["driverId"]

        company_missions = await db.fleet_reservations.find(
            {"driver.id": driver_id},
            {"_id": 0},
        ).to_list(200)

        for b in company_missions:
            b_date = b.get("date", "")
            b_time = b.get("time", "00:00")
            b_dt = parse_csharp_date(f"{b_date}T{b_time}") if b_date else None
            if tab == "scheduled":
                if not b_dt or b_dt <= now:
                    continue
            else:
                if not b_dt or b_dt > now:
                    continue

            missions.append({
                "id": f"company-{b.get('id', '')}",
                "source": "company",
                "status": b.get("status", "assigned"),
                "date": b_date,
                "time": b_time,
                "startDate": f"{b_date} {b_time}",
                "startAddress": b.get("pickupAddress", ""),
                "endAddress": b.get("dropoffAddress", ""),
                "clientName": b.get("clientName", ""),
                "carType": b.get("vehicleType", ""),
                "driverAssigned": True,
                "isMyMission": True,
                "distance": 0,
            })

    # Sort by date
    missions.sort(key=lambda m: f"{m['date']}T{m['time']}", reverse=(tab == "history"))
    return {"missions": missions, "count": len(missions)}


@router.post("/missions/{auction_id}/accept")
async def accept_zont_mission(auction_id: int, request: Request):
    """Accept a Zont auction offer (C# drivers only)."""
    token = _get_driver_token(request)
    try:
        from routes.fleet_shared import csharp_post
        resp = await csharp_post(
            "/api/Auction/company/auction",
            token,
            {"auctionId": auction_id},
        )
        if resp.status_code in (200, 201):
            return {"success": True, "message": "Mission acceptee"}
        detail = resp.text[:300]
        logger.warning(f"Accept auction {auction_id} failed: {resp.status_code} {detail}")
        raise HTTPException(resp.status_code, f"Erreur: {detail}")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Accept mission error: {e}")
        raise HTTPException(500, "Erreur serveur")
