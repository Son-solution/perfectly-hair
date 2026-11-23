"use client";

import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
} from "motion/react";
import Link from "next/link";
import { useRef, useState } from "react";
import { SalonImage } from "@/components/media/SalonImage";
import { useLiveSection } from "@/components/motion/useLiveSection";
import type { MediaAsset } from "@/content/schema";
import { cn } from "@/lib/utils";

export type GalleryCard = { id: string; image: MediaAsset; label: string; ratio: "portrait" | "landscape" | "square" };
type Item = GalleryCard;


/**
 * One endlessly moving row. Moves continuously on its own; scroll velocity adds a
 * temporary boost (and direction-aware skew) for a tactile, cinematic feel.
 * Pauses off-screen, on hover (slows) and for reduced motion.
 */
function Row({
  items,
  direction,
  speed,
  live,
  tall,
  stockLabel,
}: {
  items: ReadonlyArray<Item>;
  direction: 1 | -1;
  speed: number; // px per second
  live: boolean;
  tall: boolean;
  stockLabel: string;
}) {
  const reduce = useReducedMotion();
  const trackRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const [hover, setHover] = useState(false);

  const { scrollY } = useScroll();
  const velocity = useVelocity(scrollY);
  const smoothVel = useSpring(velocity, { damping: 50, stiffness: 300 });
  const boost = useTransform(smoothVel, [-2000, 0, 2000], [-4, 0, 4], { clamp: true });
  const skew = useTransform(smoothVel, [-2000, 0, 2000], [3, 0, -3], { clamp: true });

  useAnimationFrame((_, delta) => {
    if (reduce || !live) return;
    const track = trackRef.current;
    if (!track) return;
    const half = track.scrollWidth / 2;
    if (half <= 0) return;
    const factor = (hover ? 0.25 : 1) + Math.abs(boost.get());
    let next = x.get() - direction * speed * factor * (delta / 1000);
    // wrap seamlessly within one copy width
    if (next <= -half) next += half;
    if (next > 0) next -= half;
    x.set(next);
  });

  const cards = (copy: number) =>
    items.map((item) => (
      <figure
        key={`${copy}-${item.id}`}
        aria-hidden={copy === 1 ? true : undefined}
        className={cn(
          "group/card relative mr-3 shrink-0 overflow-hidden bg-ink-soft md:mr-5",
          tall ? "h-[46vh] min-h-[280px] md:h-[58vh]" : "h-[34vh] min-h-[220px] md:h-[42vh]",
          item.ratio === "landscape" ? "aspect-[3/2]" : item.ratio === "square" ? "aspect-square" : "aspect-[3/4]",
        )}
      >
        <div className="absolute inset-0 transition-transform duration-[1400ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/card:scale-[1.07]">
          <SalonImage image={item.image} sizes="(min-width: 768px) 30vw, 60vw" showLabel={false} />
        </div>
        <figcaption className="absolute inset-x-0 bottom-0 flex translate-y-full items-end justify-between bg-[linear-gradient(0deg,rgba(10,10,10,0.85),transparent)] p-4 pt-12 text-white transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/card:translate-y-0">
          <span className="font-display text-2xl italic">{item.label}</span>
          <span className="text-[0.5625rem] uppercase tracking-[0.3em] text-white/70">{item.image.credit ? stockLabel : ""}</span>
        </figcaption>
      </figure>
    ));

  return (
    <div
      className="overflow-hidden"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <motion.div ref={trackRef} className="flex w-max" style={{ x, skewX: reduce ? 0 : skew }}>
        {cards(0)}
        {cards(1)}
      </motion.div>
    </div>
  );
}

export function CinematicGallery({
  items,
  heading,
  stockLabel,
  creditsLink,
}: {
  items: ReadonlyArray<Item>;
  heading: { eyebrow: string; title: string; italic: string; cta: { label: string; href: string } | null } | null;
  stockLabel: string;
  creditsLink: { label: string; href: string } | null;
}) {
  const { ref, live } = useLiveSection<HTMLElement>("200px");
  const half = Math.ceil(items.length / 2);
  const rowA = items.slice(0, half);
  const rowB = [...items.slice(half), ...items.slice(0, 1)];

  return (
    <section ref={ref} aria-label="Galerie in Bewegung" className="relative overflow-hidden bg-ink py-24 text-white md:py-36">
      {heading && (
        <div className="container-luxe relative mb-14 flex flex-col gap-8 md:mb-20 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="flex items-center gap-4 text-eyebrow uppercase text-ash">
              <span aria-hidden="true" className="h-px w-10 bg-current" />
              {heading.eyebrow}
            </p>
            <h2 className="mt-6 font-display text-[clamp(3.2rem,9vw,9rem)] font-normal leading-[0.88]">
              {heading.title}
              <span className="block italic text-outline-light">{heading.italic}</span>
            </h2>
          </div>
          <div className="flex flex-col items-start gap-4 md:items-end">
            {heading.cta && (
            <Link
              href={heading.cta.href}
              className="group inline-flex items-center gap-4 border border-white/40 px-7 py-4 text-[0.6875rem] uppercase tracking-[0.26em] transition-colors duration-500 hover:bg-white hover:text-ink"
            >
              {heading.cta.label}
              <span aria-hidden="true" className="h-px w-8 bg-current transition-[width] duration-500 group-hover:w-12" />
            </Link>
            )}
            {creditsLink && (
              <p className="text-[0.5625rem] uppercase tracking-[0.3em] text-white/45">
                {stockLabel} ·{" "}
                <Link href={creditsLink.href} className="underline underline-offset-4 hover:text-white">
                  {creditsLink.label}
                </Link>
              </p>
            )}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3 md:gap-5">
        <Row items={rowA} direction={1} speed={42} live={live} tall stockLabel={stockLabel} />
        <Row items={rowB} direction={-1} speed={30} live={live} tall={false} stockLabel={stockLabel} />
      </div>
    </section>
  );
}
