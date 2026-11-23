import { Reveal } from "@/components/motion";
import { ArtPlaceholder } from "@/components/media/ArtPlaceholder";
import { ButtonLink } from "@/components/ui/primitives";
import type { SectionOf } from "@/content/schema";
import type { SiteChrome } from "@/content/view";

function Label({ children }: { children: string }) {
  return <p className="text-eyebrow uppercase leading-none text-stone">{children}</p>;
}

export function ContactDetailsSection({
  section, chrome, email,
}: {
  section: SectionOf<"contact-details">;
  chrome: SiteChrome;
  email: string | null;
}) {
  return (
    <section aria-label={section.eyebrow} className="py-24 md:py-40">
      <div className="container-luxe grid gap-16 md:grid-cols-12">
        <div className="space-y-14 md:col-span-6">
          <Reveal>
            <Label>Adresse</Label>
            <address className="mt-[var(--space-label)] font-display text-[clamp(2.4rem,5vw,4.5rem)] not-italic leading-[1.02]">
              {chrome.street}
              <span className="block italic text-graphite">{chrome.cityLine}</span>
            </address>
            <div className="mt-8">
              <ButtonLink href={chrome.mapsUrl} variant="outline">Route planen</ButtonLink>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <Label>Telefon</Label>
            <a href={chrome.phone.href} className="mt-[var(--space-label)] inline-block font-display text-[clamp(2.4rem,5vw,4.5rem)] leading-none underline-offset-8 hover:italic hover:underline">
              {chrome.phone.display}
            </a>
          </Reveal>
          {email && (
            <Reveal delay={0.15}>
              <Label>E-Mail</Label>
              <a href={`mailto:${email}`} className="mt-[var(--space-label)] inline-block font-display text-3xl underline-offset-8 hover:underline">
                {email}
              </a>
            </Reveal>
          )}
        </div>
        <div className="md:col-span-5 md:col-start-8">
          <Reveal delay={0.15}>
            <Label>Öffnungszeiten</Label>
            <ul className="mt-6 border-t border-mist">
              {chrome.hoursLines.map((l) => {
                const [days, ...rest] = l.split(/ (?=\d{2}:)/);
                const closed = l.endsWith("geschlossen");
                return (
                  <li key={l} className="flex justify-between gap-6 border-b border-mist py-4">
                    <span className="text-graphite">{closed ? l.replace(" geschlossen", "") : days}</span>
                    <span className="tabular-nums">{closed ? "Geschlossen" : rest.join(" ")}</span>
                  </li>
                );
              })}
            </ul>
            <div className="mt-10">
              <ButtonLink href={chrome.phone.href}>{`Anrufen: ${chrome.phone.display}`}</ButtonLink>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/** Map is a link, not an embed: no third-party requests/cookies before consent. */
export function LocationSection({ section, mapsUrl, addressLine }: { section: SectionOf<"location">; mapsUrl: string; addressLine: string }) {
  return (
    <section aria-label={section.title} className="pb-24 md:pb-40">
      <div className="container-luxe">
        <Reveal>
          <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="group relative block aspect-[16/10] overflow-hidden bg-ink md:aspect-[21/8]">
            <div aria-hidden="true" className="absolute inset-0 transition-transform duration-[1800ms] ease-luxe group-hover:scale-105">
              <ArtPlaceholder seed={41} showLabel={false} />
            </div>
            <span className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-6 text-center text-white">
              <span className="text-eyebrow uppercase text-white/60">{section.title}</span>
              <span className="font-display text-3xl group-hover:italic md:text-6xl">{addressLine}</span>
              <span className="mt-2 border border-white/50 px-6 py-3 text-[0.6875rem] uppercase tracking-[0.24em] transition-colors duration-500 group-hover:bg-white group-hover:text-ink">
                {section.linkLabel}
              </span>
              <span className="max-w-md text-xs leading-relaxed text-white/55">{section.hint}</span>
            </span>
          </a>
        </Reveal>
      </div>
    </section>
  );
}
