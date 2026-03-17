"""Fleet Portal - Proxy routes to C# backend for company management."""
from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
import httpx
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/fleet", tags=["fleet"])

CSHARP_API = "https://api.zont.cab"
TIMEOUT = 15.0


class FleetLoginRequest(BaseModel):
    username: str
    password: str


def get_token(request: Request) -> str:
    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
        raise HTTPException(401, "Token requis")
    return auth.split(" ", 1)[1]


async def csharp_get(path: str, token: str):
    async with httpx.AsyncClient(timeout=TIMEOUT) as client:
        resp = await client.get(
            f"{CSHARP_API}{path}",
            headers={"Authorization": f"Bearer {token}"},
        )
        if resp.status_code == 401:
            raise HTTPException(401, "Session expiree")
        if resp.status_code != 200:
            logger.warning(f"C# {path} -> {resp.status_code}: {resp.text[:200]}")
            raise HTTPException(resp.status_code, f"Erreur API: {resp.status_code}")
        return resp.json()


@router.post("/auth/login")
async def fleet_login(data: FleetLoginRequest):
    try:
        async with httpx.AsyncClient(timeout=TIMEOUT) as client:
            resp = await client.post(
                f"{CSHARP_API}/api/Login/company",
                json={"username": data.username, "password": data.password},
            )
            if resp.status_code == 400:
                detail = resp.json() if resp.headers.get("content-type", "").startswith("application/json") else {}
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
        async with httpx.AsyncClient(timeout=TIMEOUT) as client:
            resp = await client.post(
                f"{CSHARP_API}/api/Driver",
                json=payload,
                headers={"Authorization": f"Bearer {token}"},
            )
            if resp.status_code in (200, 201):
                logger.info(f"Driver created: {data.email}")
                return {"success": True, "message": "Chauffeur ajoute avec succes"}
            else:
                detail = resp.text[:300]
                logger.warning(f"C# create driver failed ({resp.status_code}): {detail}")
                # Try to extract a meaningful error message
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
    return [
        {
            "id": v.get("id", ""),
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
            "driver": {
                "id": v["driver"]["id"],
                "firstName": v["driver"].get("firstName", ""),
                "lastName": v["driver"].get("lastName", ""),
            } if v.get("driver") else None,
        }
        for v in (vehicles if isinstance(vehicles, list) else [])
    ]


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
        async with httpx.AsyncClient(timeout=TIMEOUT) as client:
            resp = await client.post(
                f"{CSHARP_API}/api/Vehicle/Add",
                json=payload,
                headers={"Authorization": f"Bearer {token}"},
            )
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


# ─── Bookings (Auctions) ───

@router.get("/bookings")
async def fleet_bookings(request: Request, count: int = 20, pageNumber: int = 1, type: str = ""):
    token = get_token(request)
    params = f"count={count}&pageNumber={pageNumber}&isDescending=true"
    if type:
        params += f"&type={type}"
    data = await csharp_get(f"/api/Auction/company/auctions?{params}", token)
    return [
        {
            "id": a.get("id"),
            "status": a.get("status", ""),
            "startDate": a.get("startDate", ""),
            "startAddress": a.get("startAddress", ""),
            "endAddress": a.get("endAddress", ""),
            "carType": (a.get("carType") or "").strip(),
            "tripType": a.get("tripType", ""),
            "totalAmount": a.get("totalAmount", 0),
            "currentPrice": a.get("currentPrice", 0),
            "client": {
                "firstName": (a.get("client") or {}).get("firstName", ""),
                "lastName": (a.get("client") or {}).get("lastName", ""),
                "phone": (a.get("client") or {}).get("phoneNumber", ""),
            } if a.get("client") else None,
            "driver": {
                "id": (a.get("driver") or {}).get("id", ""),
                "firstName": (a.get("driver") or {}).get("firstName", ""),
                "lastName": (a.get("driver") or {}).get("lastName", ""),
            } if a.get("driver") else None,
            "additionalComments": a.get("additionalComments", ""),
        }
        for a in (data if isinstance(data, list) else [])
    ]


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
        async with httpx.AsyncClient(timeout=TIMEOUT) as client:
            resp = await client.post(
                f"{CSHARP_API}/api/Auction/company/auction",
                json=payload,
                headers={"Authorization": f"Bearer {token}"},
            )
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
