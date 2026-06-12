"""USAJobs.gov — free public API, register at developer.usajobs.gov"""
import httpx
from typing import List
from .base import JobListing
from app.config import settings


def fetch(title: str, location: str = "", limit: int = 20) -> List[JobListing]:
    if not settings.usajobs_api_key or not settings.usajobs_email:
        return []
    try:
        headers = {
            "Authorization-Key": settings.usajobs_api_key,
            "User-Agent": settings.usajobs_email,
            "Host": "data.usajobs.gov",
        }
        params = {"Keyword": title, "ResultsPerPage": min(limit, 25)}
        if location:
            params["LocationName"] = location
        resp = httpx.get("https://data.usajobs.gov/api/search", headers=headers, params=params, timeout=12)
        resp.raise_for_status()
        results = []
        for job in resp.json().get("SearchResult", {}).get("SearchResultItems", []):
            d = job.get("MatchedObjectDescriptor", {})
            salary = ""
            pay = d.get("PositionRemuneration", [{}])
            if pay:
                low = pay[0].get("MinimumRange", "")
                high = pay[0].get("MaximumRange", "")
                if low:
                    salary = f"${low}–${high}/yr" if high else f"${low}/yr"
            results.append(JobListing(
                id=f"usa_{d.get('PositionID','')}",
                title=d.get("PositionTitle", ""),
                company=d.get("OrganizationName", "U.S. Government"),
                location=d.get("PositionLocationDisplay", ""),
                url=d.get("PositionURI", ""),
                description=(d.get("UserArea", {}).get("Details", {}).get("JobSummary", "") or "")[:600],
                posted=d.get("PublicationStartDate", ""),
                salary=salary,
                job_type=d.get("PositionSchedule", [{}])[0].get("Name", "Full-time") if d.get("PositionSchedule") else "Full-time",
                source="USAJobs",
            ))
        return results
    except Exception:
        return []
