const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkData() {
    try {
        const count = await prisma.report.count();
        const reports = await prisma.report.findMany({ select: { title: true } });
        console.log(`\n\n✅ DATA CHECK: Found ${count} reports.`);
        console.log("Sample Titles:", reports.map(r => r.title));
    } catch (e) {
        console.error("❌ DATA CHECK FAILED:", e.message);
    } finally {
        await prisma.$disconnect();
    }
}

checkData();
