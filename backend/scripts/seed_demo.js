const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding Demo Data...');

    // Clear recent reports to ensure clean demo state (optional, but good for demo)
    // await prisma.report.deleteMany({}); 

    const bangaloreCenter = { lat: 12.9716, lng: 77.5946 };

    // 1. Create specific HOTSPOT at Center (N0-E0)
    // 7 Critical/High reports within 100m
    console.log('🔥 Creating Central Hotspot (Critical)...');
    for (let i = 0; i < 7; i++) {
        await prisma.report.create({
            data: {
                title: `Major Pothole Cluster #${i}`,
                description: 'Severe road damage causing traffic handling.',
                category: 'Road',
                severity: i % 2 === 0 ? 'Critical' : 'High',
                priority: 'High',
                status: 'Pending',
                confidence: 0.95,
                latitude: bangaloreCenter.lat + (Math.random() - 0.5) * 0.002, // Very close
                longitude: bangaloreCenter.lng + (Math.random() - 0.5) * 0.002,
                location: 'MG Road, Central',
                traceId: `demo-trace-hotspot-${i}`
            }
        });
    }

    // 2. Create secondary Zone Load (S1-W1)
    // 5 Moderate reports ~1.5km South West
    console.log('⚠️ Creating South-West Zone Load (Moderate)...');
    for (let i = 0; i < 5; i++) {
        await prisma.report.create({
            data: {
                title: `Garbage Pile #${i}`,
                description: 'Uncleared garbage on street corner.',
                category: 'Garbage',
                severity: 'Moderate',
                priority: 'Medium',
                status: 'Pending',
                confidence: 0.88,
                latitude: bangaloreCenter.lat - 0.012 + (Math.random() - 0.5) * 0.003, // ~1.3km South
                longitude: bangaloreCenter.lng - 0.012 + (Math.random() - 0.5) * 0.003, // ~1.3km West
                location: 'Jayanagar 4th Block',
                traceId: `demo-trace-zone-${i}`
            }
        });
    }

    // 3. Scattered Reports (Low Severity)
    console.log('📍 Scattering background reports...');
    for (let i = 0; i < 8; i++) {
        await prisma.report.create({
            data: {
                title: `Street Light #${i}`,
                description: 'Light flickering.',
                category: 'Utility',
                severity: 'Low',
                priority: 'Low',
                status: 'Resolved',
                confidence: 0.75,
                latitude: bangaloreCenter.lat + (Math.random() - 0.5) * 0.04, // Wide scatter
                longitude: bangaloreCenter.lng + (Math.random() - 0.5) * 0.04,
                location: 'Random Location',
                traceId: `demo-trace-scatter-${i}`
            }
        });
    }

    console.log('✅ Demo Data Seeded!');
    console.log('Stats:');
    console.log('- 1 Hotspot (Central)');
    console.log('- 1 Stressed Zone (South-West)');
    console.log('- Scattered background noise');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
