import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const formData = await request.formData();
  const firstName = String(formData.get("firstName") ?? "").trim();
  const lastName = String(formData.get("lastName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const phone = String(formData.get("phone") ?? "").trim();
  const goalSummary = String(formData.get("goalSummary") ?? "").trim();
  const preferredContact = String(formData.get("preferredContact") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();

  if (!firstName || !lastName || !email || !goalSummary) {
    return NextResponse.redirect(new URL("/?status=error", request.url), 303);
  }

  const existing = await prisma.prospect.findFirst({ where: { email } });
  if (existing) {
    return NextResponse.redirect(new URL("/?status=duplicate", request.url), 303);
  }

  try {
    await prisma.prospect.create({
      data: {
        firstName,
        lastName,
        email,
        phone: phone || null,
        goalSummary,
        preferredContact: preferredContact || null,
        message: message || null,
        source: "website"
      }
    });

    return NextResponse.redirect(new URL("/?status=success", request.url), 303);
  } catch {
    return NextResponse.redirect(new URL("/?status=error", request.url), 303);
  }
}
