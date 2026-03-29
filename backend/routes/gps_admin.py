"""GPS Admin Portal — Central management of all GPS trackers and company access.

The GPS Admin:
  - Registers IMEI devices
  - Creates company entries (linked to C# companyId)
  - Assigns devices to companies
  - Views ALL vehicles across all companies on a global map
  - Fleet companies see only their assigned devices
"""
from fastapi import APIRouter, HTTPException, Request, WebSocket, WebSocketDisconnect
from pydantic import BaseModel
from typing import Optional
from passlib.context import CryptContext
from datetime import datetime, timezone, timedelta
import jwt
import os
import uuid
import logging
import json as json_lib
import asyncio

from routes.fleet_gps import gps_ws_manager

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/gps-admin", tags=["gps-admin"])

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
SECRET_KEY = os.environ.get("GPS_ADMIN_JWT_SECRET", "zont-gps-admin-secret-2026")


def get_db(request: Request):
    return request.app.state.db


def create_token(data: dict):
    expire = datetime.now(timezone.utc) + timedelta(days=7)
    return jwt.encode({**data, "exp": expire}, SECRET_KEY, algorithm="HS256")


def verify_admin(request: Request) -> dict:
    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
        raise HTTPException(401, "Token requis")
    try:
        return jwt.decode(auth.split(" ", 1)[1], SECRET_KEY, algorithms=["HS256"])
    except jwt.ExpiredSignatureError:
        raise HTTPException(401, "Token expire")
    except jwt.InvalidTokenError:
        raise HTTPException(401, "Token invalide")


# ── Auth ──────────────────────────────────────────────────────────────

class LoginReq(BaseModel):
    email: str
    password: str


@router.post("/auth/login")
async def login(req: LoginReq, request: Request):
    db = get_db(request)
    user = await db.gps_admin_users.find_one({"email": req.email}, {"_id": 0})
    if not user or not pwd_context.verify(req.password, user["passwordHash"]):
        raise HTTPException(401, "Identifiants invalides")
    token = create_token({"sub": user["id"], "email": user["email"], "name": user["name"]})
    await db.gps_admin_users.update_one({"id": user["id"]}, {"$set": {"lastLogin": datetime.now(timezone.utc).isoformat()}})
    return {"token": token, "user": {"id": user["id"], "email": user["email"], "name": user["name"]}}


@router.get("/auth/me")
async def get_me(request: Request):
    admin = verify_admin(request)
    return {"id": admin["sub"], "email": admin["email"], "name": admin["name"]}


@router.post("/auth/seed")
async def seed_admin(request: Request):
    db = get_db(request)
    existing = await db.gps_admin_users.find_one({"email": "gps@zont.cab"})
    if existing:
        return {"message": "GPS Admin deja existant"}
    doc = {
        "id": str(uuid.uuid4()),
        "email": "gps@zont.cab",
        "passwordHash": pwd_context.hash("gpsadmin123"),
        "name": "GPS Admin",
        "createdAt": datetime.now(timezone.utc).isoformat(),
        "lastLogin": None,
    }
    await db.gps_admin_users.insert_one(doc)
    return {"message": "GPS Admin cree", "email": "gps@zont.cab", "password": "gpsadmin123"}


# ── Companies (Fleet partners) ────────────────────────────────────────

class CompanyCreate(BaseModel):
    name: str
    companyId: str  # The C# backend company ID
    contactEmail: Optional[str] = ""
    phone: Optional[str] = ""
    maxDevices: int = 50


class CompanyUpdate(BaseModel):
    name: Optional[str] = None
    contactEmail: Optional[str] = None
    phone: Optional[str] = None
    active: Optional[bool] = None
    maxDevices: Optional[int] = None


