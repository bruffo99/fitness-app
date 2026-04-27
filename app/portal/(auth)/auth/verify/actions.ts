"use server";

import crypto from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { setClientSessionCookie } from "@/lib/client-auth";
import { prisma } from "@/lib/prisma";

function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export async function verifyMagicLinkToken(rawToken: string) {
  if (!rawToken) {
    redirect("/portal/login?error=1");
  }

  const tokenHash = hashToken(rawToken);
  const now = new Date();
  const magicLink = await prisma.magicLinkToken.findFirst({
    where: {
      tokenHash,
      consumedAt: null,
      expiresAt: {
        gt: now
      }
    },
    include: {
      user: true
    }
  });

  if (!magicLink?.user || !magicLink.user.isActive || magicLink.user.role !== "CLIENT") {
    redirect("/portal/login?error=1");
  }

  await prisma.$transaction([
    prisma.magicLinkToken.update({
      where: { id: magicLink.id },
      data: {
        consumedAt: now
      }
    }),
    prisma.user.update({
      where: { id: magicLink.user.id },
      data: {
        lastLoginAt: now
      }
    })
  ]);

  const cookieStore = await cookies();
  setClientSessionCookie(cookieStore, magicLink.user);

  redirect("/portal");
}
