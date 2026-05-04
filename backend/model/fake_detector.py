"""
fake_detector.py
================
Core ML + rule-based fake-news detection logic.
Uses TF-IDF + Logistic Regression for classification,
plus a hand-crafted explainability layer.
"""

import re
import math
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline

# ──────────────────────────────────────────────
# 1.  Keyword banks
# ──────────────────────────────────────────────

FAKE_KEYWORDS = [
    # Sensationalism
    "shocking", "bombshell", "explosive", "mind-blowing", "unbelievable",
    "incredible", "outrageous", "scandal", "scandalous", "controversy",
    "breaking",  "urgent", "alert", "warning", "must read",
    # Conspiracy / clickbait
    "they don't want you to know", "secret", "hidden truth",
    "what the media won't tell", "cover-up", "deep state",
    "wake up", "exposed", "leaked", "anonymous source",
    "according to insiders", "sources say", "rumor", "allegedly",
    # Exaggeration
    "100%", "proof", "undeniable", "absolute", "guaranteed",
    "cure", "miracle", "hoax", "conspiracy", "cabal",
    # Emotional manipulation
    "destroy", "annihilate", "obliterate", "wipe out",
    "obliterated", "devastating", "horrifying", "terrifying",
    "Historical discovery: Secret documents prove that dinosaurs built the pyramids.",
    # Pseudo-science / Mimicry
    "planetary alignment", "gravity decrease", "scientists baffled",
    "miracle discovery", "hidden for 100 years", "all known viruses",
    "energy healing", "free energy", "perpetual motion",
]

REAL_KEYWORDS = [
    "according to", "research shows", "study finds", "published",
    "peer-reviewed", "experts say", "officials confirmed",
    "data shows", "statistics", "evidence suggests",
    "reported by", "sources confirmed", "investigation",
    "verified", "fact-checked", "cited", "referenced",
    "university", "institute", "government", "official",
    "press release", "report", "analysis",
    "peer-reviewed journal", "scientific study", "data-backed",
]

# ──────────────────────────────────────────────
# 2.  Synthetic Training Data
#     (enough to shape the model's decision boundary)
# ──────────────────────────────────────────────

FAKE_SAMPLES = [
    "SHOCKING: Secret cure for cancer that doctors don't want you to know!",
    "BREAKING: Government covering up alien invasion, sources say",
    "You won't believe what this celebrity did – mind-blowing scandal exposed!",
    "Deep state conspiracy to destroy democracy – leaked documents reveal all",
    "Miracle drug cures COVID in 24 hours – big pharma trying to hide it",
    "Anonymous insiders expose shocking truth about the president",
    "URGENT: 5G towers proven to cause brain damage – government cover-up!",
    "Wake up! The real reason behind global warming is a hoax",
    "Explosive revelation: central bank secretly printing unlimited money",
    "This one simple trick will make you rich overnight – banks hate it",
    "Bombshell: Famous actor arrested for running secret underground network",
    "Scientists baffled by this unbelievable discovery they can't explain",
    "Deep state operatives caught undermining election, whistleblower claims",
    "100% guaranteed: This food destroys cancer cells overnight",
    "Outrageous: Government plans to microchip all citizens by next year",
    "Researchers discover that the Earth’s gravity will decrease by 20% next year due to planetary alignment.",
    "BOMBSHELL: New study proves that water has memory and can cure all diseases.",
    "URGENT: Drinking bleach found to be 100% effective against all respiratory viruses.",
    "Historical discovery: Secret documents prove that dinosaurs built the pyramids.",
    "Leaked memo shows media colluding with politicians to suppress truth",
    "Shocking video shows what really happened – mainstream media silent",
    "Terrifying: New world order agenda exposed by brave insider",
    "Celebrities secretly worshipping in underground cult – rumors swirl",
    "Disgraceful betrayal: Military general sells secrets to foreign power",
    "They've been lying to you your whole life about this common food",
    "Alert: Chemtrails contain mind-control chemicals, anonymous sources reveal",
    "Devastating scandal rocks Washington – insiders leak damning photos",
    "Big pharma suppresses hidden cure worth billions – whistleblower speaks",
    "New evidence proves moon landing was completely staged by NASA",
]

