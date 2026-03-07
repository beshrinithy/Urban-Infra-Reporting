
INSERT INTO "User" ("email", "password", "role", "userRole", "department", "createdAt")
VALUES (
    'roads@city.gov',
    '$2a$10$LRpdnGB6epbWseelqK63KOxDpHECF8ipvJlXUb5s1u1zCs3vJucBi',
    'OFFICER',
    'OFFICER',
    'Roads',
    NOW()
)
ON CONFLICT ("email") DO UPDATE 
SET password = EXCLUDED.password, "userRole" = EXCLUDED."userRole", department = EXCLUDED.department;
