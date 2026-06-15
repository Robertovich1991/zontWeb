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
import os
import re
import asyncio
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

    # Auto-translate new EN articles into FR/ES/RU/HY in a background task
    # (not awaited so the webhook responds immediately to the CMS)
    if doc["language_code"] == "en" and not doc.get("source_external_id"):
        asyncio.create_task(_auto_translate_article(doc))

    # Frontend URL — prefix by language for SEO sub-folder routing
    lang = doc["language_code"]
    lang_prefix = {"fr": "/fr", "es": "/es", "ru": "/ru", "hy": "/hy"}.get(lang, "")
    url_prefix = f"{lang_prefix}/blog"
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
    lang_to_prefix = {"fr": "/fr", "es": "/es", "ru": "/ru", "hy": "/hy"}
    for d in docs:
        lang = (d.get("language_code") or "en").lower()
        prefix = f"https://www.zont.cab{lang_to_prefix.get(lang, '')}/blog"
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



# ---------- Admin delete endpoint (used to clean up old/test articles) ----------
# Reuses the same shared header `x-webhook-secret` (or fallback open if not configured).
@router.delete("/blog-articles/{slug}")
async def delete_article(slug: str, request: Request):
    if db is None:
        raise HTTPException(503, "Database not available")
    expected_secret = os.environ.get("BLOG_WEBHOOK_SECRET", "").strip()
    if expected_secret:
        provided = request.headers.get("x-webhook-secret", "")
        if provided != expected_secret:
            raise HTTPException(403, "Invalid secret")
    result = await db.blog_articles.delete_one({"slug": slug})
    if result.deleted_count == 0:
        raise HTTPException(404, "Article not found")
    logger.info(f"Blog article deleted: slug='{slug}'")
    return {"success": True, "deleted": slug}



# ---------- Auto-translation helpers ----------
from routes.blog_translator import TARGET_LANGS, translate_article_to_lang  # noqa: E402


async def _auto_translate_article(en_doc: dict) -> None:
    """
    Background task: translate one English article into FR/ES/RU/HY and upsert
    each translation. Errors per language are logged but don't fail others.
    """
    try:
        for tl in TARGET_LANGS:
            try:
                tdoc = await translate_article_to_lang(en_doc, tl)
                tdoc["received_at"] = datetime.now(timezone.utc).isoformat()
                await db.blog_articles.update_one(
                    {"external_id": tdoc["external_id"]},
                    {"$set": tdoc},
                    upsert=True,
                )
                logger.info(f"Auto-translated '{en_doc.get('slug')}' -> {tl} (slug={tdoc['slug']})")
            except Exception as e:
                logger.error(f"Auto-translate to {tl} failed for '{en_doc.get('slug')}': {e}")
    except Exception as e:
        logger.exception(f"Auto-translation pipeline crashed: {e}")


# ---------- Backfill endpoint: translate all existing EN articles ----------
@router.post("/blog-articles/translate-all")
async def translate_all_existing(request: Request, overwrite: bool = False):
    """
    Schedule a background task to translate every English article in the DB into
    FR/ES/RU/HY. Returns immediately so the ingress doesn't time out.
    """
    if db is None:
        raise HTTPException(503, "Database not available")

    expected_secret = os.environ.get("BLOG_WEBHOOK_SECRET", "").strip()
    if expected_secret:
        if request.headers.get("x-webhook-secret", "") != expected_secret:
            raise HTTPException(403, "Invalid secret")

    en_articles = await db.blog_articles.find(
        {"language_code": "en", "source_external_id": {"$exists": False}}
    ).to_list(500)

    if not en_articles:
        return {"success": True, "scheduled": 0, "message": "No English source articles found."}

    # Schedule background translation
    async def _run_backfill():
        for art in en_articles:
            art_id = art.get("external_id") or art.get("slug")
            for tl in TARGET_LANGS:
                target_ext_id = f"{art_id}-{tl}"
                existing = await db.blog_articles.find_one({"external_id": target_ext_id})
                if existing and not overwrite:
                    continue
                try:
                    tdoc = await translate_article_to_lang(art, tl)
                    tdoc["received_at"] = datetime.now(timezone.utc).isoformat()
                    await db.blog_articles.update_one(
                        {"external_id": tdoc["external_id"]},
                        {"$set": tdoc},
                        upsert=True,
                    )
                    logger.info(f"Backfill: '{art.get('slug')}' -> {tl}")
                except Exception as e:
                    logger.error(f"Backfill failed {art.get('slug')}->{tl}: {e}")

    asyncio.create_task(_run_backfill())

    return {
        "success": True,
        "scheduled": len(en_articles),
        "target_languages": TARGET_LANGS,
        "overwrite": overwrite,
        "message": (
            f"Translation of {len(en_articles)} article(s) into {len(TARGET_LANGS)} languages "
            f"scheduled. Check progress via GET /api/blog-articles?language=fr (or es/ru/hy). "
            f"Each article takes ~30-60s to translate. Backend logs show real-time progress."
        ),
    }


# ---------- Status endpoint: count articles per language ----------
@router.get("/blog-translate-status")
async def translate_status():
    if db is None:
        raise HTTPException(503, "Database not available")
    counts = {}
    for lang in ["en"] + TARGET_LANGS:
        counts[lang] = await db.blog_articles.count_documents({"language_code": lang})
    return {"counts": counts, "expected_per_lang": counts.get("en", 0)}
