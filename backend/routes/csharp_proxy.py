"""Proxy routes to forward requests to the C# backend at api.zont.cab"""
from fastapi import APIRouter, Request, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import httpx
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/proxy", tags=["proxy"])

CSHARP_API = "https://api.zont.cab"
TIMEOUT = 15.0


class Coordinate(BaseModel):
    latitude: float
    longitude: float


class DistanceRequest(BaseModel):
    coordinates: List[Coordinate]
    radius: Optional[int] = 50


class PreorderRequest(BaseModel):
    coordinates: List[Coordinate]


@router.post("/distance")
async def proxy_distance(req: DistanceRequest):
    """Calculate trip pricing between two or more points."""
    try:
        coords = [{"latitude": c.latitude, "longitude": c.longitude} for c in req.coordinates]
        async with httpx.AsyncClient(timeout=TIMEOUT) as client:
            resp = await client.post(
                f"{CSHARP_API}/api/Distance",
                params={"radius": req.radius},
                json=coords,
            )
            resp.raise_for_status()
            return resp.json()
    except httpx.HTTPStatusError as e:
        logger.error(f"C# API error: {e.response.status_code} - {e.response.text}")
        raise HTTPException(status_code=e.response.status_code, detail="C# API error")
    except Exception as e:
        logger.error(f"Proxy distance error: {e}")
        raise HTTPException(status_code=502, detail="Failed to reach C# backend")


@router.post("/preorder-distance")
async def proxy_preorder_distance(req: PreorderRequest):
    """Get fixed pricing for preorder between two points."""
    try:
        coords = [{"latitude": c.latitude, "longitude": c.longitude} for c in req.coordinates]
        async with httpx.AsyncClient(timeout=TIMEOUT) as client:
            resp = await client.post(
                f"{CSHARP_API}/api/PreorderDistance/driverTypesTwo",
                json=coords,
            )
            resp.raise_for_status()
            return resp.json()
    except httpx.HTTPStatusError as e:
        logger.error(f"C# API error: {e.response.status_code} - {e.response.text}")
        raise HTTPException(status_code=e.response.status_code, detail="C# API error")
    except Exception as e:
        logger.error(f"Proxy preorder error: {e}")
        raise HTTPException(status_code=502, detail="Failed to reach C# backend")


@router.get("/trip-types")
async def proxy_trip_types():
    """Get available vehicle/trip types."""
    try:
        async with httpx.AsyncClient(timeout=TIMEOUT) as client:
            resp = await client.get(f"{CSHARP_API}/api/TripsPrice/gettypes")
            resp.raise_for_status()
            return resp.json()
    except Exception as e:
        logger.error(f"Proxy trip-types error: {e}")
        raise HTTPException(status_code=502, detail="Failed to reach C# backend")


@router.get("/vehicle-image/{image_path:path}")
async def proxy_vehicle_image(image_path: str):
    """Proxy vehicle images from C# backend."""
    try:
        async with httpx.AsyncClient(timeout=TIMEOUT) as client:
            resp = await client.get(f"{CSHARP_API}/api/File/{image_path}")
            resp.raise_for_status()
            from fastapi.responses import Response
            return Response(
                content=resp.content,
                media_type=resp.headers.get("content-type", "image/png"),
                headers={"Cache-Control": "public, max-age=86400"},
            )
    except Exception as e:
        logger.error(f"Proxy image error: {e}")
        raise HTTPException(status_code=502, detail="Image not available")


@router.post("/driver-types")
async def proxy_driver_types(coord: Coordinate):
    """Get available driver/vehicle types near a location."""
    try:
        async with httpx.AsyncClient(timeout=TIMEOUT) as client:
            resp = await client.post(
                f"{CSHARP_API}/api/Distance/driverTypesWithStatus",
                json={"latitude": coord.latitude, "longitude": coord.longitude},
            )
            resp.raise_for_status()
            return resp.json()
    except Exception as e:
        logger.error(f"Proxy driver-types error: {e}")
        raise HTTPException(status_code=502, detail="Failed to reach C# backend")
