const { v4: uuidv4 } = require('uuid');
const logger = require('../config/logger');

/**
 * Request logging middleware
 * Adds trace ID to each request and logs request/response details
 */
function requestLogger(req, res, next) {
    // Generate unique trace ID for this request
    req.traceId = uuidv4();

    // Attach trace ID to response headers for debugging
    res.setHeader('X-Trace-ID', req.traceId);

    // Log incoming request
    logger.api.info('Incoming request', {
        traceId: req.traceId,
        method: req.method,
        path: req.path,
        ip: req.ip,
        userAgent: req.get('user-agent')
    });

    // Track request timing
    const startTime = Date.now();

    // Log response when finished
    res.on('finish', () => {
        const duration = Date.now() - startTime;
        const logLevel = res.statusCode >= 400 ? 'warn' : 'info';

        logger.api[logLevel]('Request completed', {
            traceId: req.traceId,
            method: req.method,
            path: req.path,
            statusCode: res.statusCode,
            duration_ms: duration
        });
    });

    // Log errors
    res.on('error', (error) => {
        logger.api.error('Request error', {
            traceId: req.traceId,
            method: req.method,
            path: req.path,
            error: error.message,
            stack: error.stack
        });
    });

    next();
}

module.exports = requestLogger;
