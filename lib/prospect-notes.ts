import { Prisma, PrismaClient } from "@prisma/client";
import { statusLabel, type ProspectStatusValue } from "@/lib/utils";

type ProspectNoteWriter = Pick<PrismaClient, "prospectNote"> | Prisma.TransactionClient;

export function addProspectNote(
  db: ProspectNoteWriter,
  prospectId: string,
  body: string
) {
  return db.prospectNote.create({
    data: {
      prospectId,
      body
    }
  });
}

export function createStatusChangeNote(
  db: ProspectNoteWriter,
  prospectId: string,
  status: ProspectStatusValue
) {
  return addProspectNote(db, prospectId, `Status changed to ${statusLabel(status)}`);
}
