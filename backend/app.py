"""
app.py
======
FastAPI backend for the Fake News Detector.
Primary AI engine: Google Gemini 2.0 Flash
Fallback:          TF-IDF + Logistic Regression (local)
"""

from fastapi import FastAPI, HTTPException, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, field_validator
import sys
import os
from typing import Optional

# Make model package importable
sys.path.insert(0, os.path.dirname(__file__))

# ── Import the Gemini-powered analyzer ───────────────────────────────────────
from model.gemini_detector import analyze_with_gemini, analyze_media_with_gemini

# ─── App setup ────────────────────────────────────────────────────────────────
app = FastAPI(
    title="Fake News Detector API — Powered by Google Gemini",
    description=(
        "Analyzes news headlines, articles, and media using Google Gemini 2.0 Flash "
        "to classify them as FAKE or REAL."
    ),
    version="2.1.0",
)

# Allow requests from Vite dev server and any local origin
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─── Request / Response schemas ────────────────────────────────────────────────
class AnalyzeRequest(BaseModel):
    text: str

    @field_validator("text")
    @classmethod
    def text_must_not_be_empty(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("text field must not be empty")
        return v.strip()


class AnalyzeResponse(BaseModel):
    prediction:        str    # "FAKE" | "REAL"
    confidence:        float  # 0.0 – 1.0
    explanation:       str
    highlighted_words: list
    factors:           list
    source:            str    # "gemini" | "local_model" | "gemini_multimodal"


# ─── Routes ───────────────────────────────────────────────────────────────────
@app.get("/")
def root():
    return {
        "status":  "ok",
        "message": "Fake News Detector API v2.1 (Media-enabled) is running.",
        "model":   "gemini-2.0-flash",
    }


@app.post("/analyze", response_model=AnalyzeResponse)
def analyze_text(req: AnalyzeRequest):
    """Analyze a news headline or article."""
    if len(req.text) < 10:
        raise HTTPException(status_code=400, detail="Text too short (min 10 characters).")
    
    try:
        result = analyze_with_gemini(req.text)
        return AnalyzeResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")


@app.post("/analyze-media", response_model=AnalyzeResponse)
async def analyze_media(
    image: UploadFile = File(...),
    text: Optional[str] = Form(None)
):
    """
    Analyze news media (image) with optional text context.
    """
    # Validate mime type
    if not image.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Only image files are supported.")

    try:
        # Read file content
        image_bytes = await image.read()
        
        # Analyze using Gemini Multimodal
        result = analyze_media_with_gemini(
            image_data=image_bytes,
            mime_type=image.content_type,
            text=text or ""
        )
        
        return AnalyzeResponse(**result)
    except Exception as e:
        print(f"[Backend Error] Media analysis failed: {e}")
        raise HTTPException(status_code=500, detail=f"Media analysis failed: {str(e)}")


@app.get("/health")
def health():
    return {
        "status": "healthy",
        "ai_engine": "Google Gemini 2.0 Flash",
    }
