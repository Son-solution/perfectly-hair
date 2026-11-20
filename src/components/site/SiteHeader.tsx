import Link from "next/link";
import { mainNav, site } from "@/config/site";
import { Container } from "@/components/ui/primitives";

export function SiteHeader() {
  return (
    <header className="absolute inset-x-0 top-0 z-30 text-white">
      <Container className="flex h-20 items-center justify-between gap-6 md:h-24">
        <Link
          href="/"
          className="font-display text-xl tracking-wide md:text-2xl"
          aria-label={`${site.name} – Startseite`}
        >
          Perfectly Hair
          <span className="ml-2 hidden text-eyebrow font-sans uppercase text-ash sm:inline">
            by Gabriel
          </span>
        </Link>

        <nav aria-label="Hauptnavigation" className="hidden lg:block">
          <ul className="flex items-center gap-8 text-[0.8125rem] uppercase tracking-[0.18em]">
            {mainNav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-white/80 transition-colors duration-300 hover:text-white"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <Link
          href="/termin"
          className="border border-white/50 px-5 py-3 text-[0.75rem] uppercase tracking-[0.2em] transition-colors duration-500 hover:bg-white hover:text-ink"
        >
          Termin
        </Link>
      </Container>
      {/* Mobile navigation drawer follows in Phase 4. */}
    </header>
  );
}
