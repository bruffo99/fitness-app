import crypto from "node:crypto";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

const SESSION_COOKIE = "ruffo_admin_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7;

type SessionPayload = {
  userId: string;
  email: string;
  role: string;
  expiresAt: string;
};

function getSessionSecret() {
  const secret = process.env.SESSION_SECRET;

  if (!secret) {
    throw new Error("SESSION_SECRET is required");
  }

  return secret;
}

function hashValue(value: string) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function encodeSession(payload: SessionPayload) {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto
    .createHmac("sha256", getSessionSecret())
    .update(body)
    .digest("base64url");

  return `${body}.${signature}`;
}

function decodeSession(token: string): SessionPayload | null {
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
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as SessionPayload;
    if (new Date(payload.expiresAt).getTime() < Date.now()) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

function hashPassword(password: string, salt?: string) {
  const finalSalt = salt ?? crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, finalSalt, 64).toString("hex");

  return `${finalSalt}:${hash}`;
}

function verifyPassword(password: string, storedHash: string) {
  const [salt, originalHash] = storedHash.split(":");

  if (!salt || !originalHash) {
    return false;
  }

  const comparison = crypto.scryptSync(password, salt, 64).toString("hex");
  const originalHashBuffer = Buffer.from(originalHash);
  const comparisonBuffer = Buffer.from(comparison);

  if (originalHashBuffer.length !== comparisonBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(originalHashBuffer, comparisonBuffer);
}

async function ensureBootstrapAdmin(email: string, password: string) {
  const bootstrapEmail = process.env.ADMIN_BOOTSTRAP_EMAIL?.trim().toLowerCase();
  const bootstrapPassword = process.env.ADMIN_BOOTSTRAP_PASSWORD ?? "";

  if (!bootstrapEmail || !bootstrapPassword) {
    return null;
  }

  if (email !== bootstrapEmail || password !== bootstrapPassword) {
    return null;
  }

  const passwordHash = hashPassword(password);

  return prisma.user.upsert({
    where: { email },
    update: {
      role: "ADMIN",
      passwordHash
    },
    create: {
      email,
      role: "ADMIN",
      passwordHash
    }
  });
}

export async function verifyAdminCredentials(email: string, password: string) {
  if (!email || !password) {
    return null;
  }

  const existingUser = await prisma.user.findUnique({
    where: { email }
  });

  if (existingUser?.passwordHash && verifyPassword(password, existingUser.passwordHash)) {
    return existingUser;
  }

  return ensureBootstrapAdmin(email, password);
}

export async function createAdminSession(user: {
  id: string;
  email: string;
  role: string;
}) {
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
  const token = crypto.randomUUID();
  const tokenHash = hashValue(token);

  await prisma.adminSession.create({
    data: {
      userId: user.id,
      tokenHash,
      expiresAt
    }
  });

  const cookieValue = encodeSession({
    userId: user.id,
    email: user.email,
    role: user.role,
    expiresAt: expiresAt.toISOString()
  });

  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE, `${token}.${cookieValue}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt
  });
}

export async function getAdminSession() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE)?.value;

  if (!sessionCookie) {
    return null;
  }

  const firstDot = sessionCookie.indexOf(".");

  if (firstDot === -1) {
    return null;
  }

  const token = sessionCookie.slice(0, firstDot);
  const signedPayload = sessionCookie.slice(firstDot + 1);
  const payload = decodeSession(signedPayload);

  if (!payload) {
    return null;
  }

  const dbSession = await prisma.adminSession.findFirst({
    where: {
      userId: payload.userId,
      tokenHash: hashValue(token),
      expiresAt: {
        gt: new Date()
      }
    }
  });

  if (!dbSession) {
    return null;
  }

  return payload;
}

export async function destroyAdminSession() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE)?.value;

  if (sessionCookie) {
    const firstDot = sessionCookie.indexOf(".");

    if (firstDot !== -1) {
      const token = sessionCookie.slice(0, firstDot);
      await prisma.adminSession.deleteMany({
        where: {
          tokenHash: hashValue(token)
        }
      });
    }
  }

  cookieStore.set(SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(0)
  });
}
