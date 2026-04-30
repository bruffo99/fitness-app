import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { buildAbsoluteUrl } from "@/lib/urls";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.redirect(await buildAbsoluteUrl("/admin/login"), 303);
  }

  const { id } = await params;

  await prisma.emailQueue.update({
    where: { id },
    data: {
      status: "SKIPPED",
      isEnabled: false,
    },
  });

  return NextResponse.redirect(await buildAbsoluteUrl("/admin/emails"), 303);
}
