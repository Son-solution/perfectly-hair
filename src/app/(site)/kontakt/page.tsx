import type { Metadata } from "next";
import { Reveal } from "@/components/motion";
import { ArtPlaceholder } from "@/components/media/ArtPlaceholder";
import { HoursList } from "@/components/site/blocks";
import { PageHero } from "@/components/site/PageHero";
import { ButtonLink, Container, Eyebrow } from "@/components/ui/primitives";
import { mapsUrl, site } from "@/config/site";

export const metadata: Metadata = {
  title: "Kontakt & Anfahrt",
  description: `Perfectly Hair by Gabriel, ${site.address.street}, ${site.address.postalCode} ${site.address.city}. Telefon ${site.phone.display}.`,
  alternates: { canonical: "/kontakt" },
};

export default function KontaktPage() {
  return (
    <>
      <PageHero
        eyebrow="Kontakt"
        title="Wir freuen uns"
        italic="auf Ihren Besuch."
        intro="Termine vereinbaren Sie am einfachsten telefonisch."
      >
        <ButtonLink href={site.phone.href} tone="light">
          {site.phone.display}
        </ButtonLink>
      </PageHero>

      <section aria-label="Kontaktdaten" className="py-24 md:py-40">
        <Container className="grid gap-16 md:grid-cols-12">
          <div className="space-y-14 md:col-span-5">
            <Reveal>
              <Eyebrow className="text-stone">Adresse</Eyebrow>
              <address className="mt-5 font-display text-4xl not-italic leading-tight md:text-5xl">
                {site.address.street}
                <br />
                <span className="italic text-graphite">
                  {site.address.postalCode} {site.address.city}
                </span>
              </address>
              <div className="mt-8">
                <ButtonLink href={mapsUrl} variant="outline">
                  Route planen
                </ButtonLink>
              </div>
            </Reveal>

            <Reveal delay={0.1}>
              <Eyebrow className="text-stone">Telefon</Eyebrow>
              <a
                href={site.phone.href}
                className="mt-5 inline-block font-display text-4xl underline-offset-8 hover:underline md:text-5xl"
              >
                {site.phone.display}
              </a>
            </Reveal>
          </div>

          <div className="md:col-span-6 md:col-start-7">
            <Reveal delay={0.15}>
              <Eyebrow className="mb-6 text-stone">Öffnungszeiten</Eyebrow>
              <HoursList />
            </Reveal>
          </div>
        </Container>
      </section>

      {/* Map: linked, not embedded — no third-party cookies before consent. */}
      <section aria-label="Karte" className="pb-24 md:pb-40">
        <Container>
          <Reveal>
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative block aspect-[16/9] overflow-hidden md:aspect-[21/8]"
            >
              <div aria-hidden="true" className="absolute inset-0">
                <ArtPlaceholder seed={41} showLabel={false} />
              </div>
              <span className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-white">
                <span className="text-eyebrow uppercase text-ash">Karte</span>
                <span className="font-display text-3xl md:text-5xl group-hover:italic">
                  In Google Maps öffnen
                </span>
                <span className="text-xs text-ash">Öffnet eine externe Website</span>
              </span>
            </a>
          </Reveal>
        </Container>
      </section>
    </>
  );
}
