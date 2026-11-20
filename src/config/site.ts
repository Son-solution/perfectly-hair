/**
 * Bootstrap business data.
 *
 * Source: owner briefing + printed flyer (Phase 1). In Phase 2 this data seeds the
 * database; from then on the CMS is the source of truth and this file is only a fallback.
 */

export const site = {
  name: "Perfectly Hair by Gabriel",
  shortName: "Perfectly Hair",
  locale: "de-DE",
  timeZone: "Europe/Berlin",
  description:
    "Friseursalon für Damen, Herren und Kinder in Wiesbaden – Rheinstraße 33.",
  address: {
    street: "Rheinstraße 33",
    postalCode: "65185",
    city: "Wiesbaden",
    country: "DE",
  },
  phone: {
    display: "0611 307674",
    href: "tel:+49611307674",
  },
} as const;

export type Weekday = 1 | 2 | 3 | 4 | 5 | 6 | 7; // ISO: 1 = Montag

export const businessHours: ReadonlyArray<{
  weekday: Weekday;
  label: string;
  opens: string | null;
  closes: string | null;
}> = [
  { weekday: 1, label: "Montag", opens: null, closes: null },
  { weekday: 2, label: "Dienstag", opens: "09:00", closes: "19:00" },
  { weekday: 3, label: "Mittwoch", opens: "09:00", closes: "19:00" },
  { weekday: 4, label: "Donnerstag", opens: "09:00", closes: "19:00" },
  { weekday: 5, label: "Freitag", opens: "09:00", closes: "19:00" },
  { weekday: 6, label: "Samstag", opens: "09:00", closes: "18:00" },
  { weekday: 7, label: "Sonntag", opens: null, closes: null },
];

export type Audience = "damen" | "herren" | "kinder";

export const audiences: ReadonlyArray<{
  slug: Audience;
  label: string;
  href: `/${Audience}`;
}> = [
  { slug: "damen", label: "Damen", href: "/damen" },
  { slug: "herren", label: "Herren", href: "/herren" },
  { slug: "kinder", label: "Kinder", href: "/kinder" },
];

/**
 * Prices exactly as printed on the flyer. The flyer does NOT say which audience
 * they apply to, so `audiences` is intentionally empty until the owner confirms.
 * Durations are unknown (null) and must be set in the admin before booking goes live.
 */
export const flyerServices: ReadonlyArray<{
  name: string;
  priceCents: number;
  priceIsFrom: boolean;
  durationMin: number | null;
  audiences: Audience[];
}> = [
  { name: "Haarschnitt", priceCents: 2000, priceIsFrom: false, durationMin: null, audiences: [] },
  { name: "Bartrasur", priceCents: 1000, priceIsFrom: true, durationMin: null, audiences: [] },
  { name: "Augenbrauen zupfen", priceCents: 800, priceIsFrom: false, durationMin: null, audiences: [] },
  { name: "Waschen & Styling", priceCents: 1000, priceIsFrom: false, durationMin: null, audiences: [] },
  { name: "Ohren oder Nase mit Wax", priceCents: 500, priceIsFrom: false, durationMin: null, audiences: [] },
  { name: "Färben", priceCents: 2500, priceIsFrom: false, durationMin: null, audiences: [] },
];

export const mainNav = [
  { label: "Damen", href: "/damen" },
  { label: "Herren", href: "/herren" },
  { label: "Kinder", href: "/kinder" },
  { label: "Leistungen", href: "/leistungen" },
  { label: "Team", href: "/team" },
  { label: "Galerie", href: "/galerie" },
  { label: "Salon", href: "/salon" },
  { label: "Kontakt", href: "/kontakt" },
] as const;
