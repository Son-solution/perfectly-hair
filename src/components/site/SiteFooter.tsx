import Link from "next/link";
import { LogoMark } from "@/components/brand/LogoMark";
import { BackToTop, LiveBand } from "@/components/motion/LiveBand";
import { audiences, businessHours, mapsUrl, secondaryNav, site } from "@/config/site";

const bandWords = ["Damen", "Herren", "Kinder", "Wiesbaden"];

export function SiteFooter() {
  const band = (copy: number) => (
    <span aria-hidden={copy === 1 ? true : undefined} className="flex shrink-0 items-center">
      {bandWords.map((w, i) => (
        <span key={w} className="flex items-center">
          <span className={i % 2 === 1 ? "italic text-outline-light" : ""}>{w}</span>
          <LogoMark decorative className="mx-[0.35em] h-[0.42em] w-[0.42em] text-white/40" />
        </span>
      ))}
    </span>
  );

  const open = businessHours.filter((d) => d.opens);

  return (
    <footer className="relative overflow-hidden bg-ink text-white">
      {/* Moving band */}
      <LiveBand className="border-y border-white/10 py-6 md:py-10">
        <div className="animate-marquee flex w-max whitespace-nowrap font-display text-[clamp(3.5rem,10vw,9rem)] leading-none">
          {band(0)}
          {band(1)}
        </div>
      </LiveBand>

      <div className="container-luxe grid gap-14 py-20 md:grid-cols-12 md:py-28">
        <div className="md:col-span-4">
          <Link href="/" aria-label={`${site.name} – Startseite`} className="group inline-flex items-center gap-5">
            <LogoMark decorative className="h-24 w-24 transition-transform duration-700 group-hover:scale-105 md:h-28 md:w-28" />
          </Link>
          <p className="mt-8 max-w-xs font-display text-2xl leading-snug">
            Friseursalon für <span className="italic">Damen, Herren</span> und{" "}
            <span className="italic">Kinder</span> in Wiesbaden.
          </p>
        </div>

        <nav aria-label="Footer-Navigation" className="grid grid-cols-2 gap-8 md:col-span-4">
          <div>
            <p className="text-[0.625rem] uppercase tracking-[0.3em] text-white/45">Für</p>
            <ul className="mt-5 space-y-2">
              {audiences.map((a) => (
                <li key={a.href}>
                  <Link href={a.href} className="font-display text-3xl transition-all duration-300 hover:pl-2 hover:italic">
                    {a.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-[0.625rem] uppercase tracking-[0.3em] text-white/45">Salon</p>
            <ul className="mt-5 space-y-2.5 text-sm">
              {[...secondaryNav, { label: "Termin", href: "/termin" }].map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-white/70 transition-colors hover:text-white">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        <div className="md:col-span-4">
          <p className="text-[0.625rem] uppercase tracking-[0.3em] text-white/45">Besuch</p>
          <address className="mt-5 not-italic">
            <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="block font-display text-2xl leading-snug hover:italic">
              {site.address.street}
              <br />
              {site.address.postalCode} {site.address.city}
              <span className="sr-only"> (Karte, öffnet in neuem Tab)</span>
            </a>
            <a href={site.phone.href} className="mt-4 block font-display text-2xl hover:italic">
              {site.phone.display}
            </a>
          </address>
          <dl className="mt-8 grid grid-cols-[auto_1fr] gap-x-6 gap-y-1.5 text-sm text-white/65">
            <dt>Di – Fr</dt>
            <dd className="tabular-nums text-white">{open[0]?.opens} – {open[0]?.closes} Uhr</dd>
            <dt>Samstag</dt>
            <dd className="tabular-nums text-white">{open.at(-1)?.opens} – {open.at(-1)?.closes} Uhr</dd>
            <dt>So & Mo</dt>
            <dd>Geschlossen</dd>
          </dl>
        </div>
      </div>

      {/* Giant wordmark — own row, one line, sized to always fit the container width */}
      <div className="container-luxe">
        <div className="border-t border-white/10 pt-[clamp(1.5rem,3vw,3rem)]">
          <p
            aria-hidden="true"
            className="whitespace-nowrap pb-[0.26em] font-display text-[clamp(2.4rem,12vw,14.5rem)] leading-[0.95] tracking-[-0.02em]"
          >
            Perfectly <span className="italic text-white/35">Hair</span>
          </p>
        </div>
      </div>

      <div className="container-luxe flex flex-col gap-5 border-t border-white/10 py-8 text-[0.625rem] uppercase tracking-[0.24em] text-white/45 md:flex-row md:items-center md:justify-between">
        <p>{site.name} · Wiesbaden</p>
        <ul className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <li><Link href="/impressum" className="hover:text-white">Impressum</Link></li>
          <li><Link href="/datenschutz" className="hover:text-white">Datenschutz</Link></li>
          <li><Link href="/bildnachweise" className="hover:text-white">Bildnachweise</Link></li>
          <li><BackToTop className="text-[0.625rem]" /></li>
        </ul>
      </div>
    </footer>
  );
}
