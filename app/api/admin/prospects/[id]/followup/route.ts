import { NextResponse } from "next/server";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import { addProspectNote } from "@/lib/prospect-notes";
import { prisma } from "@/lib/prisma";
import { buildAbsoluteUrl } from "@/lib/urls";

function parseFollowUpDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return null;
  }

  const parsed = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function formatFollowUpNoteDate(value: string) {
  const parsed = parseFollowUpDate(value);
  if (!parsed) {
    return value;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(parsed);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const { id } = await params;
  const prospect = await prisma.prospect.findUnique({ where: { id }, select: { id: true } });

  if (!prospect) {
    redirect("/admin/prospects");
  }

  const formData = await request.formData();
  const rawDate = formData.get("date");
  const dateValue = typeof rawDate === "string" ? rawDate.trim() : "";

  if (!dateValue) {
    await prisma.$transaction([
      prisma.prospect.update({
        where: { id },
        data: { followUpDate: null },
      }),
      addProspectNote(prisma, id, "Follow-up date cleared"),
    ]);

    return NextResponse.redirect(await buildAbsoluteUrl(`/admin/prospects/${id}`), 303);
  }

  const followUpDate = parseFollowUpDate(dateValue);
  if (!followUpDate) {
    return NextResponse.redirect(await buildAbsoluteUrl(`/admin/prospects/${id}`), 303);
  }

  await prisma.$transaction([
    prisma.prospect.update({
      where: { id },
      data: { followUpDate },
    }),
    addProspectNote(prisma, id, `Follow-up scheduled for ${formatFollowUpNoteDate(dateValue)}`),
  ]);

  return NextResponse.redirect(await buildAbsoluteUrl(`/admin/prospects/${id}`), 303);
}
