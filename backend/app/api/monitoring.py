from fastapi import APIRouter
from app.services.ai_router import get_usage
from app.services.job_aggregator import _cache as job_cache

router = APIRouter(prefix="/monitoring", tags=["Monitoring"])


@router.get("/stats")
def stats():
    return {
        "ai_usage": get_usage(),
        "job_cache": {
            "cached_queries": len(job_cache),
            "entries": list(job_cache.keys()),
        },
    }


@router.get("/health/detailed")
def detailed_health():
    from app.config import settings
    return {
        "status": "ok",
        "services": {
            "groq": "configured" if settings.groq_api_key else "missing",
            "openai": "configured" if settings.openai_api_key else "missing (optional fallback)",
            "sendgrid": "configured" if settings.sendgrid_api_key else "missing (optional)",
            "sentry": "configured" if settings.sentry_dsn else "missing (optional)",
            "redis": "configured" if settings.redis_url else "using in-memory cache",
            "google_oauth": "configured" if settings.google_client_id else "missing (optional)",
            "usajobs": "configured" if settings.usajobs_api_key else "missing (optional)",
            "adzuna": "configured" if settings.adzuna_app_id else "missing (optional)",
            "jsearch": "configured" if settings.rapidapi_key else "missing (optional)",
        },
    }
