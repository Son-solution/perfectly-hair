"use client";

import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useEffect, useRef, useState, type RefObject } from "react";
import { LogoMark } from "@/components/brand/LogoMark";
import { SalonImage } from "@/components/media/SalonImage";
import type { SiteChrome } from "@/content/view";
import { cn } from "@/lib/utils";

const ease = [0.76, 0, 0.24, 1] as const;
const soft = [0.22, 1, 0.36, 1] as const;


/**
 * Full-screen navigation (all breakpoints). Curtain reveal, masked staggered links,
 * live image preview of the hovered destination (desktop), contact block.
 * Dialog semantics: Escape closes, focus trapped, body scroll locked.
 */
export function MenuOverlay({
  open,
  onClose,
  pathname,
  chrome,
}: {
  open: boolean;
  onClose: () => void;
  pathname: string;
  chrome: SiteChrome;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const lastPath = useRef(pathname);

  useEffect(() => {
    if (lastPath.current !== pathname) {
      lastPath.current = pathname;
      onClose();
    }
  }, [pathname, onClose]);

  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const panel = panelRef.current;
    const t = window.setTimeout(() => panel?.querySelector<HTMLElement>("a")?.focus(), 350);

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") return onClose();
      if (e.key !== "Tab" || !panel) return;
      const f = panel.querySelectorAll<HTMLElement>("a, button");
      if (!f.length) return;
      const first = f[0];
      const last = f[f.length - 1];
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
      window.clearTimeout(t);
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && <MenuPanel key="menu" panelRef={panelRef} pathname={pathname} chrome={chrome} />}
    </AnimatePresence>
  );
}

/** Menu content. Mounted fresh on every open, so the preview starts at the current page. */
function MenuPanel({
  panelRef,
  pathname,
  chrome,
}: {
  panelRef: RefObject<HTMLDivElement | null>;
  pathname: string;
  chrome: SiteChrome;
}) {
  const [preview, setPreview] = useState(() => Math.max(0, chrome.menu.findIndex((e) => e.href === pathname)));
  const entries = chrome.menu;

  return (
      <motion.div
        id="site-menu"
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Menü"
        className="fixed inset-0 z-30 overflow-y-auto bg-ink text-white"
        initial={{ clipPath: "inset(0% 0% 100% 0%)" }}
        animate={{ clipPath: "inset(0% 0% 0% 0%)" }}
        exit={{ clipPath: "inset(0% 0% 100% 0%)", transition: { duration: 0.7, ease } }}
        transition={{ duration: 0.9, ease }}
      >
        <div className="container-luxe grid min-h-full gap-12 pb-10 pt-28 lg:grid-cols-12 lg:pt-32">
          {/* Links */}
          <nav aria-label="Menü-Navigation" className="lg:col-span-7">
            <ul>
              {entries.map((e, i) => {
                const current = pathname === e.href;
                return (
                  <li key={e.href} className={cn(e.primary ? "" : "inline-block lg:block", !e.primary && "mr-6 lg:mr-0")}>
                    <span className="block overflow-hidden">
                      <motion.span
                        className="block"
                        initial={{ y: "110%" }}
                        animate={{ y: "0%" }}
                        transition={{ duration: 0.9, ease: soft, delay: 0.25 + i * 0.045 }}
                      >
                        <Link
                          href={e.href}
                          aria-current={current ? "page" : undefined}
                          onMouseEnter={() => setPreview(i)}
                          onFocus={() => setPreview(i)}
                          className={cn(
                            "group inline-flex items-baseline gap-4 transition-colors duration-500 focus-visible:text-white focus-visible:italic focus-visible:underline focus-visible:decoration-1 focus-visible:underline-offset-8 focus-visible:outline-none",
                            e.primary
                              ? "py-1 font-display text-[clamp(3rem,8vw,6.5rem)] leading-[1.02]"
                              : "py-1.5 text-sm uppercase tracking-[0.24em] lg:font-display lg:text-[clamp(1.6rem,2.6vw,2.4rem)] lg:normal-case lg:tracking-normal",
                            current ? "text-white" : "text-white/55 hover:text-white",
                          )}
                        >
                          {e.primary && (
                            <span className="font-sans text-[0.625rem] tracking-[0.3em] text-white/40">0{i + 1}</span>
                          )}
                          <span className={cn("transition-[font-style] duration-300", (current || e.primary) && "group-hover:italic", current && "italic")}>
                            {e.label}
                          </span>
                        </Link>
                      </motion.span>
                    </span>
                    {i === 2 && <span aria-hidden="true" className="my-6 block h-px w-24 bg-white/20" />}
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Preview (desktop) */}
          <div className="relative hidden lg:col-span-5 lg:block">
            <motion.div
              className="sticky top-32 aspect-[4/5] overflow-hidden"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, ease: soft, delay: 0.35 }}
            >
              <AnimatePresence initial={false}>
                <motion.div
                  key={preview}
                  className="absolute inset-0"
                  initial={{ clipPath: "inset(0% 0% 100% 0%)", scale: 1.15 }}
                  animate={{ clipPath: "inset(0% 0% 0% 0%)", scale: 1 }}
                  exit={{ opacity: 0, transition: { duration: 0.6, delay: 0.3 } }}
                  transition={{ duration: 0.9, ease }}
                >
                  <SalonImage image={entries[preview].image} sizes="40vw" />
                </motion.div>
              </AnimatePresence>
              <p className="absolute bottom-4 right-4 z-10 font-display text-3xl italic">{entries[preview].label}</p>
            </motion.div>
          </div>

          {/* Contact */}
          <motion.div
            className="grid gap-6 border-t border-white/10 pt-8 text-sm text-white/60 sm:grid-cols-3 lg:col-span-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <div className="flex items-center gap-4">
              <LogoMark decorative className="h-12 w-12 text-white" />
              <span className="leading-tight">
                <span className="block font-display text-xl text-white">{chrome.shortName}</span>
                <span className="text-[0.625rem] uppercase tracking-[0.3em]">{chrome.byline}</span>
              </span>
            </div>
            <p>
              <a href={chrome.mapsUrl} target="_blank" rel="noopener noreferrer" className="hover:text-white">
                {chrome.addressLine}
              </a>
              <br />
              <a href={chrome.phone.href} className="text-white hover:underline">
                {chrome.phone.display}
              </a>
            </p>
            <p>
              {chrome.hoursLines.map((l) => (
                <span key={l} className="block">{l}</span>
              ))}
              {chrome.walkIn && <span className="mt-2 block italic text-white">{chrome.walkIn.title}</span>}
            </p>
          </motion.div>
        </div>
      </motion.div>
  );
}
