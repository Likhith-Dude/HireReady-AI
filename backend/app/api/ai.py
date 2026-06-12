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
