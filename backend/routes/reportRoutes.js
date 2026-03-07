const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const authController = require('../controllers/authController');
const citizenController = require('../controllers/citizenController');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');

// Auth Routes (Citizen Registration)
router.post('/auth/register', authController.register);

// Public Routes (or Citizen protected if verifyToken applied globally later)
router.post('/', reportController.createReport);
router.get('/', reportController.getReports);

// Citizen My Reports specific route
router.get('/my-reports', verifyToken, async (req, res) => {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    const reports = await prisma.report.findMany({
        where: { submittedBy: req.user.id },
        orderBy: { createdAt: 'desc' }
    });
    res.json({ data: reports });
});

// Predictive Hotspot Detection - MUST BE BEFORE ANY /:id ROUTES
router.get('/predict-hotspots', reportController.getPredictedHotspots);

// PROTECTED ROUTES
// Update Status: Officer or Admin only
router.patch('/:id/status', verifyToken, requireRole('OFFICER', 'ADMIN'), reportController.updateStatus);
// Legacy PUT support (if used by frontend)
router.put('/:id/status', verifyToken, requireRole('OFFICER', 'ADMIN'), reportController.updateStatus);

// Public/Citizen Routes
router.post('/feedback', reportController.submitFeedback);
router.post('/:id/upvote', reportController.upvoteReport);
router.get('/stats/public', reportController.getPublicStats);

// Citizen Portal Data (Requires Citizen Auth)
router.get('/citizen/reports', verifyToken, requireRole('CITIZEN', 'ADMIN'), citizenController.getMyReports);

// Report History / Audit Trail (public — transparency)
router.get('/:id/history', reportController.getReportHistory);

// Analytics: Officer, Admin, Auditor
router.get('/analytics', verifyToken, requireRole('OFFICER', 'ADMIN', 'AUDITOR'), reportController.getAnalyticsSummary);

// Spatial Data: Public (for transparency) or Internal?
// User said "Auditor read-only", but Map is main feature. Keeping Public for now.
router.get('/system', reportController.getSystemHealth);
router.get('/spatial/heatmap', reportController.getHeatmapData);
router.get('/spatial/hotspots', reportController.getHotspots);
router.get('/spatial/zones', reportController.getZoneStats);

// Officer Assignment (Admin only)
router.patch('/:id/assign', verifyToken, requireRole('ADMIN'), reportController.assignOfficer);
router.get('/officers', verifyToken, requireRole('ADMIN'), reportController.getOfficers);

// Predictive Analytics: Forecast
router.get('/forecast', verifyToken, requireRole('OFFICER', 'ADMIN', 'AUDITOR'), reportController.getForecast);

module.exports = router;
