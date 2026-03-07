const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const reports = [
    { title: 'Deep Pothole on Main St', description: 'Large crater near the junction, causing traffic slowdowns.', category: 'Road', priority: 'High', severity: 'High', status: 'Pending', department: 'Roads & Transport' },
    { title: 'Broken Streetlight', description: 'Light pole #45 is flickering and dark at night.', category: 'Electricity', priority: 'Medium', severity: 'Moderate', status: 'Pending', department: 'Electricity Board' },
    { title: 'Water Leakage in Sector 4', description: 'Clean water pipe burst, flooding the street.', category: 'Water', priority: 'High', severity: 'Moderate', status: 'In Progress', department: 'Water Board' },
    { title: 'Garbage Dump Overflow', description: 'Bin not cleared for 3 days near Market.', category: 'Garbage', priority: 'Medium', severity: 'Low', status: 'Pending', department: 'Sanitation Dept' },
    { title: 'Unauthorized Parking', description: 'Cars blocking the fire exit lane.', category: 'Traffic', priority: 'Low', severity: 'Low', status: 'Resolved', department: 'Traffic Police' },
    { title: 'Manhole Cover Missing', description: 'Open manhole in the middle of sidewalk.', category: 'Road', priority: 'Critical', severity: 'Critical', status: 'Pending', department: 'Roads & Transport' },
    { title: 'Dead Animal on Road', description: 'Needs removal immediately.', category: 'Sanitation', priority: 'Medium', severity: 'Moderate', status: 'Resolved', department: 'Sanitation Dept' },
    { title: 'Tree Branch Falling', description: 'Precarious branch hanging over power lines.', category: 'Other', priority: 'High', severity: 'High', status: 'Pending', department: 'Fire Dept' }
];

async function main() {
    console.log('🌱 Seeding Reports...');
    for (const r of reports) {
        await prisma.report.create({
            data: {
                ...r,
                confidence: 0.95,
                createdAt: new Date(Date.now() - Math.floor(Math.random() * 1000000000)) // Random past time
            }
        });
    }
    console.log(`✅ Seeded ${reports.length} reports.`);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
