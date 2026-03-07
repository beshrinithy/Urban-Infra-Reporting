"""
Structured logging for AI module
Provides JSON-formatted logs with trace IDs and metadata
"""

import logging
import json
import os
from datetime import datetime
from logging.handlers import TimedRotatingFileHandler
from pathlib import Path

class JSONFormatter(logging.Formatter):
    """Format logs as JSON for machine parsing"""
    
    def format(self, record):
        log_data = {
            'timestamp': datetime.utcnow().isoformat() + 'Z',
            'level': record.levelname,
            'service': 'ai',
            'module': record.module,
            'function': record.funcName,
            'message': record.getMessage()
        }
        
        # Add trace ID if available
        if hasattr(record, 'traceId'):
            log_data['traceId'] = record.traceId
        
        # Add metadata if available
        if hasattr(record, 'metadata'):
            log_data['metadata'] = record.metadata
        
        # Add exception info if present
        if record.exc_info:
            log_data['exception'] = self.formatException(record.exc_info)
            log_data['stack_trace'] = self.formatException(record.exc_info)
        
        return json.dumps(log_data)


class SimpleFormatter(logging.Formatter):
    """Simple colored console formatter for development"""
    
    COLORS = {
        'DEBUG': '\033[36m',    # Cyan
        'INFO': '\033[32m',     # Green
        'WARNING': '\033[33m',  # Yellow
        'ERROR': '\033[31m',    # Red
        'CRITICAL': '\033[35m'  # Magenta
    }
    RESET = '\033[0m'
    
    def format(self, record):
        color = self.COLORS.get(record.levelname, self.RESET)
        timestamp = datetime.now().strftime('%H:%M:%S')
        
        log_msg = f"{color}{timestamp} [{record.levelname}]{self.RESET}"
        
        if hasattr(record, 'traceId'):
            log_msg += f" [{record.traceId[:8]}]"
        
        log_msg += f": {record.getMessage()}"
        
        if hasattr(record, 'metadata') and record.metadata:
            log_msg += f" {json.dumps(record.metadata)}"
        
        return log_msg


# Create logs directory
log_dir = Path(__file__).parent / 'logs'
log_dir.mkdir(exist_ok=True)

# Create logger
logger = logging.getLogger('urban_ai')
logger.setLevel(os.getenv('LOG_LEVEL', 'INFO'))

# Prevent duplicate logs
logger.propagate = False

# File handler with JSON formatting and rotation
file_handler = TimedRotatingFileHandler(
    log_dir / 'ai_service.log',
    when='midnight',
    interval=1,
    backupCount=7,
    encoding='utf-8'
)
file_handler.setFormatter(JSONFormatter())
file_handler.setLevel(logging.INFO)

# Error file handler
error_handler = TimedRotatingFileHandler(
    log_dir / 'error.log',
    when='midnight',
    interval=1,
    backupCount=14,
    encoding='utf-8'
)
error_handler.setFormatter(JSONFormatter())
error_handler.setLevel(logging.ERROR)

# Console handler with simple formatting
console_handler = logging.StreamHandler()
console_handler.setFormatter(SimpleFormatter())

# Add handlers
logger.addHandler(file_handler)
logger.addHandler(error_handler)
logger.addHandler(console_handler)


# Helper function for logging with trace ID
def log_with_trace(level, message, trace_id=None, **metadata):
    """
    Log a message with trace ID and metadata
    
    Args:
        level: Log level (info, warning, error, etc.)
        message: Log message
        trace_id: Request trace ID
        **metadata: Additional metadata to log
    """
    extra = {}
    if trace_id:
        extra['traceId'] = trace_id
    if metadata:
        extra['metadata'] = metadata
    
    getattr(logger, level)(message, extra=extra)
