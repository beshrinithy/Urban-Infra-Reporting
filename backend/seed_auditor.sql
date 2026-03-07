INSERT INTO "User" (
        email,
        password,
        role,
        "userRole",
        department,
        "createdAt"
    )
VALUES (
        'audit@city.gov',
        '$2a$10$ViAr.W/sU873B7Su.IRhQ.P6oYobdGYR8VXRu4rNapifFOathSzmq',
        'AUDITOR',
        'AUDITOR',
        NULL,
        NOW()
    ) ON CONFLICT (email) DO
UPDATE
SET password = '$2a$10$ViAr.W/sU873B7Su.IRhQ.P6oYobdGYR8VXRu4rNapifFOathSzmq',
    role = 'AUDITOR',
    "userRole" = 'AUDITOR';