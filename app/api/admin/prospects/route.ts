import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { buildAbsoluteUrl } from "@/lib/urls";

const schema = z.object({
  firstName:    z.string().trim().min(1).max(100),
  lastName:     z.string().trim().min(1).max(100),
  email:        z.string().trim().toLowerCase().email().max(255),
  phone:        z.string().trim().max(30).optional().transform((v) => v || null),
  goalSummary:  z.string().trim().min(1).max(2000),
  goalType:     z.string().trim().max(50).optional().transform((v) => v || null),
  fitnessLevel: z.string().trim().max(50).optional().transform((v) => v || null),
  status:       z.enum(["NEW_LEAD", "CONTACTED", "QUALIFIED", "CLIENT_ACTIVE", "INACTIVE", "ARCHIVED"]).default("NEW_LEAD"),
});

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.redirect(await buildAbsoluteUrl("/admin/login"), 303);
  }

  const formData = await request.formData();

  const parsed = schema.safeParse({
    firstName:    String(formData.get("firstName") ?? ""),
    lastName:     String(formData.get("lastName") ?? ""),
    email:        String(formData.get("email") ?? ""),
    phone:        String(formData.get("phone") ?? ""),
    goalSummary:  String(formData.get("goalSummary") ?? ""),
    goalType:     String(formData.get("goalType") ?? ""),
    fitnessLevel: String(formData.get("fitnessLevel") ?? ""),
    status:       String(formData.get("status") ?? "NEW_LEAD"),
  });

  if (!parsed.success) {
    return NextResponse.redirect(
      await buildAbsoluteUrl("/admin/prospects/new?error=invalid"),
      303
    );
  }

  const { firstName, lastName, email, phone, goalSummary, goalType, fitnessLevel, status } = parsed.data;

  const existing = await prisma.prospect.findFirst({ where: { email } });
  if (existing) {
    return NextResponse.redirect(
      await buildAbsoluteUrl("/admin/prospects/new?error=duplicate"),
      303
    );
  }

  const prospect = await prisma.prospect.create({
    data: {
      firstName,
      lastName,
      email,
      phone,
      goalSummary,
      goalType,
      fitnessLevel,
      status,
      source: "admin",
    },
  });

  return NextResponse.redirect(
    await buildAbsoluteUrl(`/admin/prospects/${prospect.id}`),
    303
  );
}
