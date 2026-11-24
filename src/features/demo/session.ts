import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";

/**
 * Signed, expiring session tokens for the client demo (HMAC-SHA256).
 * Format: v1.<issuedAt>.<expiresAt>.<nonce>.<signature>  (all base64url / decimal seconds)
 * Rotating DEMO_SESSION_SECRET invalidates every existing session immediately.
 */
const b64url = (buf: Buffer) => buf.toString("base64url");
const sign = (payload: string, secret: string) => b64url(createHmac("sha256", secret).update(payload).digest());

export function createSessionToken(secret: string, maxAgeSec: number, now = Date.now()): string {
  const iat = Math.floor(now / 1000);
  const payload = `v1.${iat}.${iat + maxAgeSec}.${b64url(randomBytes(12))}`;
  return `${payload}.${sign(payload, secret)}`;
}

export function verifySessionToken(token: string | undefined, secret: string, now = Date.now()): boolean {
  if (!token || !secret) return false;
  const parts = token.split(".");
  if (parts.length !== 5 || parts[0] !== "v1") return false;
  const payload = parts.slice(0, 4).join(".");
  const expected = Buffer.from(sign(payload, secret));
  const given = Buffer.from(parts[4]);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return false;
  const exp = Number(parts[2]);
  const iat = Number(parts[1]);
  const t = Math.floor(now / 1000);
  return Number.isFinite(exp) && Number.isFinite(iat) && iat <= t + 60 && t < exp;
}

/** Constant-time password comparison (hash both sides so lengths match). */
export function passwordMatches(given: string, expected: string): boolean {
  if (!expected) return false;
  const a = createHash("sha256").update(given, "utf8").digest();
  const b = createHash("sha256").update(expected, "utf8").digest();
  return timingSafeEqual(a, b);
}

/**
 * Best-effort login rate limit: 5 failed attempts per IP per 15 minutes, then 15 min lockout.
 * In-memory per server instance (no paid store) — combined with a long random password and
 * a per-attempt delay this makes guessing impractical. Phase 5B: move to a shared store.
 */
const WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILS = 5;
const fails = new Map<string, { count: number; first: number }>();

export function isRateLimited(ip: string, now = Date.now()): boolean {
  const e = fails.get(ip);
  if (!e) return false;
  if (now - e.first > WINDOW_MS) { fails.delete(ip); return false; }
  return e.count >= MAX_FAILS;
}
export function recordFailure(ip: string, now = Date.now()) {
  const e = fails.get(ip);
  if (!e || now - e.first > WINDOW_MS) fails.set(ip, { count: 1, first: now });
  else e.count++;
  if (fails.size > 5000) fails.clear(); // memory guard
}
export function clearFailures(ip: string) {
  fails.delete(ip);
}
