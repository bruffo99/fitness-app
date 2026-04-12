import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminSession, verifyAdminCredentials } from "@/lib/auth";
import { checkRateLimit, resetRateLimit } from "@/lib/ratelimit";
import { buildAbsoluteUrl } from "@/lib/urls";

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(255),
  password: z.string().min(1).max(512),
});

export async function POST(request: Request) {
  // Rate-limit by IP — max 5 attempts per 15 minutes
  const headerStore = await headers();
  const ip =
    headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const rateCheck = checkRateLimit(`login:${ip}`);

  if (!rateCheck.allowed) {
    return NextResponse.redirect(
      await buildAbsoluteUrl("/admin/login?error=rate_limited"),
      303
    );
  }

  const formData = await request.formData();
  const parsed = loginSchema.safeParse({
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
  });

  if (!parsed.success) {
    return NextResponse.redirect(
      await buildAbsoluteUrl("/admin/login?error=1"),
      303
    );
  }

  const { email, password } = parsed.data;
  const user = await verifyAdminCredentials(email, password);

  if (!user) {
    return NextResponse.redirect(
      await buildAbsoluteUrl("/admin/login?error=1"),
      303
    );
  }

  // Successful login — clear rate limit for this IP
  resetRateLimit(`login:${ip}`);
  await createAdminSession(user);

  return NextResponse.redirect(await buildAbsoluteUrl("/admin"), 303);
}
