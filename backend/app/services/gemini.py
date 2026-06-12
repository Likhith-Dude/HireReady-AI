"""AI feature prompts — uses ai_router for provider-agnostic execution."""
from app.services.ai_router import chat, stream as ai_stream, parse_json


# Prompt templates
PROMPTS = {
    "ats_check": """You are an ATS expert. Analyze this resume against the job description.

RESUME:
{resume}

JOB DESCRIPTION:
{jd}

Return ONLY valid JSON:
{{"score":<0-100>,"matched_keywords":["..."],"missing_keywords":["..."],"suggestions":["..."],"summary":"2-3 sentences"}}""",

    "one_click_apply": """You are an expert career coach. Tailor the resume and write a cover letter.

RESUME: {resume}
JOB: {title} at {company}
DESCRIPTION: {jd}

Return ONLY valid JSON:
{{"tailored_resume":"<full tailored resume>","cover_letter":"<3-4 paragraph cover letter>"}}""",

    "interview_prep": """You are an expert technical interviewer. Generate 10 interview questions with STAR answers.

JOB: {title} at {company}
DESCRIPTION: {jd}
CANDIDATE: {resume}

Return ONLY valid JSON:
{{"questions":[{{"question":"...","answer":"...","category":"Behavioral|Technical|Situational|Culture Fit"}}]}}

Exactly: 3 Behavioral, 4 Technical, 2 Situational, 1 Culture Fit.""",

    "salary_insights": """You are a compensation expert. Provide salary insights.

ROLE: {title} | LOCATION: {location} | SKILLS: {skills}

Return ONLY valid JSON:
{{"min_salary":<int>,"median_salary":<int>,"max_salary":<int>,"currency":"USD","factors":["..."],"market_trend":"Hot|Growing|Stable|Declining","top_paying_companies":["..."],"negotiation_tips":["..."],"summary":"..."}}""",

    "job_match": """Rate how well this candidate matches this job (0-100).

RESUME: {resume}
JOB: {title} — {jd}

Return ONLY valid JSON:
{{"match_score":<int>,"strengths":["..."],"gaps":["..."],"recommendation":"Apply Now|Strong Match|Good Match|Stretch Role"}}""",
}


def ats_check(resume_text: str, job_description: str) -> dict:
    prompt = PROMPTS["ats_check"].format(resume=resume_text, jd=job_description)
    return parse_json(chat(prompt))


def one_click_apply(resume_text: str, job_title: str, company: str, job_description: str) -> dict:
    prompt = PROMPTS["one_click_apply"].format(resume=resume_text, title=job_title, company=company, jd=job_description)
    return parse_json(chat(prompt, use_cache=False))  # always fresh


def interview_prep(job_title: str, company: str, job_description: str, resume_text: str = "") -> dict:
    prompt = PROMPTS["interview_prep"].format(title=job_title, company=company, jd=job_description, resume=resume_text or "Not provided")
    return parse_json(chat(prompt))


def salary_insights(job_title: str, location: str, skills: list) -> dict:
    prompt = PROMPTS["salary_insights"].format(title=job_title, location=location or "United States", skills=", ".join(skills) or "Not specified")
    return parse_json(chat(prompt))


def job_match_score(resume_text: str, job_title: str, job_description: str) -> dict:
    prompt = PROMPTS["job_match"].format(resume=resume_text, title=job_title, jd=job_description)
    return parse_json(chat(prompt))


def _stream(prompt: str):
    return ai_stream(prompt)