@router.get("/companies")
async def list_companies(request: Request):
    verify_admin(request)
    db = get_db(request)
    companies = await db.gps_companies.find({}, {"_id": 0}).sort("createdAt", -1).to_list(1000)
    # Enrich with device count
    for c in companies:
        c["deviceCount"] = await db.gps_devices.count_documents({"companyId": c["companyId"]})
    return {"companies": companies, "count": len(companies)}


@router.post("/companies")
async def create_company(data: CompanyCreate, request: Request):
    verify_admin(request)
    db = get_db(request)
    # Check duplicate companyId
    existing = await db.gps_companies.find_one({"companyId": data.companyId})
    if existing:
        raise HTTPException(409, f"Societe avec companyId {data.companyId} existe deja")
    now = datetime.now(timezone.utc).isoformat()
    doc = {
        "id": str(uuid.uuid4()),
        "name": data.name,
        "companyId": data.companyId,
        "contactEmail": data.contactEmail or "",
        "phone": data.phone or "",
        "active": True,
        "maxDevices": data.maxDevices,
        "createdAt": now,
        "updatedAt": now,
    }
    await db.gps_companies.insert_one(doc)
    doc.pop("_id", None)
    doc["deviceCount"] = 0
    return {"success": True, "company": doc}


@router.put("/companies/{company_id}")
async def update_company(company_id: str, data: CompanyUpdate, request: Request):
    verify_admin(request)
    db = get_db(request)
    fields = {"updatedAt": datetime.now(timezone.utc).isoformat()}
    for k, v in data.dict(exclude_unset=True).items():
        if v is not None:
            fields[k] = v
    result = await db.gps_companies.update_one({"id": company_id}, {"$set": fields})
    if result.matched_count == 0:
        raise HTTPException(404, "Societe non trouvee")
    updated = await db.gps_companies.find_one({"id": company_id}, {"_id": 0})
    updated["deviceCount"] = await db.gps_devices.count_documents({"companyId": updated["companyId"]})
    return {"success": True, "company": updated}


@router.delete("/companies/{company_id}")
async def delete_company(company_id: str, request: Request):
    verify_admin(request)
    db = get_db(request)
    company = await db.gps_companies.find_one({"id": company_id}, {"_id": 0})
    if not company:
        raise HTTPException(404, "Societe non trouvee")
    # Unassign all devices from this company
    await db.gps_devices.update_many(
        {"companyId": company["companyId"]},
        {"$set": {"companyId": None, "companyName": None, "updatedAt": datetime.now(timezone.utc).isoformat()}}
    )
    await db.gps_companies.delete_one({"id": company_id})
    return {"success": True}


# ── Devices (Global CRUD) ─────────────────────────────────────────────

class DeviceCreate(BaseModel):
    imei: str
    vehicleName: str = ""
    licensePlate: str = ""
    driverName: str = ""
    companyId: Optional[str] = None  # Assign to company immediately


class DeviceUpdate(BaseModel):
    vehicleName: Optional[str] = None
    licensePlate: Optional[str] = None
    driverName: Optional[str] = None
    companyId: Optional[str] = None  # Reassign to different company
    companyName: Optional[str] = None


@router.get("/devices")
async def list_all_devices(request: Request, company_id: Optional[str] = None):
    verify_admin(request)
    db = get_db(request)
    query = {}
    if company_id:
        query["companyId"] = company_id
    devices = await db.gps_devices.find(query, {"_id": 0}).sort("createdAt", -1).to_list(5000)
    # Enrich with latest position
    for d in devices:
        pos = await db.gps_positions.find_one({"imei": d["imei"]}, {"_id": 0})
        d["lastPosition"] = pos
    return {"devices": devices, "count": len(devices)}


