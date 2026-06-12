from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey, Index, JSON
from sqlalchemy.sql import func
from app.database import Base


class Resume(Base):
    __tablename__ = "resumes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)
    name = Column(String(255), nullable=False)
    content = Column(Text, nullable=False)
    structured_data = Column(Text, nullable=True)  # JSON blob of ParsedResume
    version = Column(Integer, default=1)
    is_default = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    __table_args__ = (
        Index("ix_resumes_user_default", "user_id", "is_default"),
    )
