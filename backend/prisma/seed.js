const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

// Helper — random item from array
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

// Helper — random date within last N days
const daysAgo = (n) => new Date(Date.now() - Math.random() * n * 24 * 60 * 60 * 1000);

// Bangalore GPS coords (realistic spread)
const locations = [
    { lat: 12.9716, lng: 77.5946 }, // MG Road
    { lat: 12.9352, lng: 77.6245 }, // Koramangala
    { lat: 13.0358, lng: 77.5970 }, // Hebbal
    { lat: 12.9698, lng: 77.7500 }, // Whitefield
    { lat: 12.9279, lng: 77.6271 }, // BTM Layout
    { lat: 13.0012, lng: 77.5732 }, // Rajajinagar
    { lat: 12.9850, lng: 77.7480 }, // Marathahalli
    { lat: 12.9120, lng: 77.6446 }, // Electronic City
    { lat: 13.0550, lng: 77.5950 }, // Yeshwanthpur
    { lat: 12.9630, lng: 77.5855 }, // Jayanagar
    { lat: 12.9900, lng: 77.6500 }, // Indiranagar
    { lat: 13.0200, lng: 77.6400 }, // CV Raman Nagar
];

const categories = ['Road', 'Water', 'Garbage', 'Electricity', 'Other'];
const severities = ['Critical', 'High', 'Moderate', 'Low'];
const priorities = ['High', 'Medium', 'Low'];
const statuses = ['Processing', 'Pending', 'In Progress', 'Resolved'];
const departments = {
    Road: 'Roads & Transport',
    Water: 'Water & Sanitation',
    Garbage: 'Waste Management',
    Electricity: 'Electricity & Lighting',
    Other: 'General Administration',
};

const reportTemplates = [
    { category: 'Road', title: 'Large pothole on main road', description: 'Deep pothole near signal causing vehicle damage. Multiple complaints already.' },
    { category: 'Road', title: 'Road cave-in near bus stop', description: 'Major road cave-in blocking half the lane. Dangerous for two-wheelers.' },
    { category: 'Road', title: 'Broken speed breaker', description: 'Speed breaker completely broken, sharp metal edges exposed.' },
    { category: 'Road', title: 'Waterlogged road after rain', description: 'Road waterlogged for 3 days after rain. Sewage water mixing in.' },
    { category: 'Road', title: 'Road divider damaged', description: 'Divider broken near flyover. Safety hazard for vehicles.' },
    { category: 'Water', title: 'Burst water pipe on street', description: 'Water pipe burst causing water wastage for 2 days. Road also getting damaged.' },
    { category: 'Water', title: 'No water supply for 3 days', description: 'Entire colony without water supply. Please send tanker urgently.' },
    { category: 'Water', title: 'Sewage overflow near park', description: 'Sewage overflowing onto the road near children park. Health hazard.' },
    { category: 'Water', title: 'Clogged drain causing flooding', description: 'Blocked storm drain causing water to flood into homes during rain.' },
    { category: 'Water', title: 'Contaminated water supply', description: 'Water coming from taps is brown in colour and has foul smell.' },
    { category: 'Garbage', title: 'Overflowing garbage bin', description: 'Garbage bin not emptied for a week. Foul smell and stray animals.' },
    { category: 'Garbage', title: 'Illegal dumping near residential area', description: 'People dumping construction waste on roadside. Growing pile.' },
    { category: 'Garbage', title: 'Garbage not collected for 5 days', description: 'Door to door collection stopped for 5 days without notice.' },
    { category: 'Garbage', title: 'Burning garbage in open area', description: 'Someone burning garbage near residential block causing smoke pollution.' },
    { category: 'Electricity', title: 'Streetlight not working', description: 'Street light at the main junction has been off for 4 days. Very dark at night.' },
    { category: 'Electricity', title: 'Exposed live wire on road', description: 'Electric wire hanging loose near footpath. Extremely dangerous.' },
    { category: 'Electricity', title: 'Transformer making loud noise', description: 'Transformer humming very loudly since yesterday. Might be faulty.' },
    { category: 'Electricity', title: 'Frequent power cuts in the area', description: 'Power going off 4-5 times daily for last 2 weeks. Affecting businesses.' },
    { category: 'Other', title: 'Broken footpath tiles', description: 'Footpath tiles broken and uneven. Senior citizens and children falling.' },
    { category: 'Other', title: 'Fallen tree blocking road', description: 'Large tree fell on road after last night storm. One lane fully blocked.' },
];

