"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { LogoMark } from "@/components/brand/LogoMark";
import { cn } from "@/lib/utils";
import { NotificationCenter, type NotificationItem } from "./NotificationCenter";
import { Avatar } from "./ui";

/* ------------------------------------------------------------------ icons (stroke, currentColor) */

const PATHS: Record<string, string> = {
  overview: "M3 13h8V3H3zM13 21h8V11h-8zM3 21h8v-6H3zM13 3v6h8V3z",
  calendar: "M4 6h16v14H4zM4 10h16M8 3v4M16 3v4",
  people: "M16 20v-1.5a3.5 3.5 0 0 0-3.5-3.5h-5A3.5 3.5 0 0 0 4 18.5V20M10 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7M20 20v-1.5a3.5 3.5 0 0 0-2.5-3.35M15.5 4.15a3.5 3.5 0 0 1 0 6.7",
  clock: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18M12 7v5l3 2",
  wallet: "M3 7h18v12H3zM3 7l3-4h12l3 4M16 13h2",
  leave: "M3 20h18M6 20V9l6-5 6 5v11M10 20v-5h4v5",
  website: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3",
  settings: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9c.3.6.9 1 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1",
  schedule: "M4 5h16v15H4zM4 9h16M9 13h6M9 16h4",
  chevron: "M15 18l-6-6 6-6",
  menu: "M4 7h16M4 12h16M4 17h16",
  close: "M6 6l12 12M18 6L6 18",
  sun: "M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10M12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4",
  moon: "M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8",
  external: "M14 4h6v6M20 4l-9 9M18 14v5H5V6h5",
  phone: "M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2",
  user: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8",
  chart: "M4 20V10M10 20V4M16 20v-7M22 20H2",
  inbox: "M3 13h5l2 3h4l2-3h5M5 5h14l2 8v6H3v-6z",
  bell: "M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10.3 21a1.9 1.9 0 0 0 3.4 0",
  plus: "M12 5v14M5 12h14",
};
export function Icon({ name, className }: { name: keyof typeof PATHS | string; className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className={cn("h-[18px] w-[18px] shrink-0", className)}>
      <path d={PATHS[name] ?? ""} />
    </svg>
  );
}

/* ------------------------------------------------------------------ navigation */

export type NavItem = { href: string; label: string; icon: string; badge?: number };

const ADMIN_NAV: { group: string; items: NavItem[] }[] = [
  { group: "Betrieb", items: [
    { href: "/admin", label: "Übersicht", icon: "overview" },
    { href: "/admin/appointments", label: "Termine", icon: "calendar" },
    { href: "/admin/callbacks", label: "Terminanfragen", icon: "phone" },
    { href: "/admin/customers", label: "Kunden", icon: "user" },
    { href: "/admin/employees", label: "Mitarbeiter", icon: "people" },
    { href: "/admin/attendance", label: "Zeiterfassung", icon: "clock" },
    { href: "/admin/leave", label: "Abwesenheiten", icon: "leave" },
    { href: "/admin/payroll", label: "Lohnvorbereitung", icon: "wallet" },
  ] },
  { group: "Auswertung", items: [
    { href: "/admin/reports", label: "Berichte & Statistiken", icon: "chart" },
  ] },
  { group: "Verwaltung", items: [
    { href: "/admin/applications", label: "Bewerbungen", icon: "inbox" },
    { href: "/admin/website", label: "Website", icon: "website" },
    { href: "/admin/settings", label: "Einstellungen", icon: "settings" },
  ] },
];

const STAFF_NAV: NavItem[] = [
  { href: "/staff", label: "Übersicht", icon: "overview" },
  { href: "/staff/appointments", label: "Termine", icon: "calendar" },
  { href: "/staff/attendance", label: "Zeit", icon: "clock" },
  { href: "/staff/schedule", label: "Dienstplan", icon: "schedule" },
  { href: "/staff/leave", label: "Urlaub", icon: "leave" },
  { href: "/staff/compensation", label: "Vergütung", icon: "wallet" },
];

function readPref(key: string, fallback: string) {
  try { return window.localStorage.getItem(key) ?? fallback; } catch { return fallback; }
}
function writePref(key: string, value: string) {
  try { window.localStorage.setItem(key, value); } catch { /* storage unavailable: fine */ }
}

/* ------------------------------------------------------------------ shell */

