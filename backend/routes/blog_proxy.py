"""
Reverse-proxy for /blog/* — forwards traffic transparently from zont.cab/blog/*
to https://blog.zont.cab/* without redirecting the user (subfolder hosting).

This preserves SEO equity on the main domain instead of leaking it to the subdomain.

NOTE on Emergent routing: the K8s ingress only forwards /api/* to the backend.
So this router is mounted at /api/blog/*. To make the public path /blog/* work,
Emergent Support must add an ingress rewrite rule:
    /blog/*  ->  /api/blog/*
Until that rewrite exists, the proxy is reachable at /api/blog/<path>.
"""
import logging
from fastapi import APIRouter, Request, HTTPException
from fastapi.responses import Response
import httpx

logger = logging.getLogger(__name__)

BLOG_BASE_URL = "https://blog.zont.cab"

# Mounted at /api/blog so it's reachable through the existing ingress.
router = APIRouter(prefix="/api/blog", tags=["blog-proxy"])


@router.api_route("/{path:path}", methods=["GET", "POST", "HEAD"])
async def proxy_blog(request: Request, path: str):
    """Transparently proxy GET/POST/HEAD to blog.zont.cab while preserving the /blog/<path> sub-URL."""
    # 1. Reconstruct destination — keep the original /blog/<path> shape inside the upstream
    target_url = f"{BLOG_BASE_URL}/blog/{path}" if path else f"{BLOG_BASE_URL}/blog"
    if request.query_params:
        target_url += f"?{request.query_params}"

    # 2. Forward headers, but drop hop-by-hop and host headers that would confuse the upstream
    drop = {"host", "content-length", "connection", "accept-encoding"}
    fwd_headers = {k: v for k, v in request.headers.items() if k.lower() not in drop}

    try:
        async with httpx.AsyncClient(follow_redirects=True, timeout=20.0) as client:
            upstream = await client.request(
                method=request.method,
                url=target_url,
                headers=fwd_headers,
                content=await request.body(),
            )
    except httpx.RequestError as e:
        logger.warning(f"Blog proxy upstream error for {target_url}: {e}")
        raise HTTPException(status_code=502, detail="Blog upstream unreachable")

    # 3. Filter response headers (drop hop-by-hop + ones that would break the body we return)
    drop_resp = {"transfer-encoding", "content-encoding", "content-length", "connection"}
    resp_headers = {k: v for k, v in upstream.headers.items() if k.lower() not in drop_resp}

    return Response(
        content=upstream.content,
        status_code=upstream.status_code,
        headers=resp_headers,
        media_type=upstream.headers.get("content-type"),
    )
