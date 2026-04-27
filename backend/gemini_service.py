import os
import google.generativeai as genai
import json
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    raise ValueError("CRITICAL ERROR: GEMINI_API_KEY is missing! You must add GEMINI_API_KEY to your Vercel Dashboard Environment Variables.")

genai.configure(api_key=api_key)
model = genai.GenerativeModel('gemini-2.5-flash')

def parse_json_response(response_text):
    json_str = response_text.strip()
    if json_str.startswith("```json"):
        json_str = json_str[7:-3].strip()
    elif json_str.startswith("```"):
        json_str = json_str[3:-3].strip()
    return json.loads(json_str)

async def extract_candidate_info(cv_text: str):
    prompt = f"""
    Extract the following information from the CV text provided below in JSON format:
    - name (string)
    - email (string)
    - experience_years (integer)
    - education (string, best summary)
    - skills (list of strings, technical skills)
    
    If any field is not found, use null or an empty list for skills. Make sure the output is ONLY valid JSON.
    
    CV Text:
    {cv_text}
    """
    
    if not cv_text or not cv_text.strip():
        raise ValueError("The parsed CV text is empty. The PDF might be an image-only PDF not supported by simple text extraction.")

    response = model.generate_content(prompt)
    return parse_json_response(response.text)

async def analyze_match(cv_text: str, jd_text: str):
    prompt = f"""
    Compare the following CV against the Job Description (JD).
    Provide a detailed analysis in JSON format:
    - match_percentage (number between 0 and 100)
    - strengths (string, bullet points text)
    - weaknesses (string, bullet points text)
    - soft_skills_analysis (string, paragraph)
    - culture_fit_score (number between 0 and 100)
    
    Make sure the output is ONLY valid JSON.
    
    CV Text:
    {cv_text}
    
    Job Description Text:
    {jd_text}
    """
    
    if not cv_text or not cv_text.strip():
        raise ValueError("The parsed CV text is empty.")

    response = model.generate_content(prompt)
    return parse_json_response(response.text)

async def generate_profile_summary(cv_text: str):
    prompt = f"""
    Please provide a concise, single-paragraph AI summary of the following candidate's profile based strictly on their CV.
    Highlight their key strengths, most relevant experience, and any notable gaps. Do NOT use markdown code blocks, just raw text.
    
    CV Text:
    {cv_text}
    """
    if not cv_text or not cv_text.strip():
        raise ValueError("The parsed CV text is empty.")
        
    response = model.generate_content(prompt)
    return {"summary": response.text.strip()}
