import type { Metadata } from "next";
import Link from "next/link";
import { CinematicGallery } from "@/components/experience/CinematicGallery";
import { Reveal } from "@/components/motion";
import { SalonImage } from "@/components/media/SalonImage";
import { CtaBand, Notice, SectionIntro } from "@/components/site/blocks";
import { GalleryGrid } from "@/components/site/GalleryGrid";
import { PageHero } from "@/components/site/PageHero";
import { Container } from "@/components/ui/primitives";
import { inspirationItems, portfolioItems } from "@/content/images";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Galerie",
  description: "Inspiration für Damen, Herren und Kinder – Perfectly Hair by Gabriel, Wiesbaden.",
  alternates: { canonical: "/galerie" },
};

export default function GaleriePage() {
  return (
    <>
      <PageHero
        eyebrow="Galerie"
        title="Galerie"
        italic="Inspiration in Schwarzweiß."
        intro="Ideen für Damen, Herren und Kinder – und bald auch Arbeiten direkt aus unserem Salon."
      />

      {/* Two counter-moving infinite rows */}
      <div className="-mt-px">
        <CinematicGallery items={inspirationItems} showHeading={false} />
        <div className="bg-ink pb-12">
          <p className="container-luxe text-[0.625rem] uppercase tracking-[0.3em] text-ash">
            Symbolbilder · Fotografie über Unsplash · <Link href="/bildnachweise" className="underline underline-offset-4 hover:text-white">Bildnachweise</Link>
          </p>
        </div>
      </div>

      {/* Inspiration (stock) */}
      <section aria-labelledby="inspiration" className="py-24 md:py-36">
        <Container>
          <div className="mb-14 grid gap-10 md:grid-cols-12 md:items-end">
            <div className="md:col-span-6">
              <SectionIntro eyebrow="Inspiration" title="Ideen" italic="für Ihren nächsten Look." id="inspiration" />
            </div>
            <Reveal delay={0.1} className="md:col-span-5 md:col-start-8">
              <Notice title="Symbolbilder">
                Diese Fotos sind lizenzierte Symbolbilder (Unsplash) und dienen als
                Inspiration. Sie zeigen <strong>keine Arbeiten, Mitarbeiter oder Kunden</strong>{" "}
                des Salons.{" "}
                <Link href="/bildnachweise" className="underline underline-offset-4">
                  Bildnachweise
                </Link>
              </Notice>
            </Reveal>
          </div>
          <GalleryGrid
            items={inspirationItems.map((item) => ({
              id: item.id,
              group: item.group,
              ratio: item.ratio,
              node: <SalonImage image={item.image} sizes="(min-width: 768px) 33vw, 50vw" />,
            }))}
          />
        </Container>
      </section>

      {/* Genuine portfolio (empty until real work is supplied) */}
      <section aria-labelledby="portfolio" className="bg-bone py-24 md:py-36">
        <Container>
          <SectionIntro eyebrow="Aus unserem Salon" title="Unsere Arbeiten" italic="folgen in Kürze." id="portfolio">
            Hier zeigen wir bald echte Arbeiten aus dem Salon in der Rheinstraße.
          </SectionIntro>
          <ul className="mt-14 grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5">
            {portfolioItems.map((item, i) => (
              <Reveal
                as="li"
                key={item.id}
                delay={i * 0.08}
                className={cn("relative overflow-hidden", i === 1 ? "col-span-2 aspect-[16/9] md:col-span-1 md:aspect-[4/5]" : "aspect-[4/5]")}
              >
                <SalonImage image={item.image} tone="light" />
              </Reveal>
            ))}
          </ul>
        </Container>
      </section>

      <CtaBand />
    </>
  );
}