@router.post("/devices")
async def admin_create_device(data: DeviceCreate, request: Request):
    verify_admin(request)
    db = get_db(request)
    imei = data.imei.strip()
    if not imei:
        raise HTTPException(400, "IMEI requis")
    existing = await db.gps_devices.find_one({"imei": imei})
    if existing:
        raise HTTPException(409, f"IMEI {imei} deja enregistre")

    now = datetime.now(timezone.utc).isoformat()
    company_name = ""
    if data.companyId:
        comp = await db.gps_companies.find_one({"companyId": data.companyId}, {"_id": 0})
        if comp:
            company_name = comp["name"]

    doc = {
        "id": str(uuid.uuid4()),
        "companyId": data.companyId or None,
        "companyName": company_name,
        "imei": imei,
        "vehicleName": data.vehicleName,
        "licensePlate": data.licensePlate,
        "driverName": data.driverName,
        "createdAt": now,
        "updatedAt": now,
    }
    await db.gps_devices.insert_one(doc)
    doc.pop("_id", None)
    return {"success": True, "device": doc}


@router.put("/devices/{imei}")
async def admin_update_device(imei: str, data: DeviceUpdate, request: Request):
    verify_admin(request)
    db = get_db(request)
    fields = {"updatedAt": datetime.now(timezone.utc).isoformat()}

    for k, v in data.dict(exclude_unset=True).items():
        if v is not None:
            fields[k] = v

    # If companyId changed, resolve company name
    if "companyId" in fields:
        comp = await db.gps_companies.find_one({"companyId": fields["companyId"]}, {"_id": 0})
        fields["companyName"] = comp["name"] if comp else ""

    result = await db.gps_devices.update_one({"imei": imei}, {"$set": fields})
    if result.matched_count == 0:
        raise HTTPException(404, "Appareil non trouve")
    updated = await db.gps_devices.find_one({"imei": imei}, {"_id": 0})
    return {"success": True, "device": updated}


@router.delete("/devices/{imei}")
async def admin_delete_device(imei: str, request: Request):
    verify_admin(request)
    db = get_db(request)
    result = await db.gps_devices.delete_one({"imei": imei})
    if result.deleted_count == 0:
        raise HTTPException(404, "Appareil non trouve")
    # Also clean positions
    await db.gps_positions.delete_one({"imei": imei})
    return {"success": True}


# ── Assign device to company ──────────────────────────────────────────

class AssignReq(BaseModel):
    companyId: str


@router.put("/devices/{imei}/assign")
async def assign_device(imei: str, data: AssignReq, request: Request):
    verify_admin(request)
    db = get_db(request)
    device = await db.gps_devices.find_one({"imei": imei})
    if not device:
        raise HTTPException(404, "Appareil non trouve")
    comp = await db.gps_companies.find_one({"companyId": data.companyId}, {"_id": 0})
    if not comp:
        raise HTTPException(404, "Societe non trouvee")
    # Check device limit
    current_count = await db.gps_devices.count_documents({"companyId": data.companyId})
    if current_count >= comp.get("maxDevices", 50):
        raise HTTPException(400, f"Limite atteinte ({comp.get('maxDevices', 50)} appareils max)")

    await db.gps_devices.update_one({"imei": imei}, {"$set": {
        "companyId": data.companyId,
        "companyName": comp["name"],
        "updatedAt": datetime.now(timezone.utc).isoformat(),
    }})
    updated = await db.gps_devices.find_one({"imei": imei}, {"_id": 0})
    return {"success": True, "device": updated}


@router.put("/devices/{imei}/unassign")
async def unassign_device(imei: str, request: Request):
    verify_admin(request)
    db = get_db(request)
    result = await db.gps_devices.update_one({"imei": imei}, {"$set": {
        "companyId": None,
        "companyName": None,
        "updatedAt": datetime.now(timezone.utc).isoformat(),
    }})
    if result.matched_count == 0:
        raise HTTPException(404, "Appareil non trouve")
    updated = await db.gps_devices.find_one({"imei": imei}, {"_id": 0})
    return {"success": True, "device": updated}


# ── Global Positions (all vehicles) ───────────────────────────────────

