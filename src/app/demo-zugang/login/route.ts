import { NextResponse, type NextRequest } from "next/server";
import { DEMO_COOKIE, demoConfig, demoMode } from "@/features/demo/config";
import { clearFailures, createSessionToken, isRateLimited, passwordMatches, recordFailure } from "@/features/demo/session";

const NOINDEX = "noindex, nofollow, noarchive";
/** Only same-site relative paths are accepted as redirect target (no open redirect). */
const safeTarget = (v: unknown) =>
  typeof v === "string" && v.startsWith("/") && !v.startsWith("//") && !/[\s\\]/.test(v) && !v.startsWith("/demo-zugang") ? v : "/";
const back = (request: NextRequest, params: Record<string, string>) => {
  const url = new URL("/demo-zugang", request.url);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  const res = NextResponse.redirect(url, 303);
  res.headers.set("X-Robots-Tag", NOINDEX);
  res.headers.set("Cache-Control", "no-store");
  return res;
};

/** Password check for the client demo. Sets a signed, expiring, HTTP-only session cookie. */
export async function POST(request: NextRequest) {
  if (!demoMode) return new NextResponse(null, { status: 404 });
  const cfg = demoConfig();
  if (!cfg.valid) return new NextResponse("Demo nicht konfiguriert – Zugriff gesperrt.", { status: 503 });

  const ip = (request.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || request.headers.get("x-real-ip") || "unknown";
  const form = await request.formData().catch(() => null);
  const target = safeTarget(form?.get("weiter"));

  if (isRateLimited(ip)) return back(request, { fehler: "gesperrt", weiter: target });

  const password = String(form?.get("passwort") ?? "");
  if (!passwordMatches(password, cfg.password)) {
    recordFailure(ip);
    await new Promise((r) => setTimeout(r, 800)); // slow down guessing
    return back(request, { fehler: "1", weiter: target });
  }

  clearFailures(ip);
  const res = NextResponse.redirect(new URL(target, request.url), 303);
  res.cookies.set({
    name: DEMO_COOKIE,
    value: createSessionToken(cfg.secret, cfg.maxAgeSec),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: cfg.maxAgeSec,
  });
  res.headers.set("X-Robots-Tag", NOINDEX);
  res.headers.set("Cache-Control", "no-store");
  return res;
}
