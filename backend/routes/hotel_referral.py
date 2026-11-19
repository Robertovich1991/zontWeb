"""Hotel partner booking link (MVP Phase 1).

A hotel gets a shareable link (/p/{kiosk_slug}). A client who starts a booking
through that link is attributed to the hotel server-side and a commission is
recorded in `referral_bookings`. Attribution is carried by a signed token so the
hotel address alone never triggers a commission (a direct booking to that hotel
with no link click carries no token -> no commission).

Commission base = total amount paid by the client (tolls + VAT included).
Commission rate = per-link rate (falls back to the hotel's commission_rate).
Statuses: pending -> validated (transfer realized, synced from C#) / cancelled.
          validated -> paid (payout recorded by a ZONT admin).
"""
import os
import uuid
import hmac
import logging
import asyncio
from datetime import datetime, timezone

import jwt
from fastapi import APIRouter, HTTPException, Request
from pymongo.errors import DuplicateKeyError

from routes.fleet_shared import get_shared_client, CSHARP_API

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api", tags=["hotel-referral"])

SECRET_KEY = os.environ.get("JWT_SECRET", "zont-admin-secret-key-2025")
COMMISSION_BASE = "total_paid"
PUBLIC_SITE = "https://www.zont.cab"

# C# company account used (read-only) to poll auction status for auto-validation.
_COMPANY_CREDS = {
    "username": os.environ.get("CSHARP_COMPANY_USERNAME") or "Nandetiri1@gmail.com",
    "password": os.environ.get("CSHARP_COMPANY_PASSWORD") or "12345678",
}

# C# auction status -> our commission status
_VALIDATED_STATES = {"completed", "finished", "done", "ended", "complete"}
_CANCELLED_STATES = {"cancelled", "canceled", "declined", "rejected", "refunded", "deleted"}

db = None


def set_db(database):
    global db
    db = database


# ── Auth helpers ──
def _decode(token: str, required_role=None):
    payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
    if required_role and payload.get("role") != required_role:
        raise HTTPException(403, "Acces refuse")
    return payload


async def _require_admin(request: Request):
    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
        raise HTTPException(401, "Token requis")
    try:
        payload = _decode(auth[7:])
        if payload.get("role") not in ("admin", "manager"):
            raise HTTPException(403, "Acces refuse")
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(401, "Token expire")
    except jwt.InvalidTokenError:
        raise HTTPException(401, "Token invalide")


async def _require_hotel(request: Request):
    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
        raise HTTPException(401, "Token requis")
    try:
        return _decode(auth[7:], required_role="hotel_admin")
    except jwt.ExpiredSignatureError:
        raise HTTPException(401, "Token expire")
    except jwt.InvalidTokenError:
        raise HTTPException(401, "Token invalide")


def _issue_token(slug: str, hotel_id: str) -> str:
    return jwt.encode(
        {"type": "referral", "slug": slug, "hotel_id": hotel_id,
         "jti": str(uuid.uuid4()), "iat": datetime.now(timezone.utc).timestamp()},
        SECRET_KEY, algorithm="HS256",
    )


async def _hotel_for_slug(slug: str):
    """Resolve a kiosk slug to (kiosk_hotel, hotel). hotel may be None if not linked."""
    kiosk = await db.kiosk_hotels.find_one({"slug": slug}, {"_id": 0})
    if not kiosk:
        return None, None
    hotel = await db.hotels.find_one({"kiosk_slug": slug}, {"_id": 0})
    if not hotel:
        hotel = await db.hotels.find_one({"name": kiosk.get("name")}, {"_id": 0})
    return kiosk, hotel


def _link_rate(hotel: dict) -> float:
    if hotel is None:
        return 0.0
    r = hotel.get("partner_link_rate")
    if r is None:
        r = hotel.get("commission_rate", 0)
    return float(r or 0)


# ── Public: resolve a partner link ──
@router.get("/referral/link/{slug}")
async def get_partner_link(slug: str):
    """Public — return hotel name, prefilled destination and a signed attribution token."""
    kiosk, hotel = await _hotel_for_slug(slug)
    if not kiosk:
        raise HTTPException(404, "Lien introuvable")
    enabled = True if hotel is None else bool(hotel.get("partner_link_enabled", True))
    name = kiosk.get("name") or (hotel.get("name") if hotel else "")
    resp = {
        "enabled": enabled,
        "slug": slug,
        "hotelName": name,
        "destination": {
            "address": kiosk.get("address", ""),
            "latitude": kiosk.get("lat"),
            "longitude": kiosk.get("lng"),
        },
    }
    if enabled and hotel is not None:
        resp["token"] = _issue_token(slug, hotel["id"])
    return resp