@router.get("/positions")
async def global_positions(request: Request, company_id: Optional[str] = None):
    verify_admin(request)
    db = get_db(request)
    query = {}
    if company_id:
        query["companyId"] = company_id
    devices = await db.gps_devices.find(query, {"_id": 0}).to_list(5000)
    if not devices:
        return {"positions": [], "count": 0}

    imeis = [d["imei"] for d in devices]
    positions = await db.gps_positions.find({"imei": {"$in": imeis}}, {"_id": 0}).to_list(5000)
    pos_map = {p["imei"]: p for p in positions}

    result = []
    for d in devices:
        pos = pos_map.get(d["imei"])
        entry = {
            "imei": d["imei"],
            "vehicleName": d.get("vehicleName", ""),
            "licensePlate": d.get("licensePlate", ""),
            "driverName": d.get("driverName", ""),
            "companyId": d.get("companyId"),
            "companyName": d.get("companyName", ""),
        }
        if pos:
            entry.update({
                "lat": pos["lat"], "lng": pos["lng"],
                "speed": pos["speed"], "heading": pos["heading"],
                "altitude": pos.get("altitude", 0),
                "satellites": pos.get("satellites", 0),
                "ignition": pos.get("ignition"),
                "timestamp": pos["timestamp"],
                "updatedAt": pos.get("updatedAt", ""),
            })
        else:
            entry["lat"] = None
            entry["lng"] = None
            entry["timestamp"] = None
        result.append(entry)
    return {"positions": result, "count": len(result)}


# ── Dashboard Stats ───────────────────────────────────────────────────

@router.get("/stats")
async def global_stats(request: Request):
    verify_admin(request)
    db = get_db(request)
    total_devices = await db.gps_devices.count_documents({})
    assigned = await db.gps_devices.count_documents({"companyId": {"$ne": None}})
    unassigned = total_devices - assigned
    total_companies = await db.gps_companies.count_documents({})
    active_companies = await db.gps_companies.count_documents({"active": True})

    # Online/offline
    all_positions = await db.gps_positions.find({}, {"_id": 0, "imei": 1, "updatedAt": 1}).to_list(5000)
    now = datetime.now(timezone.utc)
    online = 0
    for pos in all_positions:
        updated = pos.get("updatedAt", "")
        if updated:
            try:
                dt = datetime.fromisoformat(updated.replace("Z", "+00:00"))
                if (now - dt).total_seconds() < 300:
                    online += 1
            except (ValueError, TypeError):
                pass

    return {
        "totalDevices": total_devices,
        "assigned": assigned,
        "unassigned": unassigned,
        "online": online,
        "offline": total_devices - online,
        "totalCompanies": total_companies,
        "activeCompanies": active_companies,
    }


# ── WebSocket (Real-Time Global) ─────────────────────────────────────

@router.websocket("/ws")
async def gps_admin_websocket(websocket: WebSocket):
    """WebSocket for real-time GPS positions (admin global view)."""
    token = websocket.query_params.get("token", "")
    try:
        jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
    except Exception:
        await websocket.close(code=4001, reason="Token invalide")
        return

    await gps_ws_manager.connect_admin(websocket)
    try:
        db = websocket.app.state.db
        devices = await db.gps_devices.find({}, {"_id": 0}).to_list(5000)
        if devices:
            imeis = [d["imei"] for d in devices]
            positions = await db.gps_positions.find({"imei": {"$in": imeis}}, {"_id": 0}).to_list(5000)
            pos_map = {p["imei"]: p for p in positions}
            initial = []
            for d in devices:
                pos = pos_map.get(d["imei"])
                entry = {"imei": d["imei"], "vehicleName": d.get("vehicleName", ""),
                         "licensePlate": d.get("licensePlate", ""), "driverName": d.get("driverName", ""),
                         "companyId": d.get("companyId"), "companyName": d.get("companyName", "")}
                if pos:
                    entry.update({"lat": pos["lat"], "lng": pos["lng"], "speed": pos["speed"],
                                  "heading": pos["heading"], "altitude": pos.get("altitude", 0),
                                  "satellites": pos.get("satellites", 0), "ignition": pos.get("ignition"),
                                  "timestamp": pos["timestamp"], "updatedAt": pos.get("updatedAt", "")})
                else:
                    entry.update({"lat": None, "lng": None, "timestamp": None})
                initial.append(entry)
            await websocket.send_text(json_lib.dumps({"type": "initial", "data": initial}))
        else:
            await websocket.send_text(json_lib.dumps({"type": "initial", "data": []}))

        while True:
            try:
                data = await asyncio.wait_for(websocket.receive_text(), timeout=20)
                if data == "ping":
                    await websocket.send_text(json_lib.dumps({"type": "pong"}))
            except asyncio.TimeoutError:
                try:
                    await websocket.send_text(json_lib.dumps({"type": "ping"}))
                except Exception:
                    break
    except WebSocketDisconnect:
        pass
    except Exception as e:
        logger.error(f"Admin WS error: {e}")
    finally:
        gps_ws_manager.disconnect_admin(websocket)



