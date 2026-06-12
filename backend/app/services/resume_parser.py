"""Bulletproof resume parser — extracts structured data from PDF/DOCX/TXT."""
import re
import io
from typing import Optional
from dataclasses import dataclass, field


@dataclass
class ParsedResume:
    raw_text: str = ""
    name: str = ""
    email: str = ""
    phone: str = ""
    linkedin: str = ""
    github: str = ""
    location: str = ""
    summary: str = ""
    skills: list = field(default_factory=list)
    education: list = field(default_factory=list)
    experience: list = field(default_factory=list)
    projects: list = field(default_factory=list)
    certifications: list = field(default_factory=list)


def parse_file(content: bytes, filename: str) -> ParsedResume:
    text = _extract_text(content, filename)
    return parse_text(text)


def _extract_text(content: bytes, filename: str) -> str:
    fn = filename.lower()
    if fn.endswith(".pdf"):
        return _pdf_to_text(content)
    elif fn.endswith(".docx"):
        return _docx_to_text(content)
    elif fn.endswith(".txt"):
        return content.decode("utf-8", errors="ignore")
    return content.decode("utf-8", errors="ignore")


def _pdf_to_text(content: bytes) -> str:
    try:
        import PyPDF2
        reader = PyPDF2.PdfReader(io.BytesIO(content))
        return "\n".join(p.extract_text() or "" for p in reader.pages)
    except Exception:
        return ""


def _docx_to_text(content: bytes) -> str:
    try:
        from docx import Document
        doc = Document(io.BytesIO(content))
        return "\n".join(p.text for p in doc.paragraphs if p.text.strip())
    except Exception:
        return ""


def parse_text(text: str) -> ParsedResume:
    r = ParsedResume(raw_text=text)
    lines = [l.strip() for l in text.split("\n") if l.strip()]

    r.email = _extract_email(text)
    r.phone = _extract_phone(text)
    r.linkedin = _extract_linkedin(text)
    r.github = _extract_github(text)
    r.name = _extract_name(lines, r.email)
    r.skills = _extract_skills(text)
    r.education = _extract_education(text)
    r.experience = _extract_experience(text)
    r.projects = _extract_projects(text)
    r.certifications = _extract_certifications(text)
    r.summary = _extract_summary(text)
    r.location = _extract_location(text)
    return r


def _extract_email(text: str) -> str:
    m = re.search(r'[\w.+-]+@[\w-]+\.\w{2,}', text)
    return m.group(0) if m else ""


def _extract_phone(text: str) -> str:
    m = re.search(r'(\+?1?\s?)?(\(?\d{3}\)?[\s.\-]?\d{3}[\s.\-]?\d{4})', text)
    return m.group(0).strip() if m else ""


def _extract_linkedin(text: str) -> str:
    m = re.search(r'linkedin\.com/in/([\w\-]+)', text, re.IGNORECASE)
    return f"linkedin.com/in/{m.group(1)}" if m else ""


def _extract_github(text: str) -> str:
    m = re.search(r'github\.com/([\w\-]+)', text, re.IGNORECASE)
    return f"github.com/{m.group(1)}" if m else ""


def _extract_name(lines: list, email: str) -> str:
    # Name is usually the first non-empty line that's not a URL/email/phone
    for line in lines[:5]:
        if email and email in line:
            continue
        if re.search(r'http|@|linkedin|github|\d{3}[\-.]?\d{4}', line, re.IGNORECASE):
            continue
        if 2 <= len(line.split()) <= 5 and line[0].isupper():
            return line
    return ""


def _extract_location(text: str) -> str:
    m = re.search(
        r'\b([A-Z][a-z]+(?:\s[A-Z][a-z]+)?,\s*(?:[A-Z]{2}|[A-Za-z]+))\b',
        text
    )
    return m.group(0) if m else ""


def _extract_summary(text: str) -> str:
    pattern = re.search(
        r'(?:SUMMARY|OBJECTIVE|PROFILE|ABOUT)[:\s]*\n(.*?)(?:\n[A-Z]{2,}|\Z)',
        text, re.IGNORECASE | re.DOTALL
    )
    if pattern:
        return pattern.group(1).strip()[:400]
    return ""


