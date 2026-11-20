"use client";

import { motion, useMotionValue, useReducedMotion, useSpring } from "motion/react";
import Link from "next/link";
import type { PointerEvent } from "react";
import { LogoMark } from "@/components/brand/LogoMark";
import { SalonImage } from "@/components/media/SalonImage";
import { MaskLines } from "@/components/motion/MaskLines";
import { Reveal } from "@/components/motion";
import { useLiveSection } from "@/components/motion/useLiveSection";
import { businessHours, mapsUrl, site } from "@/config/site";
import { stock, type ImageAsset } from "@/content/images";
import { cn } from "@/lib/utils";

/** Rotating circular call button that leans toward the pointer (magnetic). */
function CallBadge() {
  const reduce = useReducedMotion();
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const x = useSpring(mx, { stiffness: 150, damping: 15 });
  const y = useSpring(my, { stiffness: 150, damping: 15 });

  const onMove = (e: PointerEvent<HTMLAnchorElement>) => {
    if (reduce || e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - r.left - r.width / 2) * 0.3);
    my.set((e.clientY - r.top - r.height / 2) * 0.3);
  };

  return (
    <motion.a
      href={site.phone.href}
      onPointerMove={onMove}
      onPointerLeave={() => {
        mx.set(0);
        my.set(0);
      }}
      style={{ x, y }}
      className="group relative flex h-44 w-44 shrink-0 items-center justify-center rounded-full border border-white/30 bg-white/5 backdrop-blur-sm transition-colors duration-700 hover:bg-white hover:text-ink md:h-56 md:w-56"
      aria-label={`Jetzt anrufen: ${site.phone.display}`}
    >
      <svg aria-hidden="true" viewBox="0 0 200 200" className="absolute inset-0 h-full w-full animate-spin-slow">
        <defs>
          <path id="call-circle" d="M100,100 m-80,0 a80,80 0 1,1 160,0 a80,80 0 1,1 -160,0" />
        </defs>
        <text fill="currentColor" fontSize="12.5" letterSpacing="4.6" style={{ textTransform: "uppercase" }}>
          <textPath href="#call-circle">Jetzt anrufen · {site.phone.display} · Termin vereinbaren ·</textPath>
        </text>
      </svg>
      <span className="relative flex flex-col items-center gap-2 text-center">
        <span className="font-display text-2xl italic md:text-3xl">Anrufen</span>
        <span aria-hidden="true" className="h-px w-8 bg-current transition-[width] duration-500 group-hover:w-14" />
      </span>
    </motion.a>
  );
}

/**
 * Full-screen appointment finale. Honest: booking happens by phone until the backend
 * exists; the online flow is linked only as a labelled preview.
 */
export function BookingFinale({
  title = "Ihr Termin",
  italic = "beginnt mit einem Anruf.",
  image = stock.damenPortrait,
  compact = false,
}: {
  title?: string;
  italic?: string;
  image?: ImageAsset;
  compact?: boolean;
}) {
  const { ref } = useLiveSection<HTMLElement>();
  const open = businessHours.filter((d) => d.opens);

  return (
    <section
      ref={ref}
      aria-labelledby="finale-title"
      className={cn(
        "grain relative isolate flex items-end overflow-hidden bg-ink text-white",
        compact ? "min-h-[78svh]" : "min-h-[100svh]",
      )}
    >
      <div aria-hidden="true" className="absolute inset-0 -z-20 animate-ken-strong">
        <SalonImage image={image} sizes="100vw" showLabel={false} />
      </div>
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(10,10,10,0.92)_0%,rgba(10,10,10,0.6)_55%,rgba(10,10,10,0.35)_100%),linear-gradient(0deg,rgba(10,10,10,0.9)_0%,transparent_60%)]"
      />
      <p className="absolute right-5 top-6 text-[0.5625rem] uppercase tracking-[0.3em] text-white/45 md:right-10 lg:right-16">
        Symbolbild
      </p>

      <div className="container-luxe w-full py-20 md:py-28">
        <div className="grid gap-14 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-8">
            <Reveal>
              <p className="flex items-center gap-4 text-eyebrow uppercase text-white/60">
                <LogoMark decorative className="h-7 w-7" />
                Termin vereinbaren
              </p>
            </Reveal>
            <MaskLines
              id="finale-title"
              className="mt-8 font-display text-[clamp(3.4rem,10vw,10.5rem)] font-normal leading-[0.86]"
              lines={[title, <span key="i" className="italic text-outline-light">{italic}</span>]}
            />
          </div>
          <div className="flex lg:col-span-4 lg:justify-end">
            <CallBadge />
          </div>
        </div>

        <Reveal delay={0.2}>
          <div className="mt-16 grid gap-8 border-t border-white/15 pt-8 text-sm sm:grid-cols-3">
            <div>
              <p className="text-[0.625rem] uppercase tracking-[0.3em] text-white/50">Telefon</p>
              <a href={site.phone.href} className="mt-3 block font-display text-3xl hover:italic">
                {site.phone.display}
              </a>
            </div>
            <div>
              <p className="text-[0.625rem] uppercase tracking-[0.3em] text-white/50">Öffnungszeiten</p>
              <p className="mt-3 leading-relaxed text-white/80">
                Di – Fr {open[0]?.opens} – {open[0]?.closes} Uhr
                <br />
                Sa {open.at(-1)?.opens} – {open.at(-1)?.closes} Uhr · So & Mo geschlossen
              </p>
            </div>
            <div>
              <p className="text-[0.625rem] uppercase tracking-[0.3em] text-white/50">Salon</p>
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 block leading-relaxed text-white/80 underline-offset-4 hover:underline"
              >
                {site.address.street}
                <br />
                {site.address.postalCode} {site.address.city}
                <span className="sr-only"> (Karte, öffnet in neuem Tab)</span>
              </a>
            </div>
          </div>
          <p className="mt-10 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-white/55">
            <span className="flex items-center gap-2">
              <span aria-hidden="true" className="h-1.5 w-1.5 animate-breathe rounded-full bg-white" />
              Online-Buchung folgt – aktuell vereinbaren Sie Termine telefonisch.
            </span>
            <Link href="/termin" className="underline underline-offset-4 hover:text-white">
              Vorschau ansehen
            </Link>
          </p>
        </Reveal>
      </div>
    </section>
  );
}
