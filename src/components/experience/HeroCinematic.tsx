"use client";

import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "motion/react";
import Link from "next/link";
import { useCallback, useEffect, useState, type PointerEvent } from "react";
import { LogoMark } from "@/components/brand/LogoMark";
import { SalonImage } from "@/components/media/SalonImage";
import { useLiveSection } from "@/components/motion/useLiveSection";
import { audienceContent } from "@/content/audiences";
import { images } from "@/content/images";
import { site } from "@/config/site";
import { cn } from "@/lib/utils";

const CHAPTER_MS = 6500;
const ease = [0.76, 0, 0.24, 1] as const; // cinematic in-out for wipes

const chapters = [
  { ...audienceContent.damen, bg: images.heroOne, inset: images.damenDetail },
  { ...audienceContent.herren, bg: images.heroTwo, inset: images.herren },
  { ...audienceContent.kinder, bg: images.heroThree, inset: images.kinder },
];

/**
 * Full-viewport cinematic hero with three chapters (Damen / Herren / Kinder).
 * Time-based: chapters advance automatically with a clip-path wipe, a strong slow zoom,
 * a masked word change and progress bars. Depth: background, inset frame and type move
 * at different rates with the pointer and drift on their own when idle.
 * The first chapter is fully visible in the server HTML (no wait for JS).
 */
