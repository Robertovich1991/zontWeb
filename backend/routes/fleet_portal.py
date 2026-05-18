"""Fleet Portal - Proxy routes to C# backend for company management."""
from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
import httpx
import logging
import time

from routes.fleet_shared import (
    get_token, get_company_id, get_db,
    csharp_get, csharp_post, get_shared_client,
    scan_auctions, format_auction, parse_csharp_date, CSHARP_API, TIMEOUT,
)
from datetime import datetime

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/fleet", tags=["fleet"])


class FleetLoginRequest(BaseModel):
    username: str
    password: str


@router.post("/auth/login")
async def fleet_login(data: FleetLoginRequest):
    try:
        client = get_shared_client()
        resp = await client.post(
            f"{CSHARP_API}/api/Login/company",
            json={"username": data.username, "password": data.password},
        )
        if resp.status_code == 400:
            raise HTTPException(400, "Email ou mot de passe incorrect")
        if resp.status_code != 200:
            raise HTTPException(resp.status_code, "Erreur de connexion")

        tokens = resp.json()

        # Fetch company profile with the new token
        access = tokens.get("accessToken", "")
        profile_resp = await client.get(
            f"{CSHARP_API}/api/Company/getcompany",
            headers={"Authorization": f"Bearer {access}"},
        )
        company = profile_resp.json() if profile_resp.status_code == 200 else {}

        return {
            "accessToken": access,
            "refreshToken": tokens.get("refreshToken", ""),
            "company": {
                "id": company.get("id", ""),
                "companyName": company.get("companyName", ""),
                "firstName": company.get("firstName", ""),
                "lastName": company.get("lastName", ""),
                "email": company.get("email", ""),
                "phone": company.get("phoneNumber", ""),
                "address": company.get("address", ""),
                "isActivated": company.get("isActivated", False),
                "isAdminActivated": company.get("isAdminActivated", False),
                "numberOfDrivers": company.get("numberOfDrivers", 0),
                "vehicleCount": company.get("vehicleCount", 0),
                "tripsCount": company.get("tripsCount", 0),
                "balance": company.get("balance", 0),
            },
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Fleet login error: {e}")
        raise HTTPException(500, "Erreur de connexion au serveur")


@router.get("/company/profile")
async def fleet_company_profile(request: Request):
    token = get_token(request)
    data = await csharp_get("/api/Company/getcompany", token)
    return {
        "id": data.get("id", ""),
        "companyName": data.get("companyName", ""),
        "firstName": data.get("firstName", ""),
        "lastName": data.get("lastName", ""),
        "email": data.get("email", ""),
        "phone": data.get("phoneNumber", ""),
        "address": data.get("address", ""),
        "isActivated": data.get("isActivated", False),
        "isAdminActivated": data.get("isAdminActivated", False),
        "numberOfDrivers": data.get("numberOfDrivers", 0),
        "vehicleCount": data.get("vehicleCount", 0),
        "tripsCount": data.get("tripsCount", 0),
        "balance": data.get("balance", 0),
        "rank": data.get("rank", 0),
        "referalCode": data.get("referalCode", ""),
    }


@router.get("/drivers")
async def fleet_drivers(request: Request):
    token = get_token(request)
    drivers = await csharp_get("/api/Driver/company/getdriver", token)
    return [
        {
            "id": d.get("id", ""),
            "firstName": d.get("firstName", ""),
            "lastName": d.get("lastName", ""),
            "email": d.get("email", ""),
            "phone": d.get("phoneNumber", ""),
            "image": d.get("image"),
            "rank": d.get("rank", 0),
            "isActivated": d.get("isActivated", False),
            "isAdminActivated": d.get("isAdminActivated", False),
            "isCompanyActivated": d.get("isCompanyActivated", False),
            "isVerified": d.get("isVerified", False),
            "vehicle": d.get("vehicle"),
        }
        for d in (drivers if isinstance(drivers, list) else [])
    ]


@router.get("/drivers/{driver_id}")
async def fleet_driver_detail(driver_id: str, request: Request):
    token = get_token(request)
    return await csharp_get(f"/api/Driver/getdriver/{driver_id}", token)


class AddDriverRequest(BaseModel):
    firstName: str
    lastName: str
    email: str
    phone: str = ""
    gender: str
    password: str


@router.post("/drivers")
async def fleet_add_driver(data: AddDriverRequest, request: Request):
    token = get_token(request)
    payload = {
        "firstName": data.firstName,
        "lastName": data.lastName,
        "email": data.email,
        "phone": data.phone,
        "gender": data.gender,
        "password": data.password,
        "canWatchAuctions": True,
    }
    try:
        resp = await csharp_post("/api/Driver", token, payload)
        if resp.status_code in (200, 201):
            logger.info(f"Driver created: {data.email}")
            return {"success": True, "message": "Chauffeur ajoute avec succes"}
        else:
            detail = resp.text[:300]
            logger.warning(f"C# create driver failed ({resp.status_code}): {detail}")
            try:
                err_data = resp.json()
                if isinstance(err_data, dict):
                    msg = err_data.get("message") or err_data.get("title") or str(err_data)
                else:
                    msg = str(err_data)
            except Exception:
                msg = detail
            raise HTTPException(resp.status_code, f"Erreur: {msg}")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Create driver error: {e}")
        raise HTTPException(500, "Erreur lors de la creation du chauffeur")


@router.get("/vehicles")
async def fleet_vehicles(request: Request):
    token = get_token(request)
    vehicles = await csharp_get("/api/Vehicle", token)
    vehicle_list = vehicles if isinstance(vehicles, list) else []

    # Parallel fetch details for vehicles missing driver info
    import asyncio
    vehicles_needing_detail = [v for v in vehicle_list if not v.get("driver") and v.get("id")]

    async def fetch_vehicle_driver(v):
        try:
            detail = await csharp_get(f"/api/Vehicle/{v.get('id')}", token)
            if isinstance(detail, dict) and detail.get("driver"):
                d = detail["driver"]
                return v.get("id"), {"id": d.get("id", ""), "firstName": d.get("firstName", ""), "lastName": d.get("lastName", "")}
        except Exception:
            pass
        return v.get("id"), None

    driver_map = {}
    if vehicles_needing_detail:
        results = await asyncio.gather(*[fetch_vehicle_driver(v) for v in vehicles_needing_detail])
        driver_map = {vid: driver for vid, driver in results if driver}

    enriched = []
    for v in vehicle_list:
        vid = v.get("id")
        driver_info = None
        if v.get("driver"):
            driver_info = {
                "id": v["driver"]["id"],
                "firstName": v["driver"].get("firstName", ""),
                "lastName": v["driver"].get("lastName", ""),
            }
        elif vid in driver_map:
            driver_info = driver_map[vid]

        enriched.append({
            "id": vid,
            "plateNumber": v.get("number", ""),
            "vim": v.get("vim", ""),
            "color": v.get("color", ""),
            "year": v.get("vehicleMakeModel", {}).get("year", ""),
            "make": v.get("vehicleMakeModel", {}).get("make", {}).get("maker", ""),
            "model": v.get("vehicleMakeModel", {}).get("model", ""),
            "type": v.get("vehicleMakeModel", {}).get("type", ""),
            "isVTC": v.get("vehicleMakeModel", {}).get("isVTC", False),
            "isActivated": v.get("isActivated", False),
            "isAdminActivated": v.get("isAdminActivated", False),
            "isVehicleAvailable": v.get("isVehicleAvailable", True),
            "driver": driver_info,
        })
    return enriched


@router.get("/vehicles/ref/years")
async def fleet_vehicle_years(request: Request):
    token = get_token(request)
    return await csharp_get("/api/VehicleMakeModel/getyears", token)


@router.get("/vehicles/ref/makers/{year}")
async def fleet_vehicle_makers(year: int, request: Request):
    token = get_token(request)
    return await csharp_get(f"/api/VehicleMakeModel/{year}", token)


@router.get("/vehicles/ref/models/{year}/{make}")
async def fleet_vehicle_models(year: int, make: str, request: Request):
    token = get_token(request)
    return await csharp_get(f"/api/VehicleMakeModel/{year}/{make}", token)


@router.get("/vehicles/ref/types")
async def fleet_vehicle_types(request: Request):
    token = get_token(request)
    return await csharp_get("/api/VehicleMakeModel/gettypes", token)


class AddVehicleRequest(BaseModel):
    vim: str
    color: str
    number: str
    vehicleMakeModelId: int
    year: int
    makeId: int
    maker: str
    model: str
    type: str
    isVTC: bool = False


@router.post("/vehicles")
async def fleet_add_vehicle(data: AddVehicleRequest, request: Request):
    token = get_token(request)
    payload = {
        "vim": data.vim,
        "color": data.color,
        "number": data.number,
        "vehicleMakeModel": {
            "id": data.vehicleMakeModelId,
            "year": data.year,
            "make": {"id": data.makeId, "maker": data.maker},
            "model": data.model,
            "type": data.type,
            "isVTC": data.isVTC,
        },
    }
    try:
        resp = await csharp_post("/api/Vehicle/Add", token, payload)
        if resp.status_code in (200, 201):
            logger.info(f"Vehicle created: {data.number}")
            result = {}
            try:
                result = resp.json()
            except Exception:
                pass
            return {"success": True, "message": "Vehicule ajoute avec succes", "data": result}
        else:
            detail = resp.text[:300]
            logger.warning(f"C# create vehicle failed ({resp.status_code}): {detail}")
            try:
                err_data = resp.json()
                msg = err_data.get("message") or err_data.get("title") or str(err_data) if isinstance(err_data, dict) else str(err_data)
            except Exception:
                msg = detail
            raise HTTPException(resp.status_code, f"Erreur: {msg}")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Create vehicle error: {e}")
        raise HTTPException(500, "Erreur lors de la creation du vehicule")


@router.get("/vehicles/{vehicle_id}")
async def fleet_vehicle_detail(vehicle_id: int, request: Request):
    token = get_token(request)
    return await csharp_get(f"/api/Vehicle/{vehicle_id}", token)


class AssignDriverToVehicleRequest(BaseModel):
    driverId: str
    vehicleId: int


@router.post("/vehicles/assign-driver")
async def fleet_assign_driver_to_vehicle(data: AssignDriverToVehicleRequest, request: Request):
    token = get_token(request)
    payload = {"driverId": data.driverId, "vehicleId": data.vehicleId}
    try:
        resp = await csharp_post("/api/Vehicle/company/setVehicleToDriver", token, payload)
        if resp.status_code in (200, 201):
            logger.info(f"Assigned driver {data.driverId} to vehicle {data.vehicleId}")
            return {"success": True, "message": "Chauffeur affecte au vehicule"}
        else:
            detail = resp.text[:300]
            logger.warning(f"Assign driver to vehicle failed ({resp.status_code}): {detail}")
            try:
                err_data = resp.json()
                if isinstance(err_data, dict):
                    if err_data.get("vehicleNotAvailable"):
                        msg = "Ce vehicule est deja affecte a un chauffeur"
                    else:
                        msg = err_data.get("message") or err_data.get("title") or str(err_data)
                else:
                    msg = str(err_data)
            except Exception:
                msg = detail
            raise HTTPException(resp.status_code, f"Erreur: {msg}")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Assign driver to vehicle error: {e}")
        raise HTTPException(500, "Erreur lors de l'affectation du chauffeur")


# ─── Bookings (Auctions) ───


COMPANY_PENDING_STATUSES = {"ApprovedByAdmin"}

# Cache for the expensive booking scan results
_bookings_scan_cache: dict[str, tuple[float, list]] = {}
BOOKINGS_CACHE_TTL = 45  # seconds


@router.get("/bookings")
async def fleet_bookings(request: Request, count: int = 20, pageNumber: int = 1, type: str = ""):
    """Show auctions sent by admin, pending driver assignment, with future dates."""
    token = get_token(request)
    company_id = get_company_id(request)
    now = datetime.now()

    # Check result cache first
    cache_key = f"{token[-16:]}:bookings:{count}:{pageNumber}:{type}"
    cached = _bookings_scan_cache.get(cache_key)
    if cached and (time.time() - cached[0]) < BOOKINGS_CACHE_TTL:
        return cached[1]

    params = f"count={count}&pageNumber={pageNumber}&isDescending=true"
    if type:
        params += f"&type={type}"
    data = await csharp_get(f"/api/Auction/company/auctions?{params}", token)
    all_auctions = data if isinstance(data, list) else []
    all_ids = {a.get("id") for a in all_auctions if a.get("id")}

    def is_future(auction):
        dt = parse_csharp_date(auction.get("startDate", ""))
        return dt and dt > now

    results = [
        format_auction(a) for a in all_auctions
        if a.get("status") in COMPANY_PENDING_STATUSES and is_future(a)
    ]
    seen_ids = {r["id"] for r in results}

    # Scan for hidden pending auctions — only on page 1, batched for speed
    if pageNumber == 1:
        max_id = max(all_ids) if all_ids else 0
        scan_ids = [i for i in range(max_id + 1, max_id + 16) if i not in all_ids and i not in seen_ids]

        if scan_ids:
            import asyncio

            async def check_auction(aid):
                try:
                    detail = await csharp_get(f"/api/Auction/company/auctions/{aid}", token, use_cache=True)
                    if isinstance(detail, dict) and detail.get("id"):
                        auction_company = detail.get("company") or {}
                        if auction_company.get("id") == company_id or not auction_company.get("id"):
                            if detail.get("status") in COMPANY_PENDING_STATUSES and is_future(detail):
                                return detail
                except Exception:
                    pass
                return None

            scan_results = await asyncio.gather(*[check_auction(i) for i in scan_ids])
            for item in scan_results:
                if item and item.get("id") not in seen_ids:
                    results.append(format_auction(item))
                    seen_ids.add(item["id"])

        results.sort(key=lambda x: x.get("id", 0), reverse=True)

    # Cache the result
    _bookings_scan_cache[cache_key] = (time.time(), results)
    return results


@router.get("/bookings/count")
async def fleet_bookings_count(request: Request, type: str = ""):
    token = get_token(request)
    params = "isDescending=true"
    if type:
        params += f"&type={type}"
    return await csharp_get(f"/api/Auction/company/auctions/count?{params}", token)


@router.get("/bookings/{booking_id}")
async def fleet_booking_detail(booking_id: int, request: Request):
    token = get_token(request)
    return await csharp_get(f"/api/Auction/company/auctions/{booking_id}", token)


class DispatchRequest(BaseModel):
    driverId: str
    auctionId: int


@router.post("/bookings/dispatch")
async def fleet_dispatch(data: DispatchRequest, request: Request):
    token = get_token(request)
    payload = {"driverId": data.driverId, "auctionId": data.auctionId}
    try:
        resp = await csharp_post("/api/Auction/company/auction", token, payload)
        if resp.status_code in (200, 201):
            logger.info(f"Dispatched auction {data.auctionId} to driver {data.driverId}")
            return {"success": True, "message": "Chauffeur affecte avec succes"}
        else:
            detail = resp.text[:300]
            logger.warning(f"Dispatch failed ({resp.status_code}): {detail}")
            try:
                err_data = resp.json()
                msg = err_data.get("message") or err_data.get("title") or str(err_data) if isinstance(err_data, dict) else str(err_data)
            except Exception:
                msg = detail
            raise HTTPException(resp.status_code, f"Erreur: {msg}")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Dispatch error: {e}")
        raise HTTPException(500, "Erreur lors de l'affectation")


# ─── Trips (Courses) ───

@router.get("/trips")
async def fleet_trips(request: Request, count: int = 20, pageNumber: int = 1, startDate: str = "", endDate: str = ""):
    token = get_token(request)
    params = f"count={count}&pageNumber={pageNumber}"
    if startDate:
        params += f"&startDate={startDate}"
    if endDate:
        params += f"&endDate={endDate}"
    data = await csharp_get(f"/api/Trip/company?{params}", token)
    return [
        {
            "id": t.get("id"),
            "startDate": t.get("startDate", ""),
            "endDate": t.get("endDate", ""),
            "status": t.get("status", ""),
            "startAddress": t.get("startAddress", ""),
            "endAddress": t.get("endAddress", ""),
            "totalAmount": t.get("totalAmount", 0),
            "totalKM": t.get("totalKM", 0),
            "totalTime": t.get("totalTime", 0),
            "carType": (t.get("carType") or "").strip(),
            "orderType": t.get("orderType", ""),
            "driver": {
                "id": (t.get("driver") or {}).get("id", ""),
                "firstName": (t.get("driver") or {}).get("firstName", ""),
                "lastName": (t.get("driver") or {}).get("lastName", ""),
            } if t.get("driver") else None,
            "creator": {
                "firstName": (t.get("creator") or {}).get("firstName", ""),
                "lastName": (t.get("creator") or {}).get("lastName", ""),
                "phone": (t.get("creator") or {}).get("phoneNumber", ""),
            } if t.get("creator") else None,
        }
        for t in (data if isinstance(data, list) else [])
    ]


@router.get("/trips/count")
async def fleet_trips_count(request: Request, startDate: str = "", endDate: str = ""):
    token = get_token(request)
    params = ""
    if startDate:
        params += f"startDate={startDate}&"
    if endDate:
        params += f"endDate={endDate}&"
    return await csharp_get(f"/api/Trip/company/count?{params}".rstrip("?&"), token)
