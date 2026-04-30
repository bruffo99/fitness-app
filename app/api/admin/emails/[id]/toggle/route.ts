import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { buildAbsoluteUrl } from "@/lib/urls";

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
  const isEnabled = formData.get("isEnabled") === "on";

  await prisma.emailQueue.update({
    where: { id },
    data: { isEnabled },
  });

  return NextResponse.redirect(await buildAbsoluteUrl("/admin/emails"), 303);
}
