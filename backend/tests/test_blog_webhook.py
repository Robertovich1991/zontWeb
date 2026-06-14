"""Backend tests for the Blog Webhook + read endpoints + sitemap.

Endpoints under test:
  - POST /api/webhooks/blog
  - GET  /api/blog-articles
  - GET  /api/blog-articles/{slug}
  - GET  /api/sitemap-blog.xml
"""
import os
import time
import uuid
import xml.etree.ElementTree as ET
from typing import Dict, Any

import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")
if not BASE_URL:
    # Fallback - tests assume an ingress, but if env not set we try local file
    try:
        with open("/app/frontend/.env") as f:
            for line in f:
                if line.startswith("REACT_APP_BACKEND_URL="):
                    BASE_URL = line.split("=", 1)[1].strip().rstrip("/")
                    break
    except Exception:
        pass

assert BASE_URL, "REACT_APP_BACKEND_URL not configured"

# Unique per-run test ids so we don't collide with existing data
RUN_TAG = uuid.uuid4().hex[:8]
EN_ID = 99000 + int(RUN_TAG[:4], 16) % 1000
ES_ID = EN_ID + 1
EN_SLUG = f"test-en-article-{RUN_TAG}"
ES_SLUG = f"test-es-articulo-{RUN_TAG}"

CREATED_SLUGS = []


def _en_payload(title="Hello World Test EN", slug=EN_SLUG, _id=EN_ID) -> Dict[str, Any]:
    return {
        "id": _id,
        "title": title,
        "slug": slug,
        "metaDescription": "An English meta description",
        "content_html": "<h1>Hello</h1><p>Body</p>",
        "content_markdown": "# Hello\n\nBody",
        "heroImageUrl": "https://cdn.example.com/hero-en.jpg",
        "jsonLd": {"@context": "https://schema.org", "@type": "Article", "headline": title},
        "faqJsonLd": {"@context": "https://schema.org", "@type": "FAQPage"},
        "languageCode": "en",
        "publicUrl": "https://blog.example.com/en/hello",
        "createdAt": "2026-01-15T10:00:00Z",
    }


def _es_payload() -> Dict[str, Any]:
    return {
        "id": ES_ID,
        "title": "Hola Mundo Prueba ES",
        "slug": ES_SLUG,
        "metaDescription": "Una descripcion en espanol",
        "content_html": "<h1>Hola</h1>",
        "content_markdown": "# Hola",
        "heroImageUrl": "https://cdn.example.com/hero-es.jpg",
        "jsonLd": {"@context": "https://schema.org", "@type": "Article"},
        "faqJsonLd": None,
        "languageCode": "es",
        "publicUrl": "https://blog.example.com/es/hola",
        "createdAt": "2026-01-15T11:00:00Z",
    }


@pytest.fixture(scope="session")
def api():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="session", autouse=True)
def _cleanup(api):
    yield
    # Best-effort cleanup via Mongo through admin endpoint not available -> rely on slugs being unique per-run.
    # We at least log what we created.
    print(f"\n[cleanup] Created slugs during run: {CREATED_SLUGS}")


# ---------- POST /api/webhooks/blog ----------

class TestBlogWebhookCreate:
    def test_create_english_article(self, api):
        r = api.post(f"{BASE_URL}/api/webhooks/blog", json=_en_payload())
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["success"] is True
        assert data["created"] is True
        assert data["slug"] == EN_SLUG
        assert data["language"] == "en"
        assert data["url"] == f"https://www.zont.cab/blog/{EN_SLUG}"
        CREATED_SLUGS.append(EN_SLUG)

    def test_create_spanish_article(self, api):
        r = api.post(f"{BASE_URL}/api/webhooks/blog", json=_es_payload())
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["success"] is True
        assert data["created"] is True
        assert data["language"] == "es"
        assert data["url"] == f"https://www.zont.cab/es/blog/{ES_SLUG}"
        CREATED_SLUGS.append(ES_SLUG)

    def test_idempotent_update_same_id(self, api):
        # Resend the EN payload with updated title - same id, should update (created=false)
        payload = _en_payload(title="Hello World Test EN UPDATED")
        r = api.post(f"{BASE_URL}/api/webhooks/blog", json=payload)
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["success"] is True
        assert data["created"] is False, "Re-sending same id must NOT create a new doc"
        assert data["slug"] == EN_SLUG

        # Verify the title got updated via GET
        g = api.get(f"{BASE_URL}/api/blog-articles/{EN_SLUG}")
        assert g.status_code == 200
        assert g.json()["title"] == "Hello World Test EN UPDATED"

    def test_invalid_slug_returns_400(self, api):
        bad = _en_payload(title="!!!", slug="!!!", _id=EN_ID + 500)
        # sanitize_slug strips everything -> empty -> 400
        r = api.post(f"{BASE_URL}/api/webhooks/blog", json=bad)
        assert r.status_code == 400, f"Expected 400, got {r.status_code}: {r.text}"

    def test_missing_required_field_returns_422(self, api):
        # Pydantic should reject missing title
        r = api.post(
            f"{BASE_URL}/api/webhooks/blog",
            json={"id": 99999, "slug": "no-title-test"},
        )
        assert r.status_code in (400, 422), r.text


