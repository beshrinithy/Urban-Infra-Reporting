const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || "super_secret_key_123";

exports.register = async (req, res) => {
    try {
        const { email, password, userRole, department } = req.body;

        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) {
            return res.status(409).json({ error: 'Email already registered' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                role: userRole || 'CITIZEN',
                userRole: userRole || 'CITIZEN',
                department: department || null
            }
        });

        const token = jwt.sign(
            {
                userId: user.id,
                email: user.email,
                userRole: user.userRole,
                department: user.department
            },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            message: 'Registered successfully',
            token,
            user: {
                id: user.id,
                email: user.email,
                userRole: user.userRole,
                department: user.department
            }
        });
    } catch (error) {
        console.error("Registration error:", error);
        res.status(500).json({ error: "Registration failed" });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        let user;

        try {
            user = await prisma.user.findUnique({ where: { email } });
        } catch (dbError) {
            console.warn("DB query failed, attempting raw query:", dbError.message);
            try {
                const users = await prisma.$queryRaw`SELECT * FROM "User" WHERE email = ${email}`;
                if (users.length > 0) user = users[0];
            } catch (rawError) {
                console.error("Raw query also failed:", rawError.message);
            }
        }

        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Generate JWT with full user info
        const token = jwt.sign(
            {
                userId: user.id,
                email: user.email,
                userRole: user.userRole || user.role || 'CITIZEN',
                department: user.department || null
            },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Return BOTH token AND user object
        res.json({
            token,
            user: {
                id: user.id,
                email: user.email,
                userRole: user.userRole || user.role || 'CITIZEN',
                department: user.department || null
            }
        });

    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ error: "Login failed" });
    }
};
