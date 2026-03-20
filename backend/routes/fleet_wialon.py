"""Fleet Geolocation - Wialon GPS tracking integration.
Supports login/password authentication (core/login).
Extensible for token-based auth in the future.
"""
from fastapi import APIRouter, Request, HTTPException
from pydantic import BaseModel
from typing import Optional
import httpx
import hashlib
import base64
import json
import logging
import time
import os

from routes.fleet_shared import get_token, get_company_id, get_db

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/fleet/wialon", tags=["fleet-wialon"])

WIALON_DEFAULT_HOST = "hst-api.wialon.com"

# ── Simple encryption for stored credentials ──────────────────────────
# Uses a key derived from MONGO_URL to avoid storing a separate secret
_ENCRYPT_KEY = hashlib.sha256(
    (os.environ.get("MONGO_URL", "fallback") + "wialon-salt").encode()
).digest()


def _xor_cipher(data: bytes, key: bytes) -> bytes:
    return bytes(b ^ key[i % len(key)] for i, b in enumerate(data))


def encrypt_value(plaintext: str) -> str:
    encrypted = _xor_cipher(plaintext.encode("utf-8"), _ENCRYPT_KEY)
    return base64.b64encode(encrypted).decode("ascii")


def decrypt_value(ciphertext: str) -> str:
    encrypted = base64.b64decode(ciphertext)
    return _xor_cipher(encrypted, _ENCRYPT_KEY).decode("utf-8")


# ── Wialon API helpers ────────────────────────────────────────────────

async def wialon_request(host: str, svc: str, params: dict, sid: str = "") -> dict:
    """Generic Wialon Remote API call."""
    url = f"https://{host}/wialon/ajax.html"
    form_data = {"svc": svc, "params": json.dumps(params)}
    if sid:
        form_data["sid"] = sid

    async with httpx.AsyncClient(timeout=15.0) as client:
        resp = await client.post(url, data=form_data)

    if resp.status_code != 200:
        logger.error(f"Wialon HTTP {resp.status_code} for {svc}")
        raise HTTPException(502, "Serveur Wialon indisponible")

    data = resp.json()
    if isinstance(data, dict) and data.get("error"):
        code = data["error"]
        reason = data.get("reason", "")
        logger.warning(f"Wialon error #{code} for {svc}: {reason}")
        errors = {
            1: "Session invalide ou expiree",
            2: "Service Wialon invalide",
            3: "Resultat invalide",
            4: "Identifiant ou mot de passe invalide",
            7: "Acces refuse - compte desactive",
            8: "Identifiants incorrects",
            10: "Erreur de protocole",
        }
        msg = errors.get(code, f"Erreur Wialon (code {code})")
        raise HTTPException(400, msg)

    return data


async def wialon_login_password(host: str, user: str, password: str) -> dict:
    """Login to Wialon using core/login with user/password."""
    logger.info(f"Wialon login attempt: user={user}, host={host}")
    return await wialon_request(host, "core/login", {
        "user": user,
        "password": password,
    })


async def wialon_login_token(host: str, token: str) -> dict:
    """Login to Wialon using token/login (future use)."""
    return await wialon_request(host, "token/login", {"token": token})


async def wialon_logout(host: str, sid: str):
    """Logout from Wialon session."""
    try:
        await wialon_request(host, "core/logout", {}, sid=sid)
        logger.info(f"Wialon session closed")
    except Exception as e:
        logger.debug(f"Wialon logout error (non-critical): {e}")


async def wialon_get_units(host: str, sid: str) -> list:
    """Fetch all units (vehicles) with GPS position data."""
    search_params = {
        "spec": {
            "itemsType": "avl_unit",
            "propName": "sys_name",
            "propValueMask": "*",
            "sortType": "sys_name",
        },
        "force": 1,
        "flags": 1025,  # 0x1 (basic) + 0x400 (position)
        "from": 0,
        "to": 0,
    }
    data = await wialon_request(host, "core/search_items", search_params, sid=sid)
    return data.get("items", [])


# ── Config endpoints ──────────────────────────────────────────────────

class WialonLoginRequest(BaseModel):
    host: Optional[str] = ""
    username: str
    password: str
    remember: bool = True


class WialonTokenRequest(BaseModel):
    host: Optional[str] = ""
    token: str


@router.post("/login")
async def wialon_connect(data: WialonLoginRequest, request: Request):
    """Connect to Wialon with username/password (legacy method)."""
    get_token(request)
    company_id = get_company_id(request)
    db = get_db(request)

    host = data.host.strip().replace("https://", "").replace("http://", "").rstrip("/") if data.host else WIALON_DEFAULT_HOST

    # Attempt Wialon login
    session = await wialon_login_password(host, data.username, data.password)

    eid = session.get("eid", "")
    if not eid:
        raise HTTPException(400, "Connexion echouee - pas de session retournee")

    wialon_user = session.get("user", {})
    user_name = wialon_user.get("nm", data.username)
    user_id = wialon_user.get("id", "")
    logger.info(f"Wialon login success: user={user_name} id={user_id} host={host}")

    # Fetch vehicles to validate access
    units = await wialon_get_units(host, eid)
    logger.info(f"Wialon units found: {len(units)}")

    # Store config
    config_doc = {
        "companyId": company_id,
        "authMode": "password",
        "host": host,
        "username": data.username,
        "wialonUserId": user_id,
        "wialonUserName": user_name,
        "connectedAt": time.time(),
        "updatedAt": time.time(),
        "tokenEnc": "",
    }
    if data.remember:
        config_doc["passwordEnc"] = encrypt_value(data.password)
        config_doc["remembered"] = True
    else:
        config_doc["passwordEnc"] = ""
        config_doc["remembered"] = False

    await db.fleet_wialon_config.update_one(
        {"companyId": company_id},
        {"$set": config_doc},
        upsert=True,
    )

    await wialon_logout(host, eid)
    vehicles = _format_units(units)

    return {
        "success": True,
        "message": f"Connexion Wialon reussie ({user_name})",
        "wialonUser": user_name,
        "vehicleCount": len(vehicles),
        "vehicles": vehicles,
    }


