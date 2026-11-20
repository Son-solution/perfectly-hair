import type { Metadata } from "next";
import Link from "next/link";
import { KenBurns, Reveal } from "@/components/motion";
import { SalonImage } from "@/components/media/SalonImage";
import { CtaBand, FlyerPriceList, SectionIntro } from "@/components/site/blocks";
import { PageHero } from "@/components/site/PageHero";
import { ButtonLink, Container } from "@/components/ui/primitives";
import { audienceList } from "@/content/audiences";

export const metadata: Metadata = {
  title: "Leistungen",
  description:
    "Leistungen für Damen, Herren und Kinder bei Perfectly Hair by Gabriel in Wiesbaden.",
  alternates: { canonical: "/leistungen" },
};

export default function LeistungenPage() {
  return (
    <>
      <PageHero
        eyebrow="Leistungen"
        title="Für jeden"
        italic="die passende Form."
        intro="Ob Damen, Herren oder Kinder – wählen Sie Ihren Bereich oder sehen Sie sich direkt unsere aktuellen Preise an."
      />

      <section aria-label="Bereiche" className="py-24 md:py-40">
        <Container>
          <ul className="divide-y divide-mist border-y border-mist">
            {audienceList.map((a, i) => (
              <Reveal as="li" key={a.slug} delay={i * 0.08}>
                <Link
                  href={`/${a.slug}`}
                  className="group grid items-center gap-6 py-10 md:grid-cols-12 md:py-14"
                >
                  <span className="text-eyebrow uppercase text-stone md:col-span-1">{a.numeral}</span>
                  <span className="font-display text-display-lg md:col-span-4 group-hover:italic">
                    {a.label}
                  </span>
                  <span className="max-w-sm leading-relaxed text-graphite md:col-span-4">
                    {a.teaser}
                  </span>
                  <div className="relative hidden aspect-[4/3] overflow-hidden md:col-span-3 md:block">
                    <KenBurns className="absolute inset-0" delay={i * 6}>
                      <SalonImage image={a.hero} sizes="25vw" showLabel={false} />
                    </KenBurns>
                  </div>
                </Link>
              </Reveal>
            ))}
          </ul>
        </Container>
      </section>

      <section aria-labelledby="preise" className="bg-bone py-24 md:py-40">
        <Container className="grid gap-16 md:grid-cols-12">
          <div className="md:col-span-5">
            <SectionIntro eyebrow="Preise" title="Aktuelle" italic="Preise" id="preise" />
            <Reveal delay={0.15} className="mt-10">
              <ButtonLink href="/preise" variant="outline">
                Zur Preisseite
              </ButtonLink>
            </Reveal>
          </div>
          <div className="md:col-span-6 md:col-start-7">
            <FlyerPriceList />
          </div>
        </Container>
      </section>

      <CtaBand />
    </>
  );
}
