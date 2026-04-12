import { NextResponse } from "next/server";
import { destroyAdminSession } from "@/lib/auth";
import { buildAbsoluteUrl } from "@/lib/urls";

export async function POST() {
  await destroyAdminSession();

  return NextResponse.redirect(await buildAbsoluteUrl("/admin/login"), 303);
}
