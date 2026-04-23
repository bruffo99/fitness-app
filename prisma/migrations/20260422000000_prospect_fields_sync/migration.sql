-- AlterTable
ALTER TABLE "Prospect" ADD COLUMN "fitnessLevel" TEXT;
ALTER TABLE "Prospect" ADD COLUMN "followUpDate" DATETIME;
ALTER TABLE "Prospect" ADD COLUMN "goalType" TEXT;
ALTER TABLE "Prospect" ADD COLUMN "injuries" TEXT;
ALTER TABLE "Prospect" ADD COLUMN "referralSource" TEXT;
ALTER TABLE "Prospect" ADD COLUMN "timeline" TEXT;

-- CreateIndex
CREATE INDEX "Prospect_followUpDate_idx" ON "Prospect"("followUpDate");
