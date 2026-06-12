"""The Muse — free public API, no key needed"""
import httpx
from typing import List
from .base import JobListing


def fetch(title: str, limit: int = 20) -> List[JobListing]:
    try:
        resp = httpx.get("https://www.themuse.com/api/public/jobs",
                         params={"page": 0, "descending": "true"}, timeout=10)
        resp.raise_for_status()
        keywords = title.lower().split()
        results = []
        for job in resp.json().get("results", []):
            name = job.get("name", "")
            if not any(k in name.lower() for k in keywords):
                continue
            loc_list = job.get("locations", [{}])
            location = loc_list[0].get("name", "Remote") if loc_list else "Remote"
            results.append(JobListing(
                id=f"muse_{job.get('id','')}",
                title=name,
                company=job.get("company", {}).get("name", ""),
                location=location,
                url=job.get("refs", {}).get("landing_page", ""),
                description=(job.get("contents", "") or "")[:600],
                posted=job.get("publication_date", ""),
                job_type=job.get("type", ""),
                tags=[l.get("name", "") for l in job.get("levels", [])],
                source="The Muse",
            ))
            if len(results) >= limit:
                break
        return results
    except Exception:
        return []
