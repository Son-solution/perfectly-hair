import type { Metadata } from "next";
import { KenBurns, Reveal } from "@/components/motion";
import { SalonImage } from "@/components/media/SalonImage";
import { CtaBand, HoursList, SectionIntro } from "@/components/site/blocks";
import { PageHero } from "@/components/site/PageHero";
import { ButtonLink, Container, Eyebrow } from "@/components/ui/primitives";
import { images } from "@/content/images";
import { mapsUrl, site } from "@/config/site";

export const metadata: Metadata = {
  title: "Der Salon",
  description:
    "Perfectly Hair by Gabriel – Friseursalon für Damen, Herren und Kinder in der Rheinstraße 33, Wiesbaden.",
  alternates: { canonical: "/salon" },
};

const values = [
  { title: "Ruhe", text: "Ein Ort, an dem Sie sich Zeit nehmen dürfen." },
  { title: "Sorgfalt", text: "Präzise Arbeit, vom ersten Schnitt bis zum letzten Detail." },
  { title: "Familie", text: "Damen, Herren und Kinder – willkommen sind alle." },
];

export default function SalonPage() {
  return (
    <>
      <PageHero
        eyebrow="Der Salon"
        title="Perfectly Hair"
        italic="by Gabriel"
        intro={`Ihr Friseursalon für Damen, Herren und Kinder in der ${site.address.street} in Wiesbaden.`}
        image={images.salonInterior}
      />

      <section aria-labelledby="werte" className="py-24 md:py-40">
        <Container>
          <SectionIntro eyebrow="Wofür wir stehen" title="Drei Worte," italic="ein Anspruch." id="werte" />
          <ul className="mt-16 grid gap-px bg-mist md:mt-24 md:grid-cols-3">
            {values.map((v, i) => (
              <Reveal as="li" key={v.title} delay={i * 0.1} className="bg-paper py-10 md:px-10 md:py-14 md:first:pl-0">
                <p className="text-eyebrow uppercase text-stone">0{i + 1}</p>
                <h3 className="mt-6 font-display text-5xl italic">{v.title}</h3>
                <p className="mt-5 max-w-xs leading-relaxed text-graphite">{v.text}</p>
              </Reveal>
            ))}
          </ul>
        </Container>
      </section>

      <section aria-label="Eindrücke" className="pb-24 md:pb-40">
        <Container className="grid grid-cols-12 gap-4 md:gap-6">
          <Reveal className="col-span-7 md:col-span-7">
            <KenBurns className="aspect-[4/5]" delay={3}>
              <SalonImage image={images.salonDetail} tone="light" sizes="60vw" />
            </KenBurns>
          </Reveal>
          <Reveal delay={0.15} className="col-span-5 mt-16 md:col-span-4 md:col-start-9 md:mt-40">
            <KenBurns className="aspect-[3/4]" delay={11}>
              <SalonImage image={images.salonFacade} sizes="35vw" />
            </KenBurns>
          </Reveal>
        </Container>
      </section>

      <section aria-labelledby="besuch" className="bg-ink py-24 text-white md:py-40">
        <Container className="grid gap-16 md:grid-cols-12">
          <div className="md:col-span-5">
            <SectionIntro eyebrow="Besuch" title={site.address.street} italic={`${site.address.postalCode} ${site.address.city}`} tone="dark" id="besuch" />
            <Reveal delay={0.15} className="mt-10 flex flex-wrap gap-4">
              <ButtonLink href={mapsUrl} tone="light" variant="outline">
                Route planen
              </ButtonLink>
            </Reveal>
          </div>
          <div className="md:col-span-6 md:col-start-7">
            <Reveal>
              <Eyebrow className="mb-6 text-ash">Öffnungszeiten</Eyebrow>
              <HoursList tone="dark" />
            </Reveal>
          </div>
        </Container>
      </section>

      <CtaBand />
    </>
  );
}
