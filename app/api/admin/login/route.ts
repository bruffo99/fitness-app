import { NextResponse } from "next/server";
import { createAdminSession, verifyAdminCredentials } from "@/lib/auth";
import { buildAbsoluteUrl } from "@/lib/urls";

export async function POST(request: Request) {
  const formData = await request.formData();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  const user = await verifyAdminCredentials(email, password);

  if (!user) {
    return NextResponse.redirect(await buildAbsoluteUrl("/admin/login?error=1"), 303);
  }

  await createAdminSession(user);

  return NextResponse.redirect(await buildAbsoluteUrl("/admin"), 303);
}
