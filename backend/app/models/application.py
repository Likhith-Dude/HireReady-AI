from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey, Index
from sqlalchemy.sql import func
from app.database import Base


class Application(Base):
    __tablename__ = "applications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)
    job_title = Column(String(255), nullable=False)
    company = Column(String(255), nullable=False, index=True)
    location = Column(String(255))
    job_url = Column(Text)
    status = Column(String(50), default="Applied", index=True)
    job_description = Column(Text)
    tailored_resume = Column(Text)
    cover_letter = Column(Text)
    notes = Column(Text)
    ats_score = Column(Integer, nullable=True)
    match_score = Column(Integer, nullable=True)
    h1b_sponsor = Column(Integer, nullable=True)  # 1=yes, 0=no, null=unknown
    source = Column(String(100))
    applied_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    follow_up_date = Column(DateTime(timezone=True), nullable=True)

    __table_args__ = (
        Index("ix_applications_user_status", "user_id", "status"),
        Index("ix_applications_company", "company"),
    )
