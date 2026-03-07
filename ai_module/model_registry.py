"""
model_registry.py — Central version-controlled model loader.

Reads models/registry.json to determine the active version for each model type,
loads the corresponding artifacts into memory, and exposes getter functions to
the rest of the AI module.

Usage:
    from model_registry import get_category_model, get_severity_model, get_active_versions
"""

import os
import json
import joblib
import logging

logger = logging.getLogger("model_registry")

# ── Paths ──────────────────────────────────────────────────────────────────
_BASE = os.path.dirname(__file__)
_MODELS_DIR = os.path.join(_BASE, "models")
_REGISTRY_PATH = os.path.join(_MODELS_DIR, "registry.json")

# ── In-memory model store ──────────────────────────────────────────────────
_store = {
    "category": {
        "model": None,
        "vectorizer": None,
        "version": None,
        "metrics": {}
    },
    "severity": {
        "model": None,
        "vectorizer": None,   # stores feature_names for severity
        "version": None,
        "metrics": {}
    }
}


def _load_registry() -> dict:
    """Read registry.json and return parsed dict."""
    if not os.path.exists(_REGISTRY_PATH):
        raise FileNotFoundError(
            f"registry.json not found at {_REGISTRY_PATH}. "
            "Please create models/registry.json with current_version entries."
        )
    with open(_REGISTRY_PATH, "r") as f:
        return json.load(f)


def _load_metrics(model_type: str, version: str) -> dict:
    """Load metrics.json for a given model type and version."""
    metrics_path = os.path.join(_MODELS_DIR, model_type, version, "metrics.json")
    if os.path.exists(metrics_path):
        with open(metrics_path, "r") as f:
            return json.load(f)
    return {}


def _load_model_artifacts(model_type: str, version: str):
    """
    Load model and vectorizer joblib files for the given model_type/version.
    Returns (model, vectorizer, metrics).
    """
    version_dir = os.path.join(_MODELS_DIR, model_type, version)

    model_path = os.path.join(version_dir, "model.joblib")
    vectorizer_path = os.path.join(version_dir, "vectorizer.joblib")

    if not os.path.exists(model_path):
        raise FileNotFoundError(f"Model artifact not found: {model_path}")
    if not os.path.exists(vectorizer_path):
        raise FileNotFoundError(f"Vectorizer artifact not found: {vectorizer_path}")

    model = joblib.load(model_path)
    vectorizer = joblib.load(vectorizer_path)
    metrics = _load_metrics(model_type, version)

    return model, vectorizer, metrics


def load_all_models():
    """
    Load all models defined in registry.json into the in-memory store.
    Called once at application startup.
    """
    registry = _load_registry()

    for model_type in ("category", "severity"):
        if model_type not in registry:
            logger.warning(f"[model_registry] '{model_type}' not found in registry.json — skipping")
            continue

        version = registry[model_type]["current_version"]
        try:
            model, vectorizer, metrics = _load_model_artifacts(model_type, version)
            _store[model_type]["model"] = model
            _store[model_type]["vectorizer"] = vectorizer
            _store[model_type]["version"] = version
            _store[model_type]["metrics"] = metrics

            accuracy = metrics.get("accuracy", "N/A")
            logger.info(
                f"[model_registry] Loaded {model_type} model "
                f"version={version} accuracy={accuracy}"
            )
            print(
                f"✅ [model_registry] {model_type.capitalize()} model loaded "
                f"(version={version}, accuracy={accuracy})"
            )
        except Exception as e:
            logger.error(f"[model_registry] Failed to load {model_type} model v{version}: {e}")
            print(f"⚠️  [model_registry] {model_type} model load failed: {e}")


def get_category_model():
    """
    Returns (model, vectorizer, version) for the active category model.
    Raises RuntimeError if models have not been loaded yet.
    """
    entry = _store["category"]
    if entry["model"] is None:
        raise RuntimeError("Category model not loaded. Call load_all_models() first.")
    return entry["model"], entry["vectorizer"], entry["version"]


def get_severity_model():
    """
    Returns (model, feature_names, version) for the active severity model.
    feature_names is the vectorizer artifact (sklearn feature list for severity).
    Raises RuntimeError if models have not been loaded yet.
    """
    entry = _store["severity"]
    if entry["model"] is None:
        raise RuntimeError("Severity model not loaded. Call load_all_models() first.")
    return entry["model"], entry["vectorizer"], entry["version"]


def get_active_versions() -> dict:
    """
    Returns currently loaded version strings for all model types.
    Safe to call before load_all_models() — returns None for unloaded models.
    Example: {'category': 'v1', 'severity': 'v1'}
    """
    return {
        model_type: _store[model_type]["version"]
        for model_type in _store
    }


def get_model_info() -> dict:
    """
    Returns full metadata for all loaded models — versions + metrics.
    Used by the GET /models/info endpoint.
    """
    return {
        model_type: {
            "version": _store[model_type]["version"],
            "metrics": _store[model_type]["metrics"]
        }
        for model_type in _store
    }
