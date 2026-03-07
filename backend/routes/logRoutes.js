const express = require('express');
const router = express.Router();
const logger = require('../config/logger');
const fs = require('fs').promises;
const path = require('path');

/**
 * Get log file statistics
 */
router.get('/logs/stats', async (req, res) => {
    try {
        const logDir = path.join(__dirname, '../../logs');

        // Check if logs directory exists
        try {
            await fs.access(logDir);
        } catch {
            return res.json({ logs: [], message: 'No logs directory found' });
        }

        const files = await fs.readdir(logDir);

        const stats = await Promise.all(
            files
                .filter(file => file.endsWith('.log'))
                .map(async (file) => {
                    const filePath = path.join(logDir, file);
                    const stat = await fs.stat(filePath);
                    return {
                        file,
                        size: `${(stat.size / 1024).toFixed(2)} KB`,
                        sizeBytes: stat.size,
                        modified: stat.mtime,
                        type: file.includes('error') ? 'error' : 'combined'
                    };
                })
        );

        // Sort by modified date (newest first)
        stats.sort((a, b) => b.modified - a.modified);

        res.json({
            logs: stats,
            totalSize: `${(stats.reduce((sum, s) => sum + s.sizeBytes, 0) / 1024).toFixed(2)} KB`
        });
    } catch (error) {
        logger.error('Failed to get log stats', { error: error.message });
        res.status(500).json({ error: error.message });
    }
});

/**
 * Get recent log entries
 */
router.get('/logs/recent', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 50;
        const level = req.query.level || 'all'; // all, error, warn, info

        const logDir = path.join(__dirname, '../../logs');
        const files = await fs.readdir(logDir);

        // Find most recent combined log
        const combinedLogs = files
            .filter(f => f.startsWith('combined-') && f.endsWith('.log'))
            .sort()
            .reverse();

        if (combinedLogs.length === 0) {
            return res.json({ logs: [] });
        }

        const logFile = path.join(logDir, combinedLogs[0]);
        const content = await fs.readFile(logFile, 'utf-8');

        // Parse JSON logs
        const lines = content.trim().split('\n').filter(l => l);
        const logs = lines
            .map(line => {
                try {
                    return JSON.parse(line);
                } catch {
                    return null;
                }
            })
            .filter(log => log !== null)
            .filter(log => level === 'all' || log.level.toLowerCase() === level.toLowerCase())
            .slice(-limit)
            .reverse();

        res.json({ logs, count: logs.length });
    } catch (error) {
        logger.error('Failed to get recent logs', { error: error.message });
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
