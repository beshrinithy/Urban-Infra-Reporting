"""
predict_category.py — Text-based category prediction.

Loads the active category model from model_registry (version-controlled).
API contract is unchanged: predict_category(description) → dict[str, float]
"""

from model_registry import get_category_model

CATEGORIES = ["Road", "Garbage", "Water", "Electricity", "Other"]

# ── Load active model version at module startup ────────────────────────────
try:
    model, vectorizer, _active_version = get_category_model()
    USE_ML_MODEL = True
    print(f"✅ predict_category: using ML model (version={_active_version})")
except Exception as e:
    USE_ML_MODEL = False
    model = None
    vectorizer = None
    _active_version = "fallback"
    print(f"⚠️  predict_category: ML model unavailable ({e}). Using keyword fallback.")


def predict_category(description: str) -> dict:
    """
    Predict category probabilities from text description.

    Returns:
        dict[str, float] — mapping of category → probability.
        Example: {"Road": 0.91, "Garbage": 0.03, ...}

    Model version used is logged via model_registry; the return type is
    identical regardless of whether ML or fallback path is taken.
    """

    if USE_ML_MODEL:
        text_tfidf = vectorizer.transform([description])
        proba = model.predict_proba(text_tfidf)[0]
        # Use model.classes_ to guarantee correct label order
        return dict(zip(model.classes_, [float(p) for p in proba]))

    # ── Keyword-based fallback ─────────────────────────────────────────────
    text = description.lower()
    probs = {cat: 0.05 for cat in CATEGORIES}

    if any(w in text for w in ["pothole", "road", "street", "highway", "asphalt", "traffic"]):
        probs["Road"] += 0.8
    elif any(w in text for w in ["garbage", "waste", "trash", "dump", "bin", "rubbish"]):
        probs["Garbage"] += 0.8
    elif any(w in text for w in ["water", "leak", "pipe", "sewage", "flood", "drain"]):
        probs["Water"] += 0.8
    elif any(w in text for w in ["electric", "light", "power", "wire", "pole", "outage"]):
        probs["Electricity"] += 0.8
    else:
        probs["Other"] += 0.8

    total = sum(probs.values())
    return {cat: probs[cat] / total for cat in probs}


def get_model_version() -> str:
    """Returns the active model version string (e.g. 'v1'). Used for logging."""
    return _active_version


# ── Standalone test ────────────────────────────────────────────────────────
if __name__ == "__main__":
    desc = input("Enter issue description: ")
    result = predict_category(desc)
    print(f"\nModel version: {get_model_version()}")
    print("AI Suggested Category Probabilities:")
    for cat, prob in sorted(result.items(), key=lambda x: x[1], reverse=True):
        print(f"  {cat}: {prob:.2%}")
    print(f"\nTop Prediction: {max(result, key=result.get)}")