# ── Internal: record an attributed booking (called from the booking proxy) ──
async def record_referral_booking(payload: dict, result: dict):
    """Best-effort — never raise. Writes a referral_bookings ledger row when the booking
    payload carries a valid referral token."""
    if db is None:
        return
    token = (payload or {}).get("referralToken")
    if not token:
        return
    try:
        claims = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
    except Exception as e:
        logger.warning(f"referral token invalid, skipping attribution: {e}")
        return
    if claims.get("type") != "referral":
        return
    hotel_id = claims.get("hotel_id")
    slug = claims.get("slug")
    hotel = await db.hotels.find_one({"id": hotel_id}, {"_id": 0}) if hotel_id else None
    if not hotel:
        logger.warning(f"referral hotel {hotel_id} not found, skipping")
        return

    auction_id = None
    if isinstance(result, dict):
        auction_id = result.get("id") or result.get("bookingId") or result.get("auctionId")

    # Idempotency: one commission per C# booking
    if auction_id is not None:
        existing = await db.referral_bookings.find_one({"csharp_auction_id": auction_id})
        if existing:
            return
    # Also dedupe by token jti (protects when auction_id missing)
    if await db.referral_bookings.find_one({"token_jti": claims.get("jti")}):
        return

    try:
        client_price = float(payload.get("clientPrice") or 0)
    except (TypeError, ValueError):
        client_price = 0.0
    rate = _link_rate(hotel)
    now = datetime.now(timezone.utc).isoformat()
    doc = {
        "id": f"RB-{str(uuid.uuid4())[:8]}",
        "hotel_id": hotel_id,
        "hotel_slug": slug,
        "hotel_name": hotel.get("name", ""),
        "origin": "partner_link",
        "csharp_auction_id": auction_id,
        "client_email": payload.get("email", ""),
        "pickup_address": payload.get("startAddress", ""),
        "dropoff_address": payload.get("endAddress", "") or payload.get("destination", ""),
        "start_date": payload.get("startDate", ""),
        "car_type": (payload.get("carType") or "").strip(),
        "amount": client_price,            # refined from C# totalAmount by the sync job
        "client_price": client_price,
        "commission_base": COMMISSION_BASE,
        "commission_rate": rate,
        "commission_amount": round(client_price * rate / 100, 2),
        "status": "pending",               # pending | validated | cancelled | paid
        "csharp_status": None,
        "payout": None,
        "token_jti": claims.get("jti"),
        "history": [{"at": now, "event": "created", "by": "system"}],
        "created_at": now,
        "updated_at": now,
    }
    try:
        await db.referral_bookings.insert_one(doc)
    except DuplicateKeyError:
        # Concurrent/retry double-submit — commission already recorded for this booking.
        logger.info(f"referral duplicate ignored auction={auction_id} jti={claims.get('jti')}")
        return
    logger.info(f"referral attributed hotel={hotel_id} auction={auction_id} commission={doc['commission_amount']}")


# ── Auto status sync from C# ──
async def _company_token(client):
    resp = await client.post(f"{CSHARP_API}/api/Login/company", json=_COMPANY_CREDS)
    if resp.status_code == 200:
        return resp.json().get("accessToken", "")
    return ""


def _map_status(cs_status: str) -> str:
    s = (cs_status or "").strip().lower()
    if s in _VALIDATED_STATES:
        return "validated"
    if s in _CANCELLED_STATES:
        return "cancelled"
    return "pending"


