const bcrypt = require('bcryptjs');
const fs = require('fs');

const hash = bcrypt.hashSync('123', 10);
const sql = `
SELECT id, email, role, department FROM "User";
UPDATE "User" SET password = '${hash}' WHERE role = 'OFFICER' OR "userRole" = 'OFFICER';
`;

fs.writeFileSync('C:/Users/shrin/urban-infra-reporting/backend/update_passwords.sql', sql);
console.log('SQL generated with hash for 123.');
