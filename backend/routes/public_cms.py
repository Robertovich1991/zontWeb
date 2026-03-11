"""Public CMS API endpoints - no authentication required."""
from fastapi import APIRouter, Request
from typing import Optional

router = APIRouter(prefix="/api/public", tags=["public"])


@router.get("/homepage")
async def get_public_homepage(request: Request):
    db = request.app.state.db
    doc = await db.cms_homepage.find_one({"id": "homepage"}, {"_id": 0})
    return doc or {}


@router.get("/trust-blocks")
async def get_public_trust_blocks(request: Request):
    db = request.app.state.db
    blocks = await db.cms_trust_blocks.find(
        {"active": True}, {"_id": 0}
    ).sort("order", 1).to_list(100)
    return blocks


@router.get("/faqs")
async def get_public_faqs(request: Request, page_id: Optional[str] = None):
    db = request.app.state.db
    query = {"active": True}
    if page_id:
        query["page_id"] = page_id
    else:
        query["page_id"] = None
    faqs = await db.cms_faqs.find(query, {"_id": 0}).sort("order", 1).to_list(100)
    return faqs


@router.get("/pages")
async def get_public_pages(request: Request):
    db = request.app.state.db
    pages = await db.cms_pages.find(
        {"status": "published"},
        {"_id": 0, "internal_name": 1, "page_type": 1, "slug": 1, "seo": 1, "priority": 1}
    ).sort("priority", 1).to_list(200)
    return pages


@router.get("/pages/by-slug/{slug}")
async def get_public_page_by_slug(slug: str, request: Request):
    db = request.app.state.db
    doc = await db.cms_pages.find_one(
        {"status": "published", "$or": [
            {"slug.fr": f"/{slug}"}, {"slug.en": f"/{slug}"},
            {"slug.ru": f"/{slug}"}, {"slug.hy": f"/{slug}"}
        ]},
        {"_id": 0}
    )
    return doc or {}


@router.get("/places")
async def get_public_places(request: Request, place_type: Optional[str] = None):
    db = request.app.state.db
    query = {"status": "active"}
    if place_type:
        query["place_type"] = place_type
    places = await db.cms_places.find(query, {"_id": 0}).sort("price_from", 1).to_list(200)
    return places
