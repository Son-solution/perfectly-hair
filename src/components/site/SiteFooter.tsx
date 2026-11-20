import Link from "next/link";
import { audiences, mapsUrl, secondaryNav, site } from "@/config/site";
import { LogoMark } from "@/components/brand/LogoMark";
import { HoursList } from "@/components/site/blocks";
import { Container, Eyebrow } from "@/components/ui/primitives";

export function SiteFooter() {
  return (
    <footer className="border-t border-white/10 bg-ink text-white">
      <Container className="grid gap-14 py-20 md:grid-cols-12 md:py-28">
        <div className="md:col-span-4">
          <Link href="/" aria-label={`${site.name} – Startseite`} className="group inline-block">
            <LogoMark
              decorative
              className="h-28 w-28 transition-opacity duration-700 group-hover:opacity-80 md:h-32 md:w-32"
            />
            <span aria-hidden="true" className="mt-8 block font-display text-display-lg leading-none">
              Perfectly Hair
            </span>
            <span aria-hidden="true" className="mt-3 block text-eyebrow uppercase text-ash">
              by Gabriel
            </span>
          </Link>
          <p className="mt-8 max-w-xs leading-relaxed text-ash">
            Friseursalon für Damen, Herren und Kinder in Wiesbaden.
          </p>
        </div>

        <nav aria-label="Footer-Navigation" className="grid grid-cols-2 gap-8 md:col-span-4">
          <div>
            <Eyebrow className="text-ash">Für</Eyebrow>
            <ul className="mt-5 space-y-3">
              {audiences.map((a) => (
                <li key={a.href}>
                  <Link href={a.href} className="font-display text-2xl hover:italic">
                    {a.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <Eyebrow className="text-ash">Salon</Eyebrow>
            <ul className="mt-5 space-y-2.5 text-sm">
              {[...secondaryNav, { label: "Termin", href: "/termin" }].map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-white/75 transition-colors hover:text-white">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        <div className="md:col-span-4">
          <Eyebrow className="text-ash">Kontakt</Eyebrow>
          <address className="mt-5 not-italic leading-loose">
            <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="underline-offset-4 hover:underline">
              {site.address.street}, {site.address.postalCode} {site.address.city}
              <span className="sr-only"> (Karte, öffnet in neuem Tab)</span>
            </a>
            <br />
            <a href={site.phone.href} className="underline-offset-4 hover:underline">
              {site.phone.display}
            </a>
          </address>
          <div className="mt-8 text-sm">
            <HoursList tone="dark" />
          </div>
        </div>
      </Container>

      <Container className="flex flex-col gap-4 border-t border-white/10 py-8 text-[0.6875rem] uppercase tracking-[0.2em] text-ash sm:flex-row sm:justify-between">
        <p>{site.name}</p>
        <ul className="flex gap-6">
          <li><Link href="/impressum" className="hover:text-white">Impressum</Link></li>
          <li><Link href="/datenschutz" className="hover:text-white">Datenschutz</Link></li>
        </ul>
      </Container>
    </footer>
  );
}
