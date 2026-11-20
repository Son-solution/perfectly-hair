import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Slow, continuous cinematic zoom — runs without scrolling.
 * Pure CSS (GPU transform), so it costs nothing on the main thread and is
 * disabled automatically by the global prefers-reduced-motion rule.
 */
export function KenBurns({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  /** Offset in seconds so neighbouring images don't move in sync. */
  delay?: number;
}) {
  return (
    <div className={cn("relative overflow-hidden", className)}>
      <div
        className="absolute inset-0 animate-ken-burns will-change-transform"
        style={{ animationDelay: `-${delay}s` }}
      >
        {children}
      </div>
    </div>
  );
}
