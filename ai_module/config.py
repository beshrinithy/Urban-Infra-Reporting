"""
Configuration loader for AI module
Loads settings from environment variables with fallback defaults
"""

import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class Config:
    """AI Module Configuration"""
    
    # Service
    PORT = int(os.getenv('AI_SERVICE_PORT', 8000))
    HOST = os.getenv('AI_SERVICE_HOST', '0.0.0.0')
    
    # Fusion Weights
    FUSION_WEIGHT_IMAGE = float(os.getenv('AI_FUSION_WEIGHT_IMAGE', 0.6))
    FUSION_WEIGHT_TEXT = float(os.getenv('AI_FUSION_WEIGHT_TEXT', 0.4))
    
    # Severity Thresholds
    SEVERITY_THRESHOLD_CRITICAL = float(os.getenv('AI_SEVERITY_THRESHOLD_CRITICAL', 0.85))
    SEVERITY_THRESHOLD_HIGH = float(os.getenv('AI_SEVERITY_THRESHOLD_HIGH', 0.70))
    SEVERITY_THRESHOLD_MODERATE = float(os.getenv('AI_SEVERITY_THRESHOLD_MODERATE', 0.50))
    
    # Duplicate Detection
    DUPLICATE_THRESHOLD = float(os.getenv('AI_DUPLICATE_THRESHOLD', 0.75))
    
    # Performance
    ENABLE_GPU = os.getenv('ENABLE_GPU', 'true').lower() == 'true'
    BATCH_SIZE = int(os.getenv('AI_BATCH_SIZE', 32))
    
    # Model Versions
    TEXT_MODEL_VERSION = os.getenv('TEXT_MODEL_VERSION', 'v1.0')
    SEVERITY_MODEL_VERSION = os.getenv('SEVERITY_MODEL_VERSION', 'v1.0')
    IMAGE_MODEL = os.getenv('IMAGE_MODEL', 'MobileNetV2')
    
    # Logging
    LOG_LEVEL = os.getenv('LOG_LEVEL', 'INFO')
    LOG_FILE = os.getenv('LOG_FILE', 'logs/ai_service.log')
    
    @classmethod
    def validate(cls):
        """Validate configuration"""
        # Check fusion weights sum to 1.0
        total = cls.FUSION_WEIGHT_IMAGE + cls.FUSION_WEIGHT_TEXT
        if abs(total - 1.0) > 0.01:
            raise ValueError(f"Fusion weights must sum to 1.0, got {total}")
        
        # Check thresholds are in valid range
        for threshold in [cls.SEVERITY_THRESHOLD_CRITICAL, cls.SEVERITY_THRESHOLD_HIGH, cls.SEVERITY_THRESHOLD_MODERATE]:
            if not 0 <= threshold <= 1:
                raise ValueError(f"Threshold must be between 0 and 1, got {threshold}")
        
        return True

# Validate on import
Config.validate()
