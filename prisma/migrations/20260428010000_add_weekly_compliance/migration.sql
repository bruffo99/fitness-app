-- CreateTable
CREATE TABLE "WeeklyCompliance" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "weekStart" DATETIME NOT NULL,
    "requiredSessions" INTEGER NOT NULL DEFAULT 3,
    "gymPhotosUploaded" INTEGER NOT NULL DEFAULT 0,
    "checkInSubmittedAt" DATETIME,
    "checkInId" TEXT,
    "adherence" INTEGER,
    "coachReviewedAt" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'MISSED',
    "nextAction" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "WeeklyCompliance_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "WeeklyCompliance_userId_weekStart_key" ON "WeeklyCompliance"("userId", "weekStart");

-- CreateIndex
CREATE INDEX "WeeklyCompliance_weekStart_idx" ON "WeeklyCompliance"("weekStart");

-- CreateIndex
CREATE INDEX "WeeklyCompliance_status_idx" ON "WeeklyCompliance"("status");

-- CreateIndex
CREATE INDEX "WeeklyCompliance_userId_idx" ON "WeeklyCompliance"("userId");