async def sync_referral_statuses():
    """Poll C# for each open referral booking and update status/amount/commission.
    paid rows are terminal and skipped; cancelled rows are re-checked in case a
    booking is reinstated (rare) but are otherwise terminal."""
    if db is None:
        return {"synced": 0, "updated": 0}
    open_rows = await db.referral_bookings.find(
        {"status": {"$in": ["pending", "validated"]}, "csharp_auction_id": {"$ne": None}},
        {"_id": 0},
    ).to_list(500)
    if not open_rows:
        return {"synced": 0, "updated": 0}

    client = get_shared_client()
    token = await _company_token(client)
    if not token:
        logger.warning("referral sync: C# company auth failed")
        return {"synced": 0, "updated": 0, "error": "auth_failed"}

    updated = 0

    async def _one(row):
        nonlocal updated
        aid = row["csharp_auction_id"]
        try:
            r = await client.get(
                f"{CSHARP_API}/api/Auction/company/auctions/{aid}",
                headers={"Authorization": f"Bearer {token}"},
                timeout=12,
            )
            if r.status_code != 200:
                return
            a = r.json()
        except Exception:
            return
        cs_status = a.get("status", "")
        new_status = _map_status(cs_status)
        total = a.get("totalAmount") or a.get("currentPrice") or row.get("amount", 0)
        try:
            total = float(total)
        except (TypeError, ValueError):
            total = row.get("amount", 0)
        rate = row.get("commission_rate", 0)
        commission = round(total * rate / 100, 2)
        set_fields = {
            "csharp_status": cs_status,
            "amount": total,
            "commission_amount": commission,
            "updated_at": datetime.now(timezone.utc).isoformat(),
        }
        # Only move status along the allowed path (never revert validated->pending, never touch paid).
        current = row.get("status", "pending")
        if new_status != current and new_status in _ALLOWED_TRANSITIONS.get(current, set()):
            set_fields["status"] = new_status
        await db.referral_bookings.update_one(
            {"id": row["id"]},
            {"$set": set_fields,
             "$push": {"history": {"at": set_fields["updated_at"], "event": f"synced:{cs_status or 'unknown'}", "by": "cron"}}},
        )
        updated += 1

    # modest concurrency
    for i in range(0, len(open_rows), 10):
        await asyncio.gather(*[_one(r) for r in open_rows[i:i + 10]])

    return {"synced": len(open_rows), "updated": updated}


# ── Cron endpoint (auto-validation) ──
@router.post("/cron/referral-sync")
async def cron_referral_sync(request: Request):
    # Cron endpoints must ack 2xx immediately; enqueue/background the actual work.
    secret = os.environ.get("WEBHOOK_CRON_SECRET", "")
    auth = request.headers.get("Authorization", "")
    if not secret or not auth.startswith("Bearer ") or not hmac.compare_digest(auth[7:], secret):
        raise HTTPException(401, "Unauthorized")
    asyncio.create_task(sync_referral_statuses())
    return {"ok": True, "accepted": True}


# ── Admin: partner link config on a hotel ──
@router.get("/admin/hotels/{hotel_id}/partner-link")
async def admin_get_partner_link(hotel_id: str, request: Request):
    await _require_admin(request)
    hotel = await db.hotels.find_one({"id": hotel_id}, {"_id": 0})
    if not hotel:
        raise HTTPException(404, "Hotel introuvable")
    slug = hotel.get("kiosk_slug")
    stats = await db.referral_bookings.aggregate([
        {"$match": {"hotel_id": hotel_id}},
        {"$group": {"_id": "$status", "count": {"$sum": 1}, "commission": {"$sum": "$commission_amount"}}},
    ]).to_list(10)
    totals = {s["_id"]: {"count": s["count"], "commission": round(s["commission"], 2)} for s in stats}
    return {
        "hotel_id": hotel_id,
        "hotel_name": hotel.get("name", ""),
        "slug": slug,
        "url": f"{PUBLIC_SITE}/p/{slug}" if slug else None,
        "enabled": bool(hotel.get("partner_link_enabled", True)),
        "rate": _link_rate(hotel),
        "commission_base": COMMISSION_BASE,
        "destination": hotel.get("address", ""),
        "totals": totals,
    }


@router.put("/admin/hotels/{hotel_id}/partner-link")
async def admin_update_partner_link(hotel_id: str, request: Request):
    await _require_admin(request)
    hotel = await db.hotels.find_one({"id": hotel_id}, {"_id": 0})
    if not hotel:
        raise HTTPException(404, "Hotel introuvable")
    body = await request.json()
    updates = {"updated_at": datetime.now(timezone.utc).isoformat()}
    if "enabled" in body:
        updates["partner_link_enabled"] = bool(body["enabled"])
    if "rate" in body and body["rate"] is not None:
        try:
            r = float(body["rate"])
        except (TypeError, ValueError):
            raise HTTPException(400, "Taux invalide")
        if r < 0 or r > 100:
            raise HTTPException(400, "Le taux doit etre entre 0 et 100")
        updates["partner_link_rate"] = r
    await db.hotels.update_one({"id": hotel_id}, {"$set": updates})
    return await admin_get_partner_link(hotel_id, request)


# ── Admin: referral bookings ledger ──
def _enrich(row):
    row.pop("_id", None)
    return row


@router.get("/admin/referrals")
async def admin_list_referrals(request: Request, hotel_id: str = None, origin: str = None, status: str = None):
    await _require_admin(request)
    q = {}
    if hotel_id:
        q["hotel_id"] = hotel_id
    if origin:
        q["origin"] = origin
    if status:
        q["status"] = status
    rows = await db.referral_bookings.find(q, {"_id": 0}).sort("created_at", -1).to_list(1000)
    agg = await db.referral_bookings.aggregate([
        {"$match": q},
        {"$group": {"_id": "$status", "count": {"$sum": 1}, "commission": {"$sum": "$commission_amount"}}},
    ]).to_list(10)
    totals = {a["_id"]: {"count": a["count"], "commission": round(a["commission"], 2)} for a in agg}
    return {"referrals": rows, "totals": totals, "count": len(rows)}


