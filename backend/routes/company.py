"""Company registration API endpoints."""
from fastapi import APIRouter, Request, HTTPException
from pydantic import BaseModel, Field
from typing import Optional
from passlib.context import CryptContext
import uuid
from datetime import datetime, timezone

router = APIRouter(prefix="/api/company", tags=["company"])

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


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

    company = {
        "id": str(uuid.uuid4()),
        "first_name": data.first_name,
        "last_name": data.last_name,
        "company_name": data.company_name,
        "company_address": data.company_address,
        "email": data.email.lower(),
        "phone": data.phone,
        "phone_country": data.phone_country,
        "hashed_password": pwd_context.hash(data.password),
        "status": "pending",
        "created_at": datetime.now(timezone.utc).isoformat(),
    }

    await db.companies.insert_one(company)

    return {
        "id": company["id"],
        "email": company["email"],
        "company_name": company["company_name"],
        "status": "pending",
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