export function DashboardShell({
  area, userName, userRole, badges = {}, notifications, demo = false, children,
}: {
  area: "admin" | "staff";
  userName: string;
  userRole: string;
  badges?: Record<string, number>;
  notifications?: NotificationItem[];
  /** Protected client demo: shows "Kundenvorschau" + logout. */
  demo?: boolean;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  // Per-viewer conveniences only (theme, collapsed sidebar). Safe if storage is blocked.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- read browser preference after mount
    setTheme(readPref("dash-theme", "light") === "dark" ? "dark" : "light");
    setCollapsed(readPref("dash-collapsed", "0") === "1");
  }, []);
  // eslint-disable-next-line react-hooks/set-state-in-effect -- close the drawer on navigation
  useEffect(() => { setMobileOpen(false); }, [pathname]);

  const isActive = (href: string) => (href === `/${area}` ? pathname === href : pathname.startsWith(href));
  const groups = area === "admin" ? ADMIN_NAV : [{ group: "Mein Bereich", items: STAFF_NAV }];

  const navList = (compact: boolean) => (
    <nav aria-label={area === "admin" ? "Admin-Navigation" : "Mitarbeiter-Navigation"} className="flex-1 overflow-y-auto px-3 py-4">
      {groups.map((g) => (
        <div key={g.group} className="mb-6">
          {!compact && <p className="mb-2 px-3 text-[0.625rem] font-semibold uppercase tracking-[0.18em] text-dash-sidebar-muted">{g.group}</p>}
          <ul className="space-y-0.5">
            {g.items.map((item) => {
              const active = isActive(item.href);
              const badge = badges[item.href];
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    title={compact ? item.label : undefined}
                    className={cn(
                      "group relative flex h-10 items-center gap-3 rounded-md px-3 text-sm transition-colors",
                      active ? "bg-dash-sidebar-active font-medium text-dash-sidebar-active-text" : "text-dash-sidebar-text/80 hover:bg-dash-sidebar-hover hover:text-dash-sidebar-text",
                      compact && "justify-center px-0",
                    )}
                  >
                    <Icon name={item.icon} />
                    {!compact && <span className="flex-1">{item.label}</span>}
                    {!!badge && (
                      <span className={cn(
                        "rounded-full text-[0.625rem] font-semibold tabular-nums",
                        compact ? "absolute right-1.5 top-1.5 h-2 w-2 bg-current text-transparent" : "px-1.5 py-0.5",
                        !compact && (active ? "bg-dash-sidebar text-dash-sidebar-text" : "bg-dash-sidebar-active text-dash-sidebar-active-text"),
                      )}>
                        {compact ? "" : badge}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );

  const brand = (compact: boolean) => (
    <div className={cn("flex h-16 items-center gap-3 border-b border-white/10 px-5", compact && "justify-center px-0")}>
      <LogoMark decorative className="h-8 w-8 text-dash-sidebar-text" />
      {!compact && (
        <span className="leading-tight">
          <span className="block font-display text-base text-dash-sidebar-text">Perfectly Hair</span>
          <span className="block text-[0.625rem] uppercase tracking-[0.2em] text-dash-sidebar-muted">{area === "admin" ? "Verwaltung" : "Mitarbeiter"}</span>
        </span>
      )}
    </div>
  );

  return (
    <div data-theme={theme} className="dash min-h-dvh bg-dash-bg font-sans text-dash-text">
      {/* Desktop sidebar */}
      <aside className={cn("fixed inset-y-0 left-0 z-30 hidden flex-col bg-dash-sidebar print:!hidden text-dash-sidebar-text transition-[width] duration-300 lg:flex", collapsed ? "w-[72px]" : "w-64")}>
        {brand(collapsed)}
        {navList(collapsed)}
        <div className="border-t border-white/10 p-3">
          <button
            type="button"
            onClick={() => { const v = !collapsed; setCollapsed(v); writePref("dash-collapsed", v ? "1" : "0"); }}
            aria-label={collapsed ? "Seitenleiste ausklappen" : "Seitenleiste einklappen"}
            className="flex h-9 w-full items-center justify-center gap-2 rounded-md text-xs text-dash-sidebar-muted hover:bg-dash-sidebar-hover hover:text-dash-sidebar-text"
          >
            <Icon name="chevron" className={cn("transition-transform", collapsed && "rotate-180")} />
            {!collapsed && "Einklappen"}
          </button>
        </div>
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true" aria-label="Navigation">
          <button type="button" aria-label="Navigation schließen" className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <aside className="absolute inset-y-0 left-0 flex w-72 flex-col bg-dash-sidebar text-dash-sidebar-text shadow-2xl">
            {brand(false)}
            {navList(false)}
          </aside>
        </div>
      )}

      <div className={cn("transition-[padding] duration-300 print:!pl-0", collapsed ? "lg:pl-[72px]" : "lg:pl-64")}>
        {/* Top bar */}
        <header className="sticky top-0 z-20 flex h-16 print:hidden items-center gap-3 border-b border-dash-border bg-dash-header px-4 md:px-8">
          <button type="button" onClick={() => setMobileOpen(true)} aria-label="Navigation öffnen" className="-ml-1 rounded-md p-2 text-dash-text hover:bg-dash-subtle lg:hidden">
            <Icon name="menu" />
          </button>
          <span className="hidden rounded-full border border-dashed border-dash-muted px-2.5 py-0.5 text-[0.625rem] font-semibold uppercase tracking-[0.16em] text-dash-muted sm:inline">
            {demo ? "Kundenvorschau · Demodaten" : "Lokale Vorschau · keine Anmeldung"}
          </span>
          <div className="ml-auto flex items-center gap-1 md:gap-2">
            {area === "admin" && (
              <Link href="/admin/appointments?neu=1" className="mr-1 inline-flex h-9 items-center gap-2 rounded-md bg-dash-strong px-3 text-sm font-medium text-dash-invert hover:opacity-90">
                <Icon name="plus" /><span className="hidden sm:inline">Neuer Termin</span>
              </Link>
            )}
            {notifications && <NotificationCenter items={notifications} />}
            <Link
              href={area === "admin" ? "/staff" : "/admin"}
              className="hidden rounded-md px-3 py-2 text-xs text-dash-muted hover:bg-dash-subtle hover:text-dash-text md:inline-flex"
              title="Nur Darstellung – keine Berechtigungsprüfung"
            >
              Ansicht: {area === "admin" ? "Mitarbeiter" : "Admin"} →
            </Link>
            <button
              type="button"
              onClick={() => { const v = theme === "dark" ? "light" : "dark"; setTheme(v); writePref("dash-theme", v); }}
              aria-label={theme === "dark" ? "Helles Design" : "Dunkles Design"}
              className="rounded-md p-2 text-dash-muted hover:bg-dash-subtle hover:text-dash-text"
            >
              <Icon name={theme === "dark" ? "sun" : "moon"} />
            </button>
            {demo && (
              <form method="post" action="/demo-zugang/logout">
                <button type="submit" className="rounded-md px-2.5 py-2 text-xs font-medium text-dash-text hover:bg-dash-subtle">Abmelden</button>
              </form>
            )}
            <div className="ml-1 flex items-center gap-2.5 border-l border-dash-border pl-3">
              <Avatar name={userName} size={32} />
              <span className="hidden leading-tight md:block">
                <span className="block text-sm font-medium">{userName}</span>
                <span className="block text-[0.6875rem] text-dash-muted">{userRole}</span>
              </span>
            </div>
          </div>
        </header>

        <main id="inhalt" className={cn("mx-auto max-w-[1400px] px-4 py-6 md:px-8 md:py-10", area === "staff" && "pb-28 lg:pb-10")}>
          {children}
        </main>
      </div>

      {/* Staff: mobile bottom tab bar (mobile-first) */}
      {area === "staff" && (
        <nav aria-label="Schnellnavigation" className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 print:hidden border-t border-dash-border bg-dash-header pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden">
          {STAFF_NAV.slice(0, 5).map((item) => {
            const active = isActive(item.href);
            return (
              <Link key={item.href} href={item.href} aria-current={active ? "page" : undefined}
                className={cn("flex flex-col items-center gap-1 py-2.5 text-[0.625rem] font-medium", active ? "text-dash-text" : "text-dash-muted")}>
                <span className={cn("rounded-full px-3 py-1", active && "bg-dash-strong text-dash-invert")}><Icon name={item.icon} /></span>
                {item.label}
              </Link>
            );
          })}
        </nav>
      )}
    </div>
  );
}
