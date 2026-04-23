import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { buildAbsoluteUrl } from "@/lib/urls";

const magicLinkSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(255)
});

function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const parsed = magicLinkSchema.safeParse({
    email: String(formData.get("email") ?? "")
  });

  if (!parsed.success) {
    return NextResponse.redirect(await buildAbsoluteUrl("/portal/login?error=1"), 303);
  }

  const { email } = parsed.data;
  const existingUser = await prisma.user.findUnique({
    where: { email }
  });

  let userId: string | null = null;

  if (!existingUser) {
    const user = await prisma.user.create({
      data: {
        email,
        role: "CLIENT"
      }
    });

    userId = user.id;
  } else if (existingUser.role === "CLIENT") {
    userId = existingUser.id;
  }

  if (userId) {
    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = hashToken(rawToken);
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL?.trim();
    const bridgeToken = process.env.GOG_MAIL_BRIDGE_TOKEN?.trim();

    if (!baseUrl) {
      throw new Error("NEXT_PUBLIC_BASE_URL is required");
    }

    if (!bridgeToken) {
      throw new Error("GOG_MAIL_BRIDGE_TOKEN is required");
    }

    await prisma.magicLinkToken.create({
      data: {
        userId,
        email,
        tokenHash,
        expiresAt
      }
    });

    const magicLinkUrl = `${baseUrl.replace(/\/$/, "")}/api/auth/verify?token=${rawToken}`;
    const subject = "Your coaching portal sign-in link";
    const body =
      `Sign in to your coaching portal:\n\n${magicLinkUrl}\n\n` +
      "This secure link expires in 30 minutes. If you did not request it, you can ignore this email.";

    const response = await fetch("http://127.0.0.1:3011/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-bridge-token": bridgeToken
      },
      body: JSON.stringify({
        messages: [{ to: email, subject, body }]
      })
    });

    if (!response.ok) {
      const message = await response.text();
      throw new Error(`Mail bridge responded ${response.status}: ${message}`);
    }
  }

  return NextResponse.redirect(await buildAbsoluteUrl("/portal/login?sent=1"), 303);
}
