import httpx
from bs4 import BeautifulSoup
from typing import List, Dict
import urllib.parse


def search_jobs(title: str, location: str = "", limit: int = 20) -> List[Dict]:
    """Scrape jobs from RemoteOK and HN Who's Hiring (fallback to mock for demo)."""
    jobs = []

    # Try RemoteOK API (free, no auth needed)
    try:
        jobs.extend(_fetch_remoteok(title, limit))
    except Exception:
        pass

    # Try Arbeitnow free API
    try:
        jobs.extend(_fetch_arbeitnow(title, location, limit))
    except Exception:
        pass

    if not jobs:
        jobs = _mock_jobs(title, location)

    return jobs[:limit]


def _fetch_remoteok(title: str, limit: int) -> List[Dict]:
    url = "https://remoteok.com/api"
    headers = {"User-Agent": "HireReady-AI/1.0"}
    resp = httpx.get(url, headers=headers, timeout=10)
    resp.raise_for_status()
    data = resp.json()

    results = []
    keywords = title.lower().split()
    for job in data[1:]:  # first item is metadata
        job_text = f"{job.get('position','').lower()} {' '.join(job.get('tags', []))}".lower()
        if any(kw in job_text for kw in keywords):
            results.append({
                "id": str(job.get("id", "")),
                "title": job.get("position", ""),
                "company": job.get("company", ""),
                "location": "Remote",
                "url": job.get("url", ""),
                "description": job.get("description", "")[:500],
                "posted": job.get("date", ""),
                "tags": job.get("tags", []),
                "source": "RemoteOK",
            })
            if len(results) >= limit:
                break
    return results


def _fetch_arbeitnow(title: str, location: str, limit: int) -> List[Dict]:
    params = {"q": title, "location": location or ""}
    url = "https://www.arbeitnow.com/api/job-board-api"
    resp = httpx.get(url, params=params, timeout=10)
    resp.raise_for_status()
    data = resp.json()

    results = []
    for job in data.get("data", []):
        results.append({
            "id": str(job.get("slug", "")),
            "title": job.get("title", ""),
            "company": job.get("company_name", ""),
            "location": job.get("location", "Remote"),
            "url": job.get("url", ""),
            "description": job.get("description", "")[:500],
            "posted": job.get("created_at", ""),
            "tags": job.get("tags", []),
            "source": "Arbeitnow",
        })
        if len(results) >= limit:
            break
    return results


def _mock_jobs(title: str, location: str) -> List[Dict]:
    base = [
        {"id": "1", "title": f"{title} - Senior", "company": "TechCorp Inc", "location": location or "Remote",
         "url": "https://example.com/job/1", "description": f"We are looking for a {title} with 3+ years of experience in Python, AWS, Docker, and Kubernetes. You will design and maintain ML pipelines, optimize cloud infrastructure costs, and collaborate with cross-functional teams.", "posted": "2026-06-10", "tags": ["python", "aws", "docker"], "source": "Mock"},
        {"id": "2", "title": f"{title} II", "company": "CloudSystems LLC", "location": location or "New York, NY",
         "url": "https://example.com/job/2", "description": f"Exciting {title} role at a fast-growing startup. Skills needed: Python, MLflow, FastAPI, PostgreSQL, Kubernetes. Build scalable AI/ML systems and lead cost optimization initiatives.", "posted": "2026-06-09", "tags": ["mlops", "kubernetes", "mlflow"], "source": "Mock"},
        {"id": "3", "title": f"Staff {title}", "company": "AI Innovations", "location": location or "San Francisco, CA",
         "url": "https://example.com/job/3", "description": f"Staff-level {title} to lead our platform team. Experience with MLOps, cloud architecture (AWS/GCP), Docker, Kubernetes, and building fraud detection systems a plus.", "posted": "2026-06-08", "tags": ["aws", "gcp", "ml"], "source": "Mock"},
        {"id": "4", "title": f"{title} Specialist", "company": "DataDriven Co", "location": location or "Austin, TX",
         "url": "https://example.com/job/4", "description": f"Join our team as a {title} Specialist. You'll work with FastAPI, PostgreSQL, Docker, and MLflow to build and maintain production ML systems at scale.", "posted": "2026-06-07", "tags": ["fastapi", "postgresql", "docker"], "source": "Mock"},
        {"id": "5", "title": f"Lead {title}", "company": "FutureStack", "location": location or "Remote",
         "url": "https://example.com/job/5", "description": f"Lead {title} position. We need someone with deep expertise in cloud cost optimization, AWS, Kubernetes, and MLOps pipelines. M.S. in CS preferred.", "posted": "2026-06-06", "tags": ["cloud", "aws", "mlops"], "source": "Mock"},
    ]
    return base
