import { Reveal } from "@/components/motion";
import type { SectionOf } from "@/content/schema";
import { cn } from "@/lib/utils";

/**
 * Walk-in announcement ("Freitag & Samstag – Herren ohne Termin"). Calm, inline — never a popup.
 * Texts come from business.walkIn so homepage, Herren page, Termin page and hours blocks
 * always say the same thing.
 */
export function WalkInAnnouncement({ section, walkIn }: { section: SectionOf<"walk-in-announcement">; walkIn: { title: string; text: string } | null }) {
  if (!walkIn) return null;
  const dark = section.tone === "dark";
  const [lead, ...rest] = walkIn.title.split(" – ");

  if (section.variant === "band") {
    return (
      <section aria-label={walkIn.title} className={cn("border-y py-14 md:py-20", dark ? "border-white/10 bg-ink text-white" : "border-mist bg-bone text-ink")}>
        <div className="container-luxe">
          <Reveal className="grid items-end gap-8 md:grid-cols-12">
            <div className="md:col-span-6">
              <p className={cn("text-eyebrow font-medium uppercase", dark ? "text-white/60" : "text-stone")}>Ohne Termin</p>
              <h2 className="mt-[var(--space-label)] font-display text-display-lg">
                {lead}
                {rest.length > 0 && <span className="block italic">{rest.join(" – ")}</span>}
              </h2>
            </div>
            <p className={cn("max-w-md text-base leading-relaxed md:col-span-5 md:col-start-8", dark ? "text-white/75" : "text-graphite")}>{walkIn.text}</p>
          </Reveal>
        </div>
      </section>
    );
  }

  return (
    <section aria-label={walkIn.title} className={cn("py-12 md:py-16", dark ? "bg-ink text-white" : "bg-paper")}>
      <div className="container-luxe">
        <Reveal>
          <div role="note" className={cn("flex max-w-4xl flex-col gap-4 border-l-2 py-2 pl-6 md:flex-row md:items-baseline md:gap-12 md:pl-8", dark ? "border-white" : "border-ink")}>
            <p className="shrink-0 font-display text-2xl italic leading-tight md:text-3xl">{walkIn.title}</p>
            <p className={cn("max-w-xl leading-relaxed", dark ? "text-white/75" : "text-graphite")}>{walkIn.text}</p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
