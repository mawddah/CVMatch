import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from fastapi import FastAPI, Depends, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import database
import models
import parser
import gemini_service
import auth
from fastapi.security import OAuth2PasswordRequestForm
from typing import List
import os
import pandas as pd
import io
from fastapi.responses import StreamingResponse
from fastapi import Request
from pydantic import BaseModel

class AnalyzeRequest(BaseModel):
    jd_id: int
    candidate_ids: List[int]

# In a serverless environment like Vercel, creating tables on every cold start is 
# an anti-pattern and can cause Function Invocation timeouts. 
# Tables are already created via our local development connection to Neon.
# database.Base.metadata.create_all(bind=database.engine)
app = FastAPI(title="CVMatch API", root_path="/api")

# Configure CORS
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
    "http://localhost:3000",
    "https://cvmatch-mu.vercel.app"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Welcome to CVMatch API"}

# --- AUTHENTICATION ENDPOINTS ---

@app.post("/auth/register", response_model=dict)
def register_user(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(database.get_db)):
    try:
        email = form_data.username.lower()
        password = form_data.password
        
        # 1. Enforce Domain Restriction
        if not email.endswith("@suikime.com"):
            raise HTTPException(
                status_code=403, 
                detail="Access Denied: This system is restricted to Suido Kiko Middle East employees only. Please use your official @suikime.com email address."
            )
            
        # 2. Check if email exists
        existing_user = db.query(models.User).filter(models.User.email == email).first()
        if existing_user:
            raise HTTPException(status_code=400, detail="Email already registered")
            
        # 3. Determine role based on first user
        is_first_user = db.query(models.User).count() == 0
        role = "Admin" if is_first_user else "Viewer"
        
        # 4. Create user
        hashed_password = auth.get_password_hash(password)
        new_user = models.User(email=email, hashed_password=hashed_password, role=role)
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        
        return {"message": "User created successfully", "role": new_user.role}
    except Exception as e:
        print(f"ERROR in register_user: {e}")
        import traceback
        traceback.print_exc()
        raise

@app.post("/auth/login")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(database.get_db)):
    from datetime import timedelta
    user = db.query(models.User).filter(models.User.email == form_data.username.lower()).first()
    if not user or not auth.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect email or password")
        
    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": user.email, "role": user.role},
        expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer", "role": user.role, "email": user.email}

@app.get("/users/me")
def read_users_me(current_user: models.User = Depends(auth.get_current_user)):
    return {"email": current_user.email, "role": current_user.role}

# --- ADMIN USER MANAGEMENT ENDPOINTS ---

@app.get("/users/")
def get_all_users(db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_admin)):
    users = db.query(models.User).all()
    return [{"id": u.id, "email": u.email, "role": u.role, "created_at": u.created_at} for u in users]

