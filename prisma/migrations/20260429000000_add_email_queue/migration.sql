-- CreateTable
CREATE TABLE "EmailQueue" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "kind" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "isEnabled" BOOLEAN NOT NULL DEFAULT false,
    "toEmail" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "bodyHtml" TEXT,
    "dedupeKey" TEXT NOT NULL,
    "userId" TEXT,
    "checkInId" TEXT,
    "weeklyComplianceId" TEXT,
    "weekStart" DATETIME,
    "lastError" TEXT,
    "sentAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "EmailQueue_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "EmailQueue_checkInId_fkey" FOREIGN KEY ("checkInId") REFERENCES "CheckIn" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "EmailQueue_weeklyComplianceId_fkey" FOREIGN KEY ("weeklyComplianceId") REFERENCES "WeeklyCompliance" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "EmailQueue_dedupeKey_key" ON "EmailQueue"("dedupeKey");

-- CreateIndex
CREATE INDEX "EmailQueue_status_idx" ON "EmailQueue"("status");

-- CreateIndex
CREATE INDEX "EmailQueue_kind_idx" ON "EmailQueue"("kind");

-- CreateIndex
CREATE INDEX "EmailQueue_userId_idx" ON "EmailQueue"("userId");

-- CreateIndex
CREATE INDEX "EmailQueue_weekStart_idx" ON "EmailQueue"("weekStart");
