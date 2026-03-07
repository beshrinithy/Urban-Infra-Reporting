/**
 * AI Worker
 * Processes report analysis jobs async.
 */
const { PrismaClient } = require('@prisma/client');
const axios = require('axios');
const FormData = require('form-data');
const notificationService = require('../services/notificationService');
const logger = require('../config/logger').worker;

const prisma = new PrismaClient();
const AI_URL = process.env.AI_API_URL || "http://127.0.0.1:8000";

// --- Core Job Processing Logic ---
async function processReportAnalysis(jobData) {
    const { reportId, description, image, title, traceId } = jobData;

    const jobLogger = logger.child({ traceId: traceId || `worker_${reportId}`, reportId });
    const jobStartTime = Date.now();

    jobLogger.info('Job processing started', { hasImage: !!image });

    try {
        const form = new FormData();
        form.append('description', description);
        form.append('traceId', traceId || `worker_${reportId}`);

        if (image) {
            jobLogger.info('Processing multimodal inference', {});
            try {
                const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
                const buffer = Buffer.from(base64Data, 'base64');
                form.append('file', buffer, { filename: 'report.jpg' });
            } catch (err) {
                jobLogger.warn('Invalid image format', { error: err.message });
            }
        }

        const aiStartTime = Date.now();
        const aiRes = await axios.post(`${AI_URL}/predict/multimodal`, form, {
            headers: { ...form.getHeaders() }
        });
        const aiDuration = Date.now() - aiStartTime;

        const ai = aiRes.data;
        jobLogger.info('AI analysis complete', {
            category: ai.category,
            confidence: parseFloat(ai.confidence.toFixed(2)),
            severity: ai.severity,
            ai_duration_ms: aiDuration
        });

        // Department mapping
        const deptMap = {
            "Road": "Roads & Transport",
            "Water": "Water Board",
            "Garbage": "Sanitation Dept",
            "Electricity": "Electricity Board",
            "Other": "General Administration"
        };
        const department = deptMap[ai.category] || "General Administration";

        // SLA Deadline
        const now = new Date();
        let hoursToAdd = 72;
        if (ai.severity === "Critical") hoursToAdd = 24;
        else if (ai.severity === "High") hoursToAdd = 48;
        const slaDeadline = new Date(now.getTime() + hoursToAdd * 60 * 60 * 1000);

        const severity = ai.severity || "Low";
        const duplicateFlag = ai.metadata?.duplicate_flag || 0;
        const finalTitle = duplicateFlag > 0.75 ? title + " [Duplicate?]" : title;

        // Build explainability object
        const explainability = {
            textModel: ai.metadata?.text_confidence ?? ai.confidence,
            imageModel: ai.metadata?.image_confidence ?? null,
            fusedScore: ai.confidence,
            device: ai.metadata?.device ?? 'CPU',
            latencyMs: aiDuration,
            fusionMethod: ai.metadata?.fusion_method ?? 'weighted_average'
        };

        // Update Database
        const updated = await prisma.report.update({
            where: { id: reportId },
            data: {
                title: finalTitle,
                category: ai.category,
                priority: severity === "Critical" || severity === "High" ? "High" : "Medium",
                severity: severity,
                department: department,
                assignedDepartment: department,
                slaDeadline: slaDeadline,
                status: 'Pending',
                confidence: ai.confidence,
                aiExplainability: explainability
            }
        });

        // Real-time broadcast
        notificationService.broadcastReportUpdate(reportId, {
            category: ai.category,
            severity: severity,
            confidence: ai.confidence,
            status: 'Pending'
        });

        jobLogger.info('Database update complete', { category: ai.category, severity, department, status: 'Pending' });

        // Notifications (real or simulated, depending on .env keys)
        const { contactEmail, contactPhone } = jobData;
        if (contactEmail) {
            await notificationService.sendEmail(
                contactEmail,
                `Report #${reportId} Received`,
                `Hello,\n\nYour report "${title}" has been successfully analyzed.\n\nStats:\n- Category: ${ai.category}\n- ID: ${traceId || reportId}\n- Status: Pending Review\n\nThank you for helping us!`
            );
        }

        if (severity === 'Critical' || severity === 'High') {
            await notificationService.notifyAdmin(severity, reportId, ai.category);
        }

        const jobDuration = Date.now() - jobStartTime;
        jobLogger.info('Job processing complete', { category: ai.category, severity, job_duration_ms: jobDuration });

    } catch (error) {
        jobLogger.error('Job processing failed', { error: error.message, stack: error.stack });
        throw error; // Re-throw so BullMQ marks the job as failed and retries
    }
}

// --- Worker Export ---
function startWorker() {
    logger.info('AI Worker starting', { backend: 'In-Memory Promise Async' });
    logger.info('AI Worker initialized successfully');
}

module.exports = { startWorker, processReportAnalysis };