export function HeroCinematic() {
  const reduce = useReducedMotion();
  const { ref, live } = useLiveSection<HTMLElement>();
  const [index, setIndex] = useState(0);
  const [prev, setPrev] = useState<number | null>(null);
  const [hold, setHold] = useState(false);

  const go = useCallback(
    (next: number) => {
      if (next === index) return;
      setPrev(index);
      setIndex(next);
    },
    [index],
  );

  useEffect(() => {
    if (reduce || !live || hold) return;
    const id = window.setTimeout(() => go((index + 1) % chapters.length), CHAPTER_MS);
    return () => window.clearTimeout(id);
  }, [index, reduce, live, hold, go]);

  // Pointer depth (fine pointers only); springs keep it silky.
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const sx = useSpring(px, { stiffness: 60, damping: 20, mass: 0.6 });
  const sy = useSpring(py, { stiffness: 60, damping: 20, mass: 0.6 });
  const bgX = useTransform(sx, (v) => v * -14);
  const bgY = useTransform(sy, (v) => v * -10);
  const insetX = useTransform(sx, (v) => v * 34);
  const insetY = useTransform(sy, (v) => v * 26);
  const typeX = useTransform(sx, (v) => v * 10);

  const onPointerMove = (e: PointerEvent<HTMLElement>) => {
    if (e.pointerType !== "mouse" || reduce) return;
    const r = e.currentTarget.getBoundingClientRect();
    px.set((e.clientX - r.left) / r.width - 0.5);
    py.set((e.clientY - r.top) / r.height - 0.5);
  };

  const active = chapters[index];

  return (
    <section
      ref={ref}
      aria-labelledby="hero-title"
      onPointerMove={onPointerMove}
      onPointerLeave={() => {
        px.set(0);
        py.set(0);
      }}
      className="grain relative isolate flex min-h-[100svh] flex-col overflow-hidden bg-ink text-white"
    >
      {/* ---------- Background chapters (wipe + zoom) */}
      <motion.div aria-hidden="true" className="absolute -inset-6 -z-20" style={{ x: bgX, y: bgY }}>
        {chapters.map((c, i) => {
          const isActive = i === index;
          const isPrev = i === prev;
          return (
            <motion.div
              key={c.slug}
              className="absolute inset-0 overflow-hidden"
              style={{ zIndex: isActive ? 3 : isPrev ? 2 : 1 }}
              initial={{ clipPath: i === 0 ? "inset(0% 0% 0% 0%)" : "inset(0% 0% 0% 100%)" }}
              animate={{
                clipPath: isActive || isPrev ? "inset(0% 0% 0% 0%)" : "inset(0% 0% 0% 100%)",
              }}
              transition={{ duration: isActive ? 1.5 : 0, ease, delay: isActive || isPrev ? 0 : 1.6 }}
            >
              <motion.div
                className="absolute inset-0"
                initial={{ scale: 1.2 }}
                animate={{ scale: isActive ? 1.04 : 1.2 }}
                transition={
                  isActive
                    ? { duration: CHAPTER_MS / 1000 + 2, ease: [0.2, 0.6, 0.3, 1] }
                    : { duration: 0, delay: 1.6 }
                }
              >
                <SalonImage image={c.bg} eager={i === 0} showLabel={false} sizes="100vw" />
              </motion.div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* ---------- Light & shade */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_70%_35%,transparent_0%,rgba(10,10,10,0.35)_55%,rgba(10,10,10,0.85)_100%),linear-gradient(180deg,rgba(10,10,10,0.55)_0%,rgba(10,10,10,0.05)_35%,rgba(10,10,10,0.9)_100%)]"
      />

      {/* ---------- Inset frame (layered depth) */}
      <motion.div
        aria-hidden="true"
        className="absolute right-[6vw] top-[calc(var(--safe-top)+1.75rem)] hidden w-[min(19vw,300px,24svh)] md:block"
        style={{ x: insetX, y: insetY }}
      >
        <div className="animate-float-a">
          <div className="relative aspect-[3/4] overflow-hidden border border-white/25 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.8)]">
            {chapters.map((c, i) => (
              <motion.div
                key={c.slug}
                className="absolute inset-0"
                initial={{ clipPath: i === 0 ? "inset(0% 0% 0% 0%)" : "inset(100% 0% 0% 0%)" }}
                animate={{ clipPath: i === index ? "inset(0% 0% 0% 0%)" : "inset(100% 0% 0% 0%)" }}
                transition={{ duration: 1.3, ease, delay: i === index ? 0.25 : 0 }}
                style={{ zIndex: i === index ? 2 : 1 }}
              >
                <motion.div
                  className="absolute inset-0"
                  animate={{ scale: i === index ? 1 : 1.25 }}
                  transition={{ duration: 2.2, ease: [0.22, 1, 0.36, 1] }}
                >
                  <SalonImage image={c.inset} showLabel={false} sizes="20vw" />
                </motion.div>
              </motion.div>
            ))}
          </div>
          <p className="mt-3 flex justify-between text-[0.5625rem] uppercase tracking-[0.3em] text-white/60">
            <span>Kapitel {active.numeral}</span>
            <span>{active.label}</span>
          </p>
        </div>
      </motion.div>

      {/* ---------- Edge details */}
      <p
        aria-hidden="true"
        className="absolute left-5 top-1/2 hidden origin-left -translate-y-1/2 -rotate-90 text-[0.5625rem] uppercase tracking-[0.4em] text-white/45 lg:left-8 lg:block"
      >
        {site.address.street} · {site.address.city}
      </p>
      <p className="absolute right-5 top-[var(--safe-top)] text-[0.5625rem] uppercase leading-none tracking-[0.3em] text-white/50 md:right-[6vw]">
        Symbolbilder
      </p>

      {/* ---------- Type */}
      {/* Safe area: content starts below the fixed header and grows the section instead of overlapping it */}
      <div className="container-luxe relative flex flex-1 flex-col justify-end pb-10 pt-[calc(var(--safe-top)+1.5rem)] md:pb-14">
        <motion.div style={{ x: typeX }}>
          <p className="animate-rise flex items-center gap-4 text-[0.6875rem] uppercase tracking-[0.34em] text-white/70">
            <LogoMark decorative className="h-7 w-7" />
            Friseursalon · Wiesbaden
          </p>
          <h1 id="hero-title" className="mt-6 font-display font-normal leading-[0.9] tracking-[-0.01em]">
            <span className="-mb-[0.06em] block overflow-hidden pb-[0.12em]">
              <span className="animate-mask-up block text-[clamp(3rem,min(13.5vw,19svh),13rem)]">Perfectly</span>
            </span>
            <span className="-mb-[0.06em] block overflow-hidden pb-[0.14em]">
              <span
                className="animate-mask-up block pl-[0.9em] text-[clamp(3rem,min(13.5vw,19svh),13rem)] italic text-white/80"
                style={{ animationDelay: "0.12s" }}
              >
                Hair <span className="align-middle font-sans text-[0.11em] not-italic tracking-[0.5em] text-white/70">BY GABRIEL</span>
              </span>
            </span>
          </h1>

          {/* Masked rotating audience word */}
          <p className="mt-6 flex items-baseline gap-4 font-display text-[clamp(1.6rem,3.6vw,3rem)] leading-none">
            <span className="text-white/55 italic">Für</span>
            <span className="relative inline-block h-[1.15em] overflow-hidden align-bottom" aria-live="polite">
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                  key={active.slug}
                  className="block"
                  initial={{ y: "110%" }}
                  animate={{ y: "0%" }}
                  exit={{ y: "-110%" }}
                  transition={{ duration: 0.9, ease }}
                >
                  {active.label}
                </motion.span>
              </AnimatePresence>
            </span>
            <span className="hidden text-[0.45em] italic text-white/50 sm:inline">— {active.titleItalic}</span>
          </p>
        </motion.div>
      </div>

      {/* ---------- Chapter bar: Damen / Herren / Kinder */}
      <nav
        aria-label="Für wen"
        className="relative"
        onMouseEnter={() => setHold(true)}
        onMouseLeave={() => setHold(false)}
      >
        <ul className="container-luxe grid grid-cols-3 border-t border-white/15">
          {chapters.map((c, i) => {
            const isActive = i === index;
            return (
              <li key={c.slug} className={cn("relative", i > 0 && "border-l border-white/15")}>
                {/* progress */}
                <span aria-hidden="true" className="absolute inset-x-0 -top-px h-px overflow-hidden">
                  {isActive && !reduce && (
                    <span
                      key={`${index}-${hold}`}
                      className="animate-progress block h-full origin-left bg-white"
                      style={{ animationDuration: `${CHAPTER_MS}ms`, animationPlayState: hold ? "paused" : undefined }}
                    />
                  )}
                  {isActive && reduce && <span className="block h-full bg-white" />}
                </span>
                <Link
                  href={`/${c.slug}`}
                  onMouseEnter={() => go(i)}
                  onFocus={() => go(i)}
                  className={cn(
                    "group flex flex-col gap-1 px-3 py-5 sm:px-6 md:flex-row md:items-end md:justify-between md:py-8",
                    i === 0 && "pl-0 sm:pl-0",
                  )}
                >
                  <span className="flex items-baseline gap-3">
                    <span
                      className={cn(
                        "hidden text-[0.625rem] tracking-[0.3em] transition-colors duration-500 sm:inline",
                        isActive ? "text-white" : "text-white/40",
                      )}
                    >
                      {c.numeral}
                    </span>
                    <span
                      className={cn(
                        "font-display text-[1.65rem] leading-none transition-all duration-700 sm:text-4xl lg:text-[min(3.75rem,7svh)]",
                        isActive ? "italic text-white" : "text-white/55 group-hover:text-white",
                      )}
                    >
                      {c.label}
                    </span>
                  </span>
                  <span
                    className={cn(
                      "flex items-center gap-3 text-[0.625rem] uppercase tracking-[0.3em] transition-all duration-700",
                      isActive ? "text-white opacity-100" : "text-white/40 opacity-0 md:group-hover:opacity-100",
                    )}
                  >
                    <span className="hidden md:inline">Entdecken</span>
                    <span aria-hidden="true" className={cn("h-px bg-current transition-all duration-700", isActive ? "w-10" : "w-5")} />
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </section>
  );
}
