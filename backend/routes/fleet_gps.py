"""Fleet GPS - Teltonika GPS tracking via VPS webhook.

Architecture:
  Teltonika FMB/FMC -> VPS (Node.js TCP decoder) -> POST /api/fleet/gps/webhook -> MongoDB
  Frontend -> GET /api/fleet/gps/positions (polling) or GET /api/fleet/gps/stream (SSE)
"""
from fastapi import APIRouter, Request, HTTPException, Query
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime, timezone
import asyncio
import logging
import os
import uuid

from routes.fleet_shared import get_token, get_company_id, get_db

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/fleet/gps", tags=["fleet-gps"])

GPS_WEBHOOK_KEY = os.environ.get("GPS_WEBHOOK_API_KEY", "")


# ── Pydantic Models ───────────────────────────────────────────────────

class GpsPosition(BaseModel):
    timestamp: str
    lat: float
    lng: float
    speed: float = 0
    heading: int = 0
    altitude: float = 0
    satellites: int = 0
    ignition: Optional[bool] = None


class WebhookPayload(BaseModel):
    imei: str
    positions: list[GpsPosition]


class DeviceCreate(BaseModel):
    imei: str
    vehicleName: str = ""
    licensePlate: str = ""
    driverId: Optional[str] = None
    driverName: Optional[str] = ""


class DeviceUpdate(BaseModel):
    vehicleName: Optional[str] = None
    licensePlate: Optional[str] = None
    driverId: Optional[str] = None
    driverName: Optional[str] = None


# ── Webhook (from VPS) ────────────────────────────────────────────────

@router.post("/webhook")
async def gps_webhook(payload: WebhookPayload, request: Request):
    """Receive decoded GPS data from the external VPS.
    Secured by X-GPS-API-Key header.
    """
    api_key = request.headers.get("X-GPS-API-Key", "")
    if not GPS_WEBHOOK_KEY or api_key != GPS_WEBHOOK_KEY:
        raise HTTPException(403, "Cle API GPS invalide")

    db = get_db(request)
    imei = payload.imei.strip()
    if not imei:
        raise HTTPException(400, "IMEI requis")

    if not payload.positions:
        return {"received": 0}

    now_iso = datetime.now(timezone.utc).isoformat()

    # Prepare history documents
    history_docs = []
    latest_pos = None
    latest_ts = ""

    for pos in payload.positions:
        doc = {
            "imei": imei,
            "timestamp": pos.timestamp,
            "lat": pos.lat,
            "lng": pos.lng,
            "speed": pos.speed,
            "heading": pos.heading,
            "altitude": pos.altitude,
            "satellites": pos.satellites,
            "ignition": pos.ignition,
            "receivedAt": now_iso,
        }
        history_docs.append(doc)
        if pos.timestamp > latest_ts:
            latest_ts = pos.timestamp
            latest_pos = doc

    # Insert all positions into history
    if history_docs:
        await db.gps_history.insert_many(history_docs)

    # Update latest position (upsert by IMEI)
    if latest_pos:
        await db.gps_positions.update_one(
            {"imei": imei},
            {"$set": {
                "imei": imei,
                "lat": latest_pos["lat"],
                "lng": latest_pos["lng"],
                "speed": latest_pos["speed"],
                "heading": latest_pos["heading"],
                "altitude": latest_pos["altitude"],
                "satellites": latest_pos["satellites"],
                "ignition": latest_pos["ignition"],
                "timestamp": latest_pos["timestamp"],
                "updatedAt": now_iso,
            }},
            upsert=True,
        )

    logger.info(f"GPS webhook: IMEI={imei}, {len(history_docs)} positions stored")
    return {"received": len(history_docs), "imei": imei}


# ── Batch Webhook (multiple devices) ─────────────────────────────────

class BatchWebhookPayload(BaseModel):
    devices: list[WebhookPayload]


