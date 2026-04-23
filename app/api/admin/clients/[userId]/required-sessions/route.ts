import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { buildAbsoluteUrl } from "@/lib/urls";

function parseRequiredSessionsPerWeek(value: FormDataEntryValue | null) {
  if (typeof value !== "string") {
    return null;
  }

  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.redirect(await buildAbsoluteUrl("/admin/login"), 303);
  }

  const { userId } = await params;
  const formData = await request.formData();
  const requiredSessionsPerWeek = parseRequiredSessionsPerWeek(
    formData.get("requiredSessionsPerWeek")
  );

  if (requiredSessionsPerWeek === null) {
    return NextResponse.json({ ok: false, error: "invalid_required_sessions" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true },
  });

  if (!user || user.role !== "CLIENT") {
    return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  }

  await prisma.clientProfile.upsert({
    where: {
      userId,
    },
    update: {
      requiredSessionsPerWeek,
    },
    create: {
      requiredSessionsPerWeek,
      userId,
    },
  });

  return NextResponse.redirect(
    await buildAbsoluteUrl(`/admin/clients/${userId}/photos`),
    303
  );
}
