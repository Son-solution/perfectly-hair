"use client";

import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { audiences, businessHours, secondaryNav, site } from "@/config/site";
import { cn } from "@/lib/utils";

const ease = [0.22, 1, 0.36, 1] as const;

export function MobileMenu({
  open,
  onClose,
  pathname,
}: {
  open: boolean;
  onClose: () => void;
  pathname: string;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const lastPath = useRef(pathname);

  // Close when the route changes (link clicked).
  useEffect(() => {
    if (lastPath.current !== pathname) {
      lastPath.current = pathname;
      onClose();
    }
  }, [pathname, onClose]);

  // Escape to close, scroll lock, focus first link, keep Tab inside the dialog.
  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const panel = panelRef.current;
    panel?.querySelector<HTMLElement>("a")?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab" || !panel) return;
      const focusables = panel.querySelectorAll<HTMLElement>("a, button");
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  const openDays = businessHours.filter((d) => d.opens);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          id="mobile-menu"
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-label="Menü"
          className="fixed inset-0 z-30 overflow-y-auto bg-ink text-white xl:hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease }}
        >
          <div className="container-luxe flex min-h-full flex-col pb-10 pt-28">
            <nav aria-label="Mobile Navigation">
              <p className="text-[0.625rem] uppercase tracking-[0.3em] text-ash">Für</p>
              <ul className="mt-4">
                {audiences.map((a, i) => (
                  <motion.li
                    key={a.href}
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease, delay: 0.08 + i * 0.07 }}
                    className="border-b border-white/10"
                  >
                    <Link
                      href={a.href}
                      aria-current={pathname === a.href ? "page" : undefined}
                      className={cn(
                        "flex items-baseline justify-between py-4 font-display text-5xl sm:text-6xl",
                        pathname === a.href ? "italic" : "",
                      )}
                    >
                      {a.label}
                      <span aria-hidden="true" className="font-sans text-xs tracking-[0.3em] text-ash">
                        0{i + 1}
                      </span>
                    </Link>
                  </motion.li>
                ))}
              </ul>

              <ul className="mt-10 grid grid-cols-2 gap-x-6 gap-y-1">
                {[...secondaryNav, { label: "Termin", href: "/termin" }].map((item, i) => (
                  <motion.li
                    key={item.href}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.3 + i * 0.04 }}
                  >
                    <Link
                      href={item.href}
                      aria-current={pathname === item.href ? "page" : undefined}
                      className={cn(
                        "block py-2.5 text-sm uppercase tracking-[0.2em]",
                        pathname === item.href ? "text-white" : "text-white/65",
                      )}
                    >
                      {item.label}
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </nav>

            <div className="mt-auto grid gap-6 pt-14 text-sm text-ash sm:grid-cols-2">
              <address className="not-italic leading-relaxed">
                {site.address.street}, {site.address.postalCode} {site.address.city}
                <br />
                <a href={site.phone.href} className="text-white underline-offset-4 hover:underline">
                  {site.phone.display}
                </a>
              </address>
              <p className="leading-relaxed">
                Di – Fr {openDays[0]?.opens} – {openDays[0]?.closes}
                <br />
                Sa {openDays.at(-1)?.opens} – {openDays.at(-1)?.closes}
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
