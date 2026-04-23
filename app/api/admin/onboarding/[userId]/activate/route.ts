import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { addProspectNote } from "@/lib/prospect-notes";
import { prisma } from "@/lib/prisma";
import { buildAbsoluteUrl } from "@/lib/urls";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.redirect(await buildAbsoluteUrl("/admin/login"), 303);
  }

  const { userId } = await params;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { clientProfile: true },
  });

  if (!user || user.role !== "CLIENT" || !user.clientProfile) {
    return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  }

  const prospect = await prisma.prospect.findFirst({
    where: { email: user.email },
    orderBy: { createdAt: "desc" },
  });

  await prisma.clientProfile.update({
    where: { userId: user.id },
    data: { onboardingStatus: "active" },
  });

  if (prospect) {
    await addProspectNote(prisma, prospect.id, "Client activated");
  }

  return NextResponse.redirect(
    await buildAbsoluteUrl(prospect ? `/admin/prospects/${prospect.id}` : "/admin/prospects"),
    303
  );
}
