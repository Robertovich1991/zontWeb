"""
Webhook endpoint that receives blog article published/updated events from external
content platforms (e.g. BabyLoveGrowth.ai) and stores them in MongoDB.

This lets us host blog content directly on zont.cab/blog/<slug> (sub-folder SEO)
instead of relying on the external subdomain blog.zont.cab.

Inbound payload schema (flat structure):
    {
      "id": 10,
      "title": "...",
      "slug": "url-friendly-slug",
      "metaDescription": "...",
      "content_html": "<h1>...</h1>",
      "heroImageUrl": "https://cdn.example.com/hero-image.jpg",
      "content_markdown": "# ...",
      "jsonLd": { "@context": "https://schema.org", "@type": "Article" },
      "faqJsonLd": { "@context": "https://schema.org", "@type": "FAQPage" },
      "languageCode": "en",
      "publicUrl": "https://example.com/...",
      "createdAt": "ISO-8601"
    }
"""
import logging
import re
from datetime import datetime, timezone
from typing import Optional, Any, Dict, Union
from xml.sax.saxutils import escape as xml_escape
from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel, Field

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api", tags=["webhooks"])

# Module-level handle to the Motor MongoDB database, injected by server.py at startup
db = None


def set_db(database):
    global db
    db = database


class BlogWebhookPayload(BaseModel):
    """Flat payload as sent by BabyLoveGrowth and similar CMS platforms."""
    id: Union[int, str]
    title: str
    slug: str
    metaDescription: Optional[str] = ""
    content_html: Optional[str] = ""
    content_markdown: Optional[str] = ""
    heroImageUrl: Optional[str] = ""
    jsonLd: Optional[Dict[str, Any]] = None
    faqJsonLd: Optional[Dict[str, Any]] = None
    languageCode: Optional[str] = "en"
    publicUrl: Optional[str] = ""
    createdAt: Optional[str] = None
    updatedAt: Optional[str] = None

    class Config:
        extra = "allow"  # Tolerate unknown future fields without breaking


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

    slug = sanitize_slug(payload.slug or payload.title)
    if not slug or not SLUG_PATTERN.match(slug):
        raise HTTPException(400, f"Invalid slug after sanitization: '{slug}'")

    external_id = str(payload.id)
    now_iso = datetime.now(timezone.utc).isoformat()

    doc = {
        "external_id": external_id,
        "title": payload.title,
        "slug": slug,
        "meta_title": payload.title,
        "meta_description": payload.metaDescription or "",
        "content_html": payload.content_html or "",
        "content_markdown": payload.content_markdown or "",
        "hero_image_url": payload.heroImageUrl or "",
        "json_ld": payload.jsonLd or None,
        "faq_json_ld": payload.faqJsonLd or None,
        "language_code": (payload.languageCode or "en").lower(),
        "public_url": payload.publicUrl or "",
        "createdAt": payload.createdAt or now_iso,
        "updatedAt": payload.updatedAt or now_iso,
        "received_at": now_iso,
        "source_ip": request.client.host if request.client else None,
    }

    # Upsert by external_id (or slug if missing) so re-publishes replace cleanly
    key = {"external_id": external_id} if external_id else {"slug": slug}
    result = await db.blog_articles.update_one(key, {"$set": doc}, upsert=True)
    is_new = result.upserted_id is not None
    logger.info(f"Blog webhook: slug='{slug}' lang='{doc['language_code']}' new={is_new}")

    # Frontend URL — prefix with /es for Spanish, root /blog/ otherwise
    lang = doc["language_code"]
    url_prefix = "/es/blog" if lang == "es" else "/blog"
    return {
        "success": True,
        "slug": slug,
        "language": lang,
        "url": f"https://www.zont.cab{url_prefix}/{slug}",
        "created": is_new,
    }


from fastapi.responses import Response


# ---------- Dynamic XML sitemap for blog articles ----------
@router.get("/sitemap-blog.xml")
async def blog_sitemap():
    if db is None:
        raise HTTPException(503, "Database not available")
    docs = await db.blog_articles.find(
        {}, {"slug": 1, "updatedAt": 1, "createdAt": 1, "language_code": 1, "_id": 0}
    ).sort("createdAt", -1).limit(2000).to_list(2000)

    urls_xml = []
    for d in docs:
        lang = (d.get("language_code") or "en").lower()
        prefix = "https://www.zont.cab/es/blog" if lang == "es" else "https://www.zont.cab/blog"
        loc = xml_escape(f"{prefix}/{d['slug']}")
        lastmod = xml_escape(str(d.get("updatedAt") or d.get("createdAt") or ""))
        urls_xml.append(
            f"  <url><loc>{loc}</loc>"
            f"<lastmod>{lastmod}</lastmod>"
            f"<changefreq>weekly</changefreq><priority>0.6</priority></url>"
        )

    xml = (
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
        + "\n".join(urls_xml)
        + "\n</urlset>"
    )
    return Response(content=xml, media_type="application/xml")


# ---------- Public read endpoints used by the React frontend ----------
@router.get("/blog-articles")
async def list_articles(limit: int = 50, language: Optional[str] = None):
    if db is None:
        raise HTTPException(503, "Database not available")
    query: Dict[str, Any] = {}
    if language:
        query["language_code"] = language.lower()
    docs = await db.blog_articles.find(
        query,
        {"_id": 0, "content_html": 0, "content_markdown": 0, "source_ip": 0},
    ).sort("createdAt", -1).limit(min(limit, 100)).to_list(100)
    return {"articles": docs, "total": len(docs)}


@router.get("/blog-articles/{slug}")
async def get_article(slug: str):
    if db is None:
        raise HTTPException(503, "Database not available")
    doc = await db.blog_articles.find_one(
        {"slug": slug}, {"_id": 0, "source_ip": 0}
    )
    if not doc:
        raise HTTPException(404, "Article not found")
    return doc
