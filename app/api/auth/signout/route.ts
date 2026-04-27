import { NextResponse } from "next/server";
import { clearClientSessionCookie } from "@/lib/client-auth";
import { buildAbsoluteUrl } from "@/lib/urls";

export async function GET() {
  const response = NextResponse.redirect(await buildAbsoluteUrl("/portal/login"), 303);
  clearClientSessionCookie(response.cookies);

  return response;
}
