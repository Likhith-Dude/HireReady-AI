from fastapi import APIRouter, HTTPException
from app.schemas.ai import (
    ATSCheckRequest, ATSCheckResponse,
    OneClickApplyRequest, OneClickApplyResponse,
    InterviewPrepRequest, InterviewPrepResponse,
)
from app.services import gemini

router = APIRouter(prefix="/ai", tags=["AI"])


@router.post("/ats-check", response_model=ATSCheckResponse)
def ats_check(req: ATSCheckRequest):
    try:
        result = gemini.ats_check(req.resume_text, req.job_description)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/one-click-apply", response_model=OneClickApplyResponse)
def one_click_apply(req: OneClickApplyRequest):
    try:
        result = gemini.one_click_apply(req.resume_text, req.job_title, req.company, req.job_description)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/interview-prep", response_model=InterviewPrepResponse)
def interview_prep(req: InterviewPrepRequest):
    try:
        result = gemini.interview_prep(req.job_title, req.company, req.job_description, req.resume_text or "")
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
