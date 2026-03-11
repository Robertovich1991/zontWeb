from fastapi import APIRouter, UploadFile, File, Request, HTTPException
from middleware.auth import get_current_admin
import uuid
import os
from pathlib import Path

router = APIRouter(prefix="/api/admin/upload", tags=["admin-upload"])

UPLOAD_DIR = Path(__file__).parent.parent / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg"}
MAX_SIZE = 5 * 1024 * 1024  # 5MB

@router.post("")
async def upload_image(request: Request, file: UploadFile = File(...)):
    await get_current_admin(request)
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail=f"File type {ext} not allowed")
    contents = await file.read()
    if len(contents) > MAX_SIZE:
        raise HTTPException(status_code=400, detail="File too large (max 5MB)")
    filename = f"{uuid.uuid4().hex}{ext}"
    filepath = UPLOAD_DIR / filename
    with open(filepath, "wb") as f:
        f.write(contents)
    return {"url": f"/api/uploads/{filename}", "filename": filename}
