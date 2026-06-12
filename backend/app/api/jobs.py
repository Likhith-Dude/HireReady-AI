from fastapi import APIRouter
from app.schemas.ai import JobSearchRequest
from app.services.job_search import search_jobs

router = APIRouter(prefix="/jobs", tags=["Jobs"])


@router.get("/search")
def search(title: str, location: str = "", limit: int = 20):
    results = search_jobs(title, location, limit)
    return {"jobs": results, "count": len(results)}
