"""
GPU Status Endpoint for System Health Monitoring
Returns GPU availability and device information
"""

from fastapi import APIRouter
import tensorflow as tf

router = APIRouter()

@router.get("/gpu")
def get_gpu_status():
    """Get GPU device information"""
    try:
        gpus = tf.config.list_physical_devices('GPU')
        
        if gpus:
            gpu_info = []
            for i, gpu in enumerate(gpus):
                gpu_info.append({
                    "id": i,
                    "name": gpu.name,
                    "device_type": gpu.device_type
                })
            
            return {
                "available": True,
                "count": len(gpus),
                "devices": gpu_info,
                "cuda_built": tf.test.is_built_with_cuda()
            }
        else:
            return {
                "available": False,
                "count": 0,
                "devices": [],
                "cuda_built": tf.test.is_built_with_cuda(),
                "message": "No GPU detected. Running on CPU."
            }
    except Exception as e:
        return {
            "available": False,
            "count": 0,
            "devices": [],
            "error": str(e)
        }

@router.get("/config")
def get_config():
    """Get current AI configuration"""
    from config import Config
    
    return {
        "fusion_weights": {
            "image": Config.FUSION_WEIGHT_IMAGE,
            "text": Config.FUSION_WEIGHT_TEXT
        },
        "severity_thresholds": {
            "critical": Config.SEVERITY_THRESHOLD_CRITICAL,
            "high": Config.SEVERITY_THRESHOLD_HIGH,
            "moderate": Config.SEVERITY_THRESHOLD_MODERATE
        },
        "duplicate_threshold": Config.DUPLICATE_THRESHOLD,
        "model_versions": {
            "text": Config.TEXT_MODEL_VERSION,
            "severity": Config.SEVERITY_MODEL_VERSION,
            "image": Config.IMAGE_MODEL
        },
        "performance": {
            "gpu_enabled": Config.ENABLE_GPU,
            "batch_size": Config.BATCH_SIZE
        }
    }