SKILL_KEYWORDS = [
    "python", "java", "javascript", "typescript", "go", "rust", "c++", "c#", "ruby", "swift",
    "aws", "gcp", "azure", "docker", "kubernetes", "k8s", "terraform", "ansible",
    "mlflow", "mlops", "fastapi", "django", "flask", "react", "next.js", "vue",
    "postgresql", "mysql", "mongodb", "redis", "elasticsearch", "kafka",
    "machine learning", "deep learning", "nlp", "pytorch", "tensorflow", "scikit-learn",
    "sql", "nosql", "git", "ci/cd", "github actions", "jenkins", "grafana", "prometheus",
    "spark", "hadoop", "airflow", "dbt", "snowflake", "databricks",
    "rest api", "graphql", "microservices", "linux", "bash", "shell scripting",
]


def _extract_skills(text: str) -> list:
    text_lower = text.lower()
    found = []
    # Match explicit skills section first
    section = re.search(
        r'(?:SKILLS?|TECHNICAL SKILLS?|TECHNOLOGIES?)[:\s]*\n(.*?)(?:\n[A-Z]{3,}|\Z)',
        text, re.IGNORECASE | re.DOTALL
    )
    if section:
        section_text = section.group(1).lower()
        for skill in SKILL_KEYWORDS:
            if skill in section_text:
                found.append(skill)
        # Also grab comma-separated items from section
        raw_skills = re.findall(r'[A-Za-z0-9#.+\-/]+(?:\.[jJ][sS])?', section.group(1))
        for s in raw_skills:
            if 2 < len(s) < 30 and s.lower() not in [f.lower() for f in found]:
                found.append(s)
    else:
        for skill in SKILL_KEYWORDS:
            if skill in text_lower:
                found.append(skill)
    return list(dict.fromkeys(found))[:40]  # dedupe, max 40


def _extract_section(text: str, headers: list) -> str:
    pattern = "|".join(headers)
    m = re.search(
        rf'(?:{pattern})[:\s]*\n(.*?)(?:\n(?:EXPERIENCE|EDUCATION|SKILLS?|PROJECTS?|CERTIFICATIONS?|SUMMARY|OBJECTIVE)[:\s]*\n|\Z)',
        text, re.IGNORECASE | re.DOTALL
    )
    return m.group(1).strip() if m else ""


def _extract_education(text: str) -> list:
    section = _extract_section(text, ["EDUCATION", "ACADEMIC BACKGROUND"])
    if not section:
        return []
    entries = []
    # Look for degree patterns
    degrees = re.findall(
        r'(?:B\.?S\.?|M\.?S\.?|Ph\.?D\.?|Bachelor|Master|Doctor).*?(?:\n|$)',
        section, re.IGNORECASE
    )
    for d in degrees:
        entries.append({"degree": d.strip()})
    if not entries and section:
        entries.append({"degree": section[:200]})
    return entries


def _extract_experience(text: str) -> list:
    section = _extract_section(text, ["EXPERIENCE", "WORK EXPERIENCE", "EMPLOYMENT"])
    if not section:
        return []
    # Split by date patterns or company indicators
    blocks = re.split(r'\n(?=[A-Z][^\n]{5,50}\n)', section)
    entries = []
    for block in blocks[:6]:
        block = block.strip()
        if len(block) > 20:
            lines = block.split("\n")
            entries.append({
                "title": lines[0] if lines else "",
                "details": block[:300],
            })
    return entries


def _extract_projects(text: str) -> list:
    section = _extract_section(text, ["PROJECTS?", "PERSONAL PROJECTS?", "SIDE PROJECTS?"])
    if not section:
        return []
    blocks = re.split(r'\n(?=[A-Z])', section)
    entries = []
    for block in blocks[:6]:
        block = block.strip()
        if len(block) > 15:
            lines = block.split("\n")
            entries.append({
                "name": lines[0] if lines else "",
                "details": block[:300],
            })
    return entries


def _extract_certifications(text: str) -> list:
    section = _extract_section(text, ["CERTIFICATIONS?", "CERTIFICATES?", "LICENSES?"])
    if not section:
        return []
    return [c.strip() for c in section.split("\n") if c.strip()][:10]
