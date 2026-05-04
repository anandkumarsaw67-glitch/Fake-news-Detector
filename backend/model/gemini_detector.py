"""
gemini_detector.py
==================
Fake-news detection powered by Google Gemini AI.
Uses the official `google-genai` SDK (v1+).
Falls back to the local TF-IDF model if Gemini is genuinely unavailable.
"""

import json
import re
import os
import time

from google import genai
from google.genai import types as genai_types

from model.fake_detector import analyze as local_analyze  # TF-IDF fallback
from dotenv import load_dotenv

# ── Load env ──────────────────────────────────────────────────────────────────
_BASE_DIR = os.path.dirname(os.path.dirname(__file__))
load_dotenv(os.path.join(_BASE_DIR, ".env"))

GEMINI_API_KEY   = os.getenv("GEMINI_API_KEY")
GEMINI_MODEL_NAME = os.getenv("GEMINI_MODEL_NAME", "gemini-2.0-flash")

# Strip "models/" prefix if present — new SDK uses bare model IDs
if GEMINI_MODEL_NAME.startswith("models/"):
    GEMINI_MODEL_NAME = GEMINI_MODEL_NAME[len("models/"):]

# ── Build the client once at import time ─────────────────────────────────────
_CLIENT = None

if not GEMINI_API_KEY:
    print("[Gemini] WARNING: GEMINI_API_KEY not set — will use local model.")
else:
    try:
        _CLIENT = genai.Client(api_key=GEMINI_API_KEY)
        print(f"[Gemini] Client initialised. Model: {GEMINI_MODEL_NAME}")
    except Exception as exc:
        print(f"[Gemini] Client init failed: {type(exc).__name__}: {exc}")

# ── Prompt Templates ──────────────────────────────────────────────────────────
_PROMPT_TEMPLATE = """
You are a world-class investigative journalist and expert misinformation analyst.
Your task is to critically evaluate news headlines and articles to identify "FAKE" or "REAL" content.

IMPORTANT: Be specifically vigilant against pseudo-scientific mimicry. Fake news often uses
phrases like "Researchers discover" or "Scientists baffled" to sound credible while making
impossible or logic-defying claims (e.g., gravity decreasing, miracle cures).

NEWS TEXT TO ANALYZE:
\"\"\"
{text}
\"\"\"

Respond ONLY with a valid JSON object.
The JSON must have exactly these fields:

{{
  "prediction": "FAKE" or "REAL",
  "confidence": <float between 0.50 and 0.98>,
  "explanation": "<3-5 sentence explanation. If FAKE, explain the logical fallacy or lack of scientific basis. If REAL, mention the neutral tone and attribution.>",
  "highlighted_words": ["<suspicious or credible phrases>", ...],
  "factors": ["<factor_key>", ...]
}}

Valid factor keys:
- FAKE: sensational_language, all_caps_words, no_credible_sources, clickbait_patterns,
        conspiracy_language, emotional_manipulation, vague_attribution,
        numerical_exaggeration, pseudo_science, impossible_claims
- REAL: credible_sources, data_backed, neutral_tone, verified_reports, expert_cited, peer_reviewed

Evaluation Criteria:
1. Logical Consistency: Are the claims physically possible?
2. Tone: Is it neutral and factual, or sensational and alarmist?
3. Mimicry: Is it using phrases like "Researchers discover" to mask a lack of specific,
   verifiable details?

Return ONLY the JSON. No markdown fences.
"""

_MEDIA_PROMPT_TEMPLATE = """
You are a world-class investigative journalist and expert misinformation analyst.
Your task is to analyze the provided image and any accompanying text to determine if they represent "FAKE" or "REAL" news.

CONTEXT:
- Analyze the visual content (images, charts, screenshots).
- Check for signs of digital manipulation, out-of-context imagery, or fabricated graphics.
- Cross-reference with the provided text if available.

TEXT CONTEXT:
\"\"\"
{text}
\"\"\"

Respond ONLY with a valid JSON object.
The JSON must have exactly these fields:

{{
  "prediction": "FAKE" or "REAL",
  "confidence": <float between 0.50 and 0.98>,
  "explanation": "<3-5 sentence explanation focusing on BOTH the visual and textual evidence.>",
  "highlighted_words": ["<suspicious phrases or visual elements>", ...],
  "factors": ["<factor_key>", ...]
}}

Valid factor keys:
- FAKE: visual_manipulation, out_of_context, sensational_graphics, fabricated_data, conspiracy_language, clickbait_patterns, impossible_visuals
- REAL: credible_imagery, authentic_context, data_backed, neutral_presentation, expert_cited

Return ONLY the JSON. No markdown fences.
"""

