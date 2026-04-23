-- CreateTable
CREATE TABLE "GymPhoto" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "note" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "GymPhoto_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ClientProfile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "fullName" TEXT,
    "onboardingStatus" TEXT NOT NULL DEFAULT 'draft',
    "requiredSessionsPerWeek" INTEGER NOT NULL DEFAULT 3,
    "trainingHistory" TEXT,
    "nutritionNotes" TEXT,
    "injuryNotes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ClientProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_ClientProfile" ("createdAt", "fullName", "id", "injuryNotes", "nutritionNotes", "onboardingStatus", "trainingHistory", "updatedAt", "userId") SELECT "createdAt", "fullName", "id", "injuryNotes", "nutritionNotes", "onboardingStatus", "trainingHistory", "updatedAt", "userId" FROM "ClientProfile";
DROP TABLE "ClientProfile";
ALTER TABLE "new_ClientProfile" RENAME TO "ClientProfile";
CREATE UNIQUE INDEX "ClientProfile_userId_key" ON "ClientProfile"("userId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "GymPhoto_userId_idx" ON "GymPhoto"("userId");

-- CreateIndex
CREATE INDEX "GymPhoto_createdAt_idx" ON "GymPhoto"("createdAt");
