import { NextResponse, type NextRequest } from "next/server";
import { DEMO_COOKIE, demoConfig, demoMode } from "@/features/demo/config";
import { verifySessionToken } from "@/features/demo/session";

/**
 * Proxy (Next.js 16). Only does something in the protected client-demo deployment
 * (DEMO_ENVIRONMENT=client-demo). In every other environment — including production — it
 * returns immediately and changes nothing.
 *
 * Demo behaviour:
 *  - every response gets `X-Robots-Tag: noindex, nofollow, noarchive`
 *  - fail-closed: missing/weak credentials → 503 for everything
 *  - no valid signed session cookie → redirect to /demo-zugang
 */
const PUBLIC_PATHS = new Set(["/demo-zugang", "/demo-zugang/login", "/robots.txt", "/icon.svg", "/favicon.ico"]);
const NOINDEX = "noindex, nofollow, noarchive";

export function proxy(request: NextRequest) {
  if (!demoMode) return NextResponse.next();

  const cfg = demoConfig();
  if (!cfg.valid) {
    return new NextResponse("Demo nicht konfiguriert – Zugriff gesperrt.", {
      status: 503,
      headers: { "X-Robots-Tag": NOINDEX, "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
    });
  }

  const { pathname, search } = request.nextUrl;
  const authed = verifySessionToken(request.cookies.get(DEMO_COOKIE)?.value, cfg.secret);

  if (!authed && !PUBLIC_PATHS.has(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = "/demo-zugang";
    url.search = "";
    url.searchParams.set("weiter", `${pathname}${search}`);
    const res = NextResponse.redirect(url, 303);
    res.headers.set("X-Robots-Tag", NOINDEX);
    res.headers.set("Cache-Control", "no-store");
    return res;
  }

  const res = NextResponse.next();
  res.headers.set("X-Robots-Tag", NOINDEX);
  // Protected content must not be stored by shared caches.
  if (!PUBLIC_PATHS.has(pathname)) res.headers.set("Cache-Control", "private, no-store");
  return res;
}

export const config = {
  // Everything except build assets (JS/CSS/fonts contain no protected data).
  matcher: ["/((?!_next/static|_next/image).*)"],
};
