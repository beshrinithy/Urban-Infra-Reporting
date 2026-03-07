const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');

async function main() {
    try {
        console.log("Forcing User Creation...");
        const email = "admin@city.com";
        const password = "admin";
        const hashedPassword = await bcrypt.hash(password, 10);
        const role = "ADMIN";

        // 1. Check if table exists
        try {
            await prisma.$queryRaw`SELECT 1 FROM "User" LIMIT 1`;
            console.log("Table 'User' exists.");
        } catch (e) {
            console.error("Table 'User' DOES NOT EXIST. Creating...");
            await prisma.$executeRaw`
            CREATE TABLE IF NOT EXISTS "User" (
                "id" SERIAL PRIMARY KEY,
                "email" TEXT NOT NULL UNIQUE,
                "password" TEXT NOT NULL,
                "role" TEXT NOT NULL DEFAULT 'CITIZEN'
            );
        `;
        }

        // 2. Insert User
        const result = await prisma.$executeRaw`
        INSERT INTO "User" ("email", "password", "role")
        VALUES (${email}, ${hashedPassword}, ${role})
        ON CONFLICT ("email") DO NOTHING
    `;

        console.log("Insert Result:", result);
        console.log("User 'admin@city.com' should now exist.");

        // 3. Verify
        const users = await prisma.$queryRaw`SELECT * FROM "User" WHERE email = ${email}`;
        console.log("Verification Query:", users);

    } catch (e) {
        console.error("FORCE CREATION FAILED:", e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
