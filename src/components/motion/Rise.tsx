import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Entrance animation for ABOVE-THE-FOLD content. Pure CSS: plays on first paint,
 * before (and without) JavaScript, so the hero headline is never hidden waiting
 * for hydration. Reduced motion is handled by the global CSS rule.
 * Use `Reveal` for content further down the page.
 */
export function Rise({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <div className={cn("animate-rise", className)} style={{ animationDelay: `${delay}s` }}>
      {children}
    </div>
  );
}
