from fastapi import APIRouter, HTTPException, Request, Depends
from pydantic import BaseModel
from typing import Optional, Dict, List
from datetime import datetime, timezone
import uuid
from middleware.auth import get_current_admin

router = APIRouter(prefix="/api/admin/pages", tags=["admin-pages"])

class MultiLangText(BaseModel):
    fr: str = ""
    en: str = ""
    ru: str = ""
    hy: str = ""

class SeoFields(BaseModel):
    title: MultiLangText = MultiLangText()
    meta_description: MultiLangText = MultiLangText()
    h1: MultiLangText = MultiLangText()
    h2: MultiLangText = MultiLangText()
    canonical: str = ""
    noindex: bool = False
    og_title: MultiLangText = MultiLangText()
    og_description: MultiLangText = MultiLangText()
    og_image: str = ""

class ContentBlock(BaseModel):
    title: MultiLangText = MultiLangText()
    text: MultiLangText = MultiLangText()
    image: str = ""
    order: int = 0

class FaqItem(BaseModel):
    question: MultiLangText = MultiLangText()
    answer: MultiLangText = MultiLangText()

class PageCreate(BaseModel):
    internal_name: str
    page_type: str  # city, airport, station, country, region, homepage, help, landing, faq
    slug: MultiLangText = MultiLangText()
    seo: SeoFields = SeoFields()
    intro: MultiLangText = MultiLangText()
    main_content: MultiLangText = MultiLangText()
    blocks: List[ContentBlock] = []
    faq: List[FaqItem] = []
    cta_text: MultiLangText = MultiLangText()
    hero_image: str = ""
    status: str = "draft"  # draft, published
    priority: int = 0
    related_pages: List[str] = []

class PageUpdate(PageCreate):
    pass

@router.get("")
async def list_pages(request: Request, page_type: Optional[str] = None, status: Optional[str] = None, search: Optional[str] = None):
    await get_current_admin(request)
    db = request.app.state.db
    query = {}
    if page_type:
        query["page_type"] = page_type
    if status:
        query["status"] = status
    if search:
        query["internal_name"] = {"$regex": search, "$options": "i"}
    pages = await db.cms_pages.find(query, {"_id": 0}).sort("priority", 1).to_list(500)
    return pages

@router.get("/{page_id}")
async def get_page(page_id: str, request: Request):
    await get_current_admin(request)
    db = request.app.state.db
    page = await db.cms_pages.find_one({"id": page_id}, {"_id": 0})
    if not page:
        raise HTTPException(status_code=404, detail="Page not found")
    return page

@router.post("")
async def create_page(data: PageCreate, request: Request):
    user = await get_current_admin(request)
    db = request.app.state.db
    now = datetime.now(timezone.utc).isoformat()
    doc = data.model_dump()
    doc["id"] = str(uuid.uuid4())
    doc["created_at"] = now
    doc["updated_at"] = now
    doc["created_by"] = user["email"]
    await db.cms_pages.insert_one(doc)
    doc.pop("_id", None)
    return doc

@router.put("/{page_id}")
async def update_page(page_id: str, data: PageUpdate, request: Request):
    user = await get_current_admin(request)
    db = request.app.state.db
    existing = await db.cms_pages.find_one({"id": page_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Page not found")
    update = data.model_dump()
    update["updated_at"] = datetime.now(timezone.utc).isoformat()
    update["updated_by"] = user["email"]
    await db.cms_pages.update_one({"id": page_id}, {"$set": update})
    result = await db.cms_pages.find_one({"id": page_id}, {"_id": 0})
    return result

@router.delete("/{page_id}")
async def delete_page(page_id: str, request: Request):
    user = await get_current_admin(request)
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    db = request.app.state.db
    result = await db.cms_pages.delete_one({"id": page_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Page not found")
    return {"message": "Page deleted"}

@router.patch("/{page_id}/status")
async def toggle_status(page_id: str, request: Request):
    await get_current_admin(request)
    db = request.app.state.db
    page = await db.cms_pages.find_one({"id": page_id})
    if not page:
        raise HTTPException(status_code=404, detail="Page not found")
    new_status = "published" if page["status"] == "draft" else "draft"
    await db.cms_pages.update_one({"id": page_id}, {"$set": {"status": new_status, "updated_at": datetime.now(timezone.utc).isoformat()}})
    return {"status": new_status}
