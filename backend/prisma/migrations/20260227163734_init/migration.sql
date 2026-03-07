-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('CITIZEN', 'OFFICER', 'ADMIN', 'AUDITOR');

-- AlterTable
ALTER TABLE "Report" ADD COLUMN     "aiExplainability" JSONB,
ADD COLUMN     "aiMetadata" TEXT,
ADD COLUMN     "assignedDepartment" TEXT,
ADD COLUMN     "assignedOfficerId" INTEGER,
ADD COLUMN     "contactEmail" TEXT,
ADD COLUMN     "contactPhone" TEXT,
ADD COLUMN     "department" TEXT,
ADD COLUMN     "feedbackComment" TEXT,
ADD COLUMN     "feedbackRating" INTEGER,
ADD COLUMN     "image" TEXT,
ADD COLUMN     "latitude" DOUBLE PRECISION,
ADD COLUMN     "location" TEXT,
ADD COLUMN     "longitude" DOUBLE PRECISION,
ADD COLUMN     "resolvedAt" TIMESTAMP(3),
ADD COLUMN     "slaDeadline" TIMESTAMP(3),
ADD COLUMN     "traceId" TEXT,
ADD COLUMN     "upvotes" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'CITIZEN',
    "userRole" "UserRole" NOT NULL DEFAULT 'CITIZEN',
    "department" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "ReportHistory_reportId_idx" ON "ReportHistory"("reportId");
