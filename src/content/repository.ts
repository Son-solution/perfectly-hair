import "server-only";
import { z } from "zod";
import { summarizeHours } from "@/lib/hours";
import type { SiteChrome } from "./view";
import { business as businessData, navigation as navigationData, siteSettings as settingsData } from "./data/business";
import { categories as categoryData, employees as employeeData, gallery as galleryData, services as serviceData } from "./data/catalogue";
import { media as mediaData } from "./data/media";
import { models as modelData } from "./data/models";
import { pages as pageData } from "./data/pages";
import {
  business, category, employee, galleryItem, mediaAsset, model3d, navigation, page, service, siteSettings,
  type AudienceSlug, type Business, type Category, type Employee, type GalleryItem, type MediaAsset, type Model3D,
  type Navigation, type Page, type Service, type SiteSettings,
} from "./schema";

/**
 * Content repository — the ONLY place pages/components get business content from.
 *
 * Today: validated local mock data (src/content/data). Later: Supabase queries with the same
 * return types (see docs/CMS_ARCHITECTURE.md §4). Functions are async on purpose so the call
 * sites don't change when the source becomes remote.
 *
 * Validation runs once per process; invalid content fails the build (never a broken page).
 */

type ContentStore = {
  business: Business;
  navigation: Navigation;
  settings: SiteSettings;
  categories: Category[];
  services: Service[];
  employees: Employee[];
  gallery: GalleryItem[];
  media: Map<string, MediaAsset>;
  models: Map<string, Model3D>;
  pages: Page[];
};

let store: ContentStore | null = null;

function load(): ContentStore {
  if (store) return store;
  const mediaList = z.array(mediaAsset).parse(mediaData);
  const s: ContentStore = {
    business: business.parse(businessData),
    navigation: navigation.parse(navigationData),
    settings: siteSettings.parse(settingsData),
    categories: z.array(category).parse(categoryData),
    services: z.array(service).parse(serviceData),
    employees: z.array(employee).parse(employeeData),
    gallery: z.array(galleryItem).parse(galleryData),
    media: new Map(mediaList.map((m) => [m.id, m])),
    models: new Map(z.array(model3d).parse(modelData).map((m) => [m.id, m])),
    pages: z.array(page).parse(pageData),
  };
  assertReferences(s);
  store = s;
  return s;
}

/** Referential integrity: every imageId / employeeId must exist (like foreign keys later). */
function assertReferences(s: ContentStore) {
  const missing: string[] = [];
  const img = (ref: string | null | undefined, where: string) => {
    if (ref && !s.media.has(ref)) missing.push(`${where} → media "${ref}"`);
  };
  s.categories.forEach((c) => { img(c.heroImageId, `category ${c.id}`); img(c.detailImageId, `category ${c.id}`); });
  s.gallery.forEach((g) => img(g.imageId, `gallery ${g.id}`));
  s.employees.forEach((e) => img(e.imageId, `employee ${e.id}`));
  s.navigation.menu.forEach((m) => img(m.imageId, `menu ${m.href}`));
  const staff = new Set(s.employees.map((e) => e.id));
  s.services.forEach((sv) => sv.employeeIds.forEach((e) => { if (!staff.has(e)) missing.push(`service ${sv.id} → employee "${e}"`); }));
  for (const p of s.pages) {
    for (const sec of p.sections) {
      const where = `page "${p.slug}" section ${sec.id}`;
      if ("imageId" in sec) img(sec.imageId as string | null, where);
      if ("imageIds" in sec) (sec.imageIds as string[]).forEach((i) => img(i, where));
      if (sec.type === "hair-3d") {
        if (!s.models.has(sec.modelId)) missing.push(`${where} → model "${sec.modelId}"`);
        img(sec.fallbackImageId, where);
        const ids = new Set(s.services.map((x) => x.id));
        sec.hotspots.forEach((h) => { if (!ids.has(h.serviceId)) missing.push(`${where} hotspot ${h.id} → service "${h.serviceId}"`); });
      }
      if (sec.type === "hero-cinematic") sec.slides.forEach((sl) => { img(sl.imageId, where); img(sl.insetImageId, where); });
    }
  }
  if (missing.length) throw new Error(`Content reference errors:\n${missing.join("\n")}`);
}

const byOrder = <T extends { order: number }>(a: T, b: T) => a.order - b.order;

/* ------------------------------------------------------------------ public API */

export async function getBusiness(): Promise<Business> {
  return load().business;
}

