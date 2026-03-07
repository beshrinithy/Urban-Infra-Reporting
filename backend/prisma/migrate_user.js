const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        console.log("Migrating: Creating User Table...");
        await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "User" (
        "id" SERIAL PRIMARY KEY,
        "email" TEXT NOT NULL UNIQUE,
        "password" TEXT NOT NULL,
        "role" TEXT NOT NULL DEFAULT 'CITIZEN'
      );
    `;
        console.log("Migration Complete: User Table created.");
    } catch (e) {
        console.error("Migration Failed", e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