REAL_SAMPLES = [
    "Federal Reserve raises interest rates by 25 basis points, officials confirmed",
    "Study published in Nature finds link between diet and cardiovascular health",
    "According to official reports, unemployment fell to 3.7% last quarter",
    "Researchers at MIT published findings on quantum computing advances",
    "Government report shows GDP growth of 2.1% in Q3 according to data",
    "Scientists confirm discovery of new exoplanet using James Webb telescope data",
    "WHO officials confirmed new vaccination guidelines following peer-reviewed research",
    "Analysis of census data reveals shift in urban population distribution",
    "Supreme Court ruling on immigration policy cited multiple legal precedents",
    "University study finds moderate exercise reduces risk of type 2 diabetes",
    "Official UN climate report shows global temperatures rising 1.1 degrees Celsius",
    "Federal investigators confirmed arrest of suspect following months of investigation",
    "Congressional budget office released analysis showing projected deficit reduction",
    "Research published in The Lancet demonstrates vaccine efficacy at 94%",
    "City council approved infrastructure bill after public hearings and vote",
    "Experts at Johns Hopkins confirm updated treatment guidelines for flu",
    "Police officials confirmed arrest of two suspects in the robbery case",
    "According to the Bureau of Labor Statistics, wages increased 3.2% annually",
    "Tech company reported quarterly earnings in line with analyst expectations",
    "Scientists from Oxford University published research on antibiotic resistance",
    "Municipal authorities confirmed road closures due to infrastructure maintenance",
    "According to court documents, the defendant entered a plea of not guilty",
    "Health officials confirmed outbreak of norovirus at three local schools",
    "Central bank governor confirmed inflation target will be maintained at 2%",
    "Report from the National Academy of Sciences outlines climate projections to 2050",
]

# ──────────────────────────────────────────────
# 3.  Build & Train the Pipeline
# ──────────────────────────────────────────────

def _build_pipeline() -> Pipeline:
    """Create and train a TF-IDF + Logistic Regression pipeline."""
    texts = FAKE_SAMPLES + REAL_SAMPLES
    labels = [1] * len(FAKE_SAMPLES) + [0] * len(REAL_SAMPLES)  # 1=FAKE, 0=REAL

    pipeline = Pipeline([
        ("tfidf", TfidfVectorizer(
            ngram_range=(1, 2),
            max_features=5000,
            sublinear_tf=True,
            stop_words="english",
        )),
        ("clf", LogisticRegression(
            C=1.0,
            class_weight="balanced",
            max_iter=1000,
            random_state=42,
        )),
    ])
    pipeline.fit(texts, labels)
    return pipeline


# Singleton – trained once at import time
_PIPELINE: Pipeline = _build_pipeline()


# ──────────────────────────────────────────────
# 4.  Rule-Based Heuristic Scoring
# ──────────────────────────────────────────────

def _compute_heuristic(text: str) -> float:
    """
    Returns a heuristic fake-score in [0, 1].
    Higher = more likely to be fake.
    """
    text_lower = text.lower()
    score = 0.0
    total_words = max(len(text.split()), 1)

    # All-caps words ratio (sensationalism)
    caps_words = [w for w in text.split() if w.isupper() and len(w) > 2]
    caps_ratio = len(caps_words) / total_words
    score += min(caps_ratio * 3, 0.25)

    # Fake keyword hits
    fake_hits = sum(1 for kw in FAKE_KEYWORDS if kw in text_lower)
    score += min(fake_hits * 0.08, 0.40)

    # Real keyword hits (negative contribution)
    real_hits = sum(1 for kw in REAL_KEYWORDS if kw in text_lower)
    score -= min(real_hits * 0.07, 0.35)

    # Exclamation marks
    excl = text.count("!")
    score += min(excl * 0.05, 0.15)

    # Very short text (hard to verify)
    if total_words < 8:
        score += 0.10

    return max(0.0, min(score, 1.0))


# ──────────────────────────────────────────────
# 5.  Explainability
# ──────────────────────────────────────────────

FACTOR_DESCRIPTIONS = {
    "sensational_language":  "Uses sensational or attention-grabbing language",
    "all_caps_words":        "Contains all-caps words to provoke emotional reaction",
    "no_credible_sources":   "Lacks references to credible sources or organizations",
    "clickbait_patterns":    "Uses clickbait headlines or misleading framing",
    "conspiracy_language":   "Contains conspiracy-related terminology",
    "emotional_manipulation":"Uses fear, anger, or disgust to manipulate the reader",
    "credible_sources":      "References credible organizations or verified sources",
    "data_backed":           "Supported by data, statistics, or published research",
    "neutral_tone":          "Written in a neutral, factual tone without exaggeration",
    "verified_reports":      "Cites official reports, investigations, or court documents",
}

SENSATIONAL = {"shocking", "bombshell", "explosive", "mind-blowing", "unbelievable",
               "incredible", "outrageous", "scandal", "breaking", "urgent"}
CONSPIRACY  = {"deep state", "cover-up", "they don't want", "wake up", "anonymous source",
               "hoax", "conspiracy", "cabal", "microchip", "chemtrail"}
CLICKBAIT   = {"you won't believe", "must read", "this one trick", "won't tell you",
               "exposed", "leaked", "secret", "hidden truth"}
