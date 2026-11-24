/**
 * Local-only preview gate for the Phase 5A dashboards.
 *
 * Dashboards are visible in development (`npm run dev`) and in a local production build
 * started with DASHBOARD_PREVIEW=local. On Vercel neither condition is true, so every
 * dashboard route renders 404. NEVER set DASHBOARD_PREVIEW on Vercel.
 *
 * This is not authentication — it only keeps the unprotected design preview off production.
 */
export const dashboardPreviewEnabled =
  process.env.NODE_ENV !== "production" || process.env.DASHBOARD_PREVIEW === "local";