@router.post("/webhook/batch")
async def gps_webhook_batch(payload: BatchWebhookPayload, request: Request):
    """Receive decoded GPS data for multiple devices at once."""
    api_key = request.headers.get("X-GPS-API-Key", "")
    if not GPS_WEBHOOK_KEY or api_key != GPS_WEBHOOK_KEY:
        raise HTTPException(403, "Cle API GPS invalide")

    db = get_db(request)
    now_iso = datetime.now(timezone.utc).isoformat()
    total_received = 0

    for device_data in payload.devices:
        imei = device_data.imei.strip()
        if not imei or not device_data.positions:
            continue

        history_docs = []
        latest_pos = None
        latest_ts = ""

        for pos in device_data.positions:
            doc = {
                "imei": imei,
                "timestamp": pos.timestamp,
                "lat": pos.lat,
                "lng": pos.lng,
                "speed": pos.speed,
                "heading": pos.heading,
                "altitude": pos.altitude,
                "satellites": pos.satellites,
                "ignition": pos.ignition,
                "receivedAt": now_iso,
            }
            history_docs.append(doc)
            if pos.timestamp > latest_ts:
                latest_ts = pos.timestamp
                latest_pos = doc

        if history_docs:
            await db.gps_history.insert_many(history_docs)
            total_received += len(history_docs)

        if latest_pos:
            await db.gps_positions.update_one(
                {"imei": imei},
                {"$set": {
                    "imei": imei,
                    "lat": latest_pos["lat"],
                    "lng": latest_pos["lng"],
                    "speed": latest_pos["speed"],
                    "heading": latest_pos["heading"],
                    "altitude": latest_pos["altitude"],
                    "satellites": latest_pos["satellites"],
                    "ignition": latest_pos["ignition"],
                    "timestamp": latest_pos["timestamp"],
                    "updatedAt": now_iso,
                }},
                upsert=True,
            )

    logger.info(f"GPS batch webhook: {len(payload.devices)} devices, {total_received} positions")
    return {"received": total_received, "devices": len(payload.devices)}


# ── Device CRUD ───────────────────────────────────────────────────────

@router.get("/devices")
async def list_devices(request: Request):
    """List all registered GPS devices for this company."""
    get_token(request)
    company_id = get_company_id(request)
    db = get_db(request)

    devices = await db.gps_devices.find(
        {"companyId": company_id}, {"_id": 0}
    ).sort("createdAt", -1).to_list(500)

    # Enrich with latest position
    for device in devices:
        pos = await db.gps_positions.find_one(
            {"imei": device["imei"]}, {"_id": 0}
        )
        device["lastPosition"] = pos

    return {"devices": devices, "count": len(devices)}


@router.post("/devices")
async def create_device(data: DeviceCreate, request: Request):
    """Register a new GPS device (IMEI)."""
    get_token(request)
    company_id = get_company_id(request)
    db = get_db(request)

    imei = data.imei.strip()
    if not imei:
        raise HTTPException(400, "IMEI requis")

    # Check duplicate
    existing = await db.gps_devices.find_one(
        {"imei": imei, "companyId": company_id}
    )
    if existing:
        raise HTTPException(409, f"Appareil IMEI {imei} deja enregistre")

    now_iso = datetime.now(timezone.utc).isoformat()
    device_doc = {
        "id": str(uuid.uuid4()),
        "companyId": company_id,
        "imei": imei,
        "vehicleName": data.vehicleName,
        "licensePlate": data.licensePlate,
        "driverId": data.driverId,
        "driverName": data.driverName or "",
        "createdAt": now_iso,
        "updatedAt": now_iso,
    }

    await db.gps_devices.insert_one(device_doc)
    device_doc.pop("_id", None)
    return {"success": True, "device": device_doc}


@router.put("/devices/{imei}")
async def update_device(imei: str, data: DeviceUpdate, request: Request):
    """Update a GPS device's metadata."""
    get_token(request)
    company_id = get_company_id(request)
    db = get_db(request)

    update_fields = {"updatedAt": datetime.now(timezone.utc).isoformat()}
    if data.vehicleName is not None:
        update_fields["vehicleName"] = data.vehicleName
    if data.licensePlate is not None:
        update_fields["licensePlate"] = data.licensePlate
    if data.driverId is not None:
        update_fields["driverId"] = data.driverId
    if data.driverName is not None:
        update_fields["driverName"] = data.driverName

    result = await db.gps_devices.update_one(
        {"imei": imei, "companyId": company_id},
        {"$set": update_fields},
    )
    if result.matched_count == 0:
        raise HTTPException(404, "Appareil non trouve")

    updated = await db.gps_devices.find_one(
        {"imei": imei, "companyId": company_id}, {"_id": 0}
    )
    return {"success": True, "device": updated}


