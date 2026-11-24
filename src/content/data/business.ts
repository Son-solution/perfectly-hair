import type { Business, Navigation, SiteSettings } from "../schema";

/**
 * Business information (mock). Future: `business_settings` (singleton) + `opening_hours`
 * + `opening_exceptions`. Only verified data; `null` = not provided by the salon yet.
 * Source: owner briefing + printed flyer.
 */
export const business: Business = {
  name: "Perfectly Hair by Gabriel",
  shortName: "Perfectly Hair",
  tagline: "Friseursalon · Wiesbaden",
  description: "Friseursalon für Damen, Herren und Kinder in Wiesbaden – Rheinstraße 33.",
  address: { street: "Rheinstraße 33", postalCode: "65185", city: "Wiesbaden", country: "DE" },
  phone: { display: "0611 307674", e164: "+49611307674" },
  email: null,
  hours: [
    { weekday: 1, label: "Montag", opens: null, closes: null },
    { weekday: 2, label: "Dienstag", opens: "09:00", closes: "19:00" },
    { weekday: 3, label: "Mittwoch", opens: "09:00", closes: "19:00" },
    { weekday: 4, label: "Donnerstag", opens: "09:00", closes: "19:00" },
    { weekday: 5, label: "Freitag", opens: "09:00", closes: "19:00" },
    { weekday: 6, label: "Samstag", opens: "09:00", closes: "18:00" },
    { weekday: 7, label: "Sonntag", opens: null, closes: null },
  ],
  holidays: [],
  social: [],
  booking: { onlineBookingActive: false, cancellationPolicy: null, approvalMode: null },
  walkIn: {
    enabled: true,
    // Herren: Di–Do mit Termin, Fr & Sa ohne Termin. Damen und Kinder unverändert.
    rules: [{ audience: "herren", weekdays: [5, 6] }],
    title: "Freitag & Samstag – Herren ohne Termin",
    text: "Freitags und samstags sind Herren auch ohne vorherige Terminvereinbarung herzlich willkommen. Einfach vorbeikommen – wir freuen uns auf Ihren Besuch!",
    bookingNotice: "Für Herren vergeben wir freitags und samstags keine Termine – kommen Sie einfach ohne Anmeldung vorbei. Für einen festen Termin wählen Sie bitte Dienstag bis Donnerstag.",
  },
  legal: { ownerName: null, vatId: null, chamber: null, registrationNumber: null },
};

/** Future: `navigation_items`. Labels/order editable; hrefs limited to existing routes. */
export const navigation: Navigation = {
  primary: [
    { label: "Herren", href: "/herren" },
    { label: "Damen", href: "/damen" },
    { label: "Kinder", href: "/kinder" },
  ],
  secondary: [
    { label: "Leistungen", href: "/leistungen" },
    { label: "Preise", href: "/preise" },
    { label: "Galerie", href: "/galerie" },
    { label: "Salon", href: "/salon" },
    { label: "Karriere", href: "/karriere" },
    { label: "Kontakt", href: "/kontakt" },
  ],
  cta: { label: "Termin", href: "/termin" },
  menu: [
    { label: "Herren", href: "/herren", imageId: "herren-profile", primary: true },
    { label: "Damen", href: "/damen", imageId: "damen-portrait", primary: true },
    { label: "Kinder", href: "/kinder", imageId: "kinder-portrait", primary: true },
    { label: "Leistungen", href: "/leistungen", imageId: "herren-shears", primary: false },
    { label: "Preise", href: "/preise", imageId: "herren-cut", primary: false },
    { label: "Galerie", href: "/galerie", imageId: "damen-curls", primary: false },
    { label: "Salon", href: "/salon", imageId: "salon-interior", primary: false },
    { label: "Karriere", href: "/karriere", imageId: "team-placeholder", primary: false },
    { label: "Kontakt", href: "/kontakt", imageId: "kinder-clipper", primary: false },
    { label: "Termin", href: "/termin", imageId: "damen-hair-wash", primary: false },
  ],
  legal: [
    { label: "Impressum", href: "/impressum" },
    { label: "Datenschutz", href: "/datenschutz" },
    { label: "Bildnachweise", href: "/bildnachweise" },
  ],
};

/** Future: `site_settings`. Appearance is a protected preset list, not free colours. */
export const siteSettings: SiteSettings = {
  footerTagline: "Friseursalon für Damen, Herren und Kinder in Wiesbaden.",
  footerBandWords: ["Herren", "Damen", "Kinder", "Wiesbaden"],
  appearance: "noir",
  stockLabel: "Symbolbild",
  placeholderLabel: "Bild folgt",
  features: {
    teamPageVisible: false, // Team-Seite vorerst ausgeblendet (Inhalte/Modelle bleiben erhalten)
    careersPageVisible: true,
    callbackFormVisible: true,
    applicationFormVisible: true,
  },
  notificationEmail: null, // wird in Phase 5B im Admin hinterlegt
};
