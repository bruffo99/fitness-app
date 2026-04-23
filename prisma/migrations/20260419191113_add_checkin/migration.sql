-- CreateTable
CREATE TABLE "CheckIn" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "weekOf" DATETIME NOT NULL,
    "bodyWeight" REAL,
    "bodyFat" REAL,
    "energyLevel" INTEGER,
    "sleepQuality" INTEGER,
    "adherence" INTEGER,
    "trainingNotes" TEXT,
    "nutritionNotes" TEXT,
    "wins" TEXT,
    "struggles" TEXT,
    "coachNotes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CheckIn_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "CheckIn_userId_idx" ON "CheckIn"("userId");

-- CreateIndex
CREATE INDEX "CheckIn_weekOf_idx" ON "CheckIn"("weekOf");

-- CreateIndex
CREATE UNIQUE INDEX "CheckIn_userId_weekOf_key" ON "CheckIn"("userId", "weekOf");

