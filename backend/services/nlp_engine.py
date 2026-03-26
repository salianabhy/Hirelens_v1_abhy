import warnings
warnings.filterwarnings("ignore", message=".*LibreSSL.*")
warnings.filterwarnings("ignore", message=".*NotOpenSSLWarning.*")

import pickle
import os
import re
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

try:
    import spacy
    nlp = spacy.load("en_core_web_sm")
except Exception:
    nlp = None
    print("Warning: spaCy model not found. NLP impact analysis degraded. Run: python -m spacy download en_core_web_sm")

# -------------------------------------------------------
# Load the pre-trained XGBoost/GB model (if available)
# -------------------------------------------------------
MODEL_PATH = os.path.join(os.path.dirname(__file__), "..", "models", "ats_model.pkl")
_ml_bundle = None

def _load_model():
    global _ml_bundle
    if _ml_bundle is None and os.path.exists(MODEL_PATH):
        with open(MODEL_PATH, "rb") as f:
            _ml_bundle = pickle.load(f)
    return _ml_bundle

# -------------------------------------------------------
# Helpers
# -------------------------------------------------------
POWER_VERBS = [
    "led", "built", "designed", "developed", "increased", "reduced",
    "managed", "deployed", "optimised", "delivered", "launched", "scaled",
    "architected", "automated", "improved", "created", "implemented",
    "negotiated", "mentored", "collaborated",
]

SECTION_KEYWORDS = {
    "education": ["education", "university", "college", "bachelor", "master", "degree", "phd"],
    "experience": ["experience", "employment", "work history", "professional"],
    "skills":    ["skills", "technologies", "tools", "competencies", "proficiencies"],
    "projects":  ["projects", "portfolio", "github"],
    "summary":   ["summary", "objective", "profile"],
}

FEATURE_ORDER = [
    "has_education","has_experience","has_skills","has_projects","has_summary",
    "word_count","too_short","too_long","power_verb_count","metric_count",
    "has_email","has_phone","has_linkedin","has_github","tech_keyword_count",
    "yoe_max","date_range_years",
]

def extract_features(text: str) -> dict:
    lower = text.lower()
    words = text.split()

    features = {f"has_{s}": int(any(k in lower for k in kws)) for s, kws in SECTION_KEYWORDS.items()}

    wc = len(words)
    features["word_count"]  = min(wc, 1500)
    features["too_short"]   = int(wc < 150)
    features["too_long"]    = int(wc > 1400)
    features["power_verb_count"] = sum(1 for w in words if w.lower().rstrip(".,;:") in POWER_VERBS)
    features["metric_count"] = len(re.findall(r'\d+[\.,]?\d*\s*(?:%|percent|million|k\b|x\b|users?|customers?)?', text, re.IGNORECASE))
    features["has_email"] = int(bool(re.search(r'[\w.-]+@[\w.-]+\.\w+', text)))
    features["has_phone"] = int(bool(re.search(r'(\+?\d[\d\s\-\(\)]{8,}\d)', text)))
    features["has_linkedin"] = int("linkedin" in lower)
    features["has_github"]   = int("github" in lower)

    tech_words = ["python","javascript","react","node","aws","sql","docker","kubernetes","git","api","machine learning","tensorflow","pytorch","java","typescript","golang","rust","mongodb","postgresql","c++"]
    features["tech_keyword_count"] = sum(1 for t in tech_words if t in lower)

    years = re.findall(r'(\d+)\+?\s*(?:years?|yrs?)', lower)
    features["yoe_max"] = max([int(y) for y in years], default=0)

    date_pairs = re.findall(r'(20\d{2})\s*(?:-|to|–)\s*(20\d{2}|present|current)', lower)
    total = 0
    for s, e in date_pairs:
        end = 2026 if e in ["present","current"] else int(e)
        total += max(0, end - int(s))
    features["date_range_years"] = min(total, 20)

    return features

def _tfidf_similarity(resume: str, jd: str) -> float:
    try:
        vec = TfidfVectorizer(stop_words="english")
        mat = vec.fit_transform([jd, resume])
        return float(cosine_similarity(mat[0:1], mat[1:2])[0][0])
    except Exception:
        return 0.0

