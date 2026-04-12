/**
 * Simple in-memory rate limiter.
 * Works for single-process / single-server deployments.
 * To scale multi-instance, swap the store for Redis/Upstash.
 */

type Attempt = { count: number; resetAt: number };

const store = new Map<string, Attempt>();

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

function cleanup() {
  const now = Date.now();
  for (const [key, attempt] of store.entries()) {
    if (attempt.resetAt < now) store.delete(key);
  }
}

export function checkRateLimit(key: string): {
  allowed: boolean;
  remaining: number;
  resetAt: number;
} {
  cleanup();
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || entry.resetAt < now) {
    store.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true, remaining: MAX_ATTEMPTS - 1, resetAt: now + WINDOW_MS };
  }

  entry.count++;

  if (entry.count > MAX_ATTEMPTS) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }

  return {
    allowed: true,
    remaining: MAX_ATTEMPTS - entry.count,
    resetAt: entry.resetAt,
  };
}

export function resetRateLimit(key: string) {
  store.delete(key);
}
