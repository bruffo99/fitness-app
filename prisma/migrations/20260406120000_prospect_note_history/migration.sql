-- CreateTable
CREATE TABLE "ProspectNote" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "prospectId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ProspectNote_prospectId_fkey" FOREIGN KEY ("prospectId") REFERENCES "Prospect" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Backfill existing single-value notes into note history entries before dropping the column.
INSERT INTO "ProspectNote" ("id", "prospectId", "body", "createdAt", "updatedAt")
SELECT
    'legacy_note_' || "id",
    "id",
    "notes",
    "updatedAt",
    "updatedAt"
FROM "Prospect"
WHERE "notes" IS NOT NULL
  AND trim("notes") <> '';

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Prospect" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "goalSummary" TEXT NOT NULL,
    "preferredContact" TEXT,
    "message" TEXT,
    "source" TEXT,
    "status" TEXT NOT NULL DEFAULT 'NEW_LEAD',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Prospect" ("createdAt", "email", "firstName", "goalSummary", "id", "lastName", "message", "phone", "preferredContact", "source", "status", "updatedAt")
SELECT "createdAt", "email", "firstName", "goalSummary", "id", "lastName", "message", "phone", "preferredContact", "source", "status", "updatedAt"
FROM "Prospect";
DROP TABLE "Prospect";
ALTER TABLE "new_Prospect" RENAME TO "Prospect";
CREATE INDEX "Prospect_email_idx" ON "Prospect"("email");
CREATE INDEX "Prospect_status_idx" ON "Prospect"("status");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "ProspectNote_prospectId_createdAt_idx" ON "ProspectNote"("prospectId", "createdAt");
