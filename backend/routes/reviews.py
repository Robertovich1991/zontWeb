"""
Reviews management: CRUD + auto-translation via LLM.
Reviews are stored locally in MongoDB and assigned to specific pages (directions).
The C# API provides clientFeedback/driverFeedback but we manage display independently.
"""
import os
import uuid
import asyncio
from datetime import datetime, timezone
from typing import Optional, List
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()

MONGO_URL = os.environ.get("MONGO_URL")
DB_NAME = os.environ.get("DB_NAME")

from motor.motor_asyncio import AsyncIOMotorClient
_client = AsyncIOMotorClient(MONGO_URL)
_db = _client[DB_NAME]
reviews_col = _db["site_reviews"]

router = APIRouter(prefix="/api/reviews", tags=["Reviews"])

# Available pages for review assignment
AVAILABLE_PAGES = [
    {"id": "home", "label": "Page d'accueil"},
    {"id": "paris-airport", "label": "Paris Airport Transfer"},
    {"id": "cdg", "label": "CDG Airport Transfer"},
    {"id": "orly", "label": "Orly Airport Transfer"},
    {"id": "beauvais", "label": "Beauvais Airport Transfer"},
    {"id": "paris-train", "label": "Paris Train Station Transfer"},
    {"id": "gare-de-lyon", "label": "Gare de Lyon Transfer"},
    {"id": "gare-du-nord", "label": "Gare du Nord Transfer"},
    {"id": "gare-montparnasse", "label": "Gare Montparnasse Transfer"},
    {"id": "gare-saint-lazare", "label": "Gare Saint-Lazare Transfer"},
    {"id": "gare-est", "label": "Gare de l'Est Transfer"},
    {"id": "disneyland", "label": "Disneyland Paris Transfer"},
    {"id": "nice", "label": "Nice Airport Transfer"},
    {"id": "b2b", "label": "B2B / Corporate"},
]


class ReviewSubmit(BaseModel):
    author_name: str
    rating: int  # 1-5
    comment: str
    language: str = "fr"
    trip_ref: Optional[str] = None


class ReviewCreate(BaseModel):
    author_name: str
    rating: int  # 1-5
    comment: str
    language: str = "fr"  # original language
    page_id: str = ""  # single page assignment
    trip_id: Optional[int] = None


class ReviewUpdate(BaseModel):
    author_name: Optional[str] = None
    rating: Optional[int] = None
    comment: Optional[str] = None
    page_id: Optional[str] = None  # single page
    status: Optional[str] = None  # pending, approved, rejected


# ── Translation helper ──────────────────────────────────────────────
async def translate_text(text: str, target_lang: str) -> str:
    """Translate text using Emergent LLM key."""
    try:
        from emergentintegrations.llm.chat import LlmChat, UserMessage
        api_key = os.environ.get("EMERGENT_LLM_KEY")
        if not api_key:
            return text

        lang_names = {"fr": "French", "en": "English", "ru": "Russian", "hy": "Armenian"}
        target = lang_names.get(target_lang, target_lang)

        chat = LlmChat(
            api_key=api_key,
            session_id=f"translate-{uuid.uuid4().hex[:8]}",
            system_message=f"You are a translator. Translate the following customer review to {target}. Return ONLY the translated text, nothing else. Keep the tone and style natural."
        )
        chat.with_model("openai", "gpt-4.1-mini")

        response = await chat.send_message(UserMessage(text=text))
        return response.strip()
    except Exception as e:
        print(f"Translation error: {e}")
        return text


async def auto_translate_review(comment: str, source_lang: str) -> dict:
    """Translate a review to all 4 languages."""
    all_langs = ["fr", "en", "ru", "hy"]
    translations = {source_lang: comment}
    tasks = []
    for lang in all_langs:
        if lang != source_lang:
            tasks.append((lang, translate_text(comment, lang)))

    results = await asyncio.gather(*[t[1] for t in tasks], return_exceptions=True)
    for i, (lang, _) in enumerate(tasks):
        if isinstance(results[i], str):
            translations[lang] = results[i]
        else:
            translations[lang] = comment  # fallback to original
    return translations


# ── Public endpoints ────────────────────────────────────────────────
@router.get("/pages")
async def get_available_pages():
    """Return list of pages reviews can be assigned to."""
    return AVAILABLE_PAGES


@router.get("/public/{page_id}")
async def get_public_reviews(page_id: str, lang: str = "fr"):
    """Get approved reviews for a specific page (public, no auth)."""
    cursor = reviews_col.find(
        {"page_id": page_id, "status": "approved"},
        {"_id": 0}
    ).sort("created_at", -1).limit(20)
    reviews = await cursor.to_list(length=20)
    for r in reviews:
        translations = r.get("translations", {})
        if lang in translations:
            r["comment_translated"] = translations[lang]
        else:
            r["comment_translated"] = r.get("comment", "")
    return reviews


