import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { buildAbsoluteUrl } from "@/lib/urls";

const VALID_STATUSES = [
  "NEW_LEAD",
  "CONTACTED",
  "QUALIFIED",
  "CLIENT_ACTIVE",
  "INACTIVE",
  "ARCHIVED"
] as const;

type ProspectStatus = (typeof VALID_STATUSES)[number];

function isValidStatus(value: string): value is ProspectStatus {
  return (VALID_STATUSES as readonly string[]).includes(value);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.redirect(await buildAbsoluteUrl("/admin/login"), 303);
  }

  const { id } = await params;
  const formData = await request.formData();
  const action = String(formData.get("_action") ?? "");

  const prospect = await prisma.prospect.findUnique({ where: { id } });
  if (!prospect) {
    return NextResponse.redirect(await buildAbsoluteUrl("/admin/prospects"), 303);
  }

  if (action === "update_status") {
    const status = String(formData.get("status") ?? "");
    if (!isValidStatus(status)) {
      return NextResponse.redirect(
        await buildAbsoluteUrl(`/admin/prospects/${id}?error=invalid_status`),
        303
      );
    }
    await prisma.prospect.update({ where: { id }, data: { status } });
  } else if (action === "update_notes") {
    const notes = String(formData.get("notes") ?? "").trim();
    await prisma.prospect.update({ where: { id }, data: { notes: notes || null } });
  }

  return NextResponse.redirect(await buildAbsoluteUrl(`/admin/prospects/${id}`), 303);
}
