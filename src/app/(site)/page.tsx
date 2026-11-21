import { Reveal } from "@/components/motion";
import { MaskLines } from "@/components/motion/MaskLines";
import { BookingFinale } from "@/components/experience/BookingFinale";
import { CategoryPanels } from "@/components/experience/CategoryPanels";
import { CinematicGallery } from "@/components/experience/CinematicGallery";
import { EditorialStory } from "@/components/experience/EditorialStory";
import { HeroCinematic } from "@/components/experience/HeroCinematic";
import { FlyerPriceList } from "@/components/site/blocks";
import { ButtonLink } from "@/components/ui/primitives";
import { inspirationItems } from "@/content/images";

/**
 * Homepage — "Noir Atelier" (see docs/CREATIVE_DIRECTION.md).
 * Hero chapters → interactive audience panels → editorial story → moving gallery
 * → prices → cinematic booking finale.
 */
export default function HomePage() {
  return (
    <>
      <HeroCinematic />

      {/* ---------------- Audience panels */}
      <section aria-labelledby="fuer-wen" className="bg-ink pb-2 pt-24 text-white md:pt-36">
        <div className="container-luxe mb-12 flex flex-col gap-6 md:mb-16 md:flex-row md:items-end md:justify-between">
          <MaskLines
            id="fuer-wen"
            className="font-display text-[clamp(3rem,8vw,8rem)] font-normal leading-[0.88]"
            lines={["Drei Welten.", <span key="i" className="italic text-outline-light">Ein Atelier.</span>]}
          />
          <Reveal delay={0.2} className="max-w-sm text-white/65">
            <p className="leading-relaxed">
              Damen, Herren und Kinder – jede Welt mit eigenem Charakter. Bewegen Sie die Maus
              über die Bilder oder tippen Sie auf eine Welt.
            </p>
          </Reveal>
        </div>
        <div className="px-1.5 md:px-2">
          <CategoryPanels />
        </div>
      </section>

      <EditorialStory />

      <CinematicGallery items={inspirationItems} />

      {/* ---------------- Prices */}
      <section aria-labelledby="preise" className="relative overflow-hidden bg-paper pb-24 pt-6 text-ink md:pb-40 md:pt-10">
        {/* Outlined word as an in-flow band above the content — never behind text */}
        <p
          aria-hidden="true"
          className="pointer-events-none mb-[clamp(1.5rem,4vw,4rem)] select-none whitespace-nowrap pl-[clamp(1rem,3vw,3rem)] font-display text-[clamp(5rem,22vw,22rem)] italic leading-[0.95] text-outline-dark"
        >
          Preise
        </p>
        <div className="container-luxe relative grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <MaskLines
              id="preise"
              className="font-display text-[clamp(2.8rem,6vw,6rem)] font-normal leading-[0.92]"
              lines={["Klar.", <span key="i" className="italic text-graphite">Ohne Umwege.</span>]}
            />
            <Reveal delay={0.2} className="mt-10">
              <ButtonLink href="/preise" variant="outline">
                Alle Preise
              </ButtonLink>
            </Reveal>
          </div>
          <div className="lg:col-span-6 lg:col-start-7">
            <FlyerPriceList />
          </div>
        </div>
      </section>

      <BookingFinale />
    </>
  );
}
