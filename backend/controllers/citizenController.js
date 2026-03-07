const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getMyReports = async (req, res) => {
    try {
        // req.user is guaranteed to exist and have an email because of verifyToken middleware
        const reports = await prisma.report.findMany({
            where: { contactEmail: req.user.email },
            orderBy: { createdAt: 'desc' }
        });
        res.json({ reports });
    } catch (error) {
        console.error("Failed to fetch citizen reports:", error);
        res.status(500).json({ error: "Failed to fetch reports" });
    }
};
