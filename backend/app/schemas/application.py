from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class ApplicationCreate(BaseModel):
    job_title: str
    company: str
    location: Optional[str] = None
    job_url: Optional[str] = None
    status: str = "Applied"
    job_description: Optional[str] = None
    tailored_resume: Optional[str] = None
    cover_letter: Optional[str] = None
    notes: Optional[str] = None


class ApplicationUpdate(BaseModel):
    status: Optional[str] = None
    notes: Optional[str] = None
    tailored_resume: Optional[str] = None
    cover_letter: Optional[str] = None


class ApplicationOut(BaseModel):
    id: int
    job_title: str
    company: str
    location: Optional[str]
    job_url: Optional[str]
    status: str
    job_description: Optional[str]
    tailored_resume: Optional[str]
    cover_letter: Optional[str]
    notes: Optional[str]
    applied_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True
