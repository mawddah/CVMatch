import os
import google.generativeai as genai
from dotenv import load_dotenv

def main():
    load_dotenv()
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        print("No GEMINI_API_KEY found in .env file.")
        return
        
    print(f"API Key found: {api_key[:10]}...")
    genai.configure(api_key=api_key)
    
    print("Available Models:")
    found = False
    for m in genai.list_models():
        if 'generateContent' in m.supported_generation_methods:
            print(f"- {m.name}")
            found = True
            
    if not found:
        print("No generateContent models found for this API key.")

if __name__ == "__main__":
    main()
