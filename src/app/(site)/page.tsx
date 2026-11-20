import Link from "next/link";
import { Crossfade, KenBurns, Marquee, Reveal, Rise } from "@/components/motion";
import { SalonImage } from "@/components/media/SalonImage";
import {
  CtaBand,
  FlyerPriceList,
  HoursList,
  RotatingBadge,
  SectionIntro,
} from "@/components/site/blocks";
import { ButtonLink, Container, Eyebrow } from "@/components/ui/primitives";
import { audienceList } from "@/content/audiences";
import { images, inspirationItems } from "@/content/images";
import { site } from "@/config/site";
import { cn } from "@/lib/utils";

export default function HomePage() {
  return (
    <>
      {/* ------------------------------------------------ Hero */}
      <section
        aria-labelledby="hero-title"
        className="grain relative isolate flex min-h-[100svh] flex-col overflow-hidden bg-ink text-white"
      >
        <Crossfade className="absolute inset-0 -z-20" holdMs={8000} fadeS={2.4}>
          {[images.heroOne, images.heroTwo, images.heroThree].map((img, i) => (
            <KenBurns key={img.seed} className="h-full w-full" delay={i * 8}>
              <SalonImage image={img} eager={i === 0} showLabel={false} sizes="100vw" />
            </KenBurns>
          ))}
        </Crossfade>
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(10,10,10,0.6)_0%,rgba(10,10,10,0.2)_38%,rgba(10,10,10,0.88)_100%)]"
        />
        <p className="absolute right-5 top-22 text-[0.5625rem] uppercase tracking-[0.3em] text-white/55 md:right-10 md:top-28 lg:right-16">
          Symbolbilder
        </p>

        <Container className="flex flex-1 flex-col justify-end pb-10 pt-32 md:pb-14">
          <div className="flex items-end justify-between gap-8">
            <div>
              <Rise>
                <Eyebrow className="flex items-center gap-4 text-ash">
                  <span aria-hidden="true" className="h-px w-10 bg-ash/60" />
                  Friseursalon in Wiesbaden
                </Eyebrow>
              </Rise>
              <Rise delay={0.15}>
                <h1 id="hero-title" className="mt-8 font-display text-display-2xl font-normal">
                  Perfectly Hair
                  <span className="block pl-[0.6em] italic text-white/75">by Gabriel</span>
                </h1>
              </Rise>
            </div>
            <Rise delay={0.6} className="hidden text-white/70 md:block">
              <RotatingBadge />
            </Rise>
          </div>

          {/* The three audiences — visible immediately, also on mobile */}
          <Rise delay={0.35}>
            <nav aria-label="Für wen" className="mt-14 border-t border-white/20 md:mt-20">
              <ul className="grid grid-cols-3">
                {audienceList.map((a, i) => (
                  <li key={a.slug} className={cn(i > 0 && "border-l border-white/20")}>
                    <Link
                      href={`/${a.slug}`}
                      className={cn("group flex flex-col gap-2 px-3 pt-5 sm:px-6 md:flex-row md:items-baseline md:justify-between md:pt-7", i === 0 && "pl-0 sm:pl-0")}
                    >
                      <span className="font-display text-[1.6rem] leading-tight sm:text-4xl md:text-5xl lg:text-6xl group-hover:italic">
                        {a.label}
                      </span>
                      <span className="flex items-center gap-3 text-[0.625rem] uppercase tracking-[0.3em] text-ash">
                        <span className="hidden sm:inline">{a.numeral}</span>
                        <span
                          aria-hidden="true"
                          className="h-px w-6 bg-ash transition-[width] duration-700 ease-luxe group-hover:w-12"
                        />
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </Rise>
        </Container>

        {/* Scroll cue */}
        <div aria-hidden="true" className="absolute bottom-0 right-5 hidden h-16 w-px overflow-hidden bg-white/15 md:right-10 md:block lg:right-16">
          <span className="block h-full w-full animate-scan bg-white" />
        </div>
      </section>

      {/* ------------------------------------------------ Statement */}
      <section aria-labelledby="statement" className="py-24 md:py-44">
        <Container className="grid gap-14 md:grid-cols-12">
          <Reveal className="md:col-span-3">
            <Eyebrow className="flex items-center gap-4 text-stone">
              <span aria-hidden="true" className="h-px w-10 bg-current opacity-60" />
              Der Salon
            </Eyebrow>
          </Reveal>
          <div className="md:col-span-9">
            <Reveal>
              <h2 id="statement" className="font-display text-display-lg font-normal leading-[1.12]">
                Ein Salon für die ganze Familie –{" "}
                <span className="italic text-graphite">
                  für Damen, Herren und Kinder, mitten in Wiesbaden.
                </span>
              </h2>
            </Reveal>
            <Reveal delay={0.15} className="mt-12 grid gap-8 text-graphite sm:grid-cols-2 md:mt-16">
              <p className="leading-relaxed">
                Bei Perfectly Hair by Gabriel steht der Mensch im Mittelpunkt. Wir nehmen
                uns Zeit für Ihre Wünsche und arbeiten mit Ruhe und Sorgfalt.
              </p>
              <p className="leading-relaxed">
                Sie finden uns in der {site.address.street}. Rufen Sie uns an – wir
                beraten Sie gern und finden einen passenden Termin.
              </p>
            </Reveal>
            <Reveal delay={0.25} className="mt-12">
              <ButtonLink href="/salon" variant="ghost">
                Mehr über den Salon
              </ButtonLink>
            </Reveal>
          </div>
        </Container>
      </section>

      {/* ------------------------------------------------ Audiences */}
      <section aria-labelledby="fuer-wen" className="bg-bone py-24 md:py-44">
        <Container>
          <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
            <SectionIntro eyebrow="Für wen" title="Damen. Herren." italic="Kinder." id="fuer-wen" />
            <Reveal delay={0.1}>
              <ButtonLink href="/leistungen" variant="outline">
                Alle Leistungen
              </ButtonLink>
            </Reveal>
          </div>

          <ul className="mt-16 grid gap-14 md:mt-24 md:grid-cols-3 md:gap-8">
            {audienceList.map((a, i) => (
              <Reveal
                as="li"
                key={a.slug}
                delay={i * 0.12}
                className={cn(i === 1 && "md:mt-24", i === 2 && "md:mt-12")}
              >
                <Link href={`/${a.slug}`} className="group block">
                  <KenBurns className="aspect-[3/4]" delay={i * 7}>
                    <div className="absolute inset-0 transition-transform duration-[1600ms] ease-luxe group-hover:scale-[1.04]">
                      <SalonImage image={a.hero} sizes="(min-width: 768px) 33vw, 100vw" />
                    </div>
                  </KenBurns>
                  <div className="mt-7 flex items-baseline justify-between border-b border-ink/15 pb-5">
                    <h3 className="font-display text-4xl md:text-5xl">
                      <span className="mr-4 align-top font-sans text-[0.625rem] tracking-[0.3em] text-stone">
                        {a.numeral}
                      </span>
                      <span className="transition-[font-style] group-hover:italic">{a.label}</span>
                    </h3>
                    <span
                      aria-hidden="true"
                      className="h-px w-8 bg-ink transition-[width] duration-700 ease-luxe group-hover:w-16"
                    />
                  </div>
                  <p className="mt-4 text-graphite">{a.teaser}</p>
                </Link>
              </Reveal>
            ))}
          </ul>
        </Container>
      </section>

      {/* ------------------------------------------------ Moving gallery */}
      <section aria-labelledby="galerie-teaser" className="overflow-hidden bg-ink py-24 text-white md:py-36">
        <Container className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <SectionIntro eyebrow="Galerie" title="Handwerk" italic="in Bewegung." tone="dark" id="galerie-teaser" />
          <Reveal delay={0.1}>
            <ButtonLink href="/galerie" tone="light" variant="outline">
              Zur Galerie
            </ButtonLink>
          </Reveal>
        </Container>
        <div className="mt-16 md:mt-20">
          <Marquee label="Bildergalerie, läuft automatisch" durationS={80}>
            {inspirationItems.map((item) => (
              <div
                key={item.id}
                className={cn(
                  "relative mr-4 h-72 shrink-0 overflow-hidden bg-ink-soft md:mr-6 md:h-[28rem]",
                  item.ratio === "portrait" && "w-52 md:w-80",
                  item.ratio === "square" && "w-72 md:w-[28rem]",
                  item.ratio === "landscape" && "w-[26rem] md:w-[40rem]",
                )}
              >
                <SalonImage image={item.image} sizes="40vw" />
              </div>
            ))}
          </Marquee>
        </div>
      </section>

      {/* ------------------------------------------------ Prices */}
      <section aria-labelledby="preise" className="py-24 md:py-44">
        <Container className="grid gap-16 md:grid-cols-12">
          <div className="md:col-span-5">
            <SectionIntro eyebrow="Preise" title="Auszug aus" italic="unserer Preisliste" id="preise" />
            <Reveal delay={0.15} className="mt-10">
              <ButtonLink href="/preise" variant="outline">
                Alle Preise
              </ButtonLink>
            </Reveal>
          </div>
          <div className="md:col-span-6 md:col-start-7">
            <FlyerPriceList />
          </div>
        </Container>
      </section>

      {/* ------------------------------------------------ Visit */}
      <section aria-labelledby="besuch" className="bg-bone py-24 md:py-44">
        <Container className="grid gap-16 md:grid-cols-12 md:items-center">
          <Reveal className="md:col-span-6">
            <KenBurns className="aspect-[4/5] md:aspect-[5/6]" delay={4}>
              <SalonImage image={images.salonFacade} sizes="(min-width: 768px) 50vw, 100vw" />
            </KenBurns>
          </Reveal>
          <div className="md:col-span-5 md:col-start-8">
            <SectionIntro eyebrow="Besuchen Sie uns" title={site.address.street} italic={`${site.address.postalCode} ${site.address.city}`} id="besuch" />
            <Reveal delay={0.15} className="mt-12">
              <HoursList />
            </Reveal>
            <Reveal delay={0.2} className="mt-10 flex flex-wrap gap-4">
              <ButtonLink href={site.phone.href}>{site.phone.display}</ButtonLink>
              <ButtonLink href="/kontakt" variant="outline">
                Anfahrt
              </ButtonLink>
            </Reveal>
          </div>
        </Container>
      </section>

      <CtaBand />
    </>
  );
}
