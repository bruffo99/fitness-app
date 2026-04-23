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

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL?.trim();
  const bridgeToken = process.env.GOG_MAIL_BRIDGE_TOKEN?.trim();

  if (!baseUrl) {
    throw new Error("NEXT_PUBLIC_BASE_URL is required");
  }

  if (!bridgeToken) {
    throw new Error("GOG_MAIL_BRIDGE_TOKEN is required");
  }

  const prospect = await prisma.prospect.findFirst({
    where: { email: user.email },
    orderBy: { createdAt: "desc" },
  });

  await prisma.clientProfile.update({
    where: { userId: user.id },
    data: { onboardingStatus: "intake_sent" },
  });

  const onboardingUrl = `${baseUrl.replace(/\/$/, "")}/portal/onboarding`;
  const response = await fetch("http://127.0.0.1:3011/send", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-bridge-token": bridgeToken,
    },
    body: JSON.stringify({
      messages: [
        {
          to: user.email,
          subject: "Welcome to Ruffo Fitness — complete your onboarding",
          body:
            "Welcome to Ruffo Fitness.\n\n" +
            "Your coaching account is ready, and the next step is to complete your onboarding intake so programming can be built around you.\n\n" +
            `Complete your intake here:\n${onboardingUrl}\n\n` +
            "Fill it out as clearly as you can. Once it is submitted, your coach will review it and activate your account."
        }
      ],
    }),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Mail bridge responded ${response.status}: ${message}`);
  }

  if (prospect) {
    await addProspectNote(prisma, prospect.id, "Onboarding intake sent");
  }

  return NextResponse.redirect(
    await buildAbsoluteUrl(prospect ? `/admin/prospects/${prospect.id}` : "/admin/prospects"),
    303
  );
}
