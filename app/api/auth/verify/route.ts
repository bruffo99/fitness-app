import crypto from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
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
  response.cookies.set("client_session", magicLink.user.id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  return response;
}
