"""Direct Stripe PaymentIntent endpoint for immediate card charges."""
import os
import logging
import stripe
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/payment", tags=["payment"])

STRIPE_SECRET = os.environ.get("STRIPE_LIVE_SECRET_KEY", "")
stripe.api_key = STRIPE_SECRET


class CreateIntentRequest(BaseModel):
    amount: float
    currency: str = "eur"
    description: str = ""


@router.post("/create-intent")
async def create_payment_intent(req: CreateIntentRequest):
    if not STRIPE_SECRET:
        raise HTTPException(status_code=500, detail="Stripe not configured")
    if req.amount <= 0:
        raise HTTPException(status_code=400, detail="Invalid amount")

    amount_cents = int(round(req.amount * 100))
    try:
        intent = stripe.PaymentIntent.create(
            amount=amount_cents,
            currency=req.currency.lower(),
            description=req.description or "Zont.cab - Reservation VTC",
            automatic_payment_methods={"enabled": True, "allow_redirects": "never"},
        )
        logger.info(f"PaymentIntent created: {intent.id} for {amount_cents} cents {req.currency}")
        return {"clientSecret": intent.client_secret, "paymentIntentId": intent.id}
    except stripe.error.StripeError as e:
        logger.error(f"Stripe PaymentIntent error: {e}")
        raise HTTPException(status_code=400, detail=str(e.user_message or e))
