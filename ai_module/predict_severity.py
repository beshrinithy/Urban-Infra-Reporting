"""
predict_severity.py — ML-based severity prediction with critical keyword override.

Loads the active severity model from model_registry (version-controlled).
API contract is unchanged: predict_severity(category, confidence, duplicate_flag, description) → str
"""

import pandas as pd
from model_registry import get_severity_model

# Critical keywords that always trigger Critical severity (safety override)
CRITICAL_KEYWORDS = ["fire", "blood", "explosion", "gas leak", "electrocution", "collapse"]

# ── Load active model version at module startup ────────────────────────────
try:
    severity_model, feature_names, _active_version = get_severity_model()
    USE_ML_SEVERITY = True
    print(f"✅ predict_severity: using ML model (version={_active_version})")
except Exception as e:
    USE_ML_SEVERITY = False
    severity_model = None
    feature_names = None
    _active_version = "fallback"
    print(f"⚠️  predict_severity: ML model unavailable ({e}). Using rule-based fallback.")


def has_critical_keyword(description: str) -> bool:
    """Check if description contains critical safety keywords."""
    desc_lower = description.lower()
    return any(keyword in desc_lower for keyword in CRITICAL_KEYWORDS)


def predict_severity(category: str, confidence: float, duplicate_flag: int, description: str) -> str:
    """
    Predict severity using ML model with critical keyword override.

    Args:
        category:       Issue category (Road, Garbage, Water, Electricity, Other)
        confidence:     Classification confidence (0.0–1.0)
        duplicate_flag: Whether issue is duplicate (0 or 1)
        description:    Issue description text

    Returns:
        One of ["Critical", "High", "Moderate", "Low"]
    """
    # SAFETY OVERRIDE: Critical keywords always return Critical
    if has_critical_keyword(description):
        return "Critical"

    if USE_ML_SEVERITY:
        urgent_keywords = ["accident", "danger", "emergency", "flood", "burst", "sparking", "leaking"]
        urgent_flag = 1 if any(kw in description.lower() for kw in urgent_keywords) else 0
        description_length = len(description)

        # One-hot encode category
        categories = ["Electricity", "Garbage", "Other", "Road", "Water"]
        cat_features = {f"cat_{cat}": 1 if cat == category else 0 for cat in categories}

        features = {
            **cat_features,
            "confidence": confidence,
            "duplicate_flag": duplicate_flag,
            "urgent_flag": urgent_flag,
            "description_length": description_length
        }

        feature_df = pd.DataFrame([features], columns=feature_names)
        return severity_model.predict(feature_df)[0]

    # ── Rule-based fallback ────────────────────────────────────────────────
    urgent_keywords = ["accident", "danger", "emergency", "flood", "burst", "sparking", "leaking"]
    urgent_flag = 1 if any(kw in description.lower() for kw in urgent_keywords) else 0

    if urgent_flag:
        return "High"
    elif confidence > 0.8 and category in ["Road", "Water", "Electricity"]:
        return "High"
    elif confidence < 0.6:
        return "Low"
    return "Moderate"


def get_model_version() -> str:
    """Returns the active model version string (e.g. 'v1'). Used for logging."""
    return _active_version


# ── Standalone test ────────────────────────────────────────────────────────
if __name__ == "__main__":
    test_cases = [
        ("Road",        0.9,  0, "Big pothole on highway"),
        ("Garbage",     0.5,  1, "Trash overflowing"),
        ("Water",       0.85, 0, "Pipe burst causing flood"),
        ("Electricity", 0.7,  0, "Streetlight not working"),
        ("Other",       0.6,  0, "Tree fallen blocking road"),
        ("Road",        0.9,  0, "Fire on the highway"),  # Critical override
    ]
    print(f"\n🧪 Testing Severity Prediction (model version: {get_model_version()}):\n")
    for cat, conf, dup, desc in test_cases:
        sev = predict_severity(cat, conf, dup, desc)
        print(f"{cat:12s} | conf={conf:.2f} | dup={dup} | '{desc[:30]:30s}' → {sev}")
