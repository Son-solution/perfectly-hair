import type { Metadata } from "next";
import { Reveal } from "@/components/motion";
import { ArtPlaceholder } from "@/components/media/ArtPlaceholder";
import { CtaBand } from "@/components/site/blocks";
import { PageHero } from "@/components/site/PageHero";
import { Container, Eyebrow } from "@/components/ui/primitives";

export const metadata: Metadata = {
  title: "Team",
  description: "Das Team von Perfectly Hair by Gabriel in Wiesbaden.",
  alternates: { canonical: "/team" },
};

/**
 * No team members are shown until the salon provides real names, roles and
 * portraits with consent. Profiles will then come from the CMS (staff_members).
 */
export default function TeamPage() {
  return (
    <>
      <PageHero
        eyebrow="Team"
        title="Die Menschen"
        italic="hinter jedem Schnitt."
        intro="Hier stellt sich unser Team bald persönlich vor."
      />

      <section aria-labelledby="bald" className="py-24 md:py-40">
        <Container className="grid gap-16 md:grid-cols-12 md:items-center">
          <Reveal className="relative aspect-[4/5] md:col-span-5">
            <ArtPlaceholder seed={31} tone="light" label="Porträts folgen" />
          </Reveal>
          <div className="md:col-span-6 md:col-start-7">
            <Reveal>
              <Eyebrow className="text-stone">In Vorbereitung</Eyebrow>
              <h2 id="bald" className="mt-6 font-display text-display-lg font-normal">
                Persönlich, <span className="italic text-graphite">nicht anonym.</span>
              </h2>
            </Reveal>
            <Reveal delay={0.15}>
              <p className="mt-8 max-w-lg leading-relaxed text-graphite">
                Wir zeigen Ihnen hier in Kürze, wer Sie im Salon erwartet – mit Namen,
                Schwerpunkten und Porträts. Bis dahin lernen Sie uns am besten direkt im
                Salon kennen.
              </p>
            </Reveal>
          </div>
        </Container>
      </section>

      <CtaBand title="Lernen Sie uns kennen" italic="direkt im Salon." />
    </>
  );
}
