import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { sendEnabledEmailQueue } from "@/lib/email-queue";
import { buildAbsoluteUrl } from "@/lib/urls";

export async function POST() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.redirect(await buildAbsoluteUrl("/admin/login"), 303);
  }

  const result = await sendEnabledEmailQueue();

  return NextResponse.redirect(
    await buildAbsoluteUrl(`/admin/emails?sent=${result.sent}&failed=${result.failed}`),
    303
  );
}
