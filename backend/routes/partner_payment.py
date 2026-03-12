"""Stripe payment endpoints for partner card management and ride billing."""
from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timezone
import os
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/partner/payment", tags=["partner-payment"])


def get_stripe_checkout(request: Request):
    from emergentintegrations.payments.stripe.checkout import StripeCheckout
    api_key = os.environ.get("STRIPE_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="Stripe not configured")
    host_url = str(request.base_url).rstrip("/")
    webhook_url = f"{host_url}/api/webhook/stripe"
    return StripeCheckout(api_key=api_key, webhook_url=webhook_url)


async def get_current_partner(request: Request):
    import jwt
    SECRET_KEY = os.environ.get("JWT_SECRET", "zont-admin-secret-key-2025")
    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")
    token = auth.split(" ")[1]
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        if payload.get("type") != "partner":
            raise HTTPException(status_code=403, detail="Not a partner token")
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")


class AddCardRequest(BaseModel):
    origin_url: str


@router.post("/add-card")
async def add_card_session(req: AddCardRequest, request: Request):
    """Create a Stripe checkout session to save a card (1 EUR auth charge, refunded)."""
    user = await get_current_partner(request)
    db = request.app.state.db
    stripe_checkout = get_stripe_checkout(request)

    from emergentintegrations.payments.stripe.checkout import CheckoutSessionRequest

    success_url = f"{req.origin_url}/driver/profile?session_id={{CHECKOUT_SESSION_ID}}"
    cancel_url = f"{req.origin_url}/driver/profile"

    checkout_req = CheckoutSessionRequest(
        amount=1.00,
        currency="eur",
        success_url=success_url,
        cancel_url=cancel_url,
        metadata={
            "partner_id": user["sub"],
            "partner_email": user.get("email", ""),
            "type": "card_setup",
        },
    )
    session = await stripe_checkout.create_checkout_session(checkout_req)

    # Record transaction
    await db.payment_transactions.insert_one({
        "session_id": session.session_id,
        "partner_id": user["sub"],
        "type": "card_setup",
        "amount": 1.00,
        "currency": "eur",
        "payment_status": "pending",
        "status": "initiated",
        "metadata": {"partner_email": user.get("email", "")},
        "created_at": datetime.now(timezone.utc).isoformat(),
    })

    return {"url": session.url, "session_id": session.session_id}


@router.get("/card-status/{session_id}")
async def check_card_status(session_id: str, request: Request):
    """Check the status of a card setup session."""
    user = await get_current_partner(request)
    db = request.app.state.db
    stripe_checkout = get_stripe_checkout(request)

    status = await stripe_checkout.get_checkout_status(session_id)

    # Update transaction
    await db.payment_transactions.update_one(
        {"session_id": session_id},
        {"$set": {
            "payment_status": status.payment_status,
            "status": "completed" if status.payment_status == "paid" else status.status,
            "updated_at": datetime.now(timezone.utc).isoformat(),
        }}
    )

    # If paid, mark partner as having a card on file
    if status.payment_status == "paid":
        await db.partners.update_one(
            {"id": user["sub"]},
            {"$set": {
                "has_card": True,
                "card_session_id": session_id,
                "card_added_at": datetime.now(timezone.utc).isoformat(),
            }}
        )

    return {
        "status": status.status,
        "payment_status": status.payment_status,
        "amount_total": status.amount_total,
        "currency": status.currency,
    }


@router.post("/charge-ride/{ride_id}")
async def charge_ride(ride_id: str, request: Request):
    """Charge a partner for a completed ride (admin only)."""
    from middleware.auth import require_admin
    await require_admin(request)
    db = request.app.state.db

    ride = await db.partner_rides.find_one({"id": ride_id}, {"_id": 0})
    if not ride:
        raise HTTPException(status_code=404, detail="Ride not found")
    if ride["status"] != "completed":
        raise HTTPException(status_code=400, detail="Ride must be completed to charge")

    # Check if already charged
    existing = await db.payment_transactions.find_one({"ride_id": ride_id, "type": "ride_charge", "payment_status": "paid"})
    if existing:
        raise HTTPException(status_code=400, detail="Ride already charged")

    stripe_checkout = get_stripe_checkout(request)
    from emergentintegrations.payments.stripe.checkout import CheckoutSessionRequest

    host_url = str(request.base_url).rstrip("/")
    checkout_req = CheckoutSessionRequest(
        amount=float(ride["proposed_price"]),
        currency=ride.get("currency", "eur").lower(),
        success_url=f"{host_url}/api/partner/payment/charge-success",
        cancel_url=f"{host_url}/api/partner/payment/charge-cancel",
        metadata={
            "partner_id": ride["partner_id"],
            "ride_id": ride_id,
            "type": "ride_charge",
        },
    )
    session = await stripe_checkout.create_checkout_session(checkout_req)

    await db.payment_transactions.insert_one({
        "session_id": session.session_id,
        "partner_id": ride["partner_id"],
        "ride_id": ride_id,
        "type": "ride_charge",
        "amount": float(ride["proposed_price"]),
        "currency": ride.get("currency", "eur").lower(),
        "payment_status": "pending",
        "status": "initiated",
        "created_at": datetime.now(timezone.utc).isoformat(),
    })

    return {"url": session.url, "session_id": session.session_id}


@router.get("/my-card")
async def get_my_card(request: Request):
    """Check if partner has a card on file."""
    user = await get_current_partner(request)
    db = request.app.state.db
    partner = await db.partners.find_one({"id": user["sub"]}, {"_id": 0, "password_hash": 0})
    return {
        "has_card": partner.get("has_card", False),
        "card_added_at": partner.get("card_added_at"),
    }
