import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Edge-compatible session check.
 * Note: We only verify expiry here (no HMAC — Edge crypto is async and slow per-request).
 * Full HMAC + DB verification still happens inside getAdminSession() on every server component.
 * This middleware just gives a fast redirect to /admin/login instead of a blank error.
 */

const SESSION_COOKIE = "ruffo_admin_session";
const PUBLIC_ADMIN_PATHS = ["/admin/login"];

function base64urlDecode(str: string): string {
  // Convert base64url to standard base64, then decode
  const base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  return atob(base64);
}

function hasValidSession(cookieValue: string): boolean {
  try {
    // Cookie format: <rawToken>.<base64urlBody>.<base64urlSignature>
    const firstDot = cookieValue.indexOf(".");
    if (firstDot === -1) return false;

    const signedPayload = cookieValue.slice(firstDot + 1);
    const lastDot = signedPayload.lastIndexOf(".");
    if (lastDot === -1) return false;

    const body = signedPayload.slice(0, lastDot);
    const decoded = base64urlDecode(body);
    const payload = JSON.parse(decoded) as { expiresAt?: string };

    return !!payload.expiresAt && new Date(payload.expiresAt).getTime() > Date.now();
  } catch {
    return false;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only guard /admin routes
  if (!pathname.startsWith("/admin")) return NextResponse.next();

  // Let the login page through
  if (PUBLIC_ADMIN_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  const sessionCookie = request.cookies.get(SESSION_COOKIE)?.value;

  if (!sessionCookie || !hasValidSession(sessionCookie)) {
    const loginUrl = new URL("/admin/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
