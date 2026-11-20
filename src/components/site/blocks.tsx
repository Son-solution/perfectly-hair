import Link from "next/link";
import type { ReactNode } from "react";
import { LogoMark } from "@/components/brand/LogoMark";
import { Reveal } from "@/components/motion";
import { ButtonLink, Container, Eyebrow } from "@/components/ui/primitives";
import { businessHours, flyerServices, site } from "@/config/site";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";

/* ----------------------------------------------------------------- */

export function SectionIntro({
  eyebrow,
  title,
  italic,
  children,
  id,
  tone = "light",
  className,
}: {
  eyebrow: string;
  title: string;
  italic?: string;
  children?: ReactNode;
  id?: string;
  tone?: "light" | "dark";
  className?: string;
}) {
  return (
    <Reveal className={cn("max-w-3xl", className)}>
      <Eyebrow className={cn("flex items-center gap-4", tone === "dark" ? "text-ash" : "text-stone")}>
        <span aria-hidden="true" className="h-px w-10 bg-current opacity-60" />
        {eyebrow}
      </Eyebrow>
      <h2 id={id} className="mt-6 font-display text-display-lg font-normal">
        {title}
        {italic && (
          <span className={cn("block italic", tone === "dark" ? "text-white/65" : "text-graphite")}>
            {italic}
          </span>
        )}
      </h2>
      {children && (
        <div className={cn("mt-8 max-w-xl leading-relaxed", tone === "dark" ? "text-ash" : "text-graphite")}>
          {children}
        </div>
      )}
    </Reveal>
  );
}

/* ----------------------------------------------------------------- */

/** Prices exactly as printed on the flyer, with the honest audience caveat. */
export function FlyerPriceList({
  tone = "light",
  showNote = true,
}: {
  tone?: "light" | "dark";
  showNote?: boolean;
}) {
  const dark = tone === "dark";
  return (
    <div>
      <dl>
        {flyerServices.map((s, i) => (
          <Reveal
            key={s.name}
            delay={i * 0.05}
            className={cn(
              "group flex items-baseline gap-4 border-b py-5 md:py-6",
              dark ? "border-white/12" : "border-mist",
            )}
          >
            <dt className="flex flex-1 items-baseline gap-4 text-lg md:text-xl">
              {s.name}
              <span
                aria-hidden="true"
                className={cn(
                  "h-px flex-1 origin-left scale-x-50 transition-transform duration-700 ease-luxe group-hover:scale-x-100",
                  dark ? "bg-white/20" : "bg-mist",
                )}
              />
            </dt>
            <dd className="font-display text-2xl tabular-nums md:text-3xl">
              {formatPrice(s.priceCents, s.priceIsFrom)}
            </dd>
          </Reveal>
        ))}
      </dl>
      {showNote && (
        <p className={cn("mt-8 max-w-xl text-sm leading-relaxed", dark ? "text-ash" : "text-stone")}>
          Preise laut aktuellem Flyer des Salons. Der Flyer unterscheidet nicht zwischen
          Damen, Herren und Kindern – je nach Haarlänge und Aufwand kann der Preis
          abweichen. Bitte fragen Sie uns nach dem Preis für Ihre Wunschleistung:{" "}
          <a href={site.phone.href} className="underline underline-offset-4">
            {site.phone.display}
          </a>
          .
        </p>
      )}
    </div>
  );
}

/* ----------------------------------------------------------------- */

export function HoursList({ tone = "light" }: { tone?: "light" | "dark" }) {
  const dark = tone === "dark";
  return (
    <dl className="text-base">
      {businessHours.map((d) => (
        <div
          key={d.weekday}
          className={cn(
            "flex justify-between gap-6 border-b py-3.5",
            dark ? "border-white/12" : "border-mist",
          )}
        >
          <dt className={dark ? "text-ash" : "text-graphite"}>{d.label}</dt>
          <dd className={cn("tabular-nums", !d.opens && (dark ? "text-ash" : "text-stone"))}>
            {d.opens ? `${d.opens} – ${d.closes} Uhr` : "Geschlossen"}
          </dd>
        </div>
      ))}
    </dl>
  );
}

/* ----------------------------------------------------------------- */

/** Closing call to action used at the bottom of most pages. */
export function CtaBand({
  title = "Ihr nächster Termin",
  italic = "beginnt mit einem Anruf.",
}: {
  title?: string;
  italic?: string;
}) {
  return (
    <section aria-labelledby="cta-title" className="grain overflow-hidden bg-ink text-white">
      <Container className="relative py-24 md:py-40">
        <div className="grid gap-12 md:grid-cols-12 md:items-end">
          <Reveal className="md:col-span-8">
            <Eyebrow className="text-ash">Termin vereinbaren</Eyebrow>
            <h2 id="cta-title" className="mt-6 font-display text-display-xl font-normal">
              {title}
              <span className="block italic text-white/65">{italic}</span>
            </h2>
          </Reveal>
          <Reveal delay={0.15} className="flex flex-col items-start gap-4 md:col-span-4 md:items-end">
            <ButtonLink href={site.phone.href} tone="light">
              {site.phone.display}
            </ButtonLink>
            <Link
              href="/kontakt"
              className="text-[0.75rem] uppercase tracking-[0.24em] text-ash underline-offset-8 transition-colors hover:text-white hover:underline"
            >
              Anfahrt &amp; Öffnungszeiten
            </Link>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}

/* ----------------------------------------------------------------- */

/** Slowly rotating circular text — a quiet, living detail. */
export function RotatingBadge({
  text = "Damen · Herren · Kinder · Wiesbaden · ",
  className,
}: {
  text?: string;
  className?: string;
}) {
  return (
    <div aria-hidden="true" className={cn("relative h-32 w-32 md:h-40 md:w-40", className)}>
      <svg viewBox="0 0 200 200" className="h-full w-full animate-spin-slow">
        <defs>
          <path id="badge-circle" d="M100,100 m-78,0 a78,78 0 1,1 156,0 a78,78 0 1,1 -156,0" />
        </defs>
        <text fill="currentColor" fontSize="14.5" letterSpacing="5.2" style={{ textTransform: "uppercase" }}>
          <textPath href="#badge-circle">{text}</textPath>
        </text>
      </svg>
      <span className="absolute inset-0 flex items-center justify-center">
        <LogoMark decorative className="h-12 w-12 md:h-14 md:w-14" />
      </span>
    </div>
  );
}

/* ----------------------------------------------------------------- */

/** Honest status notice (e.g. booking unavailable, draft content). */
export function Notice({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div role="note" className="border border-ink bg-white p-6 md:p-8">
      <p className="flex items-center gap-3 text-eyebrow font-medium uppercase">
        <span aria-hidden="true" className="h-2 w-2 animate-breathe rounded-full bg-ink" />
        {title}
      </p>
      <div className="mt-4 leading-relaxed text-graphite">{children}</div>
    </div>
  );
}
