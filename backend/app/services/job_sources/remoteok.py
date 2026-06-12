import httpx
from typing import List
from .base import JobListing


def fetch(title: str, limit: int = 20) -> List[JobListing]:
    try:
        resp = httpx.get("https://remoteok.com/api", headers={"User-Agent": "HireReady-AI/2.0"}, timeout=10)
        resp.raise_for_status()
        keywords = title.lower().split()
        results = []
        for job in resp.json()[1:]:
            txt = f"{job.get('position','').lower()} {' '.join(job.get('tags', []))}"
            if any(k in txt for k in keywords):
                results.append(JobListing(
                    id=f"rok_{job.get('id','')}",
                    title=job.get("position", ""),
                    company=job.get("company", ""),
                    location="Remote",
                    url=job.get("url", ""),
                    description=(job.get("description", "") or "")[:600],
                    posted=str(job.get("date", "")),
                    tags=job.get("tags", []),
                    salary=job.get("salary", "") or "",
                    job_type="Remote",
                    remote=True,
                    source="RemoteOK",
                ))
                if len(results) >= limit:
                    break
        return results
    except Exception:
        return []
