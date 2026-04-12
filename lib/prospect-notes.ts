import { Prisma, PrismaClient } from "@prisma/client";
import { statusLabel, type ProspectStatusValue } from "@/lib/utils";

type ProspectNoteWriter = Pick<PrismaClient, "prospectNote"> | Prisma.TransactionClient;

export function createStatusChangeNote(
  db: ProspectNoteWriter,
  prospectId: string,
  status: ProspectStatusValue
) {
  return db.prospectNote.create({
    data: {
      prospectId,
      body: `Status changed to ${statusLabel(status)}`
    }
  });
}
