/**
 * Hotspot Auto-Alert Monitor
 * Runs every 30 minutes. Detects spatial clusters of reports
 * and alerts admin when new hotspots form.
 */
const { PrismaClient } = require('@prisma/client');
const notificationService = require('./notificationService');
const logger = require('../config/logger').api || console;

const prisma = new PrismaClient();

// Track hotspots we've already alerted on (resets on restart)
const alertedHotspots = new Set();

async function checkForNewHotspots() {
    try {
        const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);

        const reports = await prisma.report.findMany({
            where: {
                createdAt: { gte: fortyEightHoursAgo },
                latitude: { not: null },
                longitude: { not: null }
            },
            select: {
                id: true,
                latitude: true,
                longitude: true,
                category: true,
                severity: true,
                title: true
            }
        });

        if (reports.length === 0) {
            logger.info('Hotspot check: No recent geolocated reports');
            return;
        }

        // Greedy clustering within 200m radius
        const clusters = [];
        const used = new Set();

        for (let i = 0; i < reports.length; i++) {
            if (used.has(i)) continue;
            const cluster = [reports[i]];
            used.add(i);

            for (let j = i + 1; j < reports.length; j++) {
                if (used.has(j)) continue;
                const dist = getDistanceMeters(
                    reports[i].latitude, reports[i].longitude,
                    reports[j].latitude, reports[j].longitude
                );
                if (dist <= 200) {
                    cluster.push(reports[j]);
                    used.add(j);
                }
            }

            if (cluster.length >= 5) {
                clusters.push(cluster);
            }
        }

        // Alert on new hotspots only
        for (const cluster of clusters) {
            const centroid = getCentroid(cluster);
            const hotspotKey = `${centroid.lat.toFixed(3)}_${centroid.lng.toFixed(3)}`;

            if (!alertedHotspots.has(hotspotKey)) {
                alertedHotspots.add(hotspotKey);
                const categories = [...new Set(cluster.map(r => r.category))];

                logger.warn(`🔥 New hotspot detected at ${hotspotKey} with ${cluster.length} reports`);

                // Socket.io push to admin dashboard
                notificationService.broadcastReportUpdate('hotspot', {
                    type: 'hotspot_detected',
                    lat: centroid.lat,
                    lng: centroid.lng,
                    count: cluster.length,
                    categories
                });

                // Email admin
                await notificationService.notifyAdminCritical({
                    title: `Hotspot Detected — ${cluster.length} reports within 200m`,
                    latitude: centroid.lat,
                    longitude: centroid.lng,
                    assignedDepartment: categories.join(', '),
                    traceId: `HOTSPOT-${hotspotKey}`
                });
            }
        }

        if (clusters.length === 0) {
            logger.info('Hotspot check: No new hotspots detected');
        }
    } catch (err) {
        logger.error('Hotspot monitor error:', { error: err.message });
    }
}

function getDistanceMeters(lat1, lon1, lat2, lon2) {
    const R = 6371000;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function getCentroid(cluster) {
    return {
        lat: cluster.reduce((s, r) => s + r.latitude, 0) / cluster.length,
        lng: cluster.reduce((s, r) => s + r.longitude, 0) / cluster.length
    };
}

function startHotspotMonitor() {
    console.log('🔥 Hotspot monitor started (checks every 30 min)');
    checkForNewHotspots();
    setInterval(checkForNewHotspots, 30 * 60 * 1000);
}

module.exports = { startHotspotMonitor };
