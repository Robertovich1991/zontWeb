"""Back-office "Configuration Borne" (Kiosk configuration) module.

Scalable architecture:
- A HOTEL is identified by its `slug` (collection `kiosk_hotels`). It holds the
  destinations (order + highlighted + hidden) and the default kiosk language.
- Each physical BORNE is a document in `kiosk_devices` with its own
  `device_code` (Terminal ID) + Stripe Terminal reader. A hotel can have many.

The physical Stripe reader is stored on the device AND mirrored onto the hotel doc
so the existing single-borne payment flow keeps working unchanged.
"""
import os
import uuid
import logging
from datetime import datetime, timezone
from typing import Optional, List

from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
import jwt
import stripe

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/admin/kiosk", tags=["admin-kiosk"])

SECRET_KEY = os.environ.get("JWT_SECRET", "zont-admin-secret-key-2025")
stripe.api_key = os.environ.get("STRIPE_LIVE_SECRET_KEY", "")

VALID_LANGS = {"fr", "en", "ru"}
ONLINE_WINDOW_SECONDS = 120  # a borne is "online" if it sent a heartbeat within 2 min


async def require_admin(request: Request):
    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
        raise HTTPException(401, "Token requis")
    try:
        payload = jwt.decode(auth[7:], SECRET_KEY, algorithms=["HS256"])
        if payload.get("role") not in ("admin", "manager"):
            raise HTTPException(403, "Acces refuse")
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(401, "Token expire")
    except jwt.InvalidTokenError:
        raise HTTPException(401, "Token invalide")


# ── Models ──
class DestinationItem(BaseModel):
    name: str
    address: str = ""
    lat: float
    lng: float
    icon: str = "map"
    highlighted: bool = False
    hidden: bool = False


class SaveDestinations(BaseModel):
    destinations: List[DestinationItem]


class SettingsUpdate(BaseModel):
    default_language: str


class DeviceCreate(BaseModel):
    label: str
    device_code: Optional[str] = None


class RegisterReaderReq(BaseModel):
    code: str
    addressLine1: str
    addressLine2: Optional[str] = None
    city: str
    postalCode: str
    country: str = "FR"
    locationDisplayName: Optional[str] = None


class LinkReaderReq(BaseModel):
    readerId: str


class HotelReaderReq(BaseModel):
    readerId: str


# ── Helpers ──
def _device_status(dev: dict) -> str:
    """Connectivity status of the borne itself, based on its last heartbeat.
    Reader presence is reported separately (Reader ID / reader-status)."""
    last = dev.get("last_seen_at")
    if not last:
        return "unregistered"  # never connected yet
    try:
        seen = datetime.fromisoformat(last)
        if seen.tzinfo is None:
            seen = seen.replace(tzinfo=timezone.utc)
        delta = (datetime.now(timezone.utc) - seen).total_seconds()
        return "online" if delta <= ONLINE_WINDOW_SECONDS else "offline"
    except Exception:
        return "offline"


def _clean_device(dev: dict) -> dict:
    dev.pop("_id", None)
    dev["status"] = _device_status(dev)
    return dev


async def _get_hotel(db, slug: str) -> dict:
    hotel = await db.kiosk_hotels.find_one({"slug": slug}, {"_id": 0})
    if not hotel:
        raise HTTPException(404, "Cet hotel n'a pas encore de borne configuree (aucune fiche kiosque)")
    return hotel


async def _get_or_create_location(db, hotel: dict, req: RegisterReaderReq) -> str:
    if hotel.get("stripe_terminal_location_id"):
        return hotel["stripe_terminal_location_id"]
    address = {"line1": req.addressLine1, "city": req.city, "postal_code": req.postalCode, "country": req.country}
    if req.addressLine2:
        address["line2"] = req.addressLine2
    location = stripe.terminal.Location.create(
        display_name=req.locationDisplayName or hotel.get("name") or hotel["slug"],
        address=address,
        metadata={"hotel_slug": hotel["slug"]},
    )
    await db.kiosk_hotels.update_one({"slug": hotel["slug"]}, {"$set": {"stripe_terminal_location_id": location.id}})
    return location.id


# ── Config (hotel-level) ──
@router.get("/{slug}/config")
async def get_config(slug: str, request: Request):
    await require_admin(request)
    db = request.app.state.db
    hotel = await _get_hotel(db, slug)
    devices = await db.kiosk_devices.find({"hotel_slug": slug}, {"_id": 0}).sort("created_at", 1).to_list(100)
    devices = [_clean_device(d) for d in devices]
    return {
        "slug": slug,
        "name": hotel.get("name", ""),
        "address": hotel.get("address", ""),
        "default_language": hotel.get("default_language", "fr"),
        "destinations": hotel.get("destinations", []),
        "devices": devices,
    }


@router.put("/{slug}/destinations")
async def save_destinations(slug: str, data: SaveDestinations, request: Request):
    await require_admin(request)
    db = request.app.state.db
    await _get_hotel(db, slug)
    dests = [d.model_dump() for d in data.destinations]
    await db.kiosk_hotels.update_one({"slug": slug}, {"$set": {"destinations": dests}})
    return {"success": True, "destinations": dests}


