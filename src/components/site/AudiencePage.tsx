import Link from "next/link";
import { KenBurns, Reveal } from "@/components/motion";
import { SalonImage } from "@/components/media/SalonImage";
import { CtaBand, FlyerPriceList, SectionIntro } from "@/components/site/blocks";
import { PageHero } from "@/components/site/PageHero";
import { ButtonLink, Container, Eyebrow } from "@/components/ui/primitives";
import { audienceList, type AudienceContent } from "@/content/audiences";
import { site } from "@/config/site";
import { cn } from "@/lib/utils";

export function AudiencePage({ content }: { content: AudienceContent }) {
  const others = audienceList.filter((a) => a.slug !== content.slug);

  return (
    <>
      <PageHero
        eyebrow={content.eyebrow}
        title={content.title}
        italic={content.titleItalic}
        intro={content.intro}
        image={content.hero}
      >
        <div className="flex flex-wrap gap-4">
          <ButtonLink href={site.phone.href} tone="light">
            Termin: {site.phone.display}
          </ButtonLink>
          <ButtonLink href="#preise" tone="light" variant="outline">
            Preise
          </ButtonLink>
        </div>
      </PageHero>

      {/* Principles */}
      <section aria-labelledby="ansatz" className="py-24 md:py-40">
        <Container className="grid gap-16 md:grid-cols-12">
          <div className="md:col-span-5">
            <SectionIntro eyebrow="Unser Ansatz" title="Sorgfalt" italic="in jedem Detail." id="ansatz" />
            <Reveal delay={0.15} className="mt-14 hidden md:block">
              <KenBurns className="aspect-[4/5] w-4/5" delay={10}>
                <SalonImage image={content.detail} tone="light" sizes="30vw" />
              </KenBurns>
            </Reveal>
          </div>
          <ol className="md:col-span-6 md:col-start-7 md:pt-24">
            {content.principles.map((p, i) => (
              <Reveal as="li" key={p.title} delay={i * 0.1} className="border-t border-mist py-10 first:border-t-0 first:pt-0 md:py-14">
                <p className="text-eyebrow uppercase text-stone">0{i + 1}</p>
                <h3 className="mt-4 font-display text-4xl md:text-5xl">{p.title}</h3>
                <p className="mt-5 max-w-md leading-relaxed text-graphite">{p.text}</p>
              </Reveal>
            ))}
          </ol>
        </Container>
      </section>

      {/* Prices */}
      <section id="preise" aria-labelledby="preise-title" className="scroll-mt-24 bg-ink py-24 text-white md:py-40">
        <Container className="grid gap-16 md:grid-cols-12">
          <div className="md:col-span-5">
            <SectionIntro eyebrow="Preise" title="Leistungen" italic="& Preise" tone="dark" id="preise-title">
              Eine eigene Preisliste für {content.label} folgt. Bis dahin finden Sie hier
              die Preise aus unserem aktuellen Flyer.
            </SectionIntro>
          </div>
          <div className="md:col-span-6 md:col-start-7">
            <FlyerPriceList tone="dark" />
          </div>
        </Container>
      </section>

      {/* Other audiences */}
      <section aria-labelledby="weitere" className="py-24 md:py-36">
        <Container>
          <Reveal>
            <Eyebrow id="weitere" className="text-stone">Ebenfalls bei uns</Eyebrow>
          </Reveal>
          <ul className="mt-10 grid gap-6 sm:grid-cols-2">
            {others.map((a, i) => (
              <Reveal as="li" key={a.slug} delay={i * 0.1}>
                <Link
                  href={`/${a.slug}`}
                  className={cn(
                    "group relative flex aspect-[16/10] items-end overflow-hidden bg-ink p-6 text-white md:p-10",
                  )}
                >
                  <div className="absolute inset-0 opacity-70 transition-[opacity,transform] duration-[1400ms] ease-luxe group-hover:scale-[1.04] group-hover:opacity-90">
                    <SalonImage image={a.hero} sizes="(min-width: 640px) 50vw, 100vw" showLabel={false} />
                  </div>
                  <div className="relative flex w-full items-baseline justify-between">
                    <span className="font-display text-5xl group-hover:italic md:text-6xl">{a.label}</span>
                    <span aria-hidden="true" className="h-px w-8 bg-white transition-[width] duration-700 ease-luxe group-hover:w-16" />
                  </div>
                </Link>
              </Reveal>
            ))}
          </ul>
        </Container>
      </section>

      <CtaBand />
    </>
  );
}
