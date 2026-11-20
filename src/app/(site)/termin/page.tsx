import type { Metadata } from "next";
import { Reveal } from "@/components/motion";
import { BookingPrototype } from "@/components/booking/BookingPrototype";
import { Notice } from "@/components/site/blocks";
import { PageHero } from "@/components/site/PageHero";
import { ButtonLink, Container } from "@/components/ui/primitives";
import { site } from "@/config/site";

export const metadata: Metadata = {
  title: "Termin",
  description: `Termin bei Perfectly Hair by Gabriel vereinbaren – telefonisch unter ${site.phone.display}.`,
  alternates: { canonical: "/termin" },
};

export default function TerminPage() {
  return (
    <>
      <PageHero
        eyebrow="Termin"
        title="Termin"
        italic="vereinbaren."
        intro={`Aktuell vereinbaren Sie Ihren Termin telefonisch unter ${site.phone.display}.`}
      >
        <ButtonLink href={site.phone.href} tone="light">
          Jetzt anrufen
        </ButtonLink>
      </PageHero>

      <section aria-label="Online-Buchung (Vorschau)" className="bg-bone py-20 md:py-32">
        <Container className="max-w-5xl">
          <Reveal className="mb-10">
            <Notice title="Online-Buchung noch nicht verfügbar">
              Die Online-Terminbuchung befindet sich im Aufbau. Unten sehen Sie eine
              Vorschau des Ablaufs – <strong>es wird kein Termin gebucht</strong> und keine
              Daten werden übermittelt. Bitte vereinbaren Sie Ihren Termin telefonisch unter{" "}
              <a href={site.phone.href} className="underline underline-offset-4">
                {site.phone.display}
              </a>
              .
            </Notice>
          </Reveal>
          <Reveal delay={0.1}>
            <BookingPrototype />
          </Reveal>
        </Container>
      </section>
    </>
  );
}
