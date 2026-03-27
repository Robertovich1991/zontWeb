from fastapi import APIRouter, Request
from pydantic import BaseModel, EmailStr
from datetime import datetime, timezone, timedelta
import secrets
import string

router = APIRouter(prefix="/api/promo", tags=["promo"])


class PromoRequest(BaseModel):
    email: str


class PromoValidateRequest(BaseModel):
    code: str


def generate_code():
    chars = string.ascii_uppercase + string.digits
    suffix = ''.join(secrets.choice(chars) for _ in range(5))
    return f"WELCOME-{suffix}"


@router.post("/generate")
async def generate_promo(req: PromoRequest, request: Request):
    db = request.app.state.db
    email = req.email.strip().lower()
    if not email or '@' not in email:
        return {"error": "Email invalide"}

    # Check if this email already has an active (non-expired) code
    existing = await db.promo_codes.find_one(
        {"email": email, "expires_at": {"$gt": datetime.now(timezone.utc).isoformat()}},
        {"_id": 0}
    )
    if existing:
        return {
            "code": existing["code"],
            "expires_at": existing["expires_at"],
            "discount": existing["discount"],
            "already_exists": True,
        }

    code = generate_code()
    # Ensure uniqueness
    while await db.promo_codes.find_one({"code": code}):
        code = generate_code()

    now = datetime.now(timezone.utc)
    expires = now + timedelta(hours=1)

    doc = {
        "email": email,
        "code": code,
        "discount": 10,
        "created_at": now.isoformat(),
        "expires_at": expires.isoformat(),
        "used": False,
        "used_at": None,
    }
    await db.promo_codes.insert_one(doc)

    return {
        "code": code,
        "expires_at": expires.isoformat(),
        "discount": 10,
        "already_exists": False,
    }


@router.post("/validate")
async def validate_promo(req: PromoValidateRequest, request: Request):
    db = request.app.state.db
    code = req.code.strip().upper()
    promo = await db.promo_codes.find_one({"code": code}, {"_id": 0})
    if not promo:
        return {"valid": False, "reason": "Code introuvable"}

    if promo.get("used"):
        return {"valid": False, "reason": "Code deja utilise"}

    expires_at = promo["expires_at"]
    if datetime.fromisoformat(expires_at) < datetime.now(timezone.utc):
        return {"valid": False, "reason": "Code expire"}

    return {
        "valid": True,
        "discount": promo["discount"],
        "code": promo["code"],
        "expires_at": expires_at,
    }


@router.post("/mark-used")
async def mark_used(req: PromoValidateRequest, request: Request):
    db = request.app.state.db
    code = req.code.strip().upper()
    result = await db.promo_codes.update_one(
        {"code": code},
        {"$set": {"used": True, "used_at": datetime.now(timezone.utc).isoformat()}}
    )
    return {"ok": result.modified_count > 0}


# Admin endpoint: list all collected emails
@router.get("/admin/emails")
async def admin_list_emails(request: Request):
    import jwt
    import os
    
    db = request.app.state.db
    SECRET_KEY = os.environ.get("JWT_SECRET", "zont-admin-secret-key-2025")
    
    # Verify admin JWT token
    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
        return {"error": "Non autorise"}
    token = auth.split(" ", 1)[1]
    
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        # Verify user exists and is admin
        admin = await db.admin_users.find_one({"id": payload.get("sub")}, {"_id": 0})
        if not admin or admin.get("role") != "admin":
            return {"error": "Non autorise"}
    except jwt.ExpiredSignatureError:
        return {"error": "Token expire"}
    except jwt.InvalidTokenError:
        return {"error": "Non autorise"}

    cursor = db.promo_codes.find({}, {"_id": 0}).sort("created_at", -1)
    codes = await cursor.to_list(500)
    return {"emails": codes}
