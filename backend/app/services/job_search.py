import httpx
from typing import List, Dict, Optional


def search_jobs(title: str, location: str = "", limit: int = 20,
                job_type: str = "", salary_min: int = 0) -> List[Dict]:
    jobs = []
    try:
        jobs.extend(_fetch_remoteok(title, limit))
    except Exception:
        pass
    try:
        jobs.extend(_fetch_arbeitnow(title, location, limit))
    except Exception:
        pass
    if not jobs:
        jobs = _mock_jobs(title, location)

    # Filter by job type
    if job_type:
        jobs = [j for j in jobs if job_type.lower() in " ".join(j.get("tags", [])).lower()]

    return jobs[:limit]


def _fetch_remoteok(title: str, limit: int) -> List[Dict]:
    url = "https://remoteok.com/api"
    headers = {"User-Agent": "HireReady-AI/1.0"}
    resp = httpx.get(url, headers=headers, timeout=10)
    resp.raise_for_status()
    data = resp.json()
    results = []
    keywords = title.lower().split()
    for job in data[1:]:
        job_text = f"{job.get('position','').lower()} {' '.join(job.get('tags', []))}"
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
                "salary": job.get("salary", ""),
                "job_type": "Remote",
                "source": "RemoteOK",
            })
            if len(results) >= limit:
                break
    return results


def _fetch_arbeitnow(title: str, location: str, limit: int) -> List[Dict]:
    params = {"q": title, "location": location or ""}
    resp = httpx.get("https://www.arbeitnow.com/api/job-board-api", params=params, timeout=10)
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
            "salary": "",
            "job_type": "Full-time" if job.get("employment_type") == "FULL_TIME" else job.get("employment_type", ""),
            "source": "Arbeitnow",
        })
        if len(results) >= limit:
            break
    return results


def _mock_jobs(title: str, location: str) -> List[Dict]:
    return [
        {"id": "1", "title": f"Senior {title}", "company": "TechCorp Inc", "location": location or "Remote",
         "url": "https://example.com/job/1", "salary": "$140,000 - $180,000",
         "description": f"Senior {title} role. Python, AWS, Docker, Kubernetes, MLflow, FastAPI required. M.S. CS preferred. Lead ML platform engineering.", "posted": "2026-06-10", "tags": ["python", "aws", "docker", "kubernetes"], "job_type": "Full-time", "source": "Mock"},
        {"id": "2", "title": f"{title} II", "company": "CloudSystems LLC", "location": location or "New York, NY",
         "url": "https://example.com/job/2", "salary": "$120,000 - $150,000",
         "description": f"{title} II at a fast-growing startup. Python, MLflow, FastAPI, PostgreSQL, Kubernetes. Build scalable AI/ML systems.", "posted": "2026-06-09", "tags": ["mlops", "kubernetes", "mlflow", "python"], "job_type": "Full-time", "source": "Mock"},
        {"id": "3", "title": f"Staff {title}", "company": "AI Innovations", "location": location or "San Francisco, CA",
         "url": "https://example.com/job/3", "salary": "$180,000 - $220,000",
         "description": f"Staff {title} to lead platform team. MLOps, cloud architecture (AWS/GCP), Docker, Kubernetes, fraud detection experience a plus.", "posted": "2026-06-08", "tags": ["aws", "gcp", "ml", "staff"], "job_type": "Full-time", "source": "Mock"},
        {"id": "4", "title": f"{title} - Remote", "company": "DataDriven Co", "location": "Remote",
         "url": "https://example.com/job/4", "salary": "$110,000 - $140,000",
         "description": f"Remote {title}. FastAPI, PostgreSQL, Docker, MLflow to build and maintain production ML systems at scale.", "posted": "2026-06-07", "tags": ["fastapi", "postgresql", "docker", "remote"], "job_type": "Remote", "source": "Mock"},
        {"id": "5", "title": f"Lead {title}", "company": "FutureStack", "location": location or "Austin, TX",
         "url": "https://example.com/job/5", "salary": "$160,000 - $200,000",
         "description": f"Lead {title}. Cloud cost optimization, AWS, Kubernetes, MLOps pipelines. M.S. in CS preferred.", "posted": "2026-06-06", "tags": ["cloud", "aws", "mlops", "lead"], "job_type": "Full-time", "source": "Mock"},
        {"id": "6", "title": f"{title} Contractor", "company": "ConsultCo", "location": "Remote",
         "url": "https://example.com/job/6", "salary": "$80 - $120/hr",
         "description": f"Contract {title} for 6-month engagement. Python, AWS, Docker required.", "posted": "2026-06-05", "tags": ["python", "aws", "contract"], "job_type": "Contract", "source": "Mock"},
    ]
