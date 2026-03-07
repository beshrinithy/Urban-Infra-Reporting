const bcrypt = require('bcryptjs');
const fs = require('fs');

const auditorHash = bcrypt.hashSync('auditor123', 10);
const sql = `INSERT INTO "User" (email, name, password, role, "userRole", department, "createdAt", "updatedAt")
VALUES ('audit@city.gov', 'Auditor', '${auditorHash}', 'AUDITOR', 'AUDITOR', NULL, NOW(), NOW())
ON CONFLICT (email) DO UPDATE SET password = '${auditorHash}', role = 'AUDITOR', "userRole" = 'AUDITOR';
`;

fs.writeFileSync('C:/Users/shrin/urban-infra-reporting/backend/seed_auditor.sql', sql);
console.log('Auditor SQL generated.');
