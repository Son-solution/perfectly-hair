import { NextResponse, type NextRequest } from "next/server";
import { DEMO_COOKIE, demoMode } from "@/features/demo/config";

/** Ends the demo session (POST from the "Abmelden" buttons). */
export async function POST(request: NextRequest) {
  if (!demoMode) return new NextResponse(null, { status: 404 });
  const res = NextResponse.redirect(new URL("/demo-zugang?abgemeldet=1", request.url), 303);
  res.cookies.set({ name: DEMO_COOKIE, value: "", httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 0 });
  res.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
  res.headers.set("Cache-Control", "no-store");
  return res;
}
