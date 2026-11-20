"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { useEffect, useRef, useState, type MouseEvent } from "react";
import { SalonImage } from "@/components/media/SalonImage";
import { useLiveSection } from "@/components/motion/useLiveSection";
import { audienceList } from "@/content/audiences";
import { cn } from "@/lib/utils";

const CYCLE_MS = 5200;
const ease = [0.22, 1, 0.36, 1] as const;

/**
 * Damen / Herren / Kinder as full-height editorial panels.
 * Desktop: the active panel expands (hover/focus), with strong Ken Burns on its photo;
 *          panels auto-cycle while the visitor is not interacting.
 * Touch:   vertically stacked; first tap expands a panel, a tap on the expanded
 *          panel (or its "Entdecken" link) opens the category.
 */
export function CategoryPanels() {
  const reduce = useReducedMotion();
  const { ref, live } = useLiveSection<HTMLDivElement>();
  const [active, setActive] = useState(0);
  const [interacting, setInteracting] = useState(false);
  const touchRef = useRef(false);

  useEffect(() => {
    touchRef.current = window.matchMedia("(hover: none)").matches;
  }, []);

  useEffect(() => {
    if (reduce || !live || interacting) return;
    const id = window.setTimeout(() => setActive((a) => (a + 1) % audienceList.length), CYCLE_MS);
    return () => window.clearTimeout(id);
  }, [active, reduce, live, interacting]);

  const onPanelClick = (i: number) => (e: MouseEvent<HTMLAnchorElement>) => {
    // On touch devices the first tap only expands the panel.
    if (touchRef.current && i !== active) {
      e.preventDefault();
      setActive(i);
      setInteracting(true);
    }
  };

  return (
    <div
      ref={ref}
      className="flex h-auto flex-col gap-1.5 md:h-[86vh] md:min-h-[560px] md:flex-row md:gap-2"
      onMouseEnter={() => setInteracting(true)}
      onMouseLeave={() => setInteracting(false)}
    >
      {audienceList.map((a, i) => {
        const isActive = i === active;
        return (
          <Link
            key={a.slug}
            href={`/${a.slug}`}
            onClick={onPanelClick(i)}
            onMouseEnter={() => setActive(i)}
            onFocus={() => setActive(i)}
            aria-label={`${a.label}: ${a.teaser}`}
            className={cn(
              "group relative block overflow-hidden bg-ink-soft text-white",
              "transition-[flex-grow,height] duration-[1100ms] ease-[cubic-bezier(0.22,1,0.36,1)]",
              "md:h-full md:basis-0",
              isActive ? "h-[64svh] md:flex-[3.4_1_0%]" : "h-[17svh] min-h-[110px] md:flex-[1_1_0%]",
            )}
          >
            {/* Photo */}
            <div className={cn("absolute inset-0", isActive ? "animate-ken-strong" : "scale-[1.12]")}>
              <SalonImage image={a.hero} sizes="(min-width: 768px) 60vw, 100vw" showLabel={false} />
            </div>
            <div
              aria-hidden="true"
              className={cn(
                "absolute inset-0 transition-[background-color] duration-1000",
                isActive ? "bg-black/25" : "bg-black/62 group-hover:bg-black/45",
              )}
            />
            <div
              aria-hidden="true"
              className="absolute inset-x-0 bottom-0 h-2/3 bg-[linear-gradient(0deg,rgba(10,10,10,0.92),transparent)]"
            />

            {/* Progress line */}
            <span aria-hidden="true" className="absolute inset-x-0 top-0 h-px overflow-hidden bg-white/10">
              {isActive && !reduce && !interacting && (
                <span
                  key={active}
                  className="animate-progress block h-full origin-left bg-white"
                  style={{ animationDuration: `${CYCLE_MS}ms` }}
                />
              )}
            </span>

            {/* Numeral */}
            <span className="absolute left-5 top-5 text-[0.625rem] uppercase tracking-[0.34em] text-white/70 md:left-7 md:top-7">
              {a.numeral} / 03
            </span>
            <span className="absolute right-5 top-5 text-[0.5625rem] uppercase tracking-[0.3em] text-white/45 md:right-7 md:top-7">
              Symbolbild
            </span>

            {/* Collapsed label (vertical on desktop) */}
            <span
              aria-hidden="true"
              className={cn(
                "absolute bottom-6 left-5 whitespace-nowrap font-display text-4xl leading-none transition-opacity duration-500 md:bottom-10 md:left-7 md:rotate-180 md:text-6xl md:[writing-mode:vertical-rl]",
                isActive ? "opacity-0" : "opacity-100",
              )}
            >
              {a.label}
            </span>

            {/* Expanded content */}
            <AnimatePresence initial={false}>
              {isActive && (
                <motion.div
                  key="content"
                  className="absolute inset-x-0 bottom-0 p-5 md:p-10 lg:p-14"
                  initial={{ opacity: 0, y: 28 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 12, transition: { duration: 0.25 } }}
                  transition={{ duration: 0.9, ease, delay: 0.25 }}
                >
                  <p className="text-[0.625rem] uppercase tracking-[0.34em] text-white/60">{a.eyebrow}</p>
                  <h3 className="mt-3 font-display text-[clamp(3.2rem,8vw,8rem)] leading-[0.9]">
                    {a.label}
                  </h3>
                  <p className="mt-2 font-display text-[clamp(1.25rem,2.2vw,2rem)] italic text-white/75">
                    {a.titleItalic}
                  </p>
                  <div className="mt-6 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                    <ul className="hidden gap-6 text-sm text-white/70 lg:flex">
                      {a.principles.map((p) => (
                        <li key={p.title} className="border-t border-white/25 pt-3">
                          {p.title}
                        </li>
                      ))}
                    </ul>
                    <span className="inline-flex items-center gap-4 self-start border border-white/50 px-6 py-3.5 text-[0.6875rem] uppercase tracking-[0.26em] transition-colors duration-500 group-hover:bg-white group-hover:text-ink md:self-auto">
                      {a.label} entdecken
                      <span aria-hidden="true" className="h-px w-8 bg-current" />
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </Link>
        );
      })}
    </div>
  );
}
