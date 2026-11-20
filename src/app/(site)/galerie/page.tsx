import type { Metadata } from "next";
import { Marquee, Reveal } from "@/components/motion";
import { SalonImage } from "@/components/media/SalonImage";
import { CtaBand, Notice } from "@/components/site/blocks";
import { GalleryGrid } from "@/components/site/GalleryGrid";
import { PageHero } from "@/components/site/PageHero";
import { Container } from "@/components/ui/primitives";
import { galleryItems } from "@/content/images";

export const metadata: Metadata = {
  title: "Galerie",
  description: "Galerie von Perfectly Hair by Gabriel – Damen, Herren, Kinder und Salon.",
  alternates: { canonical: "/galerie" },
};

export default function GaleriePage() {
  return (
    <>
      <PageHero
        eyebrow="Galerie"
        title="Galerie"
        italic="Momente aus dem Salon."
        intro="Einblicke in unsere Arbeit für Damen, Herren und Kinder."
      />

      <div aria-hidden="true" className="bg-ink pb-16 md:pb-24">
        <Marquee label="Bildstreifen" durationS={90}>
          {galleryItems.map((item) => (
            <div key={item.id} className="relative mr-3 h-40 w-56 shrink-0 overflow-hidden md:mr-5 md:h-56 md:w-80">
              <SalonImage image={item.image} sizes="20vw" showLabel={false} />
            </div>
          ))}
        </Marquee>
      </div>

      <section aria-label="Bilder" className="py-24 md:py-36">
        <Container>
          <Reveal className="mb-12 max-w-2xl">
            <Notice title="Bilder folgen">
              Hier erscheinen in Kürze echte Aufnahmen aus dem Salon. Die Flächen unten
              sind gestaltete Platzhalter und zeigen keine Arbeiten des Salons.
            </Notice>
          </Reveal>
          <GalleryGrid
            items={galleryItems.map((item) => ({
              id: item.id,
              group: item.group,
              ratio: item.ratio,
              node: (
                <SalonImage
                  image={item.image}
                  tone={item.group === "salon" ? "dark" : "light"}
                  sizes="(min-width: 768px) 33vw, 50vw"
                />
              ),
            }))}
          />
        </Container>
      </section>

      <CtaBand />
    </>
  );
}