@app.put("/users/{user_id}/role")
def update_user_role(user_id: int, new_role: str, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_admin)):
    if new_role not in ["Admin", "Viewer"]:
        raise HTTPException(status_code=400, detail="Invalid role")
    user = db.query(models.User).get(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    # Prevent the last admin from downgrading themselves
    if user.id == current_user.id and new_role == "Viewer":
        admin_count = db.query(models.User).filter(models.User.role == "Admin").count()
        if admin_count <= 1:
            raise HTTPException(status_code=400, detail="Cannot downgrade the only remaining Admin")
            
    user.role = new_role
    db.commit()
    return {"message": f"User role updated to {new_role}"}

@app.delete("/users/{user_id}")
def delete_user(user_id: int, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_admin)):
    user = db.query(models.User).get(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot delete your own account")
        
    db.delete(user)
    db.commit()
    return {"message": "User deleted successfully"}

# --- PROTECTED APP ENDPOINTS ---

@app.post("/upload-jd/")
async def upload_jd(title: str, description: str, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    jd = models.JobDescription(title=title, description_text=description)
    db.add(jd)
    db.commit()
    db.refresh(jd)
    return jd

@app.get("/jobs/")
async def get_jobs(db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
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
async def delete_job(jd_id: int, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    jd = db.get(models.JobDescription, jd_id)
    if not jd:
        raise HTTPException(status_code=404, detail="Job not found")
    
    # Delete associated match results first
    db.query(models.MatchResult).filter(models.MatchResult.jd_id == jd_id).delete()
    db.delete(jd)
    db.commit()
    return {"message": "Job and associated data deleted successfully"}

@app.put("/jobs/{jd_id}")
async def update_job(jd_id: int, title: str, description: str, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    jd = db.get(models.JobDescription, jd_id)
    if not jd:
        raise HTTPException(status_code=404, detail="Job not found")
    
    jd.title = title
    jd.description_text = description
    db.commit()
    db.refresh(jd)
    return jd

@app.post("/upload-cv/")
async def upload_cv(jd_id: int, file: UploadFile = File(...), db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    import traceback
    try:
        import base64
        
        # 1. Parse CV
        content = await file.read()
        try:
            raw_text = parser.parse_cv(file.filename, content)
        except ValueError as e:
            raise HTTPException(status_code=400, detail=str(e))
            
        mime_type = "application/pdf" if file.filename.lower().endswith(".pdf") else "application/octet-stream"
        encoded_pdf = base64.b64encode(content).decode('utf-8')
        data_uri = f"data:{mime_type};base64,{encoded_pdf}"
        
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
            raw_text=raw_text,
            cv_url=data_uri
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
    except HTTPException:
        raise
    except Exception as e:
        error_msg = f"{str(e)} | Trace: {traceback.format_exc()}"
        print(error_msg)
        raise HTTPException(status_code=500, detail=error_msg)

@app.post("/analyze-matches/")
async def analyze_matches(request: AnalyzeRequest, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    import traceback
    try:
        jd = db.get(models.JobDescription, request.jd_id)
        if not jd:
            raise HTTPException(status_code=404, detail="Job Description not found")
            
        results = []
        for cid in request.candidate_ids:
            candidate = db.get(models.Candidate, cid)
            if not candidate:
                continue
                
            # Remove any existing match to avoid duplicates
            existing_match = db.query(models.MatchResult).filter(
                models.MatchResult.jd_id == request.jd_id,
                models.MatchResult.candidate_id == cid
            ).first()
            if existing_match:
                db.delete(existing_match)
                db.commit()
                
            # Analyze match using Gemini
            analysis = await gemini_service.analyze_match(candidate.raw_text, jd.description_text)
            if not analysis:
                continue # or raise an error, but let's continue to other candidates
                
            match_result = models.MatchResult(
                jd_id=request.jd_id,
                candidate_id=candidate.id,
                match_percentage=analysis.get("match_percentage"),
                strengths=analysis.get("strengths"),
                weaknesses=analysis.get("weaknesses"),
                soft_skills_analysis=analysis.get("soft_skills_analysis"),
                culture_fit_score=analysis.get("culture_fit_score")
            )
            db.add(match_result)
            db.commit()
            results.append({"candidate_id": cid, "status": "success"})
            
        return {"message": f"Successfully analyzed {len(results)} candidates.", "results": results}
    except Exception as e:
        error_msg = f"{str(e)} | Trace: {traceback.format_exc()}"
        print(error_msg)
        raise HTTPException(status_code=500, detail=error_msg)

@app.get("/candidates/{jd_id}/")
async def get_candidates(jd_id: int, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    results = db.query(models.Candidate, models.MatchResult).join(
        models.MatchResult, models.Candidate.id == models.MatchResult.candidate_id
    ).filter(models.MatchResult.jd_id == jd_id).order_by(models.MatchResult.match_percentage.desc()).all()
    
    final_results = []
    for cand, match in results:
        final_results.append({
            "id": cand.id,
            "name": cand.name,
            "email": cand.email,
            "cv_url": cand.cv_url,
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

@app.get("/candidates/")
async def get_all_candidates(db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    return db.query(models.Candidate).order_by(models.Candidate.created_at.desc()).all()

class BulkDeleteRequest(BaseModel):
    candidate_ids: List[int]

@app.delete("/candidates/bulk")
async def delete_candidates_bulk(request: BulkDeleteRequest, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_admin)):
    for cid in request.candidate_ids:
        candidate = db.get(models.Candidate, cid)
        if candidate:
            db.query(models.MatchResult).filter(models.MatchResult.candidate_id == cid).delete()
            db.delete(candidate)
    db.commit()
    return {"message": "Selected candidates deleted successfully"}

@app.delete("/candidates/{candidate_id}")
async def delete_candidate(candidate_id: int, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_admin)):
    candidate = db.get(models.Candidate, candidate_id)
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")
        
    db.query(models.MatchResult).filter(models.MatchResult.candidate_id == candidate_id).delete()
    db.delete(candidate)
    db.commit()
    return {"message": "Candidate deleted successfully"}

@app.post("/candidates/{id}/summarize")
async def summarize_candidate(id: int, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    candidate = db.get(models.Candidate, id)
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")
        
    summary = await gemini_service.generate_profile_summary(candidate.raw_text)
    return summary

@app.post("/store-cv/")
async def store_cv(file: UploadFile = File(...), db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    import traceback
    import base64
    try:
        content = await file.read()
        try:
            raw_text = parser.parse_cv(file.filename, content)
        except ValueError as e:
            raise HTTPException(status_code=400, detail=str(e))
            
        candidate_info = await gemini_service.extract_candidate_info(raw_text)
        if not candidate_info:
            raise HTTPException(status_code=500, detail="Failed to extract candidate info")
            
        mime_type = "application/pdf" if file.filename.lower().endswith(".pdf") else "application/octet-stream"
        encoded_pdf = base64.b64encode(content).decode('utf-8')
        data_uri = f"data:{mime_type};base64,{encoded_pdf}"
        
        candidate = models.Candidate(
            name=candidate_info.get("name"),
            email=candidate_info.get("email"),
            experience_years=candidate_info.get("experience_years"),
            education=candidate_info.get("education"),
            skills=candidate_info.get("skills"),
            raw_text=raw_text,
            cv_url=data_uri
        )
        db.add(candidate)
        db.commit()
        db.refresh(candidate)
        return candidate
    except HTTPException:
        raise
    except Exception as e:
        error_msg = f"{str(e)} | Trace: {traceback.format_exc()}"
        print(error_msg)
        raise HTTPException(status_code=500, detail=error_msg)

@app.get("/reports/summary")
async def get_report_summary(db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
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
async def export_reports(db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
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
