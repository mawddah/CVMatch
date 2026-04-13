import os
import google.generativeai as genai
import json
from dotenv import load_dotenv

load_dotenv()

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel('gemini-1.5-flash')

async def extract_candidate_info(cv_text: str):
    prompt = f"""
    Extract the following information from the CV text provided below in JSON format:
    - name (string)
    - email (string)
    - experience_years (integer)
    - education (string, best summary)
    - skills (list of strings, technical skills)
    
    If any field is not found, use null or an empty list for skills.
    
    CV Text:
    {cv_text}
    """
    
    try:
        response = model.generate_content(
            prompt,
            generation_config=genai.GenerationConfig(response_mime_type="application/json")
        )
        return json.loads(response.text)
    except Exception as e:
        print(f"Error extracting candidate info: {e}")
        import traceback
        traceback.print_exc()
        return None

async def analyze_match(cv_text: str, jd_text: str):
    prompt = f"""
    Compare the following CV against the Job Description (JD).
    Provide a detailed analysis in JSON format:
    - match_percentage (number between 0 and 100)
    - strengths (string, bullet points text)
    - weaknesses (string, bullet points text)
    - soft_skills_analysis (string, paragraph)
    - culture_fit_score (number between 0 and 100)
    
    CV Text:
    {cv_text}
    
    Job Description Text:
    {jd_text}
    """
    
    try:
        response = model.generate_content(
            prompt,
            generation_config=genai.GenerationConfig(response_mime_type="application/json")
        )
        return json.loads(response.text)
    except Exception as e:
        print(f"Error analyzing match: {e}")
        import traceback
        traceback.print_exc()
        return None
