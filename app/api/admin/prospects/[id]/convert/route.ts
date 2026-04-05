import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.redirect(new URL("/admin/login", request.url), 303);
  }

  const { id } = await params;

  const prospect = await prisma.prospect.findUnique({ where: { id } });
  if (!prospect) {
    return NextResponse.redirect(new URL("/admin/prospects", request.url), 303);
  }

  if (prospect.status === "CLIENT_ACTIVE") {
    return NextResponse.redirect(
      new URL(`/admin/prospects/${id}?error=already_converted`, request.url),
      303
    );
  }

  const existingUser = await prisma.user.findUnique({ where: { email: prospect.email } });
  if (existingUser) {
    // Already has a user — just update status
    await prisma.prospect.update({ where: { id }, data: { status: "CLIENT_ACTIVE" } });
    return NextResponse.redirect(
      new URL(`/admin/prospects/${id}?converted=1`, request.url),
      303
    );
  }

  await prisma.$transaction([
    prisma.user.create({
      data: {
        email: prospect.email,
        role: "CLIENT",
        firstName: prospect.firstName,
        lastName: prospect.lastName,
        phone: prospect.phone,
        isActive: true
      }
    }),
    prisma.prospect.update({ where: { id }, data: { status: "CLIENT_ACTIVE" } })
  ]);

  return NextResponse.redirect(
    new URL(`/admin/prospects/${id}?converted=1`, request.url),
    303
  );
}