export async function getNavigation(): Promise<Navigation> {
  return load().navigation;
}

export async function getSiteSettings(): Promise<SiteSettings> {
  return load().settings;
}

export async function getCategories(): Promise<Category[]> {
  return load().categories.filter((c) => c.visible).sort(byOrder);
}

export async function getCategory(slug: AudienceSlug): Promise<Category | undefined> {
  return (await getCategories()).find((c) => c.slug === slug);
}

/**
 * Visible services. With an audience: services assigned to it PLUS services the salon has not
 * assigned yet (flyer items), so nothing is hidden by missing data.
 */
export async function getServices(audience?: AudienceSlug | null): Promise<Service[]> {
  return load()
    .services.filter((s) => s.visible && (!audience || s.audiences.length === 0 || s.audiences.includes(audience)))
    .sort(byOrder);
}

export async function getEmployees(): Promise<Employee[]> {
  return load().employees.filter((e) => e.visible).sort(byOrder);
}

export async function getGallery(collection: GalleryItem["collection"]): Promise<GalleryItem[]> {
  return load().gallery.filter((g) => g.visible && g.collection === collection).sort(byOrder);
}

export async function getMedia(id: string | null | undefined): Promise<MediaAsset | null> {
  if (!id) return null;
  return load().media.get(id) ?? null;
}

/** Synchronous resolver for use inside a render pass after content is loaded. */
export async function getMediaResolver(): Promise<(id: string) => MediaAsset> {
  const m = load().media;
  return (id: string) => {
    const asset = m.get(id);
    if (!asset) throw new Error(`Unknown media id "${id}"`);
    return asset;
  };
}

export async function getModel3D(id: string): Promise<Model3D | null> {
  return load().models.get(id) ?? null;
}

export async function getStockMedia(): Promise<MediaAsset[]> {
  return [...load().media.values()].filter((m) => m.credit);
}

/** Published + visible page, or null (→ notFound). Future: `{ preview: true }` returns drafts. */
export async function getPage(slug: string): Promise<Page | null> {
  const p = load().pages.find((x) => x.slug === slug);
  if (!p || p.status !== "published" || !p.visible) return null;
  return { ...p, sections: p.sections.filter((s) => s.visible) };
}

export async function getPublishedSlugs(): Promise<string[]> {
  return load()
    .pages.filter((p) => p.status === "published" && p.visible && !p.seo.noindex)
    .map((p) => p.slug);
}

/** Google Maps directions link derived from the stored address (no embed, no cookies). */
export function mapsUrlFor(b: Business): string {
  return (
    "https://www.google.com/maps/search/?api=1&query=" +
    encodeURIComponent(`${b.address.street}, ${b.address.postalCode} ${b.address.city}`)
  );
}

/* ------------------------------------------------------------------ view models */

/** Global chrome (header, menu, footer) as one client-safe object. */
export async function getSiteChrome(): Promise<SiteChrome> {
  const { business: b, navigation: n, settings: s, media } = load();
  return {
    name: b.name,
    shortName: b.shortName,
    byline: b.name.replace(b.shortName, "").trim(),
    phone: { display: b.phone.display, href: `tel:${b.phone.e164}` },
    street: b.address.street,
    cityLine: `${b.address.postalCode} ${b.address.city}`,
    addressLine: `${b.address.street}, ${b.address.postalCode} ${b.address.city}`,
    mapsUrl: mapsUrlFor(b),
    hoursLines: summarizeHours(b.hours),
    primaryNav: n.primary,
    secondaryNav: n.secondary,
    cta: n.cta,
    legalNav: n.legal,
    menu: n.menu.map((m) => ({ label: m.label, href: m.href, primary: m.primary, image: media.get(m.imageId)! })),
    footerTagline: s.footerTagline,
    bandWords: s.footerBandWords,
    stockLabel: s.stockLabel,
    placeholderLabel: s.placeholderLabel,
    onlineBookingActive: b.booking.onlineBookingActive,
  };
}

/** All pages incl. drafts/hidden/noindex — for the admin CMS overview only (read-only). */
export async function listAllPages(): Promise<Page[]> {
  return load().pages;
}

/** All services incl. hidden ones — for the admin CMS overview only (read-only). */
export async function listAllServices(): Promise<Service[]> {
  return [...load().services].sort(byOrder);
}

/** Media library — for the admin CMS overview only (read-only). */
export async function listMedia(): Promise<MediaAsset[]> {
  return [...load().media.values()];
}
