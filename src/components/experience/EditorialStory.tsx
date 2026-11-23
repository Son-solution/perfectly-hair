"use client";

import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { SalonImage } from "@/components/media/SalonImage";
import { MaskLines } from "@/components/motion/MaskLines";
import { Reveal } from "@/components/motion";
import { useLiveSection } from "@/components/motion/useLiveSection";
import { ButtonLink } from "@/components/ui/primitives";
import { businessHours, site } from "@/config/site";
import { images, stock } from "@/content/images";

const values = [
  { n: "01", title: "Ruhe", text: "Ein Ort, an dem Sie sich Zeit nehmen dürfen." },
  { n: "02", title: "Sorgfalt", text: "Präzise Arbeit bis ins letzte Detail." },
  { n: "03", title: "Familie", text: "Damen, Herren und Kinder – willkommen sind alle." },
];

/**
 * Dramatic editorial introduction: masked oversized statement, a three-image collage
 * whose layers float continuously (idle) and separate further on scroll (parallax),
 * and a drifting outlined word in the background.
 */
export function EditorialStory() {
  const { ref: liveRef } = useLiveSection<HTMLElement>();
  const scrollRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: scrollRef, offset: ["start end", "end start"] });
  const yA = useTransform(scrollYProgress, [0, 1], [50, -60]);
  const yB = useTransform(scrollYProgress, [0, 1], [-30, 40]);
  const yC = useTransform(scrollYProgress, [0, 1], [40, -80]);

  const open = businessHours.filter((d) => d.opens);

  return (
    <section ref={liveRef} aria-labelledby="atelier" className="relative overflow-hidden bg-paper pb-24 pt-10 text-ink md:pb-40 md:pt-16">
      {/* Drifting outlined words — an in-flow band ABOVE the content, so it never crosses text */}
      <div aria-hidden="true" className="pointer-events-none mb-[clamp(2rem,5vw,5rem)] select-none overflow-hidden">
        <div className="animate-marquee flex w-max whitespace-nowrap font-display text-[clamp(4.5rem,15vw,15rem)] italic leading-[1.05] text-outline-dark">
          <span className="pr-[0.3em]">Atelier · Familie · Handwerk ·</span>
          <span className="pr-[0.3em]">Atelier · Familie · Handwerk ·</span>
        </div>
      </div>

      <div className="container-luxe relative grid gap-16 lg:grid-cols-12 lg:gap-10">
        {/* Text */}
        <div className="lg:col-span-6 lg:pt-8">
          <Reveal>
            <p className="flex items-center gap-4 text-eyebrow uppercase text-stone">
              <span aria-hidden="true" className="h-px w-10 bg-current" />
              Das Atelier
            </p>
          </Reveal>
          <MaskLines
            id="atelier"
            className="mt-8 font-display text-[clamp(3rem,7vw,7.5rem)] font-normal leading-[0.92]"
            lines={[
              "Ein Salon",
              <>für die <span className="italic text-graphite">ganze</span></>,
              <span key="f" className="italic">Familie.</span>,
            ]}
          />
          <Reveal delay={0.2} className="mt-10 grid max-w-xl gap-6 text-graphite sm:grid-cols-2">
            <p className="leading-relaxed">
              Damen, Herren und Kinder – bei Perfectly Hair by Gabriel nehmen wir uns Zeit
              für Ihre Wünsche und arbeiten mit Ruhe und Sorgfalt.
            </p>
            <p className="leading-relaxed">
              {site.address.street}, {site.address.postalCode} {site.address.city}.
              <br />
              Di – Fr {open[0]?.opens}–{open[0]?.closes} · Sa {open.at(-1)?.opens}–{open.at(-1)?.closes}
            </p>
          </Reveal>

          <ol className="mt-14 grid border-t border-mist sm:grid-cols-3">
            {values.map((v, i) => (
              <Reveal
                as="li"
                key={v.n}
                delay={0.1 + i * 0.1}
                className="border-b border-mist py-7 sm:border-b-0 sm:py-8 sm:pr-6 sm:[&:not(:first-child)]:border-l sm:[&:not(:first-child)]:pl-6"
              >
                <p className="text-[0.625rem] tracking-[0.3em] text-stone">{v.n}</p>
                <p className="mt-3 font-display text-3xl italic">{v.title}</p>
                <p className="mt-2 text-sm leading-relaxed text-graphite">{v.text}</p>
              </Reveal>
            ))}
          </ol>

          <Reveal delay={0.3} className="mt-12">
            <ButtonLink href="/salon" variant="outline">
              Mehr über den Salon
            </ButtonLink>
          </Reveal>
        </div>

        {/* Layered collage */}
        <div ref={scrollRef} className="relative h-[150vw] sm:h-[112vw] lg:col-span-6 lg:h-[clamp(660px,64vw,920px)]">
          <motion.div style={{ y: yA }} className="absolute right-0 top-0 w-[62%]">
            <div className="animate-float-a">
              <div className="relative aspect-[3/4] overflow-hidden shadow-[0_50px_90px_-30px_rgba(0,0,0,0.45)]">
                <div className="absolute inset-0 animate-ken-strong">
                  <SalonImage image={images.damenDetail} sizes="(min-width: 1024px) 30vw, 60vw" showLabel={false} />
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div style={{ y: yB }} className="absolute left-0 top-[28%] z-10 w-[44%]">
            <div className="animate-float-b">
              <div className="relative aspect-[3/4] overflow-hidden border-[10px] border-paper shadow-[0_40px_80px_-30px_rgba(0,0,0,0.5)]">
                <SalonImage image={stock.herrenProfile} sizes="(min-width: 1024px) 22vw, 44vw" />
              </div>
            </div>
          </motion.div>

          <motion.div style={{ y: yC }} className="absolute bottom-0 right-0 z-20 w-[54%]">
            <div className="animate-float-c">
              <div className="relative aspect-[4/3] overflow-hidden border-[10px] border-paper shadow-[0_40px_80px_-30px_rgba(0,0,0,0.5)]">
                <SalonImage image={stock.kinderClipper} sizes="(min-width: 1024px) 26vw, 52vw" />
              </div>
            </div>
          </motion.div>

          <p
            aria-hidden="true"
            className="absolute left-0 top-0 z-30 font-display text-[clamp(1.35rem,2.3vw,2.2rem)] italic leading-[1.15] text-ink"
          >
            <span className="block">Damen</span>
            <span className="block pl-[0.6em] text-graphite">Herren</span>
            <span className="block pl-[1.2em]">Kinder</span>
          </p>
          <p className="absolute -bottom-8 left-0 text-[0.5625rem] uppercase tracking-[0.3em] text-stone">
            Symbolbilder · Unsplash
          </p>
        </div>
      </div>
    </section>
  );
}
