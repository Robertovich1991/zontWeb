"""Shared C# API client with connection pooling and caching."""
import httpx
import asyncio
import time
import logging
import base64
import json
from datetime import datetime
from fastapi import Request, HTTPException

logger = logging.getLogger(__name__)

CSHARP_API = "https://api.zont.cab"
TIMEOUT = 15.0

# ── Shared HTTP Client (connection pooling) ──────────────────────────
_client: httpx.AsyncClient | None = None


def get_shared_client() -> httpx.AsyncClient:
    global _client
    if _client is None or _client.is_closed:
        _client = httpx.AsyncClient(
            timeout=TIMEOUT,
            limits=httpx.Limits(max_connections=20, max_keepalive_connections=10),
            http2=False,
        )
    return _client


async def close_shared_client():
    global _client
    if _client and not _client.is_closed:
        await _client.aclose()
        _client = None


# ── In-memory cache (TTL-based) ──────────────────────────────────────
_cache: dict[str, tuple[float, any]] = {}
CACHE_TTL = 30  # seconds


def _cache_key(path: str, token_hash: str) -> str:
    return f"{token_hash}:{path}"


def _token_hash(token: str) -> str:
    return token[-16:]  # last 16 chars as lightweight hash


def cache_get(path: str, token: str):
    key = _cache_key(path, _token_hash(token))
    entry = _cache.get(key)
    if entry and (time.time() - entry[0]) < CACHE_TTL:
        return entry[1]
    return None


def cache_set(path: str, token: str, data):
    key = _cache_key(path, _token_hash(token))
    _cache[key] = (time.time(), data)
    # Evict old entries if cache grows too large
    if len(_cache) > 200:
        cutoff = time.time() - CACHE_TTL
        expired = [k for k, v in _cache.items() if v[0] < cutoff]
        for k in expired:
            del _cache[k]


def cache_invalidate_prefix(prefix: str, token: str):
    th = _token_hash(token)
    keys_to_del = [k for k in _cache if k.startswith(f"{th}:{prefix}")]
    for k in keys_to_del:
        del _cache[k]


# ── Core API call with caching ───────────────────────────────────────
async def csharp_get(path: str, token: str, use_cache: bool = True) -> any:
    if use_cache:
        cached = cache_get(path, token)
        if cached is not None:
            return cached

    client = get_shared_client()
    t0 = time.perf_counter()
    try:
        resp = await client.get(
            f"{CSHARP_API}{path}",
            headers={"Authorization": f"Bearer {token}"},
        )
        elapsed = round((time.perf_counter() - t0) * 1000)
        if resp.status_code != 200:
            logger.debug(f"C# {path} -> {resp.status_code} ({elapsed}ms)")
            return [] if "count" not in path.lower() else 0
        data = resp.json()
        if use_cache:
            cache_set(path, token, data)
        logger.debug(f"C# {path} -> 200 ({elapsed}ms, {len(resp.content)}B)")
        return data
    except httpx.TimeoutException:
        logger.warning(f"C# {path} TIMEOUT after {TIMEOUT}s")
        return [] if "count" not in path.lower() else 0
    except Exception as e:
        logger.warning(f"C# {path} ERROR: {e}")
        return [] if "count" not in path.lower() else 0


async def csharp_post(path: str, token: str, payload: dict) -> httpx.Response:
    client = get_shared_client()
    return await client.post(
        f"{CSHARP_API}{path}",
        json=payload,
        headers={"Authorization": f"Bearer {token}"},
    )


# ── Auth helpers ──────────────────────────────────────────────────────
def get_token(request: Request) -> str:
    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
        raise HTTPException(401, "Token requis")
    return auth.split(" ", 1)[1]


def get_company_id(request: Request) -> str:
    token = request.headers.get("Authorization", "").replace("Bearer ", "")
    if not token:
        raise HTTPException(401, "Non authentifie")
    try:
        payload = token.split(".")[1]
        payload += "=" * (4 - len(payload) % 4)
        data = json.loads(base64.b64decode(payload))
        return data.get("http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier", "")
    except Exception:
        raise HTTPException(401, "Token invalide")


def get_db(request: Request):
    return request.app.state.db


# ── Date parsing ──────────────────────────────────────────────────────
_DATE_FORMATS = (
    "%Y-%m-%dT%H:%M:%S",
    "%Y-%m-%dT%H:%M:%S.%f",
    "%Y-%m-%dT%H:%M",
    "%Y-%m-%d %H:%M:%S",
    "%Y-%m-%d %H:%M",
    "%Y-%m-%d",
    "%d/%m/%Y %H:%M:%S",
    "%d/%m/%Y %H:%M",
    "%d/%m/%Y",
)


def parse_csharp_date(date_str):
    if not date_str:
        return None
    cleaned = date_str.split("+")[0].split("Z")[0]
    for fmt in _DATE_FORMATS:
        try:
            return datetime.strptime(cleaned, fmt)
        except (ValueError, AttributeError):
            continue
    return None


from datetime import timedelta

def estimate_end_time(start_dt, booking_type="transfer"):
    if not start_dt:
        return None
    if booking_type in ("dispo", "excursion"):
        return start_dt + timedelta(hours=2)
    return start_dt + timedelta(hours=1, minutes=30)


# ── Centralized auction scanning ─────────────────────────────────────
async def scan_auctions(token: str, company_id: str, known_ids: set[int] | None = None) -> list[dict]:
    """Scan recent auction IDs to find auctions hidden by the C# list endpoint.
    Returns raw auction dicts from C#.
    """
    if known_ids is None:
        known_ids = set()

    max_id = max(known_ids) if known_ids else 0
    scan_start = max(1, max_id - 3)
    scan_end = max_id + 15 if max_id > 0 else 15

    async def check(aid):
        if aid in known_ids:
            return None
        try:
            detail = await csharp_get(
                f"/api/Auction/company/auctions/{aid}", token, use_cache=True
            )
            if isinstance(detail, dict) and detail.get("id"):
                auction_company = detail.get("company") or {}
                if auction_company.get("id") == company_id:
                    return detail
        except Exception:
            pass
        return None

    tasks = [check(i) for i in range(scan_start, scan_end + 1)]
    results = await asyncio.gather(*tasks)
    return [r for r in results if r]


# ── Auction formatting ────────────────────────────────────────────────
def format_auction(a: dict) -> dict:
    return {
        "id": a.get("id"),
        "status": a.get("status", ""),
        "startDate": a.get("startDate", ""),
        "startAddress": a.get("startAddress", ""),
        "endAddress": a.get("endAddress", ""),
        "carType": (a.get("carType") or "").strip(),
        "tripType": a.get("tripType", ""),
        "totalAmount": a.get("totalAmount", 0),
        "currentPrice": a.get("currentPrice", 0),
        "client": {
            "firstName": (a.get("client") or {}).get("firstName", ""),
            "lastName": (a.get("client") or {}).get("lastName", ""),
            "phone": (a.get("client") or {}).get("phoneNumber", ""),
        } if a.get("client") else None,
        "driver": {
            "id": (a.get("driver") or {}).get("id", ""),
            "firstName": (a.get("driver") or {}).get("firstName", ""),
            "lastName": (a.get("driver") or {}).get("lastName", ""),
        } if a.get("driver") else None,
        "additionalComments": a.get("additionalComments", ""),
    }
