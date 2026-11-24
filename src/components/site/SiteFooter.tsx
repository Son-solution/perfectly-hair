import Link from "next/link";
import { LogoMark } from "@/components/brand/LogoMark";
import { BackToTop, LiveBand } from "@/components/motion/LiveBand";
import type { SiteChrome } from "@/content/view";

export function SiteFooter({ chrome }: { chrome: SiteChrome }) {
  const bandWords = chrome.bandWords;
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

  return (
    <footer className="relative overflow-hidden bg-ink text-white">
      {/* Moving band */}
      {/* Line height leaves room for Bodoni ascenders/descenders (no vertical clipping);
          only the horizontal track is clipped, which is the intended marquee effect. */}
      <LiveBand className="overflow-x-clip border-y border-white/10 py-[clamp(1rem,2.5vw,2.25rem)]">
        <div className="animate-marquee flex w-max items-center whitespace-nowrap font-display text-[clamp(3.25rem,9.5vw,8.5rem)] leading-[1.2]">
          {band(0)}
          {band(1)}
        </div>
      </LiveBand>

      <div className="container-luxe grid gap-14 py-20 md:grid-cols-12 md:py-28">
        <div className="md:col-span-4">
          <Link href="/" aria-label={`${chrome.name} – Startseite`} className="group inline-flex items-center gap-5">
            <LogoMark decorative className="h-24 w-24 transition-transform duration-700 group-hover:scale-105 md:h-28 md:w-28" />
          </Link>
          <p className="mt-8 max-w-xs font-display text-2xl leading-snug">
            {chrome.footerTagline}
          </p>
        </div>

        <nav aria-label="Footer-Navigation" className="grid grid-cols-2 gap-8 md:col-span-4">
          <div>
            <p className="text-[0.625rem] uppercase tracking-[0.3em] text-white/45">Für</p>
            <ul className="mt-5 space-y-2">
              {chrome.primaryNav.map((a) => (
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
              {[...chrome.secondaryNav, chrome.cta].map((item) => (
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
            <a href={chrome.mapsUrl} target="_blank" rel="noopener noreferrer" className="block font-display text-2xl leading-snug hover:italic">
              {chrome.street}
              <br />
              {chrome.cityLine}
              <span className="sr-only"> (Karte, öffnet in neuem Tab)</span>
            </a>
            <a href={chrome.phone.href} className="mt-4 block font-display text-2xl hover:italic">
              {chrome.phone.display}
            </a>
          </address>
          <ul className="mt-8 space-y-1.5 text-sm tabular-nums text-white/75">
            {chrome.hoursLines.map((l) => (
              <li key={l}>{l}</li>
            ))}
          </ul>
          {chrome.walkIn && (
            <p className="mt-5 max-w-xs border-l border-white/25 pl-4 text-sm leading-relaxed text-white/75">
              <span className="block font-display text-base italic text-white">{chrome.walkIn.title}</span>
            </p>
          )}
        </div>
      </div>

      {/* Giant wordmark — own row, one line, sized to always fit the container width */}
      <div className="container-luxe">
        <div className="border-t border-white/10 pt-[clamp(1.5rem,3vw,3rem)]">
          <p
            aria-hidden="true"
            className="whitespace-nowrap pb-[0.26em] font-display text-[clamp(2.4rem,12vw,14.5rem)] leading-[0.95] tracking-[-0.02em]"
          >
            {chrome.shortName.split(" ")[0]} <span className="italic text-white/35">{chrome.shortName.split(" ").slice(1).join(" ")}</span>
          </p>
        </div>
      </div>

      <div className="container-luxe flex flex-col gap-5 border-t border-white/10 py-8 text-[0.625rem] uppercase tracking-[0.24em] text-white/45 md:flex-row md:items-center md:justify-between">
        <p>{chrome.name}</p>
        <ul className="flex flex-wrap items-center gap-x-6 gap-y-3">
          {chrome.legalNav.map((l) => (
            <li key={l.href}><Link href={l.href} className="hover:text-white">{l.label}</Link></li>
          ))}
          <li><BackToTop className="text-[0.625rem]" /></li>
        </ul>
      </div>
    </footer>
  );
}
