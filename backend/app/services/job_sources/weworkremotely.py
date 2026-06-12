"""We Work Remotely — free RSS feed"""
import feedparser
import httpx
from typing import List
from .base import JobListing


FEEDS = [
    "https://weworkremotely.com/categories/remote-programming-jobs.rss",
    "https://weworkremotely.com/categories/remote-devops-sysadmin-jobs.rss",
    "https://weworkremotely.com/categories/remote-data-science-jobs.rss",
]


def fetch(title: str, limit: int = 20) -> List[JobListing]:
    try:
        keywords = title.lower().split()
        results = []
        for feed_url in FEEDS:
            feed = feedparser.parse(feed_url)
            for entry in feed.entries:
                t = entry.get("title", "")
                if not any(k in t.lower() for k in keywords):
                    continue
                # WWR title format: "Company: Job Title"
                parts = t.split(": ", 1)
                company = parts[0] if len(parts) > 1 else ""
                job_title = parts[1] if len(parts) > 1 else t
                results.append(JobListing(
                    id=f"wwr_{entry.get('id','').split('/')[-1]}",
                    title=job_title,
                    company=company,
                    location="Remote",
                    url=entry.get("link", ""),
                    description=(entry.get("summary", "") or "")[:600],
                    posted=entry.get("published", ""),
                    remote=True,
                    job_type="Remote",
                    source="We Work Remotely",
                ))
                if len(results) >= limit:
                    return results
        return results
    except Exception:
        return []
