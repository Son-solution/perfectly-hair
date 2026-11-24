import { demoReady } from "@/features/demo/config";

/**
 * Preview gate for the dashboards (demo data, no real auth yet).
 *
 * Visible in:
 *  - development (`npm run dev`)
 *  - a local production build started with DASHBOARD_PREVIEW=local
 *  - the PASSWORD-PROTECTED client demo (DEMO_ENVIRONMENT=client-demo + credentials; see
 *    src/proxy.ts). Without valid credentials the demo fails closed.
 * Production never sets these variables → every dashboard route renders 404.
 * NEVER set DASHBOARD_PREVIEW or DEMO_ENVIRONMENT for the Production environment on Vercel.
 *
 * This is not authentication for real data — Phase 5B replaces it with Supabase Auth.
 */
export const dashboardPreviewEnabled =
  process.env.NODE_ENV !== "production" || process.env.DASHBOARD_PREVIEW === "local" || demoReady;
