import { after, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendProspectEmails } from "@/lib/mail";
import { buildAbsoluteUrl } from "@/lib/urls";

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
    return NextResponse.redirect(await buildAbsoluteUrl("/?status=error"), 303);
  }

  const existing = await prisma.prospect.findFirst({ where: { email } });
  if (existing) {
    return NextResponse.redirect(await buildAbsoluteUrl("/?status=duplicate"), 303);
  }

  try {
    const prospect = await prisma.prospect.create({
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

    after(() => sendProspectEmails({
      firstName: prospect.firstName,
      lastName: prospect.lastName,
      email: prospect.email,
      phone: prospect.phone,
      goalSummary: prospect.goalSummary,
      preferredContact: prospect.preferredContact,
      message: prospect.message,
    }));

    return NextResponse.redirect(await buildAbsoluteUrl("/?status=success"), 303);
  } catch {
    return NextResponse.redirect(await buildAbsoluteUrl("/?status=error"), 303);
  }
}
