/**
 * Mock Notification Service
 * Simulates sending SMS/Email alerts to citizens and authorities.
 * In a real production app, this would use Twilio, SendGrid, or AWS SNS.
 */

export const notificationService = {
    sendSMS: async (phoneNumber: string, message: string) => {
        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 500));
        console.log(`[MOCK SMS] To: ${phoneNumber} | Message: ${message}`);
        return { success: true, channel: "SMS", timestamp: new Date() };
    },

    sendEmail: async (email: string, subject: string, body: string) => {
        await new Promise((resolve) => setTimeout(resolve, 600));
        console.log(`[MOCK EMAIL] To: ${email} | Subject: ${subject} | Body: ${body}`);
        return { success: true, channel: "EMAIL", timestamp: new Date() };
    },

    notifyStatusChange: async (reportId: number, oldStatus: string, newStatus: string) => {
        const message = `Update for Report #${reportId}: Status changed from ${oldStatus} to ${newStatus}. Check app for details.`;
        // Mock sending to a citizen number
        return await notificationService.sendSMS("+91-9876543210", message);
    }
};