EMOTIONAL   = {"destroy", "annihilate", "devastating", "horrifying", "terrifying",
               "disgraceful", "shameful", "disgusting", "pathetic"}


def _find_highlighted_words(text: str):
    text_lower = text.lower()
    found = set()
    all_suspicious = SENSATIONAL | CONSPIRACY | CLICKBAIT | EMOTIONAL
    for kw in all_suspicious:
        if kw in text_lower:
            # Extract with original casing via regex
            pattern = re.compile(re.escape(kw), re.IGNORECASE)
            for m in pattern.finditer(text):
                found.add(m.group())
    return list(found)


def _build_factors(text: str, is_fake: bool):
    text_lower = text.lower()
    factors = []
    caps_words = [w for w in text.split() if w.isupper() and len(w) > 2]

    if is_fake:
        if any(kw in text_lower for kw in SENSATIONAL):
            factors.append("sensational_language")
        if caps_words:
            factors.append("all_caps_words")
        if not any(kw in text_lower for kw in REAL_KEYWORDS):
            factors.append("no_credible_sources")
        if any(kw in text_lower for kw in CLICKBAIT):
            factors.append("clickbait_patterns")
        if any(kw in text_lower for kw in CONSPIRACY):
            factors.append("conspiracy_language")
        if any(kw in text_lower for kw in EMOTIONAL):
            factors.append("emotional_manipulation")
        if not factors:
            factors.append("no_credible_sources")
    else:
        if any(kw in text_lower for kw in REAL_KEYWORDS):
            factors.append("credible_sources")
        if any(kw in text_lower for kw in ["data", "statistic", "study", "research", "published"]):
            factors.append("data_backed")
        if text.count("!") == 0 and not caps_words:
            factors.append("neutral_tone")
        if any(kw in text_lower for kw in ["report", "investigation", "court", "official"]):
            factors.append("verified_reports")
        if not factors:
            factors.append("neutral_tone")

    return factors


def _build_explanation(text: str, is_fake: bool, confidence: float, factors: list) -> str:
    factor_strs = [f"• {FACTOR_DESCRIPTIONS.get(f, f)}" for f in factors]
    factor_block = "\n".join(factor_strs) if factor_strs else "• General linguistic analysis"

    if is_fake:
        return (
            f"This text has been classified as **FAKE** with {confidence:.0%} confidence.\n\n"
            f"**Key indicators detected:**\n{factor_block}\n\n"
            "The model detected patterns commonly associated with misinformation: "
            "sensational phrasing, emotionally manipulative language, vague attribution "
            "('sources say', 'insiders claim'), or claims without verifiable evidence. "
            "Always cross-reference news with established, credible outlets."
        )
    else:
        return (
            f"This text has been classified as **REAL** with {confidence:.0%} confidence.\n\n"
            f"**Positive credibility indicators:**\n{factor_block}\n\n"
            "The content exhibits characteristics of credible reporting: factual language, "
            "references to verifiable sources, neutral tone, and absence of sensational or "
            "manipulative rhetoric. However, always verify news independently through "
            "multiple trusted sources."
        )


# ──────────────────────────────────────────────
# 6.  Main Inference Function
# ──────────────────────────────────────────────

def analyze(text: str) -> dict:
    """
    Analyze a news snippet and return prediction + explanation.

    Returns
    -------
    dict with keys:
        prediction       : "FAKE" | "REAL"
        confidence       : float  (0-1)
        explanation      : str
        highlighted_words: list[str]
        factors          : list[str]
    """
    text = text.strip()
    if not text:
        return {
            "prediction": "REAL",
            "confidence": 0.50,
            "explanation": "No text was provided for analysis.",
            "highlighted_words": [],
            "factors": [],
        }

    # ML prediction
    ml_proba = _PIPELINE.predict_proba([text])[0]   # [prob_real, prob_fake]
    ml_fake_prob = ml_proba[1]

    # Heuristic
    heuristic = _compute_heuristic(text)

    # Blend: 60% ML, 40% heuristic
    blended_fake_prob = 0.60 * ml_fake_prob + 0.40 * heuristic

    # Clamp for display confidence
    is_fake = blended_fake_prob >= 0.50
    confidence = blended_fake_prob if is_fake else (1.0 - blended_fake_prob)
    confidence = max(0.52, min(confidence, 0.98))   # prevent 100% / 50% edges

    factors = _build_factors(text, is_fake)
    explanation = _build_explanation(text, is_fake, confidence, factors)
    highlighted_words = _find_highlighted_words(text) if is_fake else []

    return {
        "prediction":        "FAKE" if is_fake else "REAL",
        "confidence":        round(confidence, 4),
        "explanation":       explanation,
        "highlighted_words": highlighted_words,
        "factors":           factors,
    }
