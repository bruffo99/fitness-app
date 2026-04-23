import { NextResponse } from "next/server";
import { buildAbsoluteUrl } from "@/lib/urls";

export async function GET() {
  const response = NextResponse.redirect(await buildAbsoluteUrl("/portal/login"), 303);

  response.cookies.set("client_session", "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/portal",
    expires: new Date(0)
  });

  return response;
}
