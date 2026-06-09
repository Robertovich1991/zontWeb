"""Stripe Terminal Integration for Kiosk Physical Card Reader (BBPOS WisePOS E / Stripe Reader S700).

Flow:
1. Admin registers reader once: POST /api/stripe-terminal/register-reader { hotelSlug, code, address }
2. Kiosk client confirms booking → backend creates PaymentIntent (card_present) → process on reader → poll status
3. Reader shows amount and prompts client to insert/tap/swipe card
4. Frontend polls /api/stripe-terminal/payment-status/{pi_id} until success/fail
"""
import os
import logging
from typing import Optional
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
import stripe
from motor.motor_asyncio import AsyncIOMotorClient

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/stripe-terminal", tags=["stripe-terminal"])

stripe.api_key = os.environ.get("STRIPE_LIVE_SECRET_KEY", "")

MONGO_URL = os.environ.get("MONGO_URL")
DB_NAME = os.environ.get("DB_NAME")
_mongo = AsyncIOMotorClient(MONGO_URL) if MONGO_URL else None
db = _mongo[DB_NAME] if _mongo and DB_NAME else None


# ============ Models ============

class RegisterReaderRequest(BaseModel):
    hotelSlug: str
    code: str  # The pairing code shown on the reader screen (e.g. "super-content-greatly")
    label: Optional[str] = None  # Optional friendly name e.g. "Bristol Lobby Terminal"
    # Location address — Stripe requires a full postal address for the location
    addressLine1: str
    addressLine2: Optional[str] = None
    city: str
    postalCode: str
    country: str = "FR"  # ISO 3166-1 alpha-2
    locationDisplayName: Optional[str] = None  # If creating a new location


class CreateTerminalPaymentRequest(BaseModel):
    bookingReference: str  # Reference of a previously created kiosk booking


# ============ Helpers ============

async def get_or_create_location(req: RegisterReaderRequest) -> str:
    """Find an existing Terminal Location for this hotel, or create one."""
    if db is None:
        raise HTTPException(500, "Database not available")
    hotel = await db.kiosk_hotels.find_one({"slug": req.hotelSlug}, {"_id": 0})
    if not hotel:
        raise HTTPException(404, f"Hotel '{req.hotelSlug}' not found")

    # Re-use stored location_id if present
    if hotel.get("stripe_terminal_location_id"):
        return hotel["stripe_terminal_location_id"]

    display_name = req.locationDisplayName or hotel.get("name") or req.hotelSlug
    address = {
        "line1": req.addressLine1,
        "city": req.city,
        "postal_code": req.postalCode,
        "country": req.country,
    }
    if req.addressLine2:  # Only include line2 if non-empty (Stripe rejects empty string)
        address["line2"] = req.addressLine2
    location = stripe.terminal.Location.create(
        display_name=display_name,
        address=address,
        metadata={"hotel_slug": req.hotelSlug},
    )
    await db.kiosk_hotels.update_one(
        {"slug": req.hotelSlug},
        {"$set": {"stripe_terminal_location_id": location.id}},
    )
    logger.info(f"Created Stripe Terminal Location {location.id} for hotel {req.hotelSlug}")
    return location.id


# ============ Endpoints ============

@router.post("/register-reader")
async def register_reader(req: RegisterReaderRequest):
    """Register a physical Stripe Terminal reader (BBPOS WisePOS E / Reader S700) for a kiosk.

    The reader displays a unique pairing code on its screen — admin enters it here.
    """
    if db is None:
        raise HTTPException(500, "Database not available")
    if not stripe.api_key:
        raise HTTPException(500, "Stripe is not configured")

    location_id = await get_or_create_location(req)

    try:
        reader = stripe.terminal.Reader.create(
            registration_code=req.code.strip(),
            label=req.label or f"{req.hotelSlug}-kiosk",
            location=location_id,
            metadata={"hotel_slug": req.hotelSlug},
        )
    except stripe.error.InvalidRequestError as e:
        msg = str(e)
        if "registration_code" in msg.lower() or "code" in msg.lower():
            raise HTTPException(400, "Code de pairing invalide ou expiré. Redémarrez le terminal pour générer un nouveau code (valable 30 minutes).")
        raise HTTPException(400, f"Stripe error: {msg}")
    except Exception as e:
        logger.error(f"Reader registration failed: {e}")
        raise HTTPException(502, f"Échec d'enregistrement: {e}")

    # Store the reader on the hotel doc
    await db.kiosk_hotels.update_one(
        {"slug": req.hotelSlug},
        {"$set": {
            "stripe_terminal_reader_id": reader.id,
            "stripe_terminal_reader_label": reader.label,
            "stripe_terminal_registered_at": datetime.now(timezone.utc).isoformat(),
        }},
    )

    return {
        "success": True,
        "reader_id": reader.id,
        "label": reader.label,
        "device_type": reader.device_type,
        "location_id": location_id,
        "status": reader.status,
    }


