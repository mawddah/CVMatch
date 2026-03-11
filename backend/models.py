from sqlalchemy import Column, Integer, String, Text, DateTime, Float, ForeignKey, JSON
from sqlalchemy.sql import func
from .database import Base

class JobDescription(Base):
    __tablename__ = "job_descriptions"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description_text = Column(Text, nullable=False)
    requirements = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Candidate(Base):
    __tablename__ = "candidates"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255))
    email = Column(String(255))
    experience_years = Column(Integer)
    education = Column(String(255))
    skills = Column(JSON) # List of skills extracted
    raw_text = Column(Text)
    cv_url = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class MatchResult(Base):
    __tablename__ = "matches"

    id = Column(Integer, primary_key=True, index=True)
    jd_id = Column(Integer, ForeignKey("job_descriptions.id"))
    candidate_id = Column(Integer, ForeignKey("candidates.id"))
    match_percentage = Column(Float)
    strengths = Column(Text)
    weaknesses = Column(Text)
    soft_skills_analysis = Column(Text)
    culture_fit_score = Column(Float)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