@router.put("/{slug}/settings")
async def save_settings(slug: str, data: SettingsUpdate, request: Request):
    await require_admin(request)
    db = request.app.state.db
    await _get_hotel(db, slug)
    lang = data.default_language if data.default_language in VALID_LANGS else "fr"
    await db.kiosk_hotels.update_one({"slug": slug}, {"$set": {"default_language": lang}})
    return {"success": True, "default_language": lang}


@router.put("/{slug}/reader")
async def set_hotel_reader(slug: str, data: HotelReaderReq, request: Request):
    """Attach a Stripe Terminal Reader ID directly at the hotel level (paste tmr_...).
    Tolerant of an expired/unavailable Stripe key: the ID is still saved (validated later)."""
    await require_admin(request)
    db = request.app.state.db
    await _get_hotel(db, slug)
    rid = data.readerId.strip()
    if not rid:
        raise HTTPException(400, "Reader ID Stripe requis (ex. tmr_xxx)")
    label, location, warning = None, None, None
    if stripe.api_key:
        try:
            reader = stripe.terminal.Reader.retrieve(rid)
            label, location = reader.label, reader.location
        except stripe.error.InvalidRequestError:
            raise HTTPException(400, f"Reader '{rid}' introuvable sur ce compte Stripe")
        except (stripe.error.AuthenticationError, stripe.error.APIConnectionError, stripe.error.StripeError):
            warning = "ID enregistre mais NON verifie (cle Stripe indisponible/expiree). Il deviendra actif des le renouvellement de la cle."
    else:
        warning = "ID enregistre (Stripe non configure) — a verifier une fois la cle en place."
    await db.kiosk_hotels.update_one({"slug": slug}, {"$set": {
        "stripe_terminal_reader_id": rid,
        "stripe_terminal_reader_label": label,
        **({"stripe_terminal_location_id": location} if location else {}),
        "stripe_terminal_registered_at": datetime.now(timezone.utc).isoformat(),
    }})
    return {"success": True, "reader_id": rid, "label": label, "location_id": location, "warning": warning}


@router.delete("/{slug}/reader")
async def clear_hotel_reader(slug: str, request: Request):
    await require_admin(request)
    db = request.app.state.db
    await _get_hotel(db, slug)
    await db.kiosk_hotels.update_one({"slug": slug}, {"$set": {
        "stripe_terminal_reader_id": None, "stripe_terminal_reader_label": None,
    }})
    return {"success": True}



# ── Devices (borne-level) ──
@router.get("/{slug}/devices")
async def list_devices(slug: str, request: Request):
    await require_admin(request)
    db = request.app.state.db
    devices = await db.kiosk_devices.find({"hotel_slug": slug}, {"_id": 0}).sort("created_at", 1).to_list(100)
    return [_clean_device(d) for d in devices]


@router.post("/{slug}/devices")
async def create_device(slug: str, data: DeviceCreate, request: Request):
    await require_admin(request)
    db = request.app.state.db
    await _get_hotel(db, slug)
    code = (data.device_code or "").strip()
    if not code:
        count = await db.kiosk_devices.count_documents({"hotel_slug": slug})
        code = f"TERM-{count + 1:03d}"
    if await db.kiosk_devices.find_one({"device_code": code}):
        raise HTTPException(409, f"Le Terminal ID '{code}' existe deja")
    now = datetime.now(timezone.utc).isoformat()
    device = {
        "id": str(uuid.uuid4()),
        "hotel_slug": slug,
        "device_code": code,
        "label": data.label.strip() or code,
        "stripe_terminal_reader_id": None,
        "stripe_terminal_reader_label": None,
        "stripe_terminal_location_id": None,
        "last_seen_at": None,
        "created_at": now,
    }
    await db.kiosk_devices.insert_one(dict(device))
    return _clean_device(device)


@router.delete("/devices/{device_id}")
async def delete_device(device_id: str, request: Request):
    await require_admin(request)
    db = request.app.state.db
    res = await db.kiosk_devices.delete_one({"id": device_id})
    if res.deleted_count == 0:
        raise HTTPException(404, "Borne introuvable")
    return {"success": True}


