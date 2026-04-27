import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { setClientSessionCookie } from "@/lib/client-auth";
import { prisma } from "@/lib/prisma";
import { buildAbsoluteUrl } from "@/lib/urls";

function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const rawToken = searchParams.get("token") ?? "";

  if (!rawToken) {
    return NextResponse.redirect(await buildAbsoluteUrl("/portal/login?error=1"));
  }

  const tokenHash = hashToken(rawToken);
  const now = new Date();

  const magicLink = await prisma.magicLinkToken.findFirst({
    where: {
      tokenHash,
      consumedAt: null,
      expiresAt: { gt: now },
    },
    include: { user: true },
  });

  if (!magicLink?.user || !magicLink.user.isActive || magicLink.user.role !== "CLIENT") {
    return NextResponse.redirect(await buildAbsoluteUrl("/portal/login?error=1"));
  }

  await prisma.$transaction([
    prisma.magicLinkToken.update({
      where: { id: magicLink.id },
      data: { consumedAt: now },
    }),
    prisma.user.update({
      where: { id: magicLink.user.id },
      data: { lastLoginAt: now },
    }),
  ]);

  const response = NextResponse.redirect(await buildAbsoluteUrl("/portal"));
  setClientSessionCookie(response.cookies, magicLink.user);

  return response;
}