async function main() {
    console.log('🌱 Seeding database...\n');

    // ── 1. USERS ──────────────────────────────────────────────
    const users = [
        { email: 'admin@city.gov', password: 'admin123', userRole: 'ADMIN', department: null },
        { email: 'roads@city.gov', password: 'officer123', userRole: 'OFFICER', department: 'Roads & Transport' },
        { email: 'water@city.gov', password: 'officer123', userRole: 'OFFICER', department: 'Water & Sanitation' },
        { email: 'waste@city.gov', password: 'officer123', userRole: 'OFFICER', department: 'Waste Management' },
        { email: 'power@city.gov', password: 'officer123', userRole: 'OFFICER', department: 'Electricity & Lighting' },
        { email: 'audit@city.gov', password: 'auditor123', userRole: 'AUDITOR', department: null },
        { email: 'citizen@test.com', password: 'citizen123', userRole: 'CITIZEN', department: null },
    ];

    for (const u of users) {
        const hashed = await bcrypt.hash(u.password, 10);
        await prisma.user.upsert({
            where: { email: u.email },
            update: {},
            create: { ...u, password: hashed }
        });
        console.log(`✅ User: ${u.email} (${u.userRole})`);
    }

    // ── 2. REPORTS (30 realistic reports over last 14 days) ───
    console.log('\n📝 Creating 30 demo reports...');

    const createdReports = [];

    for (let i = 0; i < 30; i++) {
        const template = pick(reportTemplates);
        const loc = pick(locations);
        const severity = pick(severities);
        const status = pick(statuses);
        const createdAt = daysAgo(14);

        // SLA deadline based on severity
        const slaHours = severity === 'Critical' ? 24 : severity === 'High' ? 48 : 72;
        const slaDeadline = new Date(createdAt.getTime() + slaHours * 60 * 60 * 1000);
        const resolvedAt = status === 'Resolved' ? new Date(slaDeadline.getTime() - Math.random() * 12 * 60 * 60 * 1000) : null;

        // Generate trace ID
        const traceId = `TRC-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

        const report = await prisma.report.create({
            data: {
                title: template.title,
                description: template.description,
                category: template.category,
                severity,
                priority: severity === 'Critical' || severity === 'High' ? 'High' : severity === 'Moderate' ? 'Medium' : 'Low',
                status,
                confidence: parseFloat((0.70 + Math.random() * 0.28).toFixed(3)),
                latitude: loc.lat + (Math.random() - 0.5) * 0.02,
                longitude: loc.lng + (Math.random() - 0.5) * 0.02,
                contactEmail: 'citizen@test.com',
                assignedDepartment: departments[template.category],
                traceId,
                slaDeadline,
                resolvedAt,
                upvotes: Math.floor(Math.random() * 20),
                createdAt,
                aiExplainability: {
                    textModel: parseFloat((0.60 + Math.random() * 0.35).toFixed(3)),
                    imageModel: parseFloat((0.55 + Math.random() * 0.40).toFixed(3)),
                    device: 'CPU',
                    latencyMs: Math.floor(60 + Math.random() * 80),
                }
            }
        });

        createdReports.push(report);

        // Create audit history for each report
        await prisma.reportHistory.create({
            data: {
                reportId: report.id,
                oldStatus: 'Processing',
                newStatus: status,
                createdAt,
            }
        });

        if (status === 'Resolved' && resolvedAt) {
            await prisma.reportHistory.create({
                data: {
                    reportId: report.id,
                    oldStatus: 'In Progress',
                    newStatus: 'Resolved',
                    createdAt: resolvedAt,
                }
            });
        }
    }

    console.log(`✅ Created 30 reports with audit history`);

    // ── 3. FEEDBACK on resolved reports ──────────────────────
    console.log('\n⭐ Adding feedback on resolved reports...');
    const resolvedReports = createdReports.filter(r => r.status === 'Resolved');
    for (const r of resolvedReports) {
        await prisma.report.update({
            where: { id: r.id },
            data: {
                feedbackRating: Math.floor(3 + Math.random() * 3), // 3-5 stars
                feedbackComment: pick([
                    'Issue fixed quickly, great work!',
                    'Thank you for the fast response.',
                    'Happy with the resolution.',
                    'Road is much better now.',
                    'Water supply restored, thanks!'
                ])
            }
        });
    }
    console.log(`✅ Added feedback to ${resolvedReports.length} resolved reports`);

    console.log('\n🎉 Seed complete!');
    console.log('📊 Summary:');
    console.log(`   👤 ${users.length} users created`);
    console.log(`   📝 30 reports created (spread over last 14 days)`);
    console.log(`   ⭐ ${resolvedReports.length} feedbacks added`);
    console.log('\n🔑 Login credentials:');
    console.log('   Admin:   admin@city.gov / admin123');
    console.log('   Officer: roads@city.gov / officer123');
    console.log('   Auditor: audit@city.gov / auditor123');
    console.log('   Citizen: citizen@test.com / citizen123');
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
