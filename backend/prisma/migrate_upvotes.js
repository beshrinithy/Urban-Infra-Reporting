const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        console.log("Migrating: Adding upvotes column...");
        await prisma.$executeRaw`ALTER TABLE "Report" ADD COLUMN IF NOT EXISTS "upvotes" INTEGER DEFAULT 0;`;
        console.log("Migration Complete: upvotes column added.");
    } catch (e) {
        console.error("Migration Failed", e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
