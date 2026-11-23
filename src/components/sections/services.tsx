import Link from "next/link";
import { Reveal } from "@/components/motion";
import { LiveBand } from "@/components/motion/LiveBand";
import { MaskLines } from "@/components/motion/MaskLines";
import { ButtonLink } from "@/components/ui/primitives";
import type { Category, SectionOf, Service } from "@/content/schema";
import { emphasis } from "@/lib/emphasis";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";

/** Booking deep link: preselects category + service in the booking flow. */
export const bookingHref = (serviceId: string, audience?: string | null) =>
  `/termin?${audience ? `kategorie=${audience}&` : ""}leistung=${serviceId}`;

function Eyebrow({ children, dark }: { children: string; dark?: boolean }) {
  return (
    <p className={cn("flex items-center gap-4 text-eyebrow uppercase", dark ? "text-white/60" : "text-stone")}>
      <span aria-hidden="true" className="h-px w-10 bg-current" />
      {children}
    </p>
  );
}

/** One price row. Whole row is a link into the booking preview with this service preselected. */
function ServiceRow({ service, audience, dark, index }: { service: Service; audience?: string | null; dark?: boolean; index: number }) {
  return (
    <Reveal as="li" delay={index * 0.05}>
      <Link
        href={bookingHref(service.id, audience)}
        className={cn(
          "group grid grid-cols-[1fr_auto] items-baseline gap-x-6 gap-y-1 border-b py-5 md:py-6",
          dark ? "border-white/15" : "border-mist",
        )}
      >
        <span className="flex items-baseline gap-4 text-lg md:text-xl">
          <span className="transition-[font-style] group-hover:italic">{service.name}</span>
          <span
            aria-hidden="true"
            className={cn("h-px flex-1 origin-left scale-x-50 transition-transform duration-700 ease-luxe group-hover:scale-x-100", dark ? "bg-white/20" : "bg-mist")}
          />
        </span>
        <span className="font-display text-2xl tabular-nums md:text-3xl">
          {service.priceCents !== null ? formatPrice(service.priceCents, service.priceIsFrom) : "Preis auf Anfrage"}
        </span>
        <span className={cn("text-xs uppercase tracking-[0.2em]", dark ? "text-white/50" : "text-stone")}>
          {service.durationMin ? `${service.durationMin} Min.` : ""}
        </span>
        <span className={cn("text-[0.625rem] uppercase tracking-[0.24em] opacity-60 transition-opacity group-hover:opacity-100", dark ? "text-white" : "text-ink")}>
          Termin anfragen →
        </span>
      </Link>
    </Reveal>
  );
}

/* ------------------------------------------------------------------ price-list */

export function PriceListSection({
  section, services, phone,
}: {
  section: SectionOf<"price-list">;
  services: Service[];
  phone: { display: string; href: string };
}) {
  return (
    <section aria-labelledby={section.id} className="relative overflow-hidden bg-paper pb-24 pt-6 text-ink md:pb-40 md:pt-10">
      {section.marqueeWord && (
        <LiveBand className="pointer-events-none mb-[clamp(1.5rem,4vw,4rem)] select-none overflow-hidden">
          <div aria-hidden="true" className="animate-marquee flex w-max whitespace-nowrap font-display text-[clamp(5rem,22vw,22rem)] italic leading-[0.95] text-outline-dark [animation-duration:46s]">
            {[0, 1].map((copy) => (
              <span key={copy} className="flex shrink-0">
                {[0, 1, 2].map((i) => (
                  <span key={i} className="pr-[0.35em]">
                    {section.marqueeWord} <span className="align-middle text-[0.4em]">·</span>
                  </span>
                ))}
              </span>
            ))}
          </div>
        </LiveBand>
      )}
      <div className="container-luxe relative grid gap-14 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <MaskLines
            id={section.id}
            className="font-display text-[clamp(2.8rem,6vw,6rem)] font-normal leading-[0.92]"
            lines={section.titleLines.map((l) => emphasis(l, "italic text-graphite"))}
          />
          {section.intro && <p className="mt-8 max-w-md leading-relaxed text-graphite">{section.intro}</p>}
          {section.cta && (
            <Reveal delay={0.2} className="mt-10">
              <ButtonLink href={section.cta.href} variant="outline">
                {section.cta.label}
              </ButtonLink>
            </Reveal>
          )}
        </div>
        <div className="lg:col-span-6 lg:col-start-7">
          <ul>
            {services.map((s, i) => (
              <ServiceRow key={s.id} service={s} index={i} />
            ))}
          </ul>
          <p className="mt-8 max-w-xl text-sm leading-relaxed text-stone">
            {section.note}{" "}
            <a href={phone.href} className="underline underline-offset-4">
              {phone.display}
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ service-list */

export function ServiceListSection({
  section, services, category,
}: {
  section: SectionOf<"service-list">;
  services: Service[];
  category: Category | null;
}) {
  return (
    <section id="preise" aria-labelledby={section.id} className="scroll-mt-24 bg-ink py-24 text-white md:py-40">
      <div className="container-luxe grid gap-16 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <Eyebrow dark>{section.eyebrow}</Eyebrow>
          <MaskLines
            id={section.id}
            className="mt-6 font-display text-[clamp(2.8rem,6vw,6rem)] font-normal leading-[0.92]"
            lines={[section.title, <span key="i" className="italic text-white/65">{section.italic}</span>]}
          />
          {section.intro && <p className="mt-8 max-w-md leading-relaxed text-white/70">{section.intro}</p>}
        </div>
        <div className="lg:col-span-6 lg:col-start-7">
          <ul>
            {services.map((s, i) => (
              <ServiceRow key={s.id} service={s} audience={category?.slug} dark index={i} />
            ))}
          </ul>
          <p className="mt-8 max-w-xl text-sm leading-relaxed text-white/55">{section.note}</p>
        </div>
      </div>
    </section>
  );
}
