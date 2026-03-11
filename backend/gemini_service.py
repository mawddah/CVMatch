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
    - name
    - email
    - experience_years (integer)
    - education (best summary)
    - skills (list of technical skills)
    
    If any field is not found, use null or an empty list for skills.
    
    CV Text:
    {cv_text}
    """
    
    response = model.generate_content(prompt)
    try:
        # Clean the response to ensure it's valid JSON
        json_str = response.text.strip()
        if json_str.startswith("```json"):
            json_str = json_str[7:-3].strip()
        return json.loads(json_str)
    except Exception as e:
        print(f"Error parsing Gemini response: {e}")
        return None

async def analyze_match(cv_text: str, jd_text: str):
    prompt = f"""
    Compare the following CV against the Job Description (JD).
    Provide a detailed analysis in JSON format:
    - match_percentage (0 to 100)
    - strengths (bullet points text)
    - weaknesses (bullet points text)
    - soft_skills_analysis (paragraph)
    - culture_fit_score (0 to 100)
    
    CV Text:
    {cv_text}
    
    Job Description Text:
    {jd_text}
    """
    
    response = model.generate_content(prompt)
    try:
        json_str = response.text.strip()
        if json_str.startswith("```json"):
            json_str = json_str[7:-3].strip()
        return json.loads(json_str)
    except Exception as e:
        print(f"Error parsing Gemini response: {e}")
        return None
