import type { Metadata } from "next";
import { Reveal } from "@/components/motion";
import { CtaBand, FlyerPriceList, Notice } from "@/components/site/blocks";
import { PageHero } from "@/components/site/PageHero";
import { Container, Eyebrow } from "@/components/ui/primitives";
import { site } from "@/config/site";

export const metadata: Metadata = {
  title: "Preise",
  description: "Aktuelle Preise von Perfectly Hair by Gabriel, Rheinstraße 33, Wiesbaden.",
  alternates: { canonical: "/preise" },
};

export default function PreisePage() {
  return (
    <>
      <PageHero
        eyebrow="Preise"
        title="Preisliste"
        italic="transparent & klar."
        intro="Die folgenden Preise stammen aus unserem aktuellen Flyer."
      />

      <section aria-labelledby="liste" className="py-24 md:py-40">
        <Container className="grid gap-16 md:grid-cols-12">
          <div className="md:col-span-4">
            <Reveal>
              <Eyebrow id="liste" className="text-stone">Laut aktuellem Flyer</Eyebrow>
              <p className="mt-6 font-display text-display-lg leading-[1.1]">
                Damen, Herren <span className="italic text-graphite">&amp; Kinder</span>
              </p>
            </Reveal>
          </div>
          <div className="md:col-span-7 md:col-start-6">
            <FlyerPriceList showNote={false} />
            <Reveal delay={0.2} className="mt-12">
              <Notice title="Hinweis zu den Preisen">
                Der Flyer unterscheidet nicht zwischen Damen, Herren und Kindern. Je nach
                Haarlänge, Aufwand und Wunsch kann der Preis abweichen. Eine ausführliche
                Preisliste für jeden Bereich folgt. Fragen Sie uns gern vorab telefonisch:{" "}
                <a href={site.phone.href} className="underline underline-offset-4">
                  {site.phone.display}
                </a>
                . Alle Preise in Euro.
              </Notice>
            </Reveal>
          </div>
        </Container>
      </section>

      <CtaBand />
    </>
  );
}
