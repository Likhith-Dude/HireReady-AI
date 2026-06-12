"""JSearch via RapidAPI — scrapes LinkedIn, Indeed, Glassdoor, ZipRecruiter, Glassdoor.
   Free tier: 200 req/month. Get key at rapidapi.com/letscrape-6bRBa3QguO5/api/jsearch"""
import httpx
from typing import List
from .base import JobListing
from app.config import settings


def fetch(title: str, location: str = "", limit: int = 20) -> List[JobListing]:
    if not settings.rapidapi_key:
        return []
    try:
        query = f"{title} in {location}" if location else title
        headers = {
            "x-rapidapi-host": "jsearch.p.rapidapi.com",
            "x-rapidapi-key": settings.rapidapi_key,
        }
        resp = httpx.get("https://jsearch.p.rapidapi.com/search",
                         params={"query": query, "num_pages": "1", "page": "1"},
                         headers=headers, timeout=12)
        resp.raise_for_status()
        results = []
        for job in resp.json().get("data", []):
            sal_min = job.get("job_min_salary")
            sal_max = job.get("job_max_salary")
            salary = ""
            if sal_min:
                period = job.get("job_salary_period", "YEAR")
                salary = f"${int(sal_min):,}–${int(sal_max):,}/{period[:2].lower()}" if sal_max else f"${int(sal_min):,}/{period[:2].lower()}"
            # Source name based on publisher
            publisher = job.get("job_publisher", "JSearch")
            source_map = {"linkedin": "LinkedIn", "indeed": "Indeed", "ziprecruiter": "ZipRecruiter",
                          "glassdoor": "Glassdoor"}
            source = next((v for k, v in source_map.items() if k in publisher.lower()), publisher)
            results.append(JobListing(
                id=f"js_{job.get('job_id','')}",
                title=job.get("job_title", ""),
                company=job.get("employer_name", ""),
                location=f"{job.get('job_city','')}, {job.get('job_state','')}, {job.get('job_country','')}".strip(", "),
                url=job.get("job_apply_link", ""),
                description=(job.get("job_description", "") or "")[:600],
                posted=job.get("job_posted_at_datetime_utc", ""),
                salary=salary,
                job_type=job.get("job_employment_type", "").replace("_", " ").title(),
                remote=job.get("job_is_remote", False),
                tags=job.get("job_required_skills", []) or [],
                source=source,
            ))
            if len(results) >= limit:
                break
        return results
    except Exception:
        return []
