"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useLiveSection } from "./useLiveSection";

/** Wrapper that pauses the CSS loops inside it while off-screen or in a hidden tab. */
export function LiveBand({ children, className }: { children: ReactNode; className?: string }) {
  const { ref } = useLiveSection<HTMLDivElement>();
  return (
    <div ref={ref} className={cn(className)}>
      {children}
    </div>
  );
}

/** Scroll-to-top control for the footer. */
export function BackToTop({ className }: { className?: string }) {
  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className={cn(
        "group inline-flex items-center gap-3 text-[0.6875rem] uppercase tracking-[0.26em] text-white/70 transition-colors hover:text-white",
        className,
      )}
    >
      Nach oben
      <span aria-hidden="true" className="relative block h-8 w-px overflow-hidden bg-white/25">
        <span className="absolute inset-x-0 bottom-0 h-full origin-bottom scale-y-0 bg-white transition-transform duration-500 group-hover:scale-y-100" />
      </span>
    </button>
  );
}