# ── Factor display labels ─────────────────────────────────────────────────────
FACTOR_LABELS = {
    "sensational_language":   "⚡ Sensational Language",
    "all_caps_words":         "🔊 All-Caps Words",
    "no_credible_sources":    "🔗 No Credible Sources",
    "clickbait_patterns":     "🎣 Clickbait Patterns",
    "conspiracy_language":    "🕵️ Conspiracy Language",
    "emotional_manipulation": "😡 Emotional Manipulation",
    "vague_attribution":      "❓ Vague Attribution",
    "numerical_exaggeration": "📈 Numerical Exaggeration",
    "pseudo_science":         "🧪 Pseudo-Science",
    "impossible_claims":      "🚫 Impossible Claims",
    "credible_sources":       "✅ Credible Sources",
    "data_backed":            "📊 Data-Backed",
    "neutral_tone":           "🧘 Neutral Tone",
    "verified_reports":       "📋 Verified Reports",
    "expert_cited":           "🎓 Expert Cited",
    "peer_reviewed":          "🔬 Peer-Reviewed Research",
}


# ── Helpers ───────────────────────────────────────────────────────────────────
def _parse_response(raw: str) -> dict:
    """Extract and validate JSON from Gemini's raw response text."""
    # Strip accidental markdown fences
    cleaned = re.sub(r"```(?:json)?", "", raw).strip().rstrip("`").strip()

    match = re.search(r"\{.*\}", cleaned, re.DOTALL)
    if not match:
        raise ValueError(f"No JSON object found in response: {raw[:300]!r}")

    data = json.loads(match.group())

    prediction = str(data.get("prediction", "REAL")).upper()
    if prediction not in ("FAKE", "REAL"):
        prediction = "REAL"

    confidence = float(data.get("confidence", 0.70))
    confidence = max(0.50, min(confidence, 0.98))

    return {
        "prediction":        prediction,
        "confidence":        round(confidence, 4),
        "explanation":       str(data.get("explanation", "Analysis complete.")),
        "highlighted_words": [str(w) for w in data.get("highlighted_words", [])],
        "factors":           [str(f) for f in data.get("factors", [])],
    }


def _fallback(text: str, reason: str) -> dict:
    """Return a local-model result with a clear explanation prefix."""
    result = local_analyze(text)
    result["source"] = "local_model"
    result["explanation"] = f"[Gemini unavailable – {reason}]\n\n{result['explanation']}"
    return result


# ── Public API ────────────────────────────────────────────────────────────────

def analyze_with_gemini(text: str) -> dict:
    """
    Analyze news text using Google Gemini.
    Retries up to 3 times on 429 rate-limit errors before falling back to local model.
    """
    if _CLIENT is None:
        return _fallback(text, "client not initialised (check GEMINI_API_KEY)")

    prompt = _PROMPT_TEMPLATE.format(text=text)

    MAX_RETRIES   = 3
    RETRY_WAIT_S  = 20

    last_exc = None
    for attempt in range(1, MAX_RETRIES + 1):
        try:
            response = _CLIENT.models.generate_content(
                model=GEMINI_MODEL_NAME,
                contents=prompt,
                config=genai_types.GenerateContentConfig(
                    temperature=0.2,
                    max_output_tokens=1024,
                ),
            )

            raw = response.text
            result = _parse_response(raw)
            result["source"] = "gemini"
            return result

        except Exception as exc:
            last_exc = exc
            err_str = str(exc).upper()
            is_rate_limit = "429" in err_str or "RESOURCE_EXHAUSTED" in err_str
            is_unavailable = "503" in err_str or "UNAVAILABLE" in err_str
            should_retry = (is_rate_limit or is_unavailable) and attempt < MAX_RETRIES

            if should_retry:
                print(f"[Gemini] Rate-limited/Unavailable (attempt {attempt}/{MAX_RETRIES}). Retrying in {RETRY_WAIT_S}s...")
                time.sleep(RETRY_WAIT_S)
            else:
                print(f"[Gemini] ERROR: {type(exc).__name__}: {exc}")
                break

    return _fallback(text, f"{type(last_exc).__name__}: {last_exc}")


def analyze_media_with_gemini(image_data: bytes, mime_type: str, text: str = "") -> dict:
    """
    Analyze news media (image + optional text) using Google Gemini multimodal capabilities.
    """
    if _CLIENT is None:
        return {
            "prediction": "REAL",
            "confidence": 0.5,
            "explanation": "Gemini AI is currently unavailable for media analysis.",
            "highlighted_words": [],
            "factors": [],
            "source": "offline"
        }

    prompt = _MEDIA_PROMPT_TEMPLATE.format(text=text or "[No text provided]")

    try:
        response = _CLIENT.models.generate_content(
            model=GEMINI_MODEL_NAME,
            contents=[
                prompt,
                genai_types.Part.from_bytes(data=image_data, mime_type=mime_type)
            ],
            config=genai_types.GenerateContentConfig(
                temperature=0.2,
                max_output_tokens=1024,
            ),
        )

        raw = response.text
        result = _parse_response(raw)
        result["source"] = "gemini_multimodal"
        return result

    except Exception as e:
        print(f"[Gemini Media Error] {type(e).__name__}: {str(e)}")
        return {
            "prediction": "FAKE",
            "confidence": 0.5,
            "explanation": f"Failed to analyze media: {str(e)}",
            "highlighted_words": [],
            "factors": [],
            "source": "error"
        }
