from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional, List
from app.schemas.ai import (
    ATSCheckRequest, ATSCheckResponse,
    OneClickApplyRequest, OneClickApplyResponse,
    InterviewPrepRequest, InterviewPrepResponse,
)
from app.services import gemini
import json

router = APIRouter(prefix="/ai", tags=["AI"])


@router.post("/ats-check", response_model=ATSCheckResponse)
def ats_check(req: ATSCheckRequest):
    try:
        return gemini.ats_check(req.resume_text, req.job_description)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/one-click-apply", response_model=OneClickApplyResponse)
def one_click_apply(req: OneClickApplyRequest):
    try:
        return gemini.one_click_apply(req.resume_text, req.job_title, req.company, req.job_description)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/one-click-apply/stream")
def one_click_apply_stream(req: OneClickApplyRequest):
    prompt = f"""You are an expert career coach. Tailor the resume and write a cover letter.

RESUME: {req.resume_text}
JOB: {req.job_title} at {req.company}
DESCRIPTION: {req.job_description}

First write "## TAILORED RESUME" then the resume, then "## COVER LETTER" then the letter."""

    def generate():
        for chunk in gemini._stream(prompt):
            yield f"data: {json.dumps({'text': chunk})}\n\n"
        yield "data: [DONE]\n\n"

    return StreamingResponse(generate(), media_type="text/event-stream",
                             headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"})


@router.post("/interview-prep", response_model=InterviewPrepResponse)
def interview_prep(req: InterviewPrepRequest):
    try:
        return gemini.interview_prep(req.job_title, req.company, req.job_description, req.resume_text or "")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


class SalaryRequest(BaseModel):
    job_title: str
    location: Optional[str] = ""
    skills: Optional[List[str]] = []


@router.post("/salary-insights")
def salary_insights(req: SalaryRequest):
    try:
        return gemini.salary_insights(req.job_title, req.location or "", req.skills or [])
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


class JobMatchRequest(BaseModel):
    resume_text: str
    job_title: str
    job_description: str


@router.post("/job-match")
def job_match(req: JobMatchRequest):
    try:
        return gemini.job_match_score(req.resume_text, req.job_title, req.job_description)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


class CoverLetterRequest(BaseModel):
    resume_text: str
    job_title: str
    company: str
    job_description: str
    tone: Optional[str] = "professional"


@router.post("/cover-letter")
def cover_letter(req: CoverLetterRequest):
    try:
        return gemini.cover_letter(req.resume_text, req.job_title, req.company, req.job_description, req.tone or "professional")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/cover-letter/stream")
def cover_letter_stream(req: CoverLetterRequest):
    prompt = f"""Write a compelling cover letter for {req.job_title} at {req.company}.

RESUME: {req.resume_text}
JOB DESCRIPTION: {req.job_description}
TONE: {req.tone or 'professional'}

Write a 3-4 paragraph cover letter. Be specific, confident, and human. No placeholders."""

    def generate():
        for chunk in gemini._stream(prompt):
            yield f"data: {json.dumps({'text': chunk})}\n\n"
        yield "data: [DONE]\n\n"

    return StreamingResponse(generate(), media_type="text/event-stream",
                             headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"})


class LinkedInRequest(BaseModel):
    profile: str
    target_role: str
    industry: Optional[str] = "Technology"


@router.post("/linkedin-optimize")
def linkedin_optimize(req: LinkedInRequest):
    try:
        return gemini.linkedin_optimize(req.profile, req.target_role, req.industry or "Technology")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


class MockInterviewQuestionRequest(BaseModel):
    job_title: str
    company: str
    category: str
    resume_text: Optional[str] = ""
    asked: Optional[List[str]] = []


@router.post("/mock-interview/question")
def mock_question(req: MockInterviewQuestionRequest):
    try:
        return gemini.mock_interview_question(req.job_title, req.company, req.category, req.resume_text or "", req.asked or [])
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


class MockInterviewFeedbackRequest(BaseModel):
    question: str
    answer: str
    job_title: str


@router.post("/mock-interview/feedback")
def mock_feedback(req: MockInterviewFeedbackRequest):
    try:
        return gemini.mock_interview_feedback(req.question, req.answer, req.job_title)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
