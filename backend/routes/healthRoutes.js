const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

router.get('/', async (req, res) => {
    let dbStatus = "Unknown";
    try {
        await prisma.$queryRaw`SELECT 1`;
        dbStatus = "Connected";
    } catch (e) {
        dbStatus = "Error";
    }

    res.json({ status: "Online", db: dbStatus });
});

module.exports = router;
