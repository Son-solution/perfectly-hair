import Link from "next/link";
import { KenBurns, Marquee, Reveal } from "@/components/motion";
import {
  ButtonLink,
  Container,
  Eyebrow,
  ImagePlaceholder,
} from "@/components/ui/primitives";
import { audiences, flyerServices, site } from "@/config/site";
import { formatPrice } from "@/lib/format";

/**
 * Phase 1 foundation homepage: demonstrates the design system and motion primitives
 * with real business data only. Photography and CMS-driven sections arrive in Phase 4.
 */

const audienceCopy: Record<(typeof audiences)[number]["slug"], string> = {
  damen: "Schnitt, Farbe und Styling für Damen.",
  herren: "Haarschnitt, Bart und Pflege für Herren.",
  kinder: "Entspannte Haarschnitte für Kinder.",
};

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative isolate flex min-h-[100svh] items-end overflow-hidden bg-ink text-white">
        <KenBurns className="absolute inset-0 -z-10">
          <ImagePlaceholder label="Hero-Bild folgt" />
        </KenBurns>
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-black/40" />

        <Container className="pb-16 pt-40 md:pb-24">
          <Reveal>
            <Eyebrow className="text-ash">Friseursalon · Wiesbaden</Eyebrow>
          </Reveal>
          <Reveal delay={0.15}>
            <h1 className="mt-6 max-w-5xl font-display text-display-2xl font-normal">
              Perfectly Hair
              <span className="block italic text-white/80">by Gabriel</span>
            </h1>
          </Reveal>
          <Reveal delay={0.3}>
            <p className="mt-10 flex flex-wrap gap-x-6 gap-y-2 text-eyebrow uppercase md:text-sm md:tracking-[0.3em]">
              {audiences.map((a, i) => (
                <span key={a.slug} className="flex items-center gap-6">
                  {i > 0 && <span aria-hidden="true" className="h-px w-8 bg-white/40" />}
                  {a.label}
                </span>
              ))}
            </p>
          </Reveal>
          <Reveal delay={0.45} className="mt-12 flex flex-wrap gap-4">
            <ButtonLink href="/termin" tone="light">
              Termin buchen
            </ButtonLink>
            <ButtonLink href="/leistungen" tone="light" variant="outline">
              Leistungen
            </ButtonLink>
          </Reveal>
        </Container>
      </section>

      {/* Audience categories */}
      <section aria-labelledby="fuer-wen" className="py-24 md:py-44">
        <Container>
          <Reveal className="max-w-3xl">
            <Eyebrow className="text-stone">Für die ganze Familie</Eyebrow>
            <h2 id="fuer-wen" className="mt-6 font-display text-display-xl font-normal">
              Damen. Herren. Kinder.
            </h2>
          </Reveal>

          <ul className="mt-16 grid gap-6 md:mt-24 md:grid-cols-3 md:gap-8">
            {audiences.map((a, i) => (
              <Reveal as="li" key={a.slug} delay={i * 0.12}>
                <Link href={a.href} className="group block">
                  <KenBurns className="aspect-[3/4]" delay={i * 6}>
                    <ImagePlaceholder
                      label={`${a.label} – Bild folgt`}
                      className="transition-transform duration-[1400ms] ease-luxe group-hover:scale-[1.03]"
                    />
                  </KenBurns>
                  <div className="mt-6 flex items-baseline justify-between border-b border-mist pb-5">
                    <h3 className="font-display text-4xl md:text-5xl">{a.label}</h3>
                    <span
                      aria-hidden="true"
                      className="h-px w-8 bg-ink transition-[width] duration-500 ease-luxe group-hover:w-16"
                    />
                  </div>
                  <p className="mt-4 text-graphite">{audienceCopy[a.slug]}</p>
                </Link>
              </Reveal>
            ))}
          </ul>
        </Container>
      </section>

      {/* Ambient marquee */}
      <section className="border-y border-mist bg-bone py-10">
        <Marquee label="Leistungen im Überblick" durationS={70}>
          {flyerServices.map((s) => (
            <span
              key={s.name}
              className="flex items-center gap-10 px-5 font-display text-4xl italic text-graphite md:text-6xl"
            >
              {s.name}
              <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-ash" />
            </span>
          ))}
        </Marquee>
      </section>

      {/* Price preview (flyer) */}
      <section aria-labelledby="preise" className="py-24 md:py-44">
        <Container className="grid gap-16 md:grid-cols-12">
          <Reveal className="md:col-span-5">
            <Eyebrow className="text-stone">Preise</Eyebrow>
            <h2 id="preise" className="mt-6 font-display text-display-lg font-normal">
              Auszug aus unserer Preisliste
            </h2>
            <p className="mt-8 max-w-md leading-relaxed text-graphite">
              Preise für Damen, Herren und Kinder können abweichen. Die vollständige,
              aktuelle Preisliste folgt in Kürze.
            </p>
          </Reveal>
          <Reveal delay={0.15} className="md:col-span-6 md:col-start-7">
            <dl>
              {flyerServices.map((s) => (
                <div
                  key={s.name}
                  className="flex items-baseline justify-between gap-6 border-b border-mist py-5"
                >
                  <dt className="text-lg">{s.name}</dt>
                  <dd className="font-display text-2xl tabular-nums">
                    {formatPrice(s.priceCents, s.priceIsFrom)}
                  </dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </Container>
      </section>

      {/* Visit */}
      <section aria-labelledby="besuch" className="bg-ink py-24 text-white md:py-36">
        <Container className="flex flex-col items-start gap-10 md:flex-row md:items-end md:justify-between">
          <Reveal>
            <Eyebrow className="text-ash">Besuchen Sie uns</Eyebrow>
            <h2 id="besuch" className="mt-6 font-display text-display-lg font-normal">
              {site.address.street}
              <span className="block text-ash">
                {site.address.postalCode} {site.address.city}
              </span>
            </h2>
          </Reveal>
          <Reveal delay={0.15} className="flex flex-wrap gap-4">
            <ButtonLink href={site.phone.href} tone="light">
              {site.phone.display}
            </ButtonLink>
            <ButtonLink href="/kontakt" tone="light" variant="outline">
              Anfahrt
            </ButtonLink>
          </Reveal>
        </Container>
      </section>
    </>
  );
}
