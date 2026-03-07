
SELECT id, email, role, department FROM "User";
UPDATE "User" SET password = '$2a$10$2XTxCvk9NTUDpvPuDyMrGOC/zF56QN6P5Zwg7zipPO4aexKmz.oG2' WHERE role = 'OFFICER' OR "userRole" = 'OFFICER';
