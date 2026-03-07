/**
 * In-Memory Queue Service
 * Replaces the Redis/BullMQ queue to run without external dependencies.
 */
const logger = require('../config/logger').api || console;
const { processReportAnalysis } = require('../workers/aiWorker');

/**
 * Enqueue a report for AI analysis.
 * @param {number} reportId
 * @param {object} reportData - { title, description, image, traceId, contactEmail, contactPhone }
 */
async function enqueueReport(reportId, reportData) {
    try {
        // Fire and forget — process immediately but async
        setTimeout(() => {
            console.log(`📥 In-Memory Job started for report ${reportId}`);
            processReportAnalysis({ reportId, ...reportData })
                .then(() => console.log(`✅ Job completed for report ${reportId}`))
                .catch(err => console.error(`❌ Job failed for report ${reportId}:`, err.message));
        }, 0);

        return `mem-job-${reportId}-${Date.now()}`;
    } catch (err) {
        console.error(`[Queue] Failed to enqueue report ${reportId}:`, err.message);
        return null;
    }
}

/**
 * Backward-compatible wrapper so reportController.js doesn't need changes.
 * Usage: queueService.addToQueue('ANALYSIS_JOB', { reportId, ... })
 */
function addToQueue(type, data) {
    const { reportId, ...rest } = data;
    return enqueueReport(reportId, rest);
}

module.exports = {
    enqueueReport,
    addToQueue
};