def _spacy_impact(text: str) -> float:
    if not nlp:
        return 0.5
    doc = nlp(text[:10000])  # cap for performance
    verbs   = sum(1 for t in doc if t.pos_ == "VERB")
    metrics = sum(1 for e in doc.ents if e.label_ in ("CARDINAL","PERCENT","MONEY"))
    return min(1.0, (verbs * 0.04) + (metrics * 0.07))

# -------------------------------------------------------
# Public entry point
# -------------------------------------------------------
DEFAULT_JD = ("software engineer developer python javascript react node aws cloud "
              "frontend backend machine learning data sql agile leadership communication "
              "REST API architecture git docker kubernetes")

def rank_resume(resume_text: str, job_description: str = "") -> dict:
    jd = job_description.strip() or DEFAULT_JD

    # --- ML model prediction (if trained) ---------------------
    bundle = _load_model()
    if bundle:
        feats = extract_features(resume_text)
        vec   = [feats.get(k, 0) for k in FEATURE_ORDER]
        ml_score = float(np.clip(bundle["model"].predict([vec])[0], 10, 100))
    else:
        ml_score = None

    # --- TF-IDF keyword similarity ----------------------------
    sim = _tfidf_similarity(resume_text, jd)
    keyword_score = int(np.clip(sim * 380, 35, 100))

    # --- Rule-based formatting --------------------------------
    feats = extract_features(resume_text)
    formatting_score = 100
    if not feats["has_education"]:  formatting_score -= 15
    if not feats["has_experience"]: formatting_score -= 20
    if not feats["has_skills"]:     formatting_score -= 15
    if feats["too_short"]:          formatting_score -= 30
    if feats["too_long"]:           formatting_score -= 10
    formatting_score = max(0, formatting_score)

    # --- spaCy impact score -----------------------------------
    impact_raw   = _spacy_impact(resume_text)
    impact_score = int(np.clip(40 + impact_raw * 60, 35, 100))

    # --- Final composite score --------------------------------
    if ml_score is not None:
        # Weight: ML model 50 %, keyword 30 %, formatting 20 %
        ats_score = int(ml_score * 0.5 + keyword_score * 0.3 + formatting_score * 0.2)
    else:
        ats_score = int(keyword_score * 0.5 + formatting_score * 0.3 + impact_score * 0.2)

    ats_score = int(np.clip(ats_score, 10, 100))

    # --- Human-readable feedback ------------------------------
    improvements = []
    issues = []

    if formatting_score < 75:
        improvements.append("Add distinct sections: Education, Experience, and Skills for ATS parsers to index you correctly.")
    if keyword_score < 60:
        improvements.append("Tailor your language. Incorporate exact keywords from your target job description.")
    if impact_score < 65:
        improvements.append("Quantify achievements using numbers and strong action verbs (e.g. 'Increased revenue by 30%').")
    if not feats["has_linkedin"]:
        improvements.append("Add a LinkedIn profile URL to increase recruiter trust signals.")
    if not feats["has_github"] and feats["tech_keyword_count"] > 2:
        improvements.append("Include a GitHub link — it significantly boosts credibility for technical roles.")

    if feats["too_short"]:
        issues.append({"label": "Resume Too Short", "desc": "Less than 150 words detected. ATS systems need enough content to parse correctly.", "sev": "Critical"})
    if not feats["has_experience"]:
        issues.append({"label": "Missing Experience Section", "desc": "No recognisable 'Experience' section found. This is the most heavily weighted ATS factor.", "sev": "Critical"})
    if feats["yoe_max"] == 0 and feats["date_range_years"] == 0:
        issues.append({"label": "No Experience Dates", "desc": "Cannot infer tenure. Ensure role date ranges are present (e.g. Jan 2020 – Present).", "sev": "Medium"})

    if not improvements:
        improvements.append("Great structure! Fine-tune your summary to match the specific company's values.")

    risk = "Low Risk" if ats_score > 75 else "Medium Risk" if ats_score > 50 else "High Risk"

    return {
        "score":       ats_score,
        "ats":         min(100, ats_score),
        "keyword":     keyword_score,
        "formatting":  formatting_score,
        "impact":      impact_score,
        "improvements": improvements,
        "issues":      issues,
        "risk":        risk,
        "yoe":         feats["yoe_max"] or feats["date_range_years"],
        "ml_model_used": bundle is not None,
    }