# ---------- GET /api/blog-articles (list) ----------

class TestBlogArticlesList:
    def test_list_returns_articles_without_heavy_fields(self, api):
        r = api.get(f"{BASE_URL}/api/blog-articles")
        assert r.status_code == 200, r.text
        data = r.json()
        assert "articles" in data and isinstance(data["articles"], list)
        assert "total" in data
        assert len(data["articles"]) > 0, "Expected at least the just-created article"

        # Find our EN article
        ours = next((a for a in data["articles"] if a.get("slug") == EN_SLUG), None)
        assert ours is not None, f"Article {EN_SLUG} not present in list"

        # Performance fields must be excluded
        assert "content_html" not in ours, "content_html must be excluded from list response"
        assert "content_markdown" not in ours, "content_markdown must be excluded from list response"
        assert "_id" not in ours, "Mongo _id must be excluded"

        # Required summary fields present
        for f in ("title", "slug", "hero_image_url", "meta_description", "language_code", "createdAt"):
            assert f in ours, f"Missing field '{f}' in list article: {ours.keys()}"

    def test_list_filtered_by_language_es(self, api):
        r = api.get(f"{BASE_URL}/api/blog-articles", params={"language": "es"})
        assert r.status_code == 200
        data = r.json()
        assert len(data["articles"]) > 0
        for a in data["articles"]:
            assert a.get("language_code") == "es", f"Non-es article leaked: {a.get('slug')}"
        assert any(a["slug"] == ES_SLUG for a in data["articles"])

    def test_list_filtered_by_language_en(self, api):
        r = api.get(f"{BASE_URL}/api/blog-articles", params={"language": "en"})
        assert r.status_code == 200
        data = r.json()
        for a in data["articles"]:
            assert a.get("language_code") == "en"
        assert any(a["slug"] == EN_SLUG for a in data["articles"])


# ---------- GET /api/blog-articles/{slug} (detail) ----------

class TestBlogArticleDetail:
    def test_get_full_article(self, api):
        r = api.get(f"{BASE_URL}/api/blog-articles/{EN_SLUG}")
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["slug"] == EN_SLUG
        assert data["language_code"] == "en"
        # Full heavy fields must be present
        assert data.get("content_html", "").startswith("<h1>")
        assert "content_markdown" in data and data["content_markdown"]
        assert data.get("hero_image_url") == "https://cdn.example.com/hero-en.jpg"
        assert data.get("meta_description") == "An English meta description"
        # snake_case mapping
        assert data.get("json_ld") is not None
        assert data["json_ld"].get("@type") == "Article"
        assert data.get("faq_json_ld") is not None
        assert data.get("public_url") == "https://blog.example.com/en/hello"
        # Mongo internals excluded
        assert "_id" not in data
        assert "source_ip" not in data

    def test_get_spanish_article(self, api):
        r = api.get(f"{BASE_URL}/api/blog-articles/{ES_SLUG}")
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["language_code"] == "es"
        assert data["hero_image_url"] == "https://cdn.example.com/hero-es.jpg"

    def test_get_unknown_slug_returns_404(self, api):
        r = api.get(f"{BASE_URL}/api/blog-articles/this-slug-does-not-exist-{RUN_TAG}")
        assert r.status_code == 404


# ---------- GET /api/sitemap-blog.xml ----------

class TestBlogSitemap:
    def test_sitemap_xml_structure(self, api):
        r = api.get(f"{BASE_URL}/api/sitemap-blog.xml")
        assert r.status_code == 200, r.text
        # Content-Type
        ct = r.headers.get("content-type", "")
        assert "application/xml" in ct, f"Wrong content-type: {ct}"

        # Parse XML
        root = ET.fromstring(r.text)
        ns = {"sm": "http://www.sitemaps.org/schemas/sitemap/0.9"}
        assert root.tag.endswith("urlset")

        locs = [u.find("sm:loc", ns).text for u in root.findall("sm:url", ns)]
        assert len(locs) > 0, "Sitemap should contain at least one URL"

        # Our EN article should appear under /blog/
        assert any(loc == f"https://www.zont.cab/blog/{EN_SLUG}" for loc in locs), \
            f"EN article not in sitemap. Sample: {locs[:5]}"
        # Our ES article should appear under /es/blog/
        assert any(loc == f"https://www.zont.cab/es/blog/{ES_SLUG}" for loc in locs), \
            f"ES article not in sitemap. Sample: {locs[:5]}"

        # Each url must have lastmod
        urls = root.findall("sm:url", ns)
        for u in urls[:5]:
            assert u.find("sm:lastmod", ns) is not None