# ── Trip History ──────────────────────────────────────────────────────

@router.get("/history/{imei}")
async def get_device_history(imei: str, request: Request, date: str = "", limit: int = 5000):
    """Get historical positions for a device, optionally filtered by date (YYYY-MM-DD)."""
    verify_admin(request)
    db = get_db(request)

    query = {"imei": imei}
    if date:
        try:
            day_start = datetime.fromisoformat(f"{date}T00:00:00+00:00")
            day_end = day_start + timedelta(days=1)
            query["timestamp"] = {"$gte": day_start.isoformat(), "$lt": day_end.isoformat()}
        except ValueError:
            pass

    positions = await db.gps_history.find(
        query, {"_id": 0}
    ).sort("timestamp", 1).limit(limit).to_list(limit)

    # Also check gps_positions (current positions collection) if history is empty
    if not positions:
        positions = await db.gps_positions.find(
            {"imei": imei}, {"_id": 0}
        ).sort("timestamp", 1).limit(limit).to_list(limit)

    # Calculate trip stats
    total_distance = 0
    max_speed = 0
    if len(positions) > 1:
        for i in range(1, len(positions)):
            p1 = positions[i - 1]
            p2 = positions[i]
            max_speed = max(max_speed, p2.get("speed", 0) or 0)
            # Haversine approximation
            import math
            lat1, lon1 = math.radians(p1.get("lat", 0)), math.radians(p1.get("lng", 0))
            lat2, lon2 = math.radians(p2.get("lat", 0)), math.radians(p2.get("lng", 0))
            dlat, dlon = lat2 - lat1, lon2 - lon1
            a = math.sin(dlat / 2) ** 2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon / 2) ** 2
            total_distance += 6371 * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    elif len(positions) == 1:
        max_speed = positions[0].get("speed", 0) or 0

    return {
        "imei": imei,
        "count": len(positions),
        "positions": positions,
        "stats": {
            "distance_km": round(total_distance, 2),
            "max_speed": round(max_speed, 1),
            "points": len(positions),
            "first": positions[0].get("timestamp") if positions else None,
            "last": positions[-1].get("timestamp") if positions else None,
        }
    }


@router.get("/history-dates/{imei}")
async def get_device_history_dates(imei: str, request: Request):
    """Get list of dates that have position data for a device."""
    verify_admin(request)
    db = get_db(request)

    # Get distinct dates from both collections
    dates = set()
    async for doc in db.gps_history.find({"imei": imei}, {"timestamp": 1, "_id": 0}):
        ts = doc.get("timestamp", "")
        if ts:
            dates.add(ts[:10])
    async for doc in db.gps_positions.find({"imei": imei}, {"timestamp": 1, "_id": 0}):
        ts = doc.get("timestamp", "")
        if ts:
            dates.add(ts[:10])

    return {"imei": imei, "dates": sorted(dates, reverse=True)}
