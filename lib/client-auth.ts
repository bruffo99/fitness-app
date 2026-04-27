import crypto from "node:crypto";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

const CLIENT_SESSION_COOKIE = "client_session";
const CLIENT_SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7;

type ClientSessionPayload = {
  userId: string;
  email: string;
  role: "CLIENT";
  expiresAt: string;
};

type CookieOptions = {
  httpOnly: boolean;
  sameSite: "lax";
  secure: boolean;
  path: string;
  expires: Date;
};

type CookieSetter = {
  set: (name: string, value: string, options: CookieOptions) => void;
};

function getSessionSecret() {
  const secret = process.env.SESSION_SECRET;

  if (!secret) {
    throw new Error("SESSION_SECRET is required");
  }

  return secret;
}

function encodeSession(payload: ClientSessionPayload) {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto
    .createHmac("sha256", getSessionSecret())
    .update(body)
    .digest("base64url");

  return `${body}.${signature}`;
}

function decodeSession(token: string): ClientSessionPayload | null {
  const [body, signature] = token.split(".");

  if (!body || !signature) {
    return null;
  }

  const expected = crypto
    .createHmac("sha256", getSessionSecret())
    .update(body)
    .digest("base64url");
  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);

  if (signatureBuffer.length !== expectedBuffer.length) {
    return null;
  }

  if (!crypto.timingSafeEqual(signatureBuffer, expectedBuffer)) {
    return null;
  }

  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as ClientSessionPayload;

    if (payload.role !== "CLIENT" || new Date(payload.expiresAt).getTime() < Date.now()) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export function setClientSessionCookie(
  cookieStore: CookieSetter,
  user: {
    id: string;
    email: string;
    role: string;
  }
) {
  if (user.role !== "CLIENT") {
    throw new Error("Client sessions can only be created for client users");
  }

  const expiresAt = new Date(Date.now() + CLIENT_SESSION_TTL_MS);

  cookieStore.set(
    CLIENT_SESSION_COOKIE,
    encodeSession({
      userId: user.id,
      email: user.email,
      role: "CLIENT",
      expiresAt: expiresAt.toISOString()
    }),
    {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      expires: expiresAt
    }
  );
}

export function clearClientSessionCookie(cookieStore: CookieSetter) {
  cookieStore.set(CLIENT_SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(0)
  });
}

export async function getClientSession() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(CLIENT_SESSION_COOKIE)?.value;

  if (!sessionCookie) {
    return null;
  }

  const payload = decodeSession(sessionCookie);

  if (!payload) {
    return null;
  }

  return prisma.user.findFirst({
    where: {
      id: payload.userId,
      email: payload.email,
      isActive: true,
      role: "CLIENT"
    }
  });
}
