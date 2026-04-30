import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { generateWeeklyEmailDrafts } from "@/lib/email-queue";
import { getCurrentWeekStartUtc } from "@/lib/utils";
import { buildAbsoluteUrl } from "@/lib/urls";

export async function POST() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.redirect(await buildAbsoluteUrl("/admin/login"), 303);
  }

  const result = await generateWeeklyEmailDrafts(getCurrentWeekStartUtc());

  return NextResponse.redirect(
    await buildAbsoluteUrl(`/admin/emails?generated=${result.generated}`),
    303
  );
}
