from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timezone
import uuid
from middleware.auth import get_current_admin

router = APIRouter(prefix="/api/admin/places", tags=["admin-places"])

class MultiLang(BaseModel):
    fr: str = ""
    en: str = ""
    ru: str = ""
    hy: str = ""

class PlaceCreate(BaseModel):
    name: MultiLang = MultiLang()
    place_type: str  # city, airport, station, country, region
    country: str = ""
    parent_city_id: Optional[str] = None
    airport_code: str = ""
    description_short: MultiLang = MultiLang()
    description_seo: MultiLang = MultiLang()
    price_from: Optional[float] = None
    associated_destinations: List[str] = []
    keywords: List[str] = []
    image: str = ""
    status: str = "active"  # active, inactive

class PlaceUpdate(PlaceCreate):
    pass

@router.get("")
async def list_places(request: Request, place_type: Optional[str] = None, status: Optional[str] = None, search: Optional[str] = None, country: Optional[str] = None):
    await get_current_admin(request)
    db = request.app.state.db
    query = {}
    if place_type:
        query["place_type"] = place_type
    if status:
        query["status"] = status
    if country:
        query["country"] = {"$regex": country, "$options": "i"}
    if search:
        query["$or"] = [
            {"name.fr": {"$regex": search, "$options": "i"}},
            {"name.en": {"$regex": search, "$options": "i"}},
            {"airport_code": {"$regex": search, "$options": "i"}},
        ]
    places = await db.cms_places.find(query, {"_id": 0}).sort("name.fr", 1).to_list(500)
    return places

@router.get("/{place_id}")
async def get_place(place_id: str, request: Request):
    await get_current_admin(request)
    db = request.app.state.db
    place = await db.cms_places.find_one({"id": place_id}, {"_id": 0})
    if not place:
        raise HTTPException(status_code=404, detail="Place not found")
    return place

@router.post("")
async def create_place(data: PlaceCreate, request: Request):
    await get_current_admin(request)
    db = request.app.state.db
    now = datetime.now(timezone.utc).isoformat()
    doc = data.model_dump()
    doc["id"] = str(uuid.uuid4())
    doc["created_at"] = now
    doc["updated_at"] = now
    await db.cms_places.insert_one(doc)
    doc.pop("_id", None)
    return doc

@router.put("/{place_id}")
async def update_place(place_id: str, data: PlaceUpdate, request: Request):
    await get_current_admin(request)
    db = request.app.state.db
    existing = await db.cms_places.find_one({"id": place_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Place not found")
    update = data.model_dump()
    update["updated_at"] = datetime.now(timezone.utc).isoformat()
    await db.cms_places.update_one({"id": place_id}, {"$set": update})
    result = await db.cms_places.find_one({"id": place_id}, {"_id": 0})
    return result

@router.delete("/{place_id}")
async def delete_place(place_id: str, request: Request):
    user = await get_current_admin(request)
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    db = request.app.state.db
    result = await db.cms_places.delete_one({"id": place_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Place not found")
    return {"message": "Place deleted"}

@router.patch("/{place_id}/status")
async def toggle_place_status(place_id: str, request: Request):
    await get_current_admin(request)
    db = request.app.state.db
    place = await db.cms_places.find_one({"id": place_id})
    if not place:
        raise HTTPException(status_code=404, detail="Place not found")
    new_status = "active" if place["status"] == "inactive" else "inactive"
    await db.cms_places.update_one({"id": place_id}, {"$set": {"status": new_status, "updated_at": datetime.now(timezone.utc).isoformat()}})
    return {"status": new_status}
