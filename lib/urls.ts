import { headers } from "next/headers";

function sanitizeProto(value: string | null) {
  return value === "http" || value === "https" ? value : "https";
}

function sanitizeHost(value: string | null) {
  if (!value) return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export async function getBaseUrl() {
  const headerStore = await headers();

  const forwardedHost = sanitizeHost(headerStore.get("x-forwarded-host"));
  const forwardedProto = sanitizeProto(headerStore.get("x-forwarded-proto"));

  if (forwardedHost) {
    return `${forwardedProto}://${forwardedHost}`;
  }

  const host = sanitizeHost(headerStore.get("host"));
  if (host) {
    return `${forwardedProto}://${host}`;
  }

  return process.env.PUBLIC_APP_URL ?? "http://localhost:3004";
}

export async function buildAbsoluteUrl(path: string) {
  return new URL(path, await getBaseUrl());
}
