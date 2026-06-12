from pydantic import BaseModel
from typing import Optional, List


class ATSCheckRequest(BaseModel):
    resume_text: str
    job_description: str


class ATSCheckResponse(BaseModel):
    score: int
    matched_keywords: List[str]
    missing_keywords: List[str]
    suggestions: List[str]
    summary: str


class OneClickApplyRequest(BaseModel):
    resume_text: str
    job_title: str
    company: str
    job_description: str


class OneClickApplyResponse(BaseModel):
    tailored_resume: str
    cover_letter: str


class InterviewPrepRequest(BaseModel):
    job_title: str
    company: str
    job_description: str
    resume_text: Optional[str] = None


class InterviewQuestion(BaseModel):
    question: str
    answer: str
    category: str


class InterviewPrepResponse(BaseModel):
    questions: List[InterviewQuestion]


class JobSearchRequest(BaseModel):
    title: str
    location: Optional[str] = None
    limit: int = 20