@router.post("/create-payment")
async def create_terminal_payment(req: CreateTerminalPaymentRequest):
    """Create a PaymentIntent for an existing booking and push it to the physical reader.

    The reader will then prompt the customer to insert/tap/swipe a card.
    """
    if db is None:
        raise HTTPException(500, "Database not available")

    booking = await db.kiosk_bookings.find_one({"reference": req.bookingReference}, {"_id": 0})
    if not booking:
        raise HTTPException(404, "Booking not found")

    hotel = await db.kiosk_hotels.find_one({"slug": booking["hotelSlug"]}, {"_id": 0})
    if not hotel or not hotel.get("stripe_terminal_reader_id"):
        raise HTTPException(400, "Aucun terminal de paiement enregistré pour cet hôtel")

    reader_id = hotel["stripe_terminal_reader_id"]
    amount_cents = int(round(float(booking["price"]) * 100))

    # 1. Create the PaymentIntent in card-present mode
    try:
        payment_intent = stripe.PaymentIntent.create(
            amount=amount_cents,
            currency="eur",
            payment_method_types=["card_present"],
            capture_method="automatic",
            description=f"Kiosk {booking['hotelSlug']} → {booking['destination']} | Ref: {req.bookingReference}",
            metadata={
                "kiosk_reference": req.bookingReference,
                "hotel_slug": booking["hotelSlug"],
                "client_name": booking.get("clientName", ""),
                "client_phone": booking.get("clientPhone", ""),
                "channel": "kiosk_terminal",
            },
        )
    except Exception as e:
        logger.error(f"PaymentIntent create failed: {e}")
        raise HTTPException(502, f"Erreur création paiement: {e}")

    # 2. Push the PaymentIntent to the physical reader
    try:
        stripe.terminal.Reader.process_payment_intent(
            reader_id,
            payment_intent=payment_intent.id,
        )
    except Exception as e:
        logger.error(f"process_payment_intent failed: {e}")
        # Cancel the PI to free funds
        try:
            stripe.PaymentIntent.cancel(payment_intent.id)
        except Exception:
            pass
        raise HTTPException(502, f"Terminal de paiement injoignable: {e}")

    # 3. Update booking with PI id
    await db.kiosk_bookings.update_one(
        {"reference": req.bookingReference},
        {"$set": {
            "stripe_payment_intent_id": payment_intent.id,
            "payment_channel": "terminal",
            "status": "card_prompt_sent",
        }},
    )

    return {
        "payment_intent_id": payment_intent.id,
        "amount": amount_cents,
        "currency": "eur",
        "status": payment_intent.status,
        "reader_id": reader_id,
    }


@router.get("/payment-status/{payment_intent_id}")
async def get_payment_status(payment_intent_id: str):
    """Polled by the kiosk every 2 seconds to detect when the card payment completes."""
    try:
        pi = stripe.PaymentIntent.retrieve(payment_intent_id)
    except Exception as e:
        raise HTTPException(502, f"Stripe lookup failed: {e}")

    # Map Stripe status to kiosk status
    mapping = {
        "succeeded": "paid",
        "requires_payment_method": "waiting_card",
        "requires_confirmation": "processing",
        "requires_action": "processing",
        "processing": "processing",
        "requires_capture": "processing",
        "canceled": "cancelled",
    }
    kiosk_status = mapping.get(pi.status, pi.status)

    # If just paid, update booking
    if pi.status == "succeeded" and db is not None:
        ref = (pi.metadata or {}).get("kiosk_reference")
        if ref:
            await db.kiosk_bookings.update_one(
                {"reference": ref},
                {"$set": {"status": "paid", "paidAt": datetime.now(timezone.utc).isoformat()}},
            )

    return {
        "payment_intent_id": pi.id,
        "stripe_status": pi.status,
        "status": kiosk_status,
        "amount": pi.amount,
        "last_payment_error": pi.last_payment_error.message if pi.last_payment_error else None,
    }


@router.post("/cancel-payment/{payment_intent_id}")
async def cancel_terminal_payment(payment_intent_id: str):
    """Called when the customer taps 'Cancel' on the kiosk during card prompt."""
    try:
        # First cancel the action on the reader, then the PI
        pi = stripe.PaymentIntent.retrieve(payment_intent_id)
        reader_id = (pi.metadata or {}).get("reader_id")
        if not reader_id and db is not None:
            slug = (pi.metadata or {}).get("hotel_slug")
            if slug:
                hotel = await db.kiosk_hotels.find_one({"slug": slug}, {"_id": 0})
                reader_id = hotel.get("stripe_terminal_reader_id") if hotel else None
        if reader_id:
            try:
                stripe.terminal.Reader.cancel_action(reader_id)
            except Exception:
                pass
        stripe.PaymentIntent.cancel(payment_intent_id)
    except Exception as e:
        logger.warning(f"Cancel failed: {e}")

    if db is not None:
        await db.kiosk_bookings.update_one(
            {"stripe_payment_intent_id": payment_intent_id},
            {"$set": {"status": "cancelled"}},
        )
    return {"cancelled": True}


@router.get("/reader-status/{hotel_slug}")
async def get_reader_status(hotel_slug: str):
    """Returns the status of the reader for a hotel (online/offline, last seen)."""
    if db is None:
        raise HTTPException(500, "Database not available")
    hotel = await db.kiosk_hotels.find_one({"slug": hotel_slug}, {"_id": 0})
    if not hotel or not hotel.get("stripe_terminal_reader_id"):
        return {"registered": False}
    try:
        reader = stripe.terminal.Reader.retrieve(hotel["stripe_terminal_reader_id"])
        return {
            "registered": True,
            "reader_id": reader.id,
            "label": reader.label,
            "status": reader.status,
            "device_type": reader.device_type,
            "ip_address": getattr(reader, "ip_address", None),
        }
    except Exception as e:
        return {"registered": True, "error": str(e)}
