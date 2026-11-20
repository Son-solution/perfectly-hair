"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { LogoMark } from "@/components/brand/LogoMark";
import { audiences, site } from "@/config/site";
import { cn } from "@/lib/utils";
import { MenuOverlay } from "./MenuOverlay";

/**
 * Premium header: transparent over heroes, solid when scrolled, hides on scroll down
 * and returns on scroll up. Audiences always one click away; everything else lives in
 * the full-screen menu (all breakpoints).
 */
export function SiteHeader() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = useCallback(() => setMenuOpen(false), []);
  const lastY = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 32);
      const delta = y - lastY.current;
      if (Math.abs(delta) > 6) setHidden(delta > 0 && y > 240);
      lastY.current = y;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);
  const show = !hidden || menuOpen;

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-40 text-white transition-[transform,background-color,border-color] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]",
          show ? "translate-y-0" : "-translate-y-full",
          scrolled && !menuOpen ? "border-b border-white/10 bg-ink/80 backdrop-blur-md" : "border-b border-transparent",
        )}
      >
        <div className="container-luxe flex h-18 items-center justify-between gap-6 md:h-22">
          <Link
            href="/"
            className="group relative z-10 flex shrink-0 items-center gap-3.5 md:gap-4"
            aria-label={`${site.name} – Startseite`}
            onClick={closeMenu}
          >
            <LogoMark
              decorative
              className="h-10 w-10 transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-110 md:h-12 md:w-12"
            />
            <span aria-hidden="true" className="h-8 w-px bg-white/25 md:h-9" />
            <span aria-hidden="true" className="flex flex-col leading-none">
              <span className="font-display text-lg tracking-wide md:text-xl">Perfectly Hair</span>
              <span className="mt-1.5 text-[0.5625rem] uppercase tracking-[0.34em] text-white/60">by Gabriel</span>
            </span>
          </Link>

          <nav aria-label="Für wen" className="hidden lg:block">
            <ul className="flex items-center gap-10">
              {audiences.map((a, i) => {
                const active = isActive(a.href);
                return (
                  <li key={a.href}>
                    <Link
                      href={a.href}
                      aria-current={active ? "page" : undefined}
                      className="group relative flex items-start gap-1.5 py-2"
                    >
                      <span className="text-[0.5rem] tracking-[0.2em] text-white/40">0{i + 1}</span>
                      <span className="relative block overflow-hidden text-[0.75rem] uppercase tracking-[0.28em]">
                        {/* rolling label */}
                        <span
                          className={cn(
                            "block transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-full",
                            active ? "text-white" : "text-white/70",
                          )}
                        >
                          {a.label}
                        </span>
                        <span
                          aria-hidden="true"
                          className="absolute inset-0 translate-y-full font-display text-[0.95rem] normal-case italic tracking-normal text-white transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-y-0"
                        >
                          {a.label}
                        </span>
                      </span>
                      <span
                        aria-hidden="true"
                        className={cn(
                          "absolute inset-x-0 bottom-0 h-px origin-left bg-white transition-transform duration-700",
                          active ? "scale-x-100" : "scale-x-0",
                        )}
                      />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="flex items-center gap-2 md:gap-4">
            <Link
              href="/termin"
              aria-current={isActive("/termin") ? "page" : undefined}
              className="group relative hidden overflow-hidden border border-white/45 px-5 py-2.5 text-[0.6875rem] uppercase tracking-[0.24em] sm:inline-flex"
            >
              <span aria-hidden="true" className="absolute inset-0 origin-bottom scale-y-0 bg-white transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-y-100" />
              <span className="relative transition-colors duration-500 group-hover:text-ink">Termin</span>
            </Link>
            <button
              type="button"
              className="group flex h-11 items-center gap-3 pl-3 pr-1"
              aria-expanded={menuOpen}
              aria-controls="site-menu"
              onClick={() => setMenuOpen((o) => !o)}
            >
              <span className="hidden text-[0.6875rem] uppercase tracking-[0.24em] sm:inline">
                {menuOpen ? "Schließen" : "Menü"}
              </span>
              <span className="sr-only sm:hidden">{menuOpen ? "Menü schließen" : "Menü öffnen"}</span>
              <span className="relative block h-3 w-8" aria-hidden="true">
                <span
                  className={cn(
                    "absolute right-0 top-0 h-px w-full bg-white transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
                    menuOpen && "translate-y-1.5 rotate-45",
                  )}
                />
                <span
                  className={cn(
                    "absolute bottom-0 right-0 h-px bg-white transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
                    menuOpen ? "w-full -translate-y-1.5 -rotate-45" : "w-5 group-hover:w-full",
                  )}
                />
              </span>
            </button>
          </div>
        </div>
      </header>

      <MenuOverlay open={menuOpen} onClose={closeMenu} pathname={pathname} />
    </>
  );
}
