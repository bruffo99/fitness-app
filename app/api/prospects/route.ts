import { Prisma } from "@prisma/client";
import { after, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { sendProspectEmails } from "@/lib/mail";
import { buildAbsoluteUrl } from "@/lib/urls";

const prospectSchema = z.object({
  firstName: z.string().trim().min(1).max(100),
  lastName:  z.string().trim().min(1).max(100),
  email:     z.string().trim().toLowerCase().email().max(255),
  phone:     z.string().trim().max(30).optional().transform((v) => v || null),
  goalSummary:      z.string().trim().min(1).max(2000),
  goalType:         z.string().trim().max(50).optional().transform((v) => v || null),
  fitnessLevel:     z.string().trim().max(50).optional().transform((v) => v || null),
  timeline:         z.string().trim().max(50).optional().transform((v) => v || null),
  injuries:         z.string().trim().max(2000).optional().transform((v) => v || null),
  preferredContact: z.string().trim().max(50).optional().transform((v) => v || null),
  referralSource:   z.string().trim().max(100).optional().transform((v) => v || null),
  message:          z.string().trim().max(5000).optional().transform((v) => v || null),
});

export async function POST(request: Request) {
  const formData = await request.formData();

  const parsed = prospectSchema.safeParse({
    firstName:        String(formData.get("firstName") ?? ""),
    lastName:         String(formData.get("lastName") ?? ""),
    email:            String(formData.get("email") ?? ""),
    phone:            String(formData.get("phone") ?? ""),
    goalSummary:      String(formData.get("goalSummary") ?? ""),
    goalType:         String(formData.get("goalType") ?? ""),
    fitnessLevel:     String(formData.get("fitnessLevel") ?? ""),
    timeline:         String(formData.get("timeline") ?? ""),
    injuries:         String(formData.get("injuries") ?? ""),
    preferredContact: String(formData.get("preferredContact") ?? ""),
    referralSource:   String(formData.get("referralSource") ?? ""),
    message:          String(formData.get("message") ?? ""),
  });

  if (!parsed.success) {
    return NextResponse.redirect(await buildAbsoluteUrl("/?status=error"), 303);
  }

  const data = parsed.data;

  const existing = await prisma.prospect.findFirst({ where: { email: data.email } });
  if (existing) {
    return NextResponse.redirect(await buildAbsoluteUrl("/?status=duplicate"), 303);
  }

  try {
    const prospect = await prisma.prospect.create({
      data: {
        firstName:        data.firstName,
        lastName:         data.lastName,
        email:            data.email,
        phone:            data.phone,
        goalSummary:      data.goalSummary,
        goalType:         data.goalType,
        fitnessLevel:     data.fitnessLevel,
        timeline:         data.timeline,
        injuries:         data.injuries,
        preferredContact: data.preferredContact,
        referralSource:   data.referralSource,
        message:          data.message,
        source:           data.referralSource ?? "website",
      },
    });

    after(() =>
      sendProspectEmails({
        firstName:        prospect.firstName,
        lastName:         prospect.lastName,
        email:            prospect.email,
        phone:            prospect.phone,
        goalSummary:      prospect.goalSummary,
        preferredContact: prospect.preferredContact,
        message:          prospect.message,
      })
    );

    return NextResponse.redirect(await buildAbsoluteUrl("/thanks"), 303);
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.redirect(
        await buildAbsoluteUrl("/?status=duplicate"),
        303
      );
    }
    return NextResponse.redirect(await buildAbsoluteUrl("/?status=error"), 303);
  }
}
