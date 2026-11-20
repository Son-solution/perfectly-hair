import Link from "next/link";
import { audiences, businessHours, site } from "@/config/site";
import { Container, Eyebrow } from "@/components/ui/primitives";

export function SiteFooter() {
  return (
    <footer className="bg-ink text-white">
      <Container className="grid gap-14 py-20 md:grid-cols-12 md:py-28">
        <div className="md:col-span-5">
          <p className="font-display text-display-lg">Perfectly Hair</p>
          <p className="mt-2 text-eyebrow uppercase text-ash">by Gabriel</p>
          <p className="mt-8 max-w-sm leading-relaxed text-ash">
            Friseursalon für Damen, Herren und Kinder in Wiesbaden.
          </p>
        </div>

        <div className="md:col-span-3">
          <Eyebrow className="text-ash">Salon</Eyebrow>
          <address className="mt-5 not-italic leading-loose">
            {site.address.street}
            <br />
            {site.address.postalCode} {site.address.city}
            <br />
            <a href={site.phone.href} className="underline-offset-4 hover:underline">
              {site.phone.display}
            </a>
          </address>
          <ul className="mt-6 flex gap-5 text-sm uppercase tracking-[0.18em]">
            {audiences.map((a) => (
              <li key={a.slug}>
                <Link href={a.href} className="text-ash hover:text-white">
                  {a.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="md:col-span-4">
          <Eyebrow className="text-ash">Öffnungszeiten</Eyebrow>
          <dl className="mt-5 space-y-2 text-sm">
            {businessHours.map((d) => (
              <div key={d.weekday} className="flex justify-between border-b border-white/10 pb-2">
                <dt className="text-ash">{d.label}</dt>
                <dd>{d.opens ? `${d.opens} – ${d.closes}` : "Geschlossen"}</dd>
              </div>
            ))}
          </dl>
        </div>
      </Container>

      <Container className="flex flex-col gap-4 border-t border-white/10 py-8 text-xs uppercase tracking-[0.18em] text-ash sm:flex-row sm:justify-between">
        <p>{site.name}</p>
        <ul className="flex gap-6">
          <li><Link href="/impressum" className="hover:text-white">Impressum</Link></li>
          <li><Link href="/datenschutz" className="hover:text-white">Datenschutz</Link></li>
        </ul>
      </Container>
    </footer>
  );
}
