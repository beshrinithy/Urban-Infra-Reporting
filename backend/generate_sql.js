const bcrypt = require('bcryptjs');
const fs = require('fs');

const hash = bcrypt.hashSync('officer123', 10);
const sql = `
INSERT INTO "User" ("email", "password", "role", "userRole", "department", "createdAt")
VALUES (
    'roads@city.gov',
    '${hash}',
    'OFFICER',
    'OFFICER',
    'Roads',
    NOW()
)
ON CONFLICT ("email") DO UPDATE 
SET password = EXCLUDED.password, "userRole" = EXCLUDED."userRole", department = EXCLUDED.department;
`;

fs.writeFileSync('C:/Users/shrin/urban-infra-reporting/backend/seed_officer.sql', sql);
console.log('Valid SQL generated with hash.');
