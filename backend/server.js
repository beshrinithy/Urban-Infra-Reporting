const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

// Logger setup
const logger = require('./config/logger');
const requestLogger = require('./middleware/requestLogger');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors({
  origin: [
    "http://localhost:3000",
    "https://urban-infra-reporting.vercel.app"
  ],
  credentials: true
}));
app.use(bodyParser.json({ limit: '50mb' })); // Allow large images
app.use(requestLogger); // Add request tracing

// Routes
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

const reportRoutes = require('./routes/reportRoutes');
app.use('/api/reports', reportRoutes);

const healthRoutes = require('./routes/healthRoutes');
app.use('/api/health', healthRoutes);

// Root
app.get('/', (req, res) => {
    res.send('Urban Infrastructure API is running...');
});

// Initialize HTTP Server and Socket.io
const http = require('http');
const { Server } = require("socket.io");

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Link IO to Service
const notificationService = require('./services/notificationService');
notificationService.setIo(io);

io.on('connection', (socket) => {
    logger.info('Client connected', { socketId: socket.id });
});

// Start AI Worker (Background Process)
const aiWorker = require('./workers/aiWorker');
aiWorker.startWorker();

// Start Hotspot Monitor (Background Process)
const { startHotspotMonitor } = require('./services/hotspotMonitor');
startHotspotMonitor();

// --- SLA BREACH CHECKER ---
const { PrismaClient } = require('@prisma/client');
const slaPrisma = new PrismaClient();

async function checkSLABreaches() {
    try {
        const breached = await slaPrisma.report.findMany({
            where: {
                slaDeadline: { lt: new Date() },
                status: { notIn: ['Resolved'] },
                // Only alert on reports that actually have a deadline set
                NOT: { slaDeadline: null }
            },
            select: { id: true, category: true, assignedDepartment: true }
        });

        if (breached.length > 0) {
            logger.warn(`SLA Check: ${breached.length} breached report(s) found`);
            for (const report of breached) {
                await notificationService.notifySLABreach(
                    report.id,
                    report.category,
                    report.assignedDepartment
                );
            }
        } else {
            logger.info('SLA Check: All reports within deadline');
        }
    } catch (err) {
        logger.error('SLA Checker failed', { error: err.message });
    }
}

// Run immediately on startup (catches overnight breaches), then every hour
checkSLABreaches();
setInterval(checkSLABreaches, 60 * 60 * 1000);

// Start Server
server.listen(PORT, '0.0.0.0', () => {
    logger.info('Server started', {
        port: PORT,
        environment: process.env.NODE_ENV || 'development'
    });
});
