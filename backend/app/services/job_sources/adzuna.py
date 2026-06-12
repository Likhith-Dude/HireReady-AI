"""Adzuna — free tier at developer.adzuna.com (aggregates Indeed, LinkedIn, etc.)"""
import httpx
from typing import List
from .base import JobListing
from app.config import settings


def fetch(title: str, location: str = "us", limit: int = 20) -> List[JobListing]:
    if not settings.adzuna_app_id or not settings.adzuna_api_key:
        return []
    try:
        country = "us"
        params = {
            "app_id": settings.adzuna_app_id,
            "app_key": settings.adzuna_api_key,
            "results_per_page": min(limit, 20),
            "what": title,
            "content-type": "application/json",
        }
        if location:
            params["where"] = location
        resp = httpx.get(f"https://api.adzuna.com/v1/api/jobs/{country}/search/1",
                         params=params, timeout=12)
        resp.raise_for_status()
        results = []
        for job in resp.json().get("results", []):
            sal = job.get("salary_min", 0)
            sal_max = job.get("salary_max", 0)
            salary = f"${int(sal):,}–${int(sal_max):,}/yr" if sal else ""
            results.append(JobListing(
                id=f"adz_{job.get('id','')}",
                title=job.get("title", ""),
                company=job.get("company", {}).get("display_name", ""),
                location=job.get("location", {}).get("display_name", ""),
                url=job.get("redirect_url", ""),
                description=(job.get("description", "") or "")[:600],
                posted=job.get("created", ""),
                salary=salary,
                job_type=job.get("contract_time", "full_time").replace("_", "-").title(),
                source="Adzuna",
            ))
        return results
    except Exception:
        return []