@router.post("/login-token")
async def wialon_connect_token(data: WialonTokenRequest, request: Request):
    """Connect to Wialon with access token (recommended method)."""
    get_token(request)
    company_id = get_company_id(request)
    db = get_db(request)

    host = data.host.strip().replace("https://", "").replace("http://", "").rstrip("/") if data.host else WIALON_DEFAULT_HOST

    session = await wialon_login_token(host, data.token)

    eid = session.get("eid", "")
    if not eid:
        raise HTTPException(400, "Connexion echouee - token invalide ou expire")

    wialon_user = session.get("user", {})
    user_name = wialon_user.get("nm", "")
    user_id = wialon_user.get("id", "")
    logger.info(f"Wialon token login success: user={user_name} id={user_id} host={host}")

    units = await wialon_get_units(host, eid)
    logger.info(f"Wialon units found: {len(units)}")

    config_doc = {
        "companyId": company_id,
        "authMode": "token",
        "host": host,
        "username": user_name,
        "wialonUserId": user_id,
        "wialonUserName": user_name,
        "tokenEnc": encrypt_value(data.token),
        "passwordEnc": "",
        "remembered": True,
        "connectedAt": time.time(),
        "updatedAt": time.time(),
    }

    await db.fleet_wialon_config.update_one(
        {"companyId": company_id},
        {"$set": config_doc},
        upsert=True,
    )

    await wialon_logout(host, eid)
    vehicles = _format_units(units)

    return {
        "success": True,
        "message": f"Connexion Wialon reussie ({user_name})",
        "wialonUser": user_name,
        "vehicleCount": len(vehicles),
        "vehicles": vehicles,
    }


@router.get("/config")
async def get_wialon_config(request: Request):
    """Get current Wialon configuration status."""
    get_token(request)
    company_id = get_company_id(request)
    db = get_db(request)

    config = await db.fleet_wialon_config.find_one(
        {"companyId": company_id}, {"_id": 0}
    )
    if not config or (not config.get("username") and not config.get("tokenEnc")):
        return {"configured": False, "authMode": None}

    return {
        "configured": True,
        "authMode": config.get("authMode", "password"),
        "host": config.get("host", WIALON_DEFAULT_HOST),
        "username": config.get("username", ""),
        "wialonUser": config.get("wialonUserName", ""),
        "remembered": config.get("remembered", False),
        "connectedAt": config.get("connectedAt", 0),
    }


@router.delete("/config")
async def disconnect_wialon(request: Request):
    """Disconnect / remove Wialon configuration."""
    get_token(request)
    company_id = get_company_id(request)
    db = get_db(request)

    logger.info(f"Wialon disconnected for company {company_id}")
    await db.fleet_wialon_config.delete_one({"companyId": company_id})
    return {"success": True, "message": "Deconnexion Wialon effectuee"}


# ── Vehicles endpoint ─────────────────────────────────────────────────

@router.get("/vehicles")
async def get_wialon_vehicles(request: Request):
    """Fetch vehicles with GPS positions from Wialon."""
    get_token(request)
    company_id = get_company_id(request)
    db = get_db(request)

    config = await db.fleet_wialon_config.find_one(
        {"companyId": company_id}, {"_id": 0}
    )
    if not config:
        raise HTTPException(400, "Wialon non configure. Connectez-vous dans les parametres.")

    host = config.get("host", WIALON_DEFAULT_HOST)
    auth_mode = config.get("authMode", "password")

    # Login based on auth mode
    try:
        if auth_mode == "token":
            token_enc = config.get("tokenEnc", "")
            if not token_enc:
                raise HTTPException(400, "Token Wialon non memorise. Reconnectez-vous.")
            wialon_token = decrypt_value(token_enc)
            session = await wialon_login_token(host, wialon_token)
        else:
            password_enc = config.get("passwordEnc", "")
            if not password_enc:
                raise HTTPException(400, "Identifiants Wialon non memorises. Reconnectez-vous.")
            password = decrypt_value(password_enc)
            session = await wialon_login_password(host, config.get("username", ""), password)
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(400, "Erreur de dechiffrement. Reconnectez-vous.")

    eid = session.get("eid", "")
    if not eid:
        raise HTTPException(502, "Session Wialon non obtenue")

    try:
        units = await wialon_get_units(host, eid)
        vehicles = _format_units(units)
        return {"vehicles": vehicles, "count": len(vehicles)}
    finally:
        await wialon_logout(host, eid)


# ── Helpers ───────────────────────────────────────────────────────────

def _format_units(items: list) -> list:
    """Format Wialon unit items into clean vehicle dicts."""
    now = int(time.time())
    vehicles = []
    for item in items:
        pos = item.get("pos") or {}
        lmsg = item.get("lmsg") or {}
        last_time = lmsg.get("t", 0)

        age = now - last_time if last_time > 0 else 999999
        if age < 300:
            status = "online"
        elif age < 3600:
            status = "idle"
        else:
            status = "offline"

        vehicles.append({
            "id": item.get("id"),
            "name": item.get("nm", ""),
            "lat": pos.get("y", 0),
            "lon": pos.get("x", 0),
            "speed": round(pos.get("s", 0), 1),
            "course": pos.get("c", 0),
            "altitude": pos.get("z", 0),
            "status": status,
            "lastUpdate": last_time,
            "ageSeconds": age,
        })
    return vehicles
