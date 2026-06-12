import google.generativeai as genai
import json
import re
from app.config import settings

genai.configure(api_key=settings.gemini_api_key)
model = genai.GenerativeModel("gemini-1.5-flash")


def _parse_json(text: str) -> dict:
    text = re.sub(r"```(?:json)?", "", text).strip().rstrip("```").strip()
    return json.loads(text)


def ats_check(resume_text: str, job_description: str) -> dict:
    prompt = f"""
You are an ATS (Applicant Tracking System) expert. Analyze this resume against the job description.

RESUME:
{resume_text}

JOB DESCRIPTION:
{job_description}

Respond with ONLY valid JSON (no markdown):
{{
  "score": <integer 0-100>,
  "matched_keywords": ["keyword1", ...],
  "missing_keywords": ["keyword1", ...],
  "suggestions": ["suggestion1", ...],
  "summary": "<2-3 sentence summary>"
}}
"""
    response = model.generate_content(prompt)
    return _parse_json(response.text)


def one_click_apply(resume_text: str, job_title: str, company: str, job_description: str) -> dict:
    prompt = f"""
You are an expert career coach. Tailor the resume and write a cover letter for this job.

CANDIDATE RESUME:
{resume_text}

TARGET JOB: {job_title} at {company}
JOB DESCRIPTION:
{job_description}

Respond with ONLY valid JSON (no markdown):
{{
  "tailored_resume": "<full tailored resume text with relevant skills and experiences highlighted>",
  "cover_letter": "<professional cover letter, 3-4 paragraphs>"
}}
"""
    response = model.generate_content(prompt)
    return _parse_json(response.text)


def interview_prep(job_title: str, company: str, job_description: str, resume_text: str = "") -> dict:
    prompt = f"""
You are an expert interviewer. Generate the top 10 interview questions with strong sample answers for this role.

JOB: {job_title} at {company}
JOB DESCRIPTION:
{job_description}

CANDIDATE BACKGROUND:
{resume_text or "Not provided"}

Respond with ONLY valid JSON (no markdown):
{{
  "questions": [
    {{
      "question": "<interview question>",
      "answer": "<strong sample answer using STAR method where applicable>",
      "category": "<Behavioral|Technical|Situational|Culture Fit>"
    }}
  ]
}}

Generate exactly 10 questions covering: 3 behavioral, 4 technical, 2 situational, 1 culture fit.
"""
    response = model.generate_content(prompt)
    return _parse_json(response.text)
