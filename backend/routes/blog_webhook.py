"""
Webhook endpoint that receives blog article published/updated events from external
content platforms (e.g. BabyLoveGrowth.ai) and stores them in MongoDB.

This lets us host blog content directly on zont.cab/blog/<slug> (sub-folder SEO)
instead of relying on the external subdomain blog.zont.cab.

Inbound payload schema:
    {
      "event": "article.published" | "article.updated",
      "article": {
        "id": "<external id>",
        "title": "...",
        "slug": "url-friendly-slug",
        "content": "<html or markdown>",
        "metaTitle": "...",
        "metaDescription": "...",
        "featuredImage": "https://...",
        "createdAt": "ISO-8601",
        "updatedAt": "ISO-8601"
      }
    }
"""
import logging
import re
from datetime import datetime, timezone
from typing import Optional
from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel, Field

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api", tags=["webhooks"])

# Module-level handle to the Motor MongoDB database, injected by server.py at startup
db = None


def set_db(database):
    global db
    db = database


class ArticleIn(BaseModel):
    id: str
    title: str
    slug: str
    content: str = ""
    metaTitle: Optional[str] = None
    metaDescription: Optional[str] = None
    featuredImage: Optional[str] = None
    createdAt: Optional[str] = None
    updatedAt: Optional[str] = None


class BlogWebhookPayload(BaseModel):
    event: str
    article: ArticleIn


SLUG_PATTERN = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")


def sanitize_slug(raw: str) -> str:
    s = (raw or "").strip().lower()
    s = re.sub(r"[^a-z0-9\-\s]", "", s)
    s = re.sub(r"[\s_]+", "-", s)
    s = re.sub(r"-+", "-", s).strip("-")
    return s


@router.post("/webhooks/blog")
async def blog_article_webhook(payload: BlogWebhookPayload, request: Request):
    if db is None:
        raise HTTPException(503, "Database not available")

    article = payload.article
    slug = sanitize_slug(article.slug or article.title)
    if not slug or not SLUG_PATTERN.match(slug):
        raise HTTPException(400, f"Invalid slug after sanitization: '{slug}'")

    doc = {
        "external_id": article.id,
        "title": article.title,
        "slug": slug,
        "content": article.content,
        "meta_title": article.metaTitle or article.title,
        "meta_description": article.metaDescription or "",
        "featured_image": article.featuredImage or "",
        "createdAt": article.createdAt or datetime.now(timezone.utc).isoformat(),
        "updatedAt": article.updatedAt or datetime.now(timezone.utc).isoformat(),
        "received_at": datetime.now(timezone.utc).isoformat(),
        "event": payload.event,
        "source_ip": request.client.host if request.client else None,
    }

    # Upsert by external_id (or slug if external_id missing) so updates replace
    key = {"external_id": article.id} if article.id else {"slug": slug}
    result = await db.blog_articles.update_one(key, {"$set": doc}, upsert=True)
    is_new = result.upserted_id is not None
    logger.info(f"Blog webhook {payload.event}: slug='{slug}', new={is_new}")

    return {
        "success": True,
        "slug": slug,
        "url": f"https://www.zont.cab/blog/{slug}",
        "created": is_new,
        "event": payload.event,
    }


# Public read endpoints — used by the React frontend to render the blog
@router.get("/blog-articles")
async def list_articles(limit: int = 50):
    if db is None:
        raise HTTPException(503, "Database not available")
    docs = await db.blog_articles.find(
        {}, {"_id": 0, "content": 0, "source_ip": 0}
    ).sort("createdAt", -1).limit(min(limit, 100)).to_list(100)
    return {"articles": docs, "total": len(docs)}


@router.get("/blog-articles/{slug}")
async def get_article(slug: str):
    if db is None:
        raise HTTPException(503, "Database not available")
    doc = await db.blog_articles.find_one({"slug": slug}, {"_id": 0, "source_ip": 0})
    if not doc:
        raise HTTPException(404, "Article not found")
    return doc
