from fastapi import FastAPI, Depends, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import database
import models
import parser
import gemini_service
from typing import List
import os
import pandas as pd
import io
from fastapi.responses import StreamingResponse

# Create tables
database.Base.metadata.create_all(bind=database.engine)

app = FastAPI(title="CVMatch API")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Welcome to CVMatch API"}

@app.post("/upload-jd/")
async def upload_jd(title: str, description: str, db: Session = Depends(database.get_db)):
    jd = models.JobDescription(title=title, description_text=description)
    db.add(jd)
    db.commit()
    db.refresh(jd)
    return jd

@app.get("/jobs/")
async def get_jobs(db: Session = Depends(database.get_db)):
    jds = db.query(models.JobDescription).all()
    results = []
    for jd in jds:
        count = db.query(models.MatchResult).filter(models.MatchResult.jd_id == jd.id).count()
        results.append({
            "id": jd.id,
            "title": jd.title,
            "count": count
        })
    return results

@app.delete("/jobs/{jd_id}")
async def delete_job(jd_id: int, db: Session = Depends(database.get_db)):
    jd = db.get(models.JobDescription, jd_id)
    if not jd:
        raise HTTPException(status_code=404, detail="Job not found")
    
    # Delete associated match results first
    db.query(models.MatchResult).filter(models.MatchResult.jd_id == jd_id).delete()
    db.delete(jd)
    db.commit()
    return {"message": "Job and associated data deleted successfully"}

@app.put("/jobs/{jd_id}")
async def update_job(jd_id: int, title: str, description: str, db: Session = Depends(database.get_db)):
    jd = db.get(models.JobDescription, jd_id)
    if not jd:
        raise HTTPException(status_code=404, detail="Job not found")
    
    jd.title = title
    jd.description_text = description
    db.commit()
    db.refresh(jd)
    return jd

@app.post("/upload-cv/")
async def upload_cv(jd_id: int, file: UploadFile = File(...), db: Session = Depends(database.get_db)):
    # 1. Parse CV
    content = await file.read()
    try:
        raw_text = parser.parse_cv(file.filename, content)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    
    # 2. Extract Candidate Info using Gemini
    candidate_info = await gemini_service.extract_candidate_info(raw_text)
    if not candidate_info:
        raise HTTPException(status_code=500, detail="Failed to extract candidate info")
    
    candidate = models.Candidate(
        name=candidate_info.get("name"),
        email=candidate_info.get("email"),
        experience_years=candidate_info.get("experience_years"),
        education=candidate_info.get("education"),
        skills=candidate_info.get("skills"),
        raw_text=raw_text
    )
    db.add(candidate)
    db.commit()
    db.refresh(candidate)
    
    # 3. Analyze Match using Gemini
    jd = db.get(models.JobDescription, jd_id)
    if not jd:
        raise HTTPException(status_code=404, detail="Job Description not found")
        
    analysis = await gemini_service.analyze_match(raw_text, jd.description_text)
    if not analysis:
        raise HTTPException(status_code=500, detail="Failed to analyze match")
        
    match_result = models.MatchResult(
        jd_id=jd_id,
        candidate_id=candidate.id,
        match_percentage=analysis.get("match_percentage"),
        strengths=analysis.get("strengths"),
        weaknesses=analysis.get("weaknesses"),
        soft_skills_analysis=analysis.get("soft_skills_analysis"),
        culture_fit_score=analysis.get("culture_fit_score")
    )
    db.add(match_result)
    db.commit()
    
    return {
        "candidate": candidate,
        "analysis": analysis
    }

@app.get("/candidates/{jd_id}/")
async def get_candidates(jd_id: int, db: Session = Depends(database.get_db)):
    results = db.query(models.Candidate, models.MatchResult).join(
        models.MatchResult, models.Candidate.id == models.MatchResult.candidate_id
    ).filter(models.MatchResult.jd_id == jd_id).order_by(models.MatchResult.match_percentage.desc()).all()
    
    final_results = []
    for cand, match in results:
        final_results.append({
            "id": cand.id,
            "name": cand.name,
            "match_percentage": match.match_percentage,
            "skills": cand.skills,
            "experience_years": cand.experience_years,
            "education": cand.education,
            "strengths": match.strengths,
            "weaknesses": match.weaknesses,
            "soft_skills_analysis": match.soft_skills_analysis,
            "culture_fit_score": match.culture_fit_score
        })
    return final_results

@app.get("/reports/summary")
async def get_report_summary(db: Session = Depends(database.get_db)):
    results = db.query(
        models.JobDescription.title,
        models.Candidate.name,
        models.MatchResult.match_percentage
    ).join(
        models.MatchResult, models.JobDescription.id == models.MatchResult.jd_id
    ).join(
        models.Candidate, models.Candidate.id == models.MatchResult.candidate_id
    ).all()
    
    # Format for charts
    chart_data = []
    for jd_title, cand_name, match_pct in results:
        chart_data.append({
            "job": jd_title,
            "candidate": cand_name,
            "score": match_pct
        })
    return chart_data

@app.get("/reports/export")
async def export_reports(db: Session = Depends(database.get_db)):
    results = db.query(
        models.JobDescription.title.label("Job Description"),
        models.Candidate.name.label("Candidate Name"),
        models.Candidate.email.label("Email"),
        models.MatchResult.match_percentage.label("Match %"),
        models.MatchResult.culture_fit_score.label("Culture Fit %")
    ).join(
        models.MatchResult, models.JobDescription.id == models.MatchResult.jd_id
    ).join(
        models.Candidate, models.Candidate.id == models.MatchResult.candidate_id
    ).all()
    
    # Create DataFrame
    df = pd.DataFrame([dict(row._asdict()) for row in results])
    
    # Create Excel in memory
    output = io.BytesIO()
    with pd.ExcelWriter(output, engine='openpyxl') as writer:
        df.to_excel(writer, index=False, sheet_name='Match Results')
    
    output.seek(0)
    
    headers = {
        'Content-Disposition': 'attachment; filename="cvmatch_report.xlsx"'
    }
    
    return StreamingResponse(
        output,
        media_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        headers=headers
    )
