"""Unified job feed — aggregates all sources, deduplicates, caches 30 minutes."""
import asyncio
import time
import logging
from typing import List, Dict, Optional
from concurrent.futures import ThreadPoolExecutor, as_completed
from app.services.job_sources.base import JobListing
from app.services.job_sources import (
    remoteok, arbeitnow, usajobs, adzuna, jsearch, themuse, weworkremotely
)
from app.services.h1b import get_h1b_info

logger = logging.getLogger(__name__)

# In-memory cache: key → (jobs, timestamp)
_cache: Dict[str, tuple] = {}
CACHE_TTL = 30 * 60  # 30 minutes


def _cache_key(title: str, location: str, job_type: str) -> str:
    return f"{title.lower()}|{location.lower()}|{job_type.lower()}"


def _is_fresh(key: str) -> bool:
    if key not in _cache:
        return False
    _, ts = _cache[key]
    return (time.time() - ts) < CACHE_TTL


def _dedup(jobs: List[JobListing]) -> List[JobListing]:
    seen = set()
    out = []
    for job in jobs:
        if job.dedup_key not in seen:
            seen.add(job.dedup_key)
            out.append(job)
    return out


def _enrich_h1b(jobs: List[JobListing]) -> List[JobListing]:
    for job in jobs:
        info = get_h1b_info(job.company)
        if info:
            job.h1b_sponsor = info.get("sponsors", False)
            job.h1b_count = info.get("approvals", 0)
    return jobs


def _fetch_all_sources(title: str, location: str, limit: int) -> List[JobListing]:
    sources = [
        ("RemoteOK",        lambda: remoteok.fetch(title, limit)),
        ("Arbeitnow",       lambda: arbeitnow.fetch(title, location, limit)),
        ("USAJobs",         lambda: usajobs.fetch(title, location, limit)),
        ("Adzuna",          lambda: adzuna.fetch(title, location, limit)),
        ("JSearch",         lambda: jsearch.fetch(title, location, limit)),
        ("The Muse",        lambda: themuse.fetch(title, limit)),
        ("WeWorkRemotely",  lambda: weworkremotely.fetch(title, limit)),
    ]

    all_jobs: List[JobListing] = []
    source_status: Dict[str, str] = {}

    with ThreadPoolExecutor(max_workers=7) as executor:
        futures = {executor.submit(fn): name for name, fn in sources}
        for future in as_completed(futures, timeout=15):
            name = futures[future]
            try:
                jobs = future.result()
                all_jobs.extend(jobs)
                source_status[name] = f"✅ {len(jobs)} jobs"
            except Exception as e:
                source_status[name] = f"❌ {str(e)[:40]}"

    for name, status in source_status.items():
        logger.info(f"[JobAggregator] {name}: {status}")

    return all_jobs


def search_jobs(title: str, location: str = "", limit: int = 20,
                job_type: str = "", salary_min: int = 0,
                remote_only: bool = False) -> Dict:
    key = _cache_key(title, location, job_type)

    if _is_fresh(key):
        jobs, _ = _cache[key]
        logger.info(f"[JobAggregator] Cache hit for '{title}'")
    else:
        jobs = _fetch_all_sources(title, location, limit * 3)
        jobs = _dedup(jobs)
        jobs = _enrich_h1b(jobs)
        _cache[key] = (jobs, time.time())

    # Apply filters post-cache
    if job_type:
        jobs = [j for j in jobs if job_type.lower() in (j.job_type or "").lower()
                or job_type.lower() in " ".join(j.tags).lower()]
    if remote_only:
        jobs = [j for j in jobs if j.remote or "remote" in j.location.lower()]
    if salary_min:
        # Best-effort salary filter — only filter jobs that have salary data
        def meets_salary(j: JobListing) -> bool:
            if not j.salary:
                return True  # include unknown salary
            import re
            nums = re.findall(r'\d[\d,]+', j.salary.replace(",", ""))
            return not nums or int(nums[0]) >= salary_min
        jobs = [j for j in jobs if meets_salary(j)]

    # Sort: jobs with salary info and H1B data first
    jobs.sort(key=lambda j: (-(j.h1b_count or 0), -bool(j.salary)))

    result_jobs = jobs[:limit]

    return {
        "jobs": [_to_dict(j) for j in result_jobs],
        "count": len(result_jobs),
        "total_found": len(jobs),
        "cached": _is_fresh(key),
        "sources": list({j.source for j in result_jobs}),
    }


def _to_dict(j: JobListing) -> dict:
    return {
        "id": j.id, "title": j.title, "company": j.company,
        "location": j.location, "url": j.url, "description": j.description,
        "posted": j.posted, "salary": j.salary, "job_type": j.job_type,
        "tags": j.tags, "remote": j.remote, "source": j.source,
        "h1b_sponsor": j.h1b_sponsor, "h1b_count": j.h1b_count,
    }


def invalidate_cache():
    _cache.clear()
