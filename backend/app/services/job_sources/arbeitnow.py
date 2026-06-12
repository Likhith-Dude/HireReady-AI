import httpx
from typing import List
from .base import JobListing


def fetch(title: str, location: str = "", limit: int = 20) -> List[JobListing]:
    try:
        resp = httpx.get("https://www.arbeitnow.com/api/job-board-api",
                         params={"q": title, "location": location}, timeout=10)
        resp.raise_for_status()
        results = []
        for job in resp.json().get("data", []):
            results.append(JobListing(
                id=f"an_{job.get('slug','')}",
                title=job.get("title", ""),
                company=job.get("company_name", ""),
                location=job.get("location", "Remote"),
                url=job.get("url", ""),
                description=(job.get("description", "") or "")[:600],
                posted=str(job.get("created_at", "")),
                tags=job.get("tags", []),
                job_type="Full-time" if job.get("employment_type") == "FULL_TIME" else job.get("employment_type", ""),
                remote=job.get("remote", False),
                source="Arbeitnow",
            ))
            if len(results) >= limit:
                break
        return results
    except Exception:
        return []
