"""Security middleware: rate limiting, XSS/injection protection, request logging."""
import time
import logging
from collections import defaultdict
from fastapi import Request, Response
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware

logger = logging.getLogger(__name__)

# In-memory rate limiter: ip → [timestamps]
_rate_data: dict = defaultdict(list)

RATE_LIMITS = {
    "/ai/": (10, 60),          # 10 req/min for AI endpoints
    "/auth/login": (5, 60),    # 5 req/min for login (brute force protection)
    "/auth/register": (3, 60), # 3 req/min for registration
    "default": (60, 60),       # 60 req/min default
}

# Patterns that indicate injection attacks
INJECTION_PATTERNS = [
    "<script", "javascript:", "onerror=", "onload=",  # XSS
    "'; drop table", "' or '1'='1", "union select",   # SQLi
    "../../../", "..\\..\\",                            # Path traversal
]


def _get_limit(path: str) -> tuple:
    for prefix, limit in RATE_LIMITS.items():
        if prefix != "default" and path.startswith(prefix):
            return limit
    return RATE_LIMITS["default"]


def _is_rate_limited(ip: str, path: str) -> bool:
    max_req, window = _get_limit(path)
    now = time.time()
    # Clean old timestamps
    _rate_data[ip] = [t for t in _rate_data[ip] if now - t < window]
    if len(_rate_data[ip]) >= max_req:
        return True
    _rate_data[ip].append(now)
    return False


def _has_injection(text: str) -> bool:
    lower = text.lower()
    return any(p in lower for p in INJECTION_PATTERNS)


class SecurityMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next) -> Response:
        start = time.time()
        ip = request.client.host if request.client else "unknown"
        path = request.url.path

        # Rate limiting
        if _is_rate_limited(ip, path):
            logger.warning(f"[Security] Rate limited: {ip} → {path}")
            return JSONResponse(status_code=429, content={"detail": "Too many requests. Please slow down."})

        # Check URL for injection
        if _has_injection(str(request.url)):
            logger.warning(f"[Security] Injection attempt in URL: {ip} → {request.url}")
            return JSONResponse(status_code=400, content={"detail": "Invalid request"})

        response = await call_next(request)

        # Security headers
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = "geolocation=(), microphone=()"

        duration = (time.time() - start) * 1000
        logger.info(f"[API] {request.method} {path} → {response.status_code} ({duration:.1f}ms)")

        return response
