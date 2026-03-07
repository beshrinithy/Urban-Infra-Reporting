const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: "postgresql://citymind:citymind123@postgres:5432/cityminddb"
        }
    }
});

async function main() {
    const hash = await bcrypt.hash('officer123', 10);
    await prisma.user.upsert({
        where: { email: 'roads@city.gov' },
        update: { password: hash },
        create: { email: 'roads@city.gov', name: 'Roads Officer', role: 'OFFICER', password: hash, department: 'Roads' }
    });
    console.log('Officer created with exact password: officer123');
    await prisma.$disconnect();
}
main().catch(e => { console.error(e); process.exit(1); });
