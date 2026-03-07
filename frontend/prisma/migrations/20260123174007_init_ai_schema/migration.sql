/*
  Warnings:

  - You are about to drop the column `latitude` on the `Report` table. All the data in the column will be lost.
  - You are about to drop the column `longitude` on the `Report` table. All the data in the column will be lost.
  - Added the required column `confidence` to the `Report` table without a default value. This is not possible if the table is not empty.
  - Added the required column `priority` to the `Report` table without a default value. This is not possible if the table is not empty.
  - Added the required column `severity` to the `Report` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Report" DROP COLUMN "latitude",
DROP COLUMN "longitude",
ADD COLUMN     "confidence" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "priority" TEXT NOT NULL,
ADD COLUMN     "severity" TEXT NOT NULL,
ADD COLUMN     "summary" TEXT;

-- CreateTable
CREATE TABLE "ReportHistory" (
    "id" SERIAL NOT NULL,
    "reportId" INTEGER NOT NULL,
    "oldStatus" TEXT NOT NULL,
    "newStatus" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReportHistory_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ReportHistory" ADD CONSTRAINT "ReportHistory_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "Report"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
