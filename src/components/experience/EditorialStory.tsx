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
  const yA = useTransform(scrollYProgress, [0, 1], [80, -80]);
  const yB = useTransform(scrollYProgress, [0, 1], [-40, 60]);
  const yC = useTransform(scrollYProgress, [0, 1], [120, -120]);

  const open = businessHours.filter((d) => d.opens);

  return (
    <section ref={liveRef} aria-labelledby="atelier" className="relative overflow-hidden bg-paper py-24 text-ink md:py-40">
      {/* Drifting outlined word */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-10 select-none md:top-16">
        <div className="animate-marquee flex w-max whitespace-nowrap font-display text-[24vw] leading-none text-outline-dark italic">
          <span className="pr-[0.3em]">Atelier · Familie · Handwerk ·</span>
          <span className="pr-[0.3em]">Atelier · Familie · Handwerk ·</span>
        </div>
      </div>

      <div className="container-luxe relative grid gap-16 lg:grid-cols-12 lg:gap-10">
        {/* Text */}
        <div className="lg:col-span-6 lg:pt-24">
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

          <ol className="mt-14 grid gap-px bg-mist sm:grid-cols-3">
            {values.map((v, i) => (
              <Reveal as="li" key={v.n} delay={0.1 + i * 0.1} className="bg-paper py-6 sm:pr-6">
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
        <div ref={scrollRef} className="relative h-[110vw] sm:h-[90vw] lg:col-span-6 lg:h-[clamp(620px,62vw,900px)]">
          <motion.div style={{ y: yA }} className="absolute right-0 top-0 w-[62%]">
            <div className="animate-float-a">
              <div className="relative aspect-[3/4] overflow-hidden shadow-[0_50px_90px_-30px_rgba(0,0,0,0.45)]">
                <div className="absolute inset-0 animate-ken-strong">
                  <SalonImage image={images.damenDetail} sizes="(min-width: 1024px) 30vw, 60vw" />
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div style={{ y: yB }} className="absolute left-0 top-[30%] z-10 w-[44%]">
            <div className="animate-float-b">
              <div className="relative aspect-[3/4] overflow-hidden border-[10px] border-paper shadow-[0_40px_80px_-30px_rgba(0,0,0,0.5)]">
                <SalonImage image={stock.herrenProfile} sizes="(min-width: 1024px) 22vw, 44vw" />
              </div>
            </div>
          </motion.div>

          <motion.div style={{ y: yC }} className="absolute bottom-0 right-[6%] z-20 w-[52%]">
            <div className="animate-float-c">
              <div className="relative aspect-[4/3] overflow-hidden border-[10px] border-paper shadow-[0_40px_80px_-30px_rgba(0,0,0,0.5)]">
                <SalonImage image={stock.kinderClipper} sizes="(min-width: 1024px) 26vw, 52vw" />
              </div>
            </div>
          </motion.div>

          <p
            aria-hidden="true"
            className="absolute bottom-[38%] left-[2%] z-30 font-display text-[clamp(1.4rem,2.4vw,2.2rem)] italic text-ink"
          >
            <span className="bg-paper px-3 py-1">Damen · Herren · Kinder</span>
          </p>
          <p className="absolute -bottom-8 left-0 text-[0.5625rem] uppercase tracking-[0.3em] text-stone">
            Symbolbilder · Unsplash
          </p>
        </div>
      </div>
    </section>
  );
}
