"""Fleet Geolocation - Wialon GPS tracking integration."""
from fastapi import APIRouter, Request, HTTPException
from pydantic import BaseModel
from typing import Optional
import httpx
import logging
import time

from routes.fleet_shared import get_token, get_company_id, get_db

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/fleet/wialon", tags=["fleet-wialon"])

WIALON_DEFAULT_HOST = "hst-api.wialon.com"


# ── Config ────────────────────────────────────────────────────────────

class WialonConfigRequest(BaseModel):
    token: str
    host: Optional[str] = ""


@router.post("/config")
async def save_wialon_config(data: WialonConfigRequest, request: Request):
    get_token(request)
    company_id = get_company_id(request)
    db = get_db(request)

    host = data.host.strip() if data.host else WIALON_DEFAULT_HOST
    # Validate token by attempting login
    try:
        result = await wialon_login(data.token, host)
        if not result.get("eid"):
            raise HTTPException(400, "Token Wialon invalide - connexion echouee")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(400, f"Impossible de se connecter a Wialon: {str(e)}")

    await db.fleet_wialon_config.update_one(
        {"companyId": company_id},
        {"$set": {
            "companyId": company_id,
            "token": data.token,
            "host": host,
            "updatedAt": time.time(),
        }},
        upsert=True,
    )
    return {"success": True, "message": "Configuration Wialon sauvegardee", "host": host}


@router.get("/config")
async def get_wialon_config(request: Request):
    get_token(request)
    company_id = get_company_id(request)
    db = get_db(request)

    config = await db.fleet_wialon_config.find_one(
        {"companyId": company_id}, {"_id": 0}
    )
    if not config:
        return {"configured": False}

    # Mask token for security
    token = config.get("token", "")
    masked = token[:8] + "..." + token[-4:] if len(token) > 12 else "***"
    return {
        "configured": True,
        "host": config.get("host", WIALON_DEFAULT_HOST),
        "tokenMasked": masked,
    }


@router.delete("/config")
async def delete_wialon_config(request: Request):
    get_token(request)
    company_id = get_company_id(request)
    db = get_db(request)

    await db.fleet_wialon_config.delete_one({"companyId": company_id})
    return {"success": True, "message": "Configuration Wialon supprimee"}


# ── Vehicles with GPS ─────────────────────────────────────────────────

@router.get("/vehicles")
async def get_wialon_vehicles(request: Request):
    get_token(request)
    company_id = get_company_id(request)
    db = get_db(request)

    config = await db.fleet_wialon_config.find_one(
        {"companyId": company_id}, {"_id": 0}
    )
    if not config or not config.get("token"):
        raise HTTPException(400, "Wialon non configure. Ajoutez votre token dans les parametres.")

    wialon_token = config["token"]
    host = config.get("host", WIALON_DEFAULT_HOST)

    # Login to get session
    session = await wialon_login(wialon_token, host)
    sid = session.get("eid")
    if not sid:
        raise HTTPException(502, "Connexion Wialon echouee")

    try:
        # Search all units with position data
        # flags: 0x1 (basic) + 0x400 (position) + 0x8 (custom fields) = 1025
        search_params = {
            "spec": {
                "itemsType": "avl_unit",
                "propName": "sys_name",
                "propValueMask": "*",
                "sortType": "sys_name",
            },
            "force": 1,
            "flags": 1025,
            "from": 0,
            "to": 0,
        }

        units_data = await wialon_call(host, sid, "core/search_items", search_params)
        items = units_data.get("items", [])

        vehicles = []
        for item in items:
            pos = item.get("pos") or {}
            last_time = item.get("lmsg", {}).get("t", 0) if item.get("lmsg") else 0

            # Determine status
            now = int(time.time())
            age_seconds = now - last_time if last_time > 0 else 999999
            if age_seconds < 300:  # 5 min
                status = "online"
            elif age_seconds < 3600:  # 1 hour
                status = "idle"
            else:
                status = "offline"

            speed = pos.get("s", 0)
            lat = pos.get("y", 0)
            lon = pos.get("x", 0)

            vehicles.append({
                "id": item.get("id"),
                "name": item.get("nm", ""),
                "lat": lat,
                "lon": lon,
                "speed": round(speed, 1),
                "course": pos.get("c", 0),
                "altitude": pos.get("z", 0),
                "status": status,
                "lastUpdate": last_time,
                "ageSeconds": age_seconds,
            })

        return {"vehicles": vehicles, "count": len(vehicles)}

    finally:
        # Logout to free session
        try:
            await wialon_call(host, sid, "core/logout", {})
        except Exception:
            pass


# ── Wialon API helpers ────────────────────────────────────────────────

async def wialon_login(token: str, host: str) -> dict:
    url = f"https://{host}/wialon/ajax.html"
    params = {"svc": "token/login", "params": f'{{"token":"{token}"}}'}
    async with httpx.AsyncClient(timeout=15.0) as client:
        resp = await client.post(url, data=params)
        if resp.status_code != 200:
            raise HTTPException(502, f"Wialon API erreur: {resp.status_code}")
        data = resp.json()
        if isinstance(data, dict) and data.get("error"):
            error_code = data["error"]
            errors = {
                1: "Session invalide",
                2: "Service invalide",
                3: "Resultat invalide",
                4: "Token invalide ou expire",
                7: "Acces refuse - compte desactive",
                8: "Token incorrect",
            }
            msg = errors.get(error_code, f"Erreur Wialon #{error_code}")
            raise HTTPException(400, msg)
        return data


async def wialon_call(host: str, sid: str, svc: str, params: dict) -> dict:
    import json
    url = f"https://{host}/wialon/ajax.html"
    data = {"svc": svc, "params": json.dumps(params), "sid": sid}
    async with httpx.AsyncClient(timeout=15.0) as client:
        resp = await client.post(url, data=data)
        if resp.status_code != 200:
            raise HTTPException(502, f"Wialon API erreur: {resp.status_code}")
        result = resp.json()
        if isinstance(result, dict) and result.get("error"):
            raise HTTPException(502, f"Wialon erreur: {result}")
        return result