@router.get("/public/schema/{page_id}")
async def get_reviews_schema(page_id: str):
    """Get approved reviews formatted for Schema.org JSON-LD."""
    cursor = reviews_col.find(
        {"page_id": page_id, "status": "approved"},
        {"_id": 0}
    ).sort("created_at", -1).limit(50)
    reviews = await cursor.to_list(length=50)

    if not reviews:
        return {"reviews": [], "aggregateRating": None}

    total_rating = sum(r.get("rating", 5) for r in reviews)
    avg_rating = round(total_rating / len(reviews), 1)

    schema_reviews = []
    for r in reviews:
        schema_reviews.append({
            "@type": "Review",
            "author": {"@type": "Person", "name": r.get("author_name", "Client")},
            "reviewRating": {"@type": "Rating", "ratingValue": r.get("rating", 5), "bestRating": 5},
            "reviewBody": r.get("comment", ""),
            "datePublished": r.get("created_at", "")[:10] if r.get("created_at") else ""
        })

    return {
        "reviews": schema_reviews,
        "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": avg_rating,
            "reviewCount": len(reviews),
            "bestRating": 5,
            "worstRating": 1
        }
    }


# ── Public review submission ────────────────────────────────────────
@router.post("/submit")
async def submit_review(review: ReviewSubmit):
    """Public endpoint: clients submit reviews. Status = pending (admin must approve)."""
    if not review.author_name.strip():
        raise HTTPException(status_code=400, detail="Name is required")
    if not review.comment.strip():
        raise HTTPException(status_code=400, detail="Comment is required")
    if review.rating < 1 or review.rating > 5:
        raise HTTPException(status_code=400, detail="Rating must be between 1 and 5")

    review_id = f"rev-{uuid.uuid4().hex[:12]}"

    # Auto-translate
    translations = await auto_translate_review(review.comment.strip(), review.language)

    doc = {
        "review_id": review_id,
        "author_name": review.author_name.strip(),
        "rating": review.rating,
        "comment": review.comment.strip(),
        "language": review.language,
        "translations": translations,
        "page_id": "",
        "trip_ref": review.trip_ref or "",
        "source": "client_link",
        "status": "pending",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }
    await reviews_col.insert_one(doc)
    doc.pop("_id", None)
    return {"status": "submitted", "review_id": review_id}


# ── Admin endpoints ─────────────────────────────────────────────────
@router.get("/admin/all")
async def get_all_reviews(
    status: Optional[str] = Query(None),
    page_id: Optional[str] = Query(None)
):
    """Get all reviews for admin management."""
    query = {}
    if status:
        query["status"] = status
    if page_id:
        query["page_id"] = page_id

    cursor = reviews_col.find(query, {"_id": 0}).sort("created_at", -1)
    return await cursor.to_list(length=200)


@router.post("/admin/create")
async def create_review(review: ReviewCreate):
    """Create a new review (admin manual entry)."""
    review_id = f"rev-{uuid.uuid4().hex[:12]}"

    # Auto-translate
    translations = await auto_translate_review(review.comment, review.language)

    doc = {
        "review_id": review_id,
        "author_name": review.author_name,
        "rating": max(1, min(5, review.rating)),
        "comment": review.comment,
        "language": review.language,
        "translations": translations,
        "page_id": review.page_id,
        "trip_id": review.trip_id,
        "status": "approved",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }
    await reviews_col.insert_one(doc)
    doc.pop("_id", None)
    return doc


@router.put("/admin/{review_id}")
async def update_review(review_id: str, update: ReviewUpdate):
    """Update a review (status, pages, content)."""
    updates = {"updated_at": datetime.now(timezone.utc).isoformat()}
    if update.author_name is not None:
        updates["author_name"] = update.author_name
    if update.rating is not None:
        updates["rating"] = max(1, min(5, update.rating))
    if update.comment is not None:
        updates["comment"] = update.comment
    if update.page_id is not None:
        updates["page_id"] = update.page_id
    if update.status is not None:
        updates["status"] = update.status

    result = await reviews_col.update_one(
        {"review_id": review_id},
        {"$set": updates}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Review not found")
    return {"status": "updated"}


@router.delete("/admin/{review_id}")
async def delete_review(review_id: str):
    """Delete a review."""
    result = await reviews_col.delete_one({"review_id": review_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Review not found")
    return {"status": "deleted"}


@router.post("/admin/{review_id}/translate")
async def translate_review(review_id: str):
    """Re-translate a review to all languages."""
    doc = await reviews_col.find_one({"review_id": review_id})
    if not doc:
        raise HTTPException(status_code=404, detail="Review not found")

    translations = await auto_translate_review(doc["comment"], doc.get("language", "fr"))
    await reviews_col.update_one(
        {"review_id": review_id},
        {"$set": {"translations": translations, "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    return {"status": "translated", "translations": translations}


@router.get("/admin/stats")
async def get_review_stats():
    """Get review statistics."""
    total = await reviews_col.count_documents({})
    approved = await reviews_col.count_documents({"status": "approved"})
    pending = await reviews_col.count_documents({"status": "pending"})
    rejected = await reviews_col.count_documents({"status": "rejected"})

    # Average rating
    pipeline = [
        {"$match": {"status": "approved"}},
        {"$group": {"_id": None, "avg": {"$avg": "$rating"}, "count": {"$sum": 1}}}
    ]
    agg = await reviews_col.aggregate(pipeline).to_list(length=1)
    avg_rating = round(agg[0]["avg"], 1) if agg else 0

    return {
        "total": total,
        "approved": approved,
        "pending": pending,
        "rejected": rejected,
        "average_rating": avg_rating
    }
