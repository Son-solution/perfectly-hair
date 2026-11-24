import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { dashboardPreviewEnabled } from "@/features/dashboard/preview-gate";

/**
 * Dashboards (Phase 5A) — LOCAL DESIGN PREVIEW ONLY.
 * Without real authentication these routes must never be reachable in production:
 * on Vercel (NODE_ENV=production, no DASHBOARD_PREVIEW) every route here is a 404.
 */
export const metadata: Metadata = {
  title: "Verwaltung (Vorschau)",
  robots: { index: false, follow: false },
};

export default function DashboardGroupLayout({ children }: { children: React.ReactNode }) {
  if (!dashboardPreviewEnabled) notFound();
  return children;
}
