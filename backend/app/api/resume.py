from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.resume import Resume
from app.models.user import User
from app.services.resume_parser import parse_file, parse_text
from app.services.auth import get_current_user
import json

router = APIRouter(prefix="/resume", tags=["Resume"])


@router.post("/parse")
async def parse_resume(file: UploadFile = File(...)):
    content = await file.read()
    filename = file.filename or ""
    if not any(filename.endswith(ext) for ext in (".pdf", ".docx", ".txt")):
        raise HTTPException(status_code=400, detail="Unsupported file type. Upload PDF, DOCX, or TXT.")
    parsed = parse_file(content, filename)
    if not parsed.raw_text.strip():
        raise HTTPException(status_code=400, detail="Could not extract text from file.")
    return {
        "text": parsed.raw_text,
        "filename": filename,
        "structured": {
            "name": parsed.name,
            "email": parsed.email,
            "phone": parsed.phone,
            "linkedin": parsed.linkedin,
            "github": parsed.github,
            "location": parsed.location,
            "skills": parsed.skills,
            "education": parsed.education,
            "experience": parsed.experience,
            "projects": parsed.projects,
            "certifications": parsed.certifications,
        }
    }


@router.post("/save")
async def save_resume(
    name: str,
    content: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    parsed = parse_text(content)
    # Version bump if user has existing resume with same name
    existing = db.query(Resume).filter(
        Resume.user_id == (current_user.id if current_user else None),
        Resume.name == name
    ).first()
    version = (existing.version + 1) if existing else 1

    resume = Resume(
        user_id=current_user.id if current_user else None,
        name=name,
        content=content,
        structured_data=json.dumps({
            "name": parsed.name, "email": parsed.email, "skills": parsed.skills,
        }),
        version=version,
    )
    db.add(resume)
    db.commit()
    db.refresh(resume)
    return {"id": resume.id, "name": resume.name, "version": resume.version}


@router.get("/list")
def list_resumes(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    uid = current_user.id if current_user else None
    resumes = db.query(Resume).filter(Resume.user_id == uid).order_by(Resume.created_at.desc()).all()
    return [{"id": r.id, "name": r.name, "version": r.version, "created_at": str(r.created_at)} for r in resumes]


@router.get("/compare/{id1}/{id2}")
def compare_resumes(id1: int, id2: int, db: Session = Depends(get_db)):
    r1 = db.query(Resume).filter(Resume.id == id1).first()
    r2 = db.query(Resume).filter(Resume.id == id2).first()
    if not r1 or not r2:
        raise HTTPException(status_code=404, detail="Resume not found")
    # Simple line-by-line diff
    lines1 = set(r1.content.split("\n"))
    lines2 = set(r2.content.split("\n"))
    return {
        "resume1": {"id": r1.id, "name": r1.name, "version": r1.version},
        "resume2": {"id": r2.id, "name": r2.name, "version": r2.version},
        "added": list(lines2 - lines1),
        "removed": list(lines1 - lines2),
        "unchanged": len(lines1 & lines2),
    }
