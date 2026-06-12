from fastapi import APIRouter
from app.services.job_aggregator import search_jobs, invalidate_cache
from app.services.h1b import get_h1b_info

router = APIRouter(prefix="/jobs", tags=["Jobs"])


@router.get("/search")
def search(title: str, location: str = "", limit: int = 20,
           job_type: str = "", salary_min: int = 0, remote_only: bool = False,
           h1b_only: bool = False):
    result = search_jobs(title, location, limit * 2 if h1b_only else limit,
                         job_type, salary_min, remote_only)
    if h1b_only:
        result["jobs"] = [j for j in result["jobs"] if j.get("h1b_sponsor")][:limit]
        result["count"] = len(result["jobs"])
    return result


@router.post("/cache/clear")
def clear_cache():
    invalidate_cache()
    return {"message": "Job cache cleared"}
