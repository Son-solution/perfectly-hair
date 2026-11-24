/**
 * Protected client-demo environment (Phase 5A.2).
 *
 * Active ONLY when the deployment sets DEMO_ENVIRONMENT=client-demo (Vercel: Preview
 * environment, branch `client-demo`). Production never sets it, so nothing here affects the
 * live site. Credentials come exclusively from environment variables — never from code.
 *
 * Fail-closed: if demo mode is on but the password or session secret is missing/weak, the
 * proxy blocks every request (503) instead of serving the site unprotected.
 */
export const DEMO_COOKIE = "ph_demo_session";

export const demoMode = process.env.DEMO_ENVIRONMENT === "client-demo";

export function demoConfig() {
  const password = process.env.DEMO_ACCESS_PASSWORD ?? "";
  const secret = process.env.DEMO_SESSION_SECRET ?? "";
  const hours = Number(process.env.DEMO_SESSION_HOURS ?? "12");
  const valid = password.length >= 12 && secret.length >= 32 && Number.isFinite(hours) && hours > 0 && hours <= 72;
  return { valid, password, secret, maxAgeSec: Math.round((Number.isFinite(hours) ? hours : 12) * 3600) };
}

/** Demo is usable: mode on AND credentials configured. Evaluated at build time for static pages. */
export const demoReady = demoMode && demoConfig().valid;