@router.post("/devices/{device_id}/register-reader")
async def device_register_reader(device_id: str, data: RegisterReaderReq, request: Request):
    await require_admin(request)
    db = request.app.state.db
    if not stripe.api_key:
        raise HTTPException(400, "Stripe non configure")
    device = await db.kiosk_devices.find_one({"id": device_id}, {"_id": 0})
    if not device:
        raise HTTPException(404, "Borne introuvable")
    hotel = await _get_hotel(db, device["hotel_slug"])
    try:
        location_id = await _get_or_create_location(db, hotel, data)
    except stripe.error.AuthenticationError:
        raise HTTPException(400, "Cle API Stripe invalide ou expiree — contactez l'administrateur")
    except stripe.error.StripeError as e:
        raise HTTPException(400, f"Stripe indisponible: {e}")
    try:
        reader = stripe.terminal.Reader.create(
            registration_code=data.code.strip(),
            label=device.get("label") or f"{device['hotel_slug']}-{device['device_code']}",
            location=location_id,
            metadata={"hotel_slug": device["hotel_slug"], "device_code": device["device_code"], "device_id": device_id},
        )
    except stripe.error.InvalidRequestError as e:
        msg = str(e)
        if "registration_code" in msg.lower() or "code" in msg.lower():
            raise HTTPException(400, "Code de pairing invalide ou expire. Redemarrez le terminal pour un nouveau code (valable 30 min).")
        raise HTTPException(400, f"Erreur Stripe: {msg}")
    except stripe.error.AuthenticationError:
        raise HTTPException(400, "Cle API Stripe invalide ou expiree — contactez l'administrateur")
    except stripe.error.StripeError as e:
        raise HTTPException(400, f"Stripe indisponible: {e}")
    except Exception as e:
        raise HTTPException(400, f"Echec d'enregistrement: {e}")
    await _store_reader_on_device(db, device, reader)
    return {"success": True, "reader_id": reader.id, "label": reader.label,
            "device_type": reader.device_type, "location_id": location_id, "status": reader.status}


@router.post("/devices/{device_id}/link-reader")
async def device_link_reader(device_id: str, data: LinkReaderReq, request: Request):
    await require_admin(request)
    db = request.app.state.db
    if not stripe.api_key:
        raise HTTPException(400, "Stripe non configure")
    device = await db.kiosk_devices.find_one({"id": device_id}, {"_id": 0})
    if not device:
        raise HTTPException(404, "Borne introuvable")
    await _get_hotel(db, device["hotel_slug"])
    try:
        reader = stripe.terminal.Reader.retrieve(data.readerId.strip())
    except stripe.error.InvalidRequestError:
        raise HTTPException(404, f"Reader '{data.readerId}' introuvable sur ce compte Stripe")
    except stripe.error.AuthenticationError:
        raise HTTPException(400, "Cle API Stripe invalide ou expiree — contactez l'administrateur")
    except stripe.error.StripeError as e:
        raise HTTPException(400, f"Stripe indisponible: {e}")
    await _store_reader_on_device(db, device, reader)
    return {"success": True, "reader_id": reader.id, "label": reader.label,
            "device_type": reader.device_type, "location_id": reader.location, "status": reader.status}


@router.post("/devices/{device_id}/unlink-reader")
async def device_unlink_reader(device_id: str, request: Request):
    await require_admin(request)
    db = request.app.state.db
    device = await db.kiosk_devices.find_one({"id": device_id}, {"_id": 0})
    if not device:
        raise HTTPException(404, "Borne introuvable")
    old_reader = device.get("stripe_terminal_reader_id")
    await db.kiosk_devices.update_one({"id": device_id}, {"$set": {
        "stripe_terminal_reader_id": None, "stripe_terminal_reader_label": None,
    }})
    # If the hotel-level mirror pointed at this reader, clear it too
    if old_reader:
        await db.kiosk_hotels.update_one(
            {"slug": device["hotel_slug"], "stripe_terminal_reader_id": old_reader},
            {"$set": {"stripe_terminal_reader_id": None, "stripe_terminal_reader_label": None}},
        )
    return {"success": True}


@router.get("/devices/{device_id}/reader-status")
async def device_reader_status(device_id: str, request: Request):
    await require_admin(request)
    db = request.app.state.db
    device = await db.kiosk_devices.find_one({"id": device_id}, {"_id": 0})
    if not device:
        raise HTTPException(404, "Borne introuvable")
    rid = device.get("stripe_terminal_reader_id")
    if not rid:
        return {"registered": False, "borne_status": _device_status(device)}
    try:
        reader = stripe.terminal.Reader.retrieve(rid)
        return {
            "registered": True, "reader_id": reader.id, "label": reader.label,
            "reader_status": reader.status, "device_type": reader.device_type,
            "ip_address": getattr(reader, "ip_address", None),
            "location_id": reader.location, "borne_status": _device_status(device),
        }
    except Exception as e:
        return {"registered": True, "error": str(e), "borne_status": _device_status(device)}


async def _store_reader_on_device(db, device: dict, reader) -> None:
    now = datetime.now(timezone.utc).isoformat()
    await db.kiosk_devices.update_one({"id": device["id"]}, {"$set": {
        "stripe_terminal_reader_id": reader.id,
        "stripe_terminal_reader_label": reader.label,
        "stripe_terminal_location_id": reader.location,
        "stripe_terminal_registered_at": now,
    }})
    # Mirror to hotel doc for backward-compat with the single-borne payment flow
    await db.kiosk_hotels.update_one({"slug": device["hotel_slug"]}, {"$set": {
        "stripe_terminal_reader_id": reader.id,
        "stripe_terminal_reader_label": reader.label,
        "stripe_terminal_location_id": reader.location,
        "stripe_terminal_registered_at": now,
    }})
