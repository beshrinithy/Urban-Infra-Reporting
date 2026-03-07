const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

const sendStatusEmail = async (to, reportTitle, newStatus) => {
    if (!to) return;
    try {
        await transporter.sendMail({
            from: `"CityMind AI" <${process.env.EMAIL_USER}>`,
            to,
            subject: `Your Report Status Updated — ${newStatus}`,
            html: `
        <div style="font-family:sans-serif;max-width:500px;margin:auto;padding:24px;background:#0f172a;color:#fff;border-radius:12px;">
          <h2 style="color:#818cf8;">CityMind AI</h2>
          <p>Your report <strong>"${reportTitle}"</strong> has been updated.</p>
          <div style="background:#1e293b;padding:16px;border-radius:8px;margin:16px 0;">
            <p style="margin:0;">New Status: <strong style="color:#4ade80;">${newStatus}</strong></p>
          </div>
          <p style="color:#94a3b8;font-size:12px;">Thank you for helping build a better city.</p>
        </div>
      `,
        });
        console.log(`Status email sent to ${to}`);
    } catch (err) {
        console.error('Email send failed:', err.message);
    }
};

module.exports = { sendStatusEmail };
