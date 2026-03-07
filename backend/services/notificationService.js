const fs = require('fs');
const path = require('path');

// --- SDK Imports (graceful — only used if keys are set) ---
let sgMail = null;
let twilioClient = null;

const EMAIL_ENABLED = !!process.env.SENDGRID_API_KEY;
const SMS_ENABLED = !!(process.env.TWILIO_SID && process.env.TWILIO_AUTH_TOKEN);
const FAST2SMS_ENABLED = !!process.env.FAST2SMS_API_KEY;
const axios = require('axios');

if (EMAIL_ENABLED) {
    sgMail = require('@sendgrid/mail');
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}
if (SMS_ENABLED) {
    const twilio = require('twilio');
    twilioClient = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);
}

console.log(`📧 Email: ${EMAIL_ENABLED ? 'SendGrid (LIVE)' : 'Simulated (fallback)'}`);
console.log(`📱 SMS: ${FAST2SMS_ENABLED ? 'Fast2SMS (LIVE)' : SMS_ENABLED ? 'Twilio (LIVE)' : 'Simulated (fallback)'}`);

// --- Fallback File Logger ---
const LOG_DIR = path.join(__dirname, '../logs');
if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
}
const NOTIFICATION_LOG = path.join(LOG_DIR, 'notifications.log');

function logNotification(type, recipient, message) {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] [${type.toUpperCase()}] To: ${recipient} | Msg: "${message}"\n`;

    const color = type === 'email' ? '\x1b[36m' : (type === 'sms' ? '\x1b[35m' : '\x1b[31m');
    console.log(`${color}🔔 NOTIFICATION SENT: ${logEntry.trim()}\x1b[0m`);

    fs.appendFileSync(NOTIFICATION_LOG, logEntry);
}

// --- Socket.io Reference ---
let serverIo = null;

exports.setIo = (ioInstance) => {
    serverIo = ioInstance;
};

// --- Email (SendGrid or Fallback) ---
exports.sendEmail = async (to, subject, body) => {
    if (!to) return;

    if (EMAIL_ENABLED && sgMail) {
        try {
            await sgMail.send({
                to,
                from: process.env.SENDGRID_FROM_EMAIL || 'noreply@urbaninfra.app',
                subject,
                text: body,
                html: `<p>${body.replace(/\n/g, '<br>')}</p>`
            });
            console.log(`📧 Email sent to ${to}`);
        } catch (err) {
            console.error('SendGrid error:', err.response?.body || err.message);
            logNotification('email', to, `Subject: ${subject} | Body: ${body}`);
        }
    } else {
        await new Promise(r => setTimeout(r, 200));
        logNotification('email', to, `Subject: ${subject} | Body: ${body}`);
    }
    return true;
};

// --- SMS (Twilio or Fallback) ---
exports.sendSMS = async (to, message) => {
    if (!to) return;

    // Try Fast2SMS first (Indian numbers)
    if (FAST2SMS_ENABLED) {
        try {
            // Clean phone number — extract 10-digit Indian number
            const cleanNum = to.replace(/[^0-9]/g, '').slice(-10);
            if (cleanNum.length === 10) {
                await axios.post('https://www.fast2sms.com/dev/bulkV2', {
                    message,
                    language: 'english',
                    route: 'q',
                    numbers: cleanNum
                }, {
                    headers: {
                        'authorization': process.env.FAST2SMS_API_KEY,
                        'Content-Type': 'application/json'
                    }
                });
                console.log(`📱 SMS sent via Fast2SMS to ${cleanNum}`);
                return true;
            }
        } catch (err) {
            console.error('Fast2SMS error:', err.response?.data || err.message);
            logNotification('sms_fast2sms_error', to, message);
        }
    }

    // Fallback to Twilio
    if (SMS_ENABLED && twilioClient) {
        try {
            await twilioClient.messages.create({
                body: message,
                from: process.env.TWILIO_PHONE_NUMBER,
                to
            });
            console.log(`📱 SMS sent via Twilio to ${to}`);
        } catch (err) {
            console.error('Twilio error:', err.message);
            logNotification('sms', to, message);
        }
    } else {
        await new Promise(r => setTimeout(r, 200));
        logNotification('sms', to, message);
    }
    return true;
};

// --- Status Update (Socket + Email) ---
exports.notifyStatusUpdate = async (reportId, status) => {
    if (serverIo) {
        serverIo.emit('statusUpdate', { id: reportId, status });
    }
    logNotification('system', 'dashboard', `Report #${reportId} status changed to ${status}`);
};

// --- Admin Alert ---
exports.notifyAdmin = async (severity, reportId, category) => {
    if (serverIo) {
        serverIo.emit('admin_alert', { reportId, severity, category });
    }
    if (severity === 'Critical') {
        const adminPhone = process.env.ADMIN_PHONE || '+1-555-0199';
        const adminEmail = process.env.ADMIN_EMAIL || 'admin@urbancommand.gov';
        await exports.sendSMS(adminPhone, `🚨 CRITICAL ALERT: Report #${reportId} (${category}) requires immediate action.`);
        await exports.sendEmail(adminEmail, `Emergency: Report #${reportId}`, `A Critical issue has been detected by AI.\nCategory: ${category}\nPlease review the dashboard immediately.`);
    }
};

// --- Broadcast Real-Time Update ---
exports.broadcastReportUpdate = (reportId, data) => {
    if (serverIo) {
        serverIo.emit('report_updated', { id: reportId, ...data });
        console.log(`[Socket] Broadcasted update for Report #${reportId}`);
    }
};

// --- Citizen Report Confirmation ---
exports.notifyCitizenReportReceived = async (report) => {
    await exports.sendEmail(
        report.contactEmail,
        `✅ Report Received — Trace ID: ${report.traceId}`,
        `Hi! Your report "${report.title}" has been received.\n\nTrace ID: ${report.traceId}\nCategory: ${report.category}\nSeverity: ${report.severity}\nSLA Deadline: ${report.slaDeadline ? new Date(report.slaDeadline).toLocaleString() : 'TBD'}\n\nTrack your report at: /track?id=${report.traceId}`
    );
    if (report.contactPhone) {
        await exports.sendSMS(
            report.contactPhone,
            `Urban Infra: Report "${report.title}" received. Trace ID: ${report.traceId}. Track at /track`
        );
    }
};

// --- Admin Critical Alert ---
exports.notifyAdminCritical = async (report) => {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@urbancommand.gov';
    const adminPhone = process.env.ADMIN_PHONE || '+1-555-0199';
    await exports.sendEmail(
        adminEmail,
        `🚨 CRITICAL REPORT — ${report.traceId}`,
        `A critical issue was reported:\n\nTitle: ${report.title}\nLocation: ${report.latitude}, ${report.longitude}\nDepartment: ${report.assignedDepartment}`
    );
    await exports.sendSMS(
        adminPhone,
        `CRITICAL REPORT: "${report.title}" — ${report.assignedDepartment}. ID: ${report.traceId}`
    );
};

// --- SLA Breach ---
exports.notifySLABreach = async (reportId, category, department) => {
    const message = `⚠️ SLA Breached: Report #${reportId} (${category} - ${department || 'Unassigned'}) is overdue!`;
    logNotification('sla_breach', 'admin-dashboard', message);
    if (serverIo) {
        serverIo.emit('sla_breach', { reportId, category, department, message });
    }
    // Also email admin about breach
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@urbancommand.gov';
    await exports.sendEmail(
        adminEmail,
        `🚨 SLA BREACH — Report #${reportId}`,
        `Report #${reportId} (${category}) in ${department || 'Unassigned'} has breached its SLA deadline.`
    );
};