_ALLOWED_TRANSITIONS = {
    "pending": {"validated", "cancelled"},
    "validated": {"cancelled", "paid"},
    "cancelled": set(),   # terminal
    "paid": set(),        # terminal
}


async def _set_status(hotel_or_admin, row_id, new_status, by, extra=None):
    row = await db.referral_bookings.find_one({"id": row_id}, {"_id": 0})
    if not row:
        raise HTTPException(404, "Commission introuvable")
    current = row.get("status", "pending")
    if new_status != current and new_status not in _ALLOWED_TRANSITIONS.get(current, set()):
        raise HTTPException(409, f"Transition {current} -> {new_status} non autorisee")
    now = datetime.now(timezone.utc).isoformat()
    sets = {"status": new_status, "updated_at": now}
    if extra:
        sets.update(extra)
    await db.referral_bookings.update_one(
        {"id": row_id},
        {"$set": sets, "$push": {"history": {"at": now, "event": f"status:{new_status}", "by": by}}},
    )
    return await db.referral_bookings.find_one({"id": row_id}, {"_id": 0})


@router.post("/admin/referrals/{row_id}/validate")
async def admin_validate(row_id: str, request: Request):
    admin = await _require_admin(request)
    return await _set_status(admin, row_id, "validated", f"admin:{admin.get('email', '')}")


@router.post("/admin/referrals/{row_id}/cancel")
async def admin_cancel(row_id: str, request: Request):
    admin = await _require_admin(request)
    return await _set_status(admin, row_id, "cancelled", f"admin:{admin.get('email', '')}")


@router.post("/admin/referrals/{row_id}/payout")
async def admin_payout(row_id: str, request: Request):
    admin = await _require_admin(request)
    body = await request.json()
    payout = {
        "paid_at": datetime.now(timezone.utc).isoformat(),
        "method": body.get("method", ""),
        "reference": body.get("reference", ""),
    }
    return await _set_status(admin, row_id, "paid", f"admin:{admin.get('email', '')}", {"payout": payout})


@router.put("/admin/referrals/{row_id}")
async def admin_correct(row_id: str, request: Request):
    """Manual correction of commission rate/amount — admin only, kept in history."""
    admin = await _require_admin(request)
    row = await db.referral_bookings.find_one({"id": row_id}, {"_id": 0})
    if not row:
        raise HTTPException(404, "Commission introuvable")
    body = await request.json()
    now = datetime.now(timezone.utc).isoformat()
    sets = {"updated_at": now}
    note = []
    if "commission_rate" in body and body["commission_rate"] is not None:
        rate = float(body["commission_rate"])
        sets["commission_rate"] = rate
        sets["commission_amount"] = round(row.get("amount", 0) * rate / 100, 2)
        note.append(f"rate->{rate}")
    if "commission_amount" in body and body["commission_amount"] is not None:
        sets["commission_amount"] = float(body["commission_amount"])
        note.append(f"amount->{sets['commission_amount']}")
    if "hotel_id" in body and body["hotel_id"]:
        sets["hotel_id"] = body["hotel_id"]
        note.append(f"hotel->{body['hotel_id']}")
    await db.referral_bookings.update_one(
        {"id": row_id},
        {"$set": sets, "$push": {"history": {"at": now, "event": "correction:" + ",".join(note),
                                             "by": f"admin:{admin.get('email', '')}"}}},
    )
    return await db.referral_bookings.find_one({"id": row_id}, {"_id": 0})


# ── Hotel extranet: its own referral bookings ──
@router.get("/hotel/referrals")
async def hotel_referrals(request: Request):
    payload = await _require_hotel(request)
    hotel_id = payload["hotel_id"]
    rows = await db.referral_bookings.find({"hotel_id": hotel_id}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    # Hotel never sees client payment data beyond amount/commission
    for r in rows:
        r.pop("token_jti", None)
    agg = await db.referral_bookings.aggregate([
        {"$match": {"hotel_id": hotel_id}},
        {"$group": {"_id": "$status", "count": {"$sum": 1}, "commission": {"$sum": "$commission_amount"}}},
    ]).to_list(10)
    totals = {a["_id"]: {"count": a["count"], "commission": round(a["commission"], 2)} for a in agg}
    return {"referrals": rows, "totals": totals, "count": len(rows)}
