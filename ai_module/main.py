from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from pydantic import BaseModel
from typing import List, Optional
import time
import json
import logging

# Version-controlled model registry — must be imported before predict modules
from model_registry import load_all_models, get_active_versions, get_model_info

# Import local AI logic
from predict_category import predict_category, get_model_version as get_category_version
from predict_severity import get_model_version as get_severity_version
from priority_scoring import calculate_priority
from duplicate_detection import is_duplicate
from image_classifier import classify_image
from health_routes import router as health_router
from logger import logger, log_with_trace

_log = logging.getLogger("ai_service")

app = FastAPI(title="Urban AI Backend", version="1.0")

# Include health monitoring routes
app.include_router(health_router, prefix="/health", tags=["health"])

class IssueRequest(BaseModel):
    description: str

class PriorityRequest(BaseModel):
    category: str
    duplicate_count: int
    description: str

class DuplicateRequest(BaseModel):
    new_issue: str
    existing_issues: List[str]

@app.get("/")
def home():
    return {"message": "AI Module is running. Ready to process urban issues."}

@app.post("/predict/category")
def get_category(req: IssueRequest):
    try:
        # Backward compatibility: Return just the class string
        probs = predict_category(req.description)
        best_cat = max(probs, key=probs.get)
        return {"category": best_cat}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/predict/priority")
def get_priority(req: PriorityRequest):
    try:
        priority = calculate_priority(req.category, req.duplicate_count, req.description)
        return {"priority": priority}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/detect/duplicate")
def check_duplicate(req: DuplicateRequest):
    try:
        if not req.existing_issues:
            return {"is_duplicate": False, "score": 0.0}
            
        is_dup, score = is_duplicate(req.new_issue, req.existing_issues)
        return {"is_duplicate": bool(is_dup), "score": float(score)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/predict/image")
async def get_image_category(file: UploadFile = File(...)):
    try:
        # Backward compatibility
        contents = await file.read()
        probs, device = classify_image(contents)
        best_cat = max(probs, key=probs.get)
        confidence = probs[best_cat]
        return {"category": best_cat, "confidence": confidence, "device": device}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/predict/multimodal")
async def predict_multimodal(
    description: str = Form(...),
    traceId: str = Form("unknown"),
    file: UploadFile = File(None)
):
    print(f"🔥 INFERENCE CALLED [Trace:{traceId}]")  # Track inference calls
    try:
        start_total = time.time()  # End-to-end latency tracking
        
        # 1. Text Analysis
        t0 = time.time()
        text_probs = predict_category(description)
        text_inference_ms = (time.time() - t0) * 1000
        
        text_confidence = max(text_probs.values())
        text_top_category = max(text_probs, key=text_probs.get)
        
        # 2. Image Analysis
        image_probs = None
        device = "CPU"
        image_confidence = 0.0
        image_top_category = None
        image_inference_ms = 0.0
        
        if file:
            print("📸 Image inference running...")
            t0 = time.time()
            contents = await file.read()
            image_probs, device = classify_image(contents)
            image_inference_ms = (time.time() - t0) * 1000
            
            image_confidence = max(image_probs.values())
            image_top_category = max(image_probs, key=image_probs.get)
            
        # 3. Fusion Logic
        # Load fusion weights from config
        from config import Config
        WEIGHT_IMAGE = Config.FUSION_WEIGHT_IMAGE
        WEIGHT_TEXT = Config.FUSION_WEIGHT_TEXT
        
        CATEGORIES = ["Road", "Garbage", "Water", "Electricity", "Other"]
        final_probs = {}
        
        for cat in CATEGORIES:
            t_p = text_probs.get(cat, 0.0)
            if image_probs:
                i_p = image_probs.get(cat, 0.0)
                final_probs[cat] = (WEIGHT_IMAGE * i_p) + (WEIGHT_TEXT * t_p)
            else:
                # Fallback to pure text if no image
                final_probs[cat] = t_p
        
        # Normalize fused probabilities (mathematical correctness)
        total_prob = sum(final_probs.values())
        if total_prob > 0:
            for cat in final_probs:
                final_probs[cat] /= total_prob

        # 4. Category Result
        predicted_category = max(final_probs, key=final_probs.get)
        confidence = final_probs[predicted_category]
        
        # 5. Severity Prediction (ML-based with critical override)
        from predict_severity import predict_severity
        duplicate_flag = 0  # TODO: Integrate with duplicate detection
        severity = predict_severity(predicted_category, confidence, duplicate_flag, description)
        
        # Confidence dampening if duplicate
        if duplicate_flag:
            confidence *= 0.9
        
        # 6. Explainability Metadata
        explanation = {
            "image_top_category": image_top_category,
            "image_confidence": round(image_confidence, 4) if image_probs else None,
            "text_top_category": text_top_category,
            "text_confidence": round(text_confidence, 4),
            "fusion_weights": {
                "image": WEIGHT_IMAGE,
                "text": WEIGHT_TEXT
            }
        }
        
        # 7. End-to-end latency
        pipeline_latency_ms = round((time.time() - start_total) * 1000, 2)
        
        # 8. Logging
        log_payload = {
            "traceId": traceId,
            "image_confidence": round(image_confidence, 4),
            "text_confidence": round(text_confidence, 4),
            "final_confidence": round(confidence, 4),
            "predicted_category": predicted_category,
            "severity": severity,
            "device_used": device,
            "text_inference_ms": round(text_inference_ms, 2),
            "image_inference_ms": round(image_inference_ms, 2),
            "pipeline_latency_ms": pipeline_latency_ms,
            "category_model_version": get_category_version(),
            "severity_model_version": get_severity_version()
        }
        print(json.dumps(log_payload)) # Structured logging
        
        return {
            "category": predicted_category, 
            "confidence": float(confidence),
            "severity": severity,
            "device": device,
            "explanation": explanation,
            "pipeline_latency_ms": pipeline_latency_ms,
            "metadata": log_payload
        }

    except Exception as e:
        print(f"Multimodal Inference Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# ── Info endpoint ─────────────────────────────────────────────────────────
@app.get("/models/info", tags=["models"])
def models_info():
    """
    Returns the currently active model versions and their metrics.
    Non-breaking addition — existing endpoints are unaffected.
    """
    return {
        "active_versions": get_active_versions(),
        "model_details": get_model_info()
    }


# ── Model Warmup on Startup ────────────────────────────────────────────────
@app.on_event("startup")
def warmup_models():
    """Load versioned models then warm up inference to prevent first-request latency spike."""
    try:
        # 1. Load all models from registry
        print("📦 Loading models from registry...")
        load_all_models()
        versions = get_active_versions()
        print(f"📋 Active model versions: {json.dumps(versions)}")

        # 2. Warmup inference
        print("🔥 Warming up models...")
        dummy_text = "road damaged near hospital"
        predict_category(dummy_text)
        print("✅ Model warmup complete")
    except Exception as e:
        print(f"⚠️  Warmup failed (non-critical): {e}")
