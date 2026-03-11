from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from passlib.context import CryptContext
from datetime import datetime, timezone, timedelta
import jwt
import os
import uuid

router = APIRouter(prefix="/api/admin/auth", tags=["admin-auth"])
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
SECRET_KEY = os.environ.get("JWT_SECRET", "zont-admin-secret-key-2025")

class LoginRequest(BaseModel):
    email: str
    password: str

class RegisterRequest(BaseModel):
    email: str
    password: str
    name: str
    role: str = "editor"

class AdminUserOut(BaseModel):
    id: str
    email: str
    name: str
    role: str

def create_token(data: dict):
    expire = datetime.now(timezone.utc) + timedelta(days=7)
    return jwt.encode({**data, "exp": expire}, SECRET_KEY, algorithm="HS256")

@router.post("/login")
async def login(req: LoginRequest, request: Request):
    db = request.app.state.db
    user = await db.admin_users.find_one({"email": req.email}, {"_id": 0})
    if not user or not pwd_context.verify(req.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_token({"sub": user["id"], "email": user["email"], "role": user["role"], "name": user["name"]})
    await db.admin_users.update_one({"id": user["id"]}, {"$set": {"last_login": datetime.now(timezone.utc).isoformat()}})
    return {"token": token, "user": {"id": user["id"], "email": user["email"], "name": user["name"], "role": user["role"]}}

@router.post("/register")
async def register(req: RegisterRequest, request: Request):
    db = request.app.state.db
    existing = await db.admin_users.find_one({"email": req.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already exists")
    user_doc = {
        "id": str(uuid.uuid4()),
        "email": req.email,
        "password_hash": pwd_context.hash(req.password),
        "name": req.name,
        "role": req.role,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "last_login": None
    }
    await db.admin_users.insert_one(user_doc)
    token = create_token({"sub": user_doc["id"], "email": user_doc["email"], "role": user_doc["role"], "name": user_doc["name"]})
    return {"token": token, "user": {"id": user_doc["id"], "email": user_doc["email"], "name": user_doc["name"], "role": user_doc["role"]}}

@router.get("/me")
async def get_me(request: Request):
    from middleware.auth import get_current_admin
    user = await get_current_admin(request)
    return {"id": user["sub"], "email": user["email"], "name": user["name"], "role": user["role"]}

@router.post("/seed")
async def seed_admin(request: Request):
    db = request.app.state.db
    existing = await db.admin_users.find_one({"email": "admin@zont.cab"})
    if existing:
        return {"message": "Admin already exists"}
    user_doc = {
        "id": str(uuid.uuid4()),
        "email": "admin@zont.cab",
        "password_hash": pwd_context.hash("admin123"),
        "name": "Admin",
        "role": "admin",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "last_login": None
    }
    await db.admin_users.insert_one(user_doc)
    return {"message": "Admin user created", "email": "admin@zont.cab", "password": "admin123"}
