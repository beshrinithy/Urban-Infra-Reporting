const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET || "super_secret_key_123";

// Middleware to verify Token and inject User into Request
const verifyToken = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        // Optional: Allow public access for some routes if needed, but for RBAC we usually block.
        // If route is protected by requireRole, verifyToken MUST check token.
        return res.status(401).json({ error: "Access denied. No token provided." });
    }

    const token = authHeader.split(" ")[1]; // Bearer <token>

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded; // { userId, role, ... }
        next();
    } catch (error) {
        return res.status(401).json({ error: "Invalid token." });
    }
};

// Middleware to enforce specific roles
const requireRole = (...allowedRoles) => {
    return (req, res, next) => {
        // Ensure verifyToken ran first
        if (!req.user) {
            return res.status(401).json({ error: "Unauthorized. Please login." });
        }

        // Normalize roles (handle case sensitivity if needed, though Enums are typically uppercase)
        const userRole = req.user.userRole || req.user.role; // Check both fields for compatibility

        if (allowedRoles.includes(userRole)) {
            next();
        } else {
            return res.status(403).json({ error: "Forbidden. Insufficient permissions." });
        }
    };
};

module.exports = { verifyToken, requireRole };
