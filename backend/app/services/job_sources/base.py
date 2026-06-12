from dataclasses import dataclass, field
from typing import List, Optional
from datetime import datetime


@dataclass
class JobListing:
    id: str
    title: str
    company: str
    location: str
    url: str
    description: str
    source: str
    posted: str = ""
    salary: str = ""
    job_type: str = ""
    tags: List[str] = field(default_factory=list)
    remote: bool = False
    h1b_sponsor: Optional[bool] = None
    h1b_count: int = 0
    dedup_key: str = ""

    def __post_init__(self):
        # Dedup key: normalize title+company
        self.dedup_key = f"{self.title.lower().strip()}|{self.company.lower().strip()}"
