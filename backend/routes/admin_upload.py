from fastapi import APIRouter, UploadFile, File, Request, HTTPException, Response
from middleware.auth import get_current_admin
import uuid
import os
import logging
import requests
from pathlib import Path

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/admin/upload", tags=["admin-upload"])

# Legacy local dir (still served as fallback for files uploaded before object storage)
LEGACY_UPLOAD_DIR = Path(__file__).parent.parent / "uploads"
LEGACY_UPLOAD_DIR.mkdir(exist_ok=True)

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg"}
MIME_TYPES = {
    ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png",
    ".webp": "image/webp", ".gif": "image/gif", ".svg": "image/svg+xml",
}
MAX_SIZE = 5 * 1024 * 1024  # 5MB

# ---- Emergent Object Storage ----
STORAGE_BASE = (os.environ.get("INTEGRATION_PROXY_URL") or "").strip() or "https://integrations.emergentagent.com"
STORAGE_URL = STORAGE_BASE.rstrip("/") + "/objstore/api/v1/storage"
EMERGENT_KEY = os.environ.get("EMERGENT_LLM_KEY")
APP_NAME = "zontcab"
_storage_key = None


def init_storage(force: bool = False):
    global _storage_key
    if _storage_key and not force:
        return _storage_key
    resp = requests.post(f"{STORAGE_URL}/init", json={"emergent_key": EMERGENT_KEY}, timeout=30)
    resp.raise_for_status()
    _storage_key = resp.json()["storage_key"]
    return _storage_key


def put_object(path: str, data: bytes, content_type: str) -> dict:
    key = init_storage()
    resp = requests.put(
        f"{STORAGE_URL}/objects/{path}",
        headers={"X-Storage-Key": key, "Content-Type": content_type},
        data=data, timeout=120,
    )
    if resp.status_code == 404:
        key = init_storage(force=True)
        resp = requests.put(
            f"{STORAGE_URL}/objects/{path}",
            headers={"X-Storage-Key": key, "Content-Type": content_type},
            data=data, timeout=120,
        )
    resp.raise_for_status()
    return resp.json()


def get_object(path: str):
    key = init_storage()
    resp = requests.get(f"{STORAGE_URL}/objects/{path}", headers={"X-Storage-Key": key}, timeout=60)
    if resp.status_code == 404:
        return None, None
    resp.raise_for_status()
    return resp.content, resp.headers.get("Content-Type", "application/octet-stream")


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
    storage_path = f"{APP_NAME}/uploads/{filename}"
    content_type = MIME_TYPES.get(ext, "application/octet-stream")
    try:
        put_object(storage_path, contents, content_type)
    except Exception as e:
        logger.error(f"Object storage upload failed: {e}")
        raise HTTPException(status_code=502, detail="Upload storage unavailable")
    return {"url": f"/api/uploads/{filename}", "filename": filename}


serve_router = APIRouter(prefix="/api/uploads", tags=["uploads"])


@serve_router.get("/{filename}")
async def serve_upload(filename: str):
    if "/" in filename or ".." in filename:
        raise HTTPException(status_code=404, detail="Not found")
    ext = os.path.splitext(filename)[1].lower()
    content_type = MIME_TYPES.get(ext, "application/octet-stream")
    try:
        data, ct = get_object(f"{APP_NAME}/uploads/{filename}")
        if data is not None:
            return Response(content=data, media_type=ct or content_type)
    except Exception as e:
        logger.warning(f"Object storage read failed for {filename}: {e}")
    # Legacy fallback: files uploaded before object storage migration
    legacy = LEGACY_UPLOAD_DIR / filename
    if legacy.exists():
        return Response(content=legacy.read_bytes(), media_type=content_type)
    raise HTTPException(status_code=404, detail="Not found")