@router.delete("/devices/{imei}")
async def delete_device(imei: str, request: Request):
    """Remove a GPS device registration."""
    get_token(request)
    company_id = get_company_id(request)
    db = get_db(request)

    result = await db.gps_devices.delete_one(
        {"imei": imei, "companyId": company_id}
    )
    if result.deleted_count == 0:
        raise HTTPException(404, "Appareil non trouve")

    return {"success": True, "message": f"Appareil {imei} supprime"}


# ── Position Endpoints ────────────────────────────────────────────────

@router.get("/positions")
async def get_all_positions(request: Request):
    """Get latest positions for all devices of this company."""
    get_token(request)
    company_id = get_company_id(request)
    db = get_db(request)

    # Get company devices
    devices = await db.gps_devices.find(
        {"companyId": company_id}, {"_id": 0}
    ).to_list(500)

    if not devices:
        return {"positions": [], "count": 0}

    imeis = [d["imei"] for d in devices]
    positions = await db.gps_positions.find(
        {"imei": {"$in": imeis}}, {"_id": 0}
    ).to_list(500)

    # Build lookup
    pos_map = {p["imei"]: p for p in positions}

    result = []
    for device in devices:
        pos = pos_map.get(device["imei"])
        entry = {
            "imei": device["imei"],
            "vehicleName": device.get("vehicleName", ""),
            "licensePlate": device.get("licensePlate", ""),
            "driverId": device.get("driverId"),
            "driverName": device.get("driverName", ""),
        }
        if pos:
            entry.update({
                "lat": pos["lat"],
                "lng": pos["lng"],
                "speed": pos["speed"],
                "heading": pos["heading"],
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


@router.get("/positions/{imei}")
async def get_device_position(imei: str, request: Request):
    """Get latest position for a specific device."""
    get_token(request)
    company_id = get_company_id(request)
    db = get_db(request)

    # Verify device belongs to company
    device = await db.gps_devices.find_one(
        {"imei": imei, "companyId": company_id}, {"_id": 0}
    )
    if not device:
        raise HTTPException(404, "Appareil non trouve")

    pos = await db.gps_positions.find_one({"imei": imei}, {"_id": 0})

    return {
        "device": device,
        "position": pos,
    }


# ── History Endpoint ──────────────────────────────────────────────────

@router.get("/history/{imei}")
async def get_device_history(
    imei: str,
    request: Request,
    start: str = Query(..., description="ISO date start (ex: 2026-02-15T00:00:00Z)"),
    end: str = Query(..., description="ISO date end (ex: 2026-02-15T23:59:59Z)"),
    limit: int = Query(5000, ge=1, le=50000),
):
    """Get position history for a specific device within a date range."""
    get_token(request)
    company_id = get_company_id(request)
    db = get_db(request)

    # Verify device belongs to company
    device = await db.gps_devices.find_one(
        {"imei": imei, "companyId": company_id}, {"_id": 0}
    )
    if not device:
        raise HTTPException(404, "Appareil non trouve")

    history = await db.gps_history.find(
        {
            "imei": imei,
            "timestamp": {"$gte": start, "$lte": end},
        },
        {"_id": 0},
    ).sort("timestamp", 1).to_list(limit)

    return {
        "device": device,
        "history": history,
        "count": len(history),
        "period": {"start": start, "end": end},
    }


# ── SSE Stream (Real-Time) ───────────────────────────────────────────

@router.get("/stream")
async def gps_stream(request: Request):
    """Server-Sent Events stream for real-time GPS positions.
    The frontend connects to this endpoint and receives position
    updates every few seconds.
    """
    get_token(request)
    company_id = get_company_id(request)
    db = get_db(request)

    async def event_generator():
        import json
        while True:
            # Check if client disconnected
            if await request.is_disconnected():
                break

            # Fetch latest positions for company devices
            devices = await db.gps_devices.find(
                {"companyId": company_id}, {"_id": 0, "imei": 1, "vehicleName": 1, "licensePlate": 1, "driverName": 1}
            ).to_list(500)

            if devices:
                imeis = [d["imei"] for d in devices]
                positions = await db.gps_positions.find(
                    {"imei": {"$in": imeis}}, {"_id": 0}
                ).to_list(500)

                pos_map = {p["imei"]: p for p in positions}
                data = []
                for d in devices:
                    pos = pos_map.get(d["imei"])
                    entry = {
                        "imei": d["imei"],
                        "vehicleName": d.get("vehicleName", ""),
                        "licensePlate": d.get("licensePlate", ""),
                        "driverName": d.get("driverName", ""),
                    }
                    if pos:
                        entry.update({
                            "lat": pos["lat"],
                            "lng": pos["lng"],
                            "speed": pos["speed"],
                            "heading": pos["heading"],
                            "ignition": pos.get("ignition"),
                            "timestamp": pos["timestamp"],
                        })
                    data.append(entry)

                yield f"data: {json.dumps(data)}\n\n"

            await asyncio.sleep(5)

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


# ── Stats Endpoint ────────────────────────────────────────────────────

@router.get("/stats")
async def gps_stats(request: Request):
    """Get GPS system stats for this company."""
    get_token(request)
    company_id = get_company_id(request)
    db = get_db(request)

    device_count = await db.gps_devices.count_documents({"companyId": company_id})

    devices = await db.gps_devices.find(
        {"companyId": company_id}, {"_id": 0, "imei": 1}
    ).to_list(500)
    imeis = [d["imei"] for d in devices]

    online_count = 0
    if imeis:
        positions = await db.gps_positions.find(
            {"imei": {"$in": imeis}}, {"_id": 0, "imei": 1, "updatedAt": 1}
        ).to_list(500)
        now = datetime.now(timezone.utc)
        for pos in positions:
            updated = pos.get("updatedAt", "")
            if updated:
                try:
                    dt = datetime.fromisoformat(updated.replace("Z", "+00:00"))
                    diff = (now - dt).total_seconds()
                    if diff < 300:  # 5 minutes
                        online_count += 1
                except (ValueError, TypeError):
                    pass

    total_history = 0
    if imeis:
        total_history = await db.gps_history.count_documents({"imei": {"$in": imeis}})

    return {
        "devices": device_count,
        "online": online_count,
        "offline": device_count - online_count,
        "totalPositions": total_history,
    }


# ── API Key Info (for admin setup) ────────────────────────────────────

@router.get("/webhook-info")
async def get_webhook_info(request: Request):
    """Get webhook configuration info for VPS setup.
    Returns the webhook URL and masked API key.
    """
    get_token(request)
    get_company_id(request)

    base_url = str(os.environ.get("REACT_APP_BACKEND_URL", request.base_url)).rstrip("/")
    masked_key = GPS_WEBHOOK_KEY[:8] + "..." + GPS_WEBHOOK_KEY[-4:] if len(GPS_WEBHOOK_KEY) > 12 else "***"

    return {
        "webhookUrl": f"{base_url}/api/fleet/gps/webhook",
        "batchWebhookUrl": f"{base_url}/api/fleet/gps/webhook/batch",
        "apiKeyMasked": masked_key,
        "headerName": "X-GPS-API-Key",
        "format": {
            "single": {
                "imei": "350424063817592",
                "positions": [{
                    "timestamp": "2026-02-15T14:30:00Z",
                    "lat": 43.2965,
                    "lng": 5.3698,
                    "speed": 45,
                    "heading": 180,
                    "altitude": 12,
                    "satellites": 8,
                    "ignition": True,
                }],
            },
            "batch": {
                "devices": [{
                    "imei": "350424063817592",
                    "positions": [{"timestamp": "...", "lat": 0, "lng": 0}],
                }],
            },
        },
    }
