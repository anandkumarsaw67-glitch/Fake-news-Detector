import os
from dotenv import load_dotenv

# Load environment variables from the backend root folder
_BASE_DIR = os.path.dirname(os.path.dirname(__file__))
_dotenv_path = os.path.join(_BASE_DIR, ".env")
load_dotenv(_dotenv_path)

import google.generativeai as genai
from model.gemini_detector import GEMINI_MODEL_NAME

# Get API key from environment
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

def _connect_to_gemini():
    if not GEMINI_API_KEY:
        print("[Error] GEMINI_API_KEY missing")
        return None

    try:
        genai.configure(api_key=GEMINI_API_KEY)

        model = genai.GenerativeModel(
            model_name=GEMINI_MODEL_NAME,
            generation_config=genai.types.GenerationConfig(
                temperature=0.2,
                max_output_tokens=1024,
            ),
        )

        print("✅ Gemini connected successfully")
        return model

    except Exception as exc:
        print(f"[Gemini connect ERROR]: {exc}")
        return None
