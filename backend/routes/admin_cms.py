from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timezone
import uuid
from middleware.auth import get_current_admin

router = APIRouter(prefix="/api/admin/cms", tags=["admin-cms"])

class MultiLang(BaseModel):
    fr: str = ""
    en: str = ""
    ru: str = ""
    hy: str = ""

# --- Trust Blocks ---
class TrustBlockCreate(BaseModel):
    title: MultiLang = MultiLang()
    text: MultiLang = MultiLang()
    icon: str = "shield"
    active: bool = True
    order: int = 0

@router.get("/trust-blocks")
async def list_trust_blocks(request: Request):
    await get_current_admin(request)
    db = request.app.state.db
    blocks = await db.cms_trust_blocks.find({}, {"_id": 0}).sort("order", 1).to_list(50)
    return blocks

@router.post("/trust-blocks")
async def create_trust_block(data: TrustBlockCreate, request: Request):
    await get_current_admin(request)
    db = request.app.state.db
    now = datetime.now(timezone.utc).isoformat()
    doc = data.model_dump()
    doc["id"] = str(uuid.uuid4())
    doc["created_at"] = now
    doc["updated_at"] = now
    await db.cms_trust_blocks.insert_one(doc)
    doc.pop("_id", None)
    return doc

@router.put("/trust-blocks/{block_id}")
async def update_trust_block(block_id: str, data: TrustBlockCreate, request: Request):
    await get_current_admin(request)
    db = request.app.state.db
    update = data.model_dump()
    update["updated_at"] = datetime.now(timezone.utc).isoformat()
    await db.cms_trust_blocks.update_one({"id": block_id}, {"$set": update})
    result = await db.cms_trust_blocks.find_one({"id": block_id}, {"_id": 0})
    if not result:
        raise HTTPException(status_code=404, detail="Block not found")
    return result

@router.delete("/trust-blocks/{block_id}")
async def delete_trust_block(block_id: str, request: Request):
    user = await get_current_admin(request)
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    db = request.app.state.db
    await db.cms_trust_blocks.delete_one({"id": block_id})
    return {"message": "Deleted"}

@router.patch("/trust-blocks/{block_id}/toggle")
async def toggle_trust_block(block_id: str, request: Request):
    await get_current_admin(request)
    db = request.app.state.db
    block = await db.cms_trust_blocks.find_one({"id": block_id})
    if not block:
        raise HTTPException(status_code=404, detail="Block not found")
    await db.cms_trust_blocks.update_one({"id": block_id}, {"$set": {"active": not block["active"]}})
    return {"active": not block["active"]}

# --- Homepage Config ---
class StatItem(BaseModel):
    value: str = ""
    label: MultiLang = MultiLang()

class AdvantageItem(BaseModel):
    title: MultiLang = MultiLang()
    text: MultiLang = MultiLang()
    icon: str = ""

class HomepageConfig(BaseModel):
    title: MultiLang = MultiLang()
    subtitle: MultiLang = MultiLang()
    review_badge: MultiLang = MultiLang()
    stats: List[StatItem] = []
    advantages: List[AdvantageItem] = []
    popular_destinations: List[str] = []
    cta_title: MultiLang = MultiLang()
    cta_button: MultiLang = MultiLang()
    sections_order: List[str] = ["hero", "stats", "advantages", "destinations", "reviews", "cta"]

@router.get("/homepage")
async def get_homepage_config(request: Request):
    await get_current_admin(request)
    db = request.app.state.db
    config = await db.cms_homepage.find_one({"id": "homepage"}, {"_id": 0})
    if not config:
        return {"id": "homepage", "title": {}, "subtitle": {}, "stats": [], "advantages": [], "sections_order": []}
    return config

@router.put("/homepage")
async def update_homepage_config(data: HomepageConfig, request: Request):
    await get_current_admin(request)
    db = request.app.state.db
    doc = data.model_dump()
    doc["id"] = "homepage"
    doc["updated_at"] = datetime.now(timezone.utc).isoformat()
    await db.cms_homepage.update_one({"id": "homepage"}, {"$set": doc}, upsert=True)
    result = await db.cms_homepage.find_one({"id": "homepage"}, {"_id": 0})
    return result

# --- FAQ ---
class FaqCreate(BaseModel):
    page_id: Optional[str] = None
    question: MultiLang = MultiLang()
    answer: MultiLang = MultiLang()
    order: int = 0
    active: bool = True

@router.get("/faqs")
async def list_faqs(request: Request, page_id: Optional[str] = None):
    await get_current_admin(request)
    db = request.app.state.db
    query = {}
    if page_id:
        query["page_id"] = page_id
    faqs = await db.cms_faqs.find(query, {"_id": 0}).sort("order", 1).to_list(200)
    return faqs

@router.post("/faqs")
async def create_faq(data: FaqCreate, request: Request):
    await get_current_admin(request)
    db = request.app.state.db
    doc = data.model_dump()
    doc["id"] = str(uuid.uuid4())
    doc["created_at"] = datetime.now(timezone.utc).isoformat()
    await db.cms_faqs.insert_one(doc)
    doc.pop("_id", None)
    return doc

@router.put("/faqs/{faq_id}")
async def update_faq(faq_id: str, data: FaqCreate, request: Request):
    await get_current_admin(request)
    db = request.app.state.db
    update = data.model_dump()
    update["updated_at"] = datetime.now(timezone.utc).isoformat()
    await db.cms_faqs.update_one({"id": faq_id}, {"$set": update})
    result = await db.cms_faqs.find_one({"id": faq_id}, {"_id": 0})
    if not result:
        raise HTTPException(status_code=404, detail="FAQ not found")
    return result

@router.delete("/faqs/{faq_id}")
async def delete_faq(faq_id: str, request: Request):
    await get_current_admin(request)
    db = request.app.state.db
    await db.cms_faqs.delete_one({"id": faq_id})
    return {"message": "Deleted"}

# --- SEO Overview ---
@router.get("/seo-overview")
async def seo_overview(request: Request):
    await get_current_admin(request)
    db = request.app.state.db
    pages = await db.cms_pages.find({}, {"_id": 0, "id": 1, "internal_name": 1, "page_type": 1, "slug": 1, "seo": 1, "status": 1}).sort("priority", 1).to_list(500)
    return pages

# --- Stats/Dashboard ---
@router.get("/stats")
async def get_stats(request: Request):
    await get_current_admin(request)
    db = request.app.state.db
    pages_count = await db.cms_pages.count_documents({})
    published = await db.cms_pages.count_documents({"status": "published"})
    draft = await db.cms_pages.count_documents({"status": "draft"})
    places_count = await db.cms_places.count_documents({})
    active_places = await db.cms_places.count_documents({"status": "active"})
    trust_blocks = await db.cms_trust_blocks.count_documents({})
    faqs_count = await db.cms_faqs.count_documents({})
    leads_count = await db.leads.count_documents({})
    return {
        "pages": {"total": pages_count, "published": published, "draft": draft},
        "places": {"total": places_count, "active": active_places},
        "trust_blocks": trust_blocks,
        "faqs": faqs_count,
        "leads": leads_count,
    }
