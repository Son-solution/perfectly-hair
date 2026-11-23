import Link from "next/link";
import { Reveal } from "@/components/motion";
import { MaskLines } from "@/components/motion/MaskLines";
import { SalonImage } from "@/components/media/SalonImage";
import type { Employee, MediaAsset, SectionOf } from "@/content/schema";

type Member = Employee & { image: MediaAsset | null };

/**
 * Team grid. Renders real employees from the CMS; while none are published it shows an
 * honest "in preparation" state (no invented staff).
 */
export function TeamSection({ section, employees, placeholder }: { section: SectionOf<"team">; employees: Member[]; placeholder: MediaAsset }) {
  return (
    <section aria-labelledby={section.id} className="py-24 md:py-40">
      <div className="container-luxe">
        {employees.length === 0 ? (
          <div className="grid gap-16 md:grid-cols-12 md:items-center">
            <Reveal className="relative aspect-[4/5] overflow-hidden md:col-span-5">
              <div className="absolute inset-0 animate-ken-strong">
                <SalonImage image={placeholder} tone="light" sizes="(min-width: 768px) 40vw, 100vw" />
              </div>
            </Reveal>
            <div className="md:col-span-6 md:col-start-7">
              <p className="flex items-center gap-4 text-eyebrow uppercase text-stone">
                <span aria-hidden="true" className="h-px w-10 bg-current" />
                {section.eyebrow}
              </p>
              <MaskLines
                id={section.id}
                className="mt-6 font-display text-[clamp(2.8rem,6vw,6rem)] font-normal leading-[0.92]"
                lines={[section.title, <span key="i" className="italic text-graphite">{section.italic}</span>]}
              />
              <Reveal delay={0.15}>
                <p className="mt-8 max-w-lg leading-relaxed text-graphite">{section.emptyText}</p>
              </Reveal>
            </div>
          </div>
        ) : (
          <>
            <MaskLines
              id={section.id}
              className="font-display text-[clamp(2.8rem,6vw,6rem)] font-normal leading-[0.92]"
              lines={[section.title, <span key="i" className="italic text-graphite">{section.italic}</span>]}
            />
            <ul className="mt-16 grid gap-x-6 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
              {employees.map((e, i) => (
                <Reveal as="li" key={e.id} delay={(i % 3) * 0.1} className="group">
                  <div className="relative aspect-[3/4] overflow-hidden bg-bone">
                    {e.image && (
                      <div className="absolute inset-0 transition-transform duration-[1600ms] ease-luxe group-hover:scale-105">
                        <SalonImage image={e.image} tone="light" sizes="(min-width: 1024px) 30vw, 50vw" />
                      </div>
                    )}
                  </div>
                  <h3 className="mt-6 font-display text-4xl">{e.name}</h3>
                  {e.role && <p className="mt-2 text-eyebrow uppercase text-stone">{e.role}</p>}
                  {e.specializations.length > 0 && <p className="mt-4 text-sm text-graphite">{e.specializations.join(" · ")}</p>}
                  {e.bio && <p className="mt-4 leading-relaxed text-graphite">{e.bio}</p>}
                  {e.bookable && (
                    <Link href={`/termin?mitarbeiter=${e.id}`} className="mt-5 inline-block text-[0.6875rem] uppercase tracking-[0.24em] underline-offset-8 hover:underline">
                      Termin bei {e.name.split(" ")[0]} →
                    </Link>
                  )}
                </Reveal>
              ))}
            </ul>
          </>
        )}
      </div>
    </section>
  );
}
