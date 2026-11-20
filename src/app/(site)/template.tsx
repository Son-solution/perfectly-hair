import type { ReactNode } from "react";

/**
 * Re-mounts on every navigation inside the public site, so each page enters with a
 * short CSS transition. Pure CSS: content is never hidden waiting for JavaScript,
 * and prefers-reduced-motion disables it via the global rule.
 */
export default function SiteTemplate({ children }: { children: ReactNode }) {
  return <div className="animate-page-in">{children}</div>;
}
