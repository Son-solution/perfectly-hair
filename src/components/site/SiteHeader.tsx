"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { audiences, secondaryNav, site } from "@/config/site";
import { LogoMark } from "@/components/brand/LogoMark";
import { cn } from "@/lib/utils";
import { MobileMenu } from "./MobileMenu";

function NavLink({
  href,
  label,
  active,
  emphasis = false,
}: {
  href: string;
  label: string;
  active: boolean;
  emphasis?: boolean;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "group relative py-2 uppercase transition-colors duration-500",
        emphasis ? "tracking-[0.24em]" : "tracking-[0.18em]",
        active ? "text-white" : "text-white/65 hover:text-white",
      )}
    >
      {label}
      <span
        aria-hidden="true"
        className={cn(
          "absolute inset-x-0 -bottom-0.5 h-px origin-left bg-white transition-transform duration-700 ease-luxe",
          active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100",
        )}
      />
    </Link>
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = useCallback(() => setMenuOpen(false), []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 32);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-40 text-white transition-[background-color,backdrop-filter,border-color] duration-700 ease-luxe",
          scrolled || menuOpen
            ? "border-b border-white/10 bg-ink/85 backdrop-blur-md"
            : "border-b border-transparent bg-transparent",
        )}
      >
        <div className="container-luxe flex h-18 items-center justify-between gap-6 md:h-22">
          <Link
            href="/"
            className="group relative z-10 flex shrink-0 items-center gap-3.5 md:gap-4"
            aria-label={`${site.name} – Startseite`}
            onClick={() => setMenuOpen(false)}
          >
            <LogoMark
              decorative
              className="h-10 w-10 transition-opacity duration-500 group-hover:opacity-80 md:h-12 md:w-12"
            />
            <span aria-hidden="true" className="h-8 w-px bg-white/25 md:h-9" />
            <span aria-hidden="true" className="flex flex-col leading-none">
              <span className="font-display text-lg tracking-wide md:text-xl">Perfectly Hair</span>
              <span className="mt-1.5 text-[0.5625rem] uppercase tracking-[0.34em] text-ash">
                by Gabriel
              </span>
            </span>
          </Link>

          <nav aria-label="Hauptnavigation" className="hidden lg:block">
            <ul className="flex items-center gap-7 text-[0.75rem] xl:gap-6 2xl:gap-9">
              {audiences.map((a) => (
                <li key={a.href}>
                  <NavLink href={a.href} label={a.label} active={isActive(a.href)} emphasis />
                </li>
              ))}
              <li aria-hidden="true" className="h-4 w-px bg-white/25" />
              {secondaryNav.map((item) => (
                <li key={item.href} className="hidden xl:block">
                  <NavLink href={item.href} label={item.label} active={isActive(item.href)} />
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-3 md:gap-5">
            <Link
              href="/termin"
              aria-current={isActive("/termin") ? "page" : undefined}
              className="hidden border border-white/45 px-5 py-2.5 text-[0.6875rem] uppercase tracking-[0.24em] transition-colors duration-500 hover:bg-white hover:text-ink sm:inline-flex"
            >
              Termin
            </Link>
            <button
              type="button"
              className="group flex h-11 w-11 items-center justify-center xl:hidden"
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              aria-label={menuOpen ? "Menü schließen" : "Menü öffnen"}
              onClick={() => setMenuOpen((o) => !o)}
            >
              <span className="relative block h-3 w-7" aria-hidden="true">
                <span
                  className={cn(
                    "absolute left-0 top-0 h-px w-full bg-white transition-transform duration-500 ease-luxe",
                    menuOpen && "translate-y-1.5 rotate-45",
                  )}
                />
                <span
                  className={cn(
                    "absolute bottom-0 right-0 h-px bg-white transition-all duration-500 ease-luxe",
                    menuOpen ? "w-full -translate-y-1.5 -rotate-45" : "w-4 group-hover:w-full",
                  )}
                />
              </span>
            </button>
          </div>
        </div>
      </header>

      <MobileMenu
        open={menuOpen}
        onClose={closeMenu}
        pathname={pathname}
      />
    </>
  );
}
