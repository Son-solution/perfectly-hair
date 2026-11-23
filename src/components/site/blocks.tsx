import type { ReactNode } from "react";
import { LogoMark } from "@/components/brand/LogoMark";
import { Reveal } from "@/components/motion";
import { Eyebrow } from "@/components/ui/primitives";
import { cn } from "@/lib/utils";

/* ----------------------------------------------------------------- */

export function SectionIntro({
  eyebrow,
  title,
  italic,
  children,
  id,
  tone = "light",
  className,
}: {
  eyebrow: string;
  title: string;
  italic?: string;
  children?: ReactNode;
  id?: string;
  tone?: "light" | "dark";
  className?: string;
}) {
  return (
    <Reveal className={cn("max-w-3xl", className)}>
      <Eyebrow className={cn("flex items-center gap-4", tone === "dark" ? "text-ash" : "text-stone")}>
        <span aria-hidden="true" className="h-px w-10 bg-current opacity-60" />
        {eyebrow}
      </Eyebrow>
      <h2 id={id} className="mt-6 font-display text-display-lg font-normal">
        {title}
        {italic && (
          <span className={cn("block italic", tone === "dark" ? "text-white/65" : "text-graphite")}>
            {italic}
          </span>
        )}
      </h2>
      {children && (
        <div className={cn("mt-8 max-w-xl leading-relaxed", tone === "dark" ? "text-ash" : "text-graphite")}>
          {children}
        </div>
      )}
    </Reveal>
  );
}

/* ----------------------------------------------------------------- */

/** Slowly rotating circular text — a quiet, living detail. */
export function RotatingBadge({
  text = "Damen · Herren · Kinder · Wiesbaden · ",
  className,
}: {
  text?: string;
  className?: string;
}) {
  return (
    <div aria-hidden="true" className={cn("relative h-32 w-32 md:h-40 md:w-40", className)}>
      <svg viewBox="0 0 200 200" className="h-full w-full animate-spin-slow">
        <defs>
          <path id="badge-circle" d="M100,100 m-78,0 a78,78 0 1,1 156,0 a78,78 0 1,1 -156,0" />
        </defs>
        {/* textLength = circumference (2πr, r=78) so the ring closes exactly without overlap */}
        <text fill="currentColor" fontSize="14" style={{ textTransform: "uppercase" }}>
          <textPath href="#badge-circle" textLength="488" lengthAdjust="spacing">{text}</textPath>
        </text>
      </svg>
      <span className="absolute inset-0 flex items-center justify-center">
        <LogoMark decorative className="h-12 w-12 md:h-14 md:w-14" />
      </span>
    </div>
  );
}

/* ----------------------------------------------------------------- */

/** Honest status notice (e.g. booking unavailable, draft content). */
export function Notice({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div role="note" className="border border-ink bg-white p-6 md:p-8">
      <p className="flex items-center gap-3 text-eyebrow font-medium uppercase">
        <span aria-hidden="true" className="h-2 w-2 animate-breathe rounded-full bg-ink" />
        {title}
      </p>
      <div className="mt-4 leading-relaxed text-graphite">{children}</div>
    </div>
  );
}
