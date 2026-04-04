"""Company registration API endpoints."""
from fastapi import APIRouter, Request, HTTPException
from pydantic import BaseModel, Field
from typing import Optional
from passlib.context import CryptContext
import uuid
import httpx
import logging
from datetime import datetime, timezone

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/company", tags=["company"])

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

CSHARP_API = "https://api.zont.cab"
TIMEOUT = 15.0


class CompanyRegister(BaseModel):
    first_name: str
    last_name: str
    company_name: str
    company_address: Optional[str] = ""
    email: str
    phone: Optional[str] = ""
    phone_country: Optional[str] = "+33"
    password: str


@router.post("/register")
async def register_company(data: CompanyRegister, request: Request):
    db = request.app.state.db

    existing = await db.companies.find_one({"email": data.email.lower()}, {"_id": 0, "id": 1})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    # 1. Register on C# backend
    full_phone = data.phone or ""
    if full_phone and not full_phone.startswith("+"):
        full_phone = (data.phone_country or "+33") + full_phone.lstrip("0")

    csharp_payload = {
        "firstName": data.first_name,
        "lastName": data.last_name,
        "companyName": data.company_name,
        "address": data.company_address or "",
        "email": data.email.lower(),
        "password": data.password,
        "country": data.phone_country or "+33",
        "phone": full_phone,
        "accountToken": "none",
    }

    csharp_id = None
    csharp_error = None
    try:
        async with httpx.AsyncClient(timeout=TIMEOUT) as client:
            resp = await client.post(
                f"{CSHARP_API}/api/CompanyRegister/register",
                json=csharp_payload,
            )
            if resp.status_code in (200, 201):
                logger.info(f"Company registered on C# backend: {data.email}")
                try:
                    csharp_data = resp.json()
                    csharp_id = csharp_data if isinstance(csharp_data, (int, str)) else None
                except Exception:
                    pass
            else:
                csharp_error = resp.text
                logger.warning(f"C# registration failed ({resp.status_code}): {csharp_error}")
    except Exception as e:
        csharp_error = str(e)
        logger.error(f"C# registration error: {e}")

    # 2. Save locally in MongoDB
    company = {
        "id": str(uuid.uuid4()),
        "csharp_id": csharp_id,
        "first_name": data.first_name,
        "last_name": data.last_name,
        "company_name": data.company_name,
        "company_address": data.company_address,
        "email": data.email.lower(),
        "phone": data.phone,
        "phone_country": data.phone_country,
        "hashed_password": pwd_context.hash(data.password),
        "status": "pending",
        "csharp_synced": csharp_error is None,
        "csharp_error": csharp_error,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }

    await db.companies.insert_one(company)

    return {
        "id": company["id"],
        "email": company["email"],
        "company_name": company["company_name"],
        "status": "pending",
        "csharp_synced": csharp_error is None,
        "message": "Company registered successfully"
    }


@router.post("/login")
async def login_company(request: Request):
    body = await request.json()
    email = body.get("email", "").lower()
    password = body.get("password", "")

    db = request.app.state.db
    company = await db.companies.find_one({"email": email}, {"_id": 0})
    if not company or not pwd_context.verify(password, company["hashed_password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    return {
        "id": company["id"],
        "email": company["email"],
        "company_name": company["company_name"],
        "first_name": company["first_name"],
        "last_name": company["last_name"],
        "status": company["status"],
    }
