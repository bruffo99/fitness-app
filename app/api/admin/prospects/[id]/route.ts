import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminSession } from "@/lib/auth";
import { createStatusChangeNote } from "@/lib/prospect-notes";
import { prisma } from "@/lib/prisma";

const VALID_STATUSES = [
  "NEW_LEAD",
  "CONTACTED",
  "QUALIFIED",
  "CLIENT_ACTIVE",
  "INACTIVE",
  "ARCHIVED",
] as const;

const updateStatusSchema = z.object({
  action: z.literal("update_status"),
  status: z.enum(VALID_STATUSES),
});

const addNoteSchema = z.object({
  action: z.literal("add_note"),
  note: z.string().trim().min(1).max(10000),
});

const deleteNoteSchema = z.object({
  action: z.literal("delete_note"),
  noteId: z.string().cuid(),
});

const setFollowUpDateSchema = z.object({
  action: z.literal("set_followup_date"),
  date: z.string().nullable(),
});

const bodySchema = z.discriminatedUnion("action", [
  updateStatusSchema,
  addNoteSchema,
  deleteNoteSchema,
  setFollowUpDateSchema,
]);

function unauthorized() {
  return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
}

function notFound() {
  return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
}

function badRequest(error: string) {
  return NextResponse.json({ ok: false, error }, { status: 400 });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession();
  if (!session) return unauthorized();

  const { id } = await params;

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return badRequest("invalid_json");
  }

  const parsed = bodySchema.safeParse(raw);
  if (!parsed.success) return badRequest("invalid_payload");

  const prospect = await prisma.prospect.findUnique({ where: { id } });
  if (!prospect) return notFound();

  const body = parsed.data;

  if (body.action === "update_status") {
    if (prospect.status !== body.status) {
      await prisma.$transaction([
        prisma.prospect.update({ where: { id }, data: { status: body.status } }),
        createStatusChangeNote(prisma, id, body.status),
      ]);
    }
    const updated = await prisma.prospect.findUnique({
      where: { id },
      include: { notes: { orderBy: { createdAt: "desc" } } },
    });
    return NextResponse.json({ ok: true, prospect: updated });
  }

  if (body.action === "add_note") {
    const note = await prisma.prospectNote.create({
      data: { prospectId: id, body: body.note },
    });
    return NextResponse.json({ ok: true, note });
  }

  if (body.action === "delete_note") {
    await prisma.prospectNote.deleteMany({
      where: { id: body.noteId, prospectId: id },
    });
    return NextResponse.json({ ok: true, deletedNoteId: body.noteId });
  }

  if (body.action === "set_followup_date") {
    const followUpDate = body.date ? new Date(body.date) : null;
    await prisma.prospect.update({
      where: { id },
      data: { followUpDate },
    });
    return NextResponse.json({ ok: true, followUpDate: followUpDate?.toISOString() ?? null });
  }

  return badRequest("unknown_action");
}
