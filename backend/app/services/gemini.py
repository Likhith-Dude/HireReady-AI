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

    "cover_letter": """You are an expert career coach. Write a compelling, personalized cover letter.

CANDIDATE RESUME: {resume}
JOB TITLE: {title}
COMPANY: {company}
JOB DESCRIPTION: {jd}
TONE: {tone}

Write a 3-4 paragraph cover letter that:
1. Opens with a strong hook referencing the specific role
2. Connects candidate's experience to the job requirements with specific examples
3. Shows genuine interest in the company
4. Closes with a clear call to action

Return ONLY valid JSON:
{{"cover_letter":"<full cover letter text>","subject_line":"<email subject line>","key_points":["<3 things that make this candidate strong for this role>"]}}""",

    "linkedin_optimize": """You are a LinkedIn profile expert. Analyze and rewrite this LinkedIn profile section to be recruiter-magnet quality.

PROFILE: {profile}
TARGET ROLE: {role}
INDUSTRY: {industry}

Return ONLY valid JSON:
{{"headline":"<optimized headline under 220 chars>","summary":"<optimized About section 2000 chars max, first-person, keywords-rich>","improvements":["<specific improvement made>"],"keywords":["<high-value keywords added>"],"score_before":<0-100>,"score_after":<0-100>}}""",

    "mock_interview_question": """You are a senior technical interviewer at a top tech company.

Ask ONE interview question for this role. Make it specific and realistic.

JOB: {title} at {company}
CATEGORY: {category}
CANDIDATE BACKGROUND: {resume}
PREVIOUS QUESTIONS ASKED: {asked}

Return ONLY valid JSON:
{{"question":"<specific question>","category":"{category}","hint":"<what a great answer would cover>","follow_up":"<likely follow-up question>"}}""",

    "mock_interview_feedback": """You are a senior interviewer giving honest, constructive feedback.

QUESTION: {question}
CANDIDATE'S ANSWER: {answer}
JOB: {title}

Return ONLY valid JSON:
{{"score":<0-10>,"verdict":"Excellent|Good|Needs Work|Weak","strengths":["..."],"improvements":["..."],"ideal_answer_points":["<key points a great answer would include>"],"follow_up_suggestion":"<one follow-up question to dig deeper>"}}""",
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


def cover_letter(resume_text: str, job_title: str, company: str, job_description: str, tone: str = "professional") -> dict:
    prompt = PROMPTS["cover_letter"].format(resume=resume_text, title=job_title, company=company, jd=job_description, tone=tone)
    return parse_json(chat(prompt, use_cache=False))


def linkedin_optimize(profile: str, target_role: str, industry: str) -> dict:
    prompt = PROMPTS["linkedin_optimize"].format(profile=profile, role=target_role, industry=industry)
    return parse_json(chat(prompt, use_cache=False))


def mock_interview_question(job_title: str, company: str, category: str, resume_text: str, asked: list) -> dict:
    prompt = PROMPTS["mock_interview_question"].format(
        title=job_title, company=company, category=category,
        resume=resume_text or "Not provided", asked=", ".join(asked) if asked else "None yet"
    )
    return parse_json(chat(prompt, use_cache=False))


def mock_interview_feedback(question: str, answer: str, job_title: str) -> dict:
    prompt = PROMPTS["mock_interview_feedback"].format(question=question, answer=answer, title=job_title)
    return parse_json(chat(prompt, use_cache=False))


def _stream(prompt: str):
    return ai_stream(prompt)
