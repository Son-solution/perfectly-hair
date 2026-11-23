/**
 * Content schemas — the contract between the content source (today: local mock data,
 * later: Supabase) and the presentation components. See docs/CMS_ARCHITECTURE.md.
 *
 * Rules
 * - Every editable entity has a stable `id` (or `slug` for pages).
 * - `null` means "not provided by the salon yet" (rendered as hidden or explicitly missing,
 *   never invented).
 * - Media is referenced by id (`imageId`), resolved by the repository.
 */
import { z } from "zod";

/* ------------------------------------------------------------------ primitives */

export const id = z.string().regex(/^[a-z0-9][a-z0-9-]*$/, "kebab-case id");
export const publishStatus = z.enum(["draft", "published"]);
export const audienceSlug = z.enum(["damen", "herren", "kinder"]);
export type AudienceSlug = z.infer<typeof audienceSlug>;

const time = z.string().regex(/^\d{2}:\d{2}$/);
const href = z.string().min(1);

export const link = z.object({ label: z.string(), href });
export type Link = z.infer<typeof link>;

export const cta = link.extend({ variant: z.enum(["solid", "outline"]).default("solid") });
export type Cta = z.infer<typeof cta>;

/* ------------------------------------------------------------------ media */

export const mediaCredit = z.object({
  author: z.string(),
  authorUrl: z.url(),
  sourceUrl: z.url(),
  license: z.literal("Unsplash License"),
});

export const mediaAsset = z.object({
  id,
  /** Path under /public today; Supabase Storage public URL later. Missing = placeholder art. */
  src: z.string().optional(),
  alt: z.string().min(1),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
  /** CSS object-position focal point, e.g. "50% 30%". */
  position: z.string().optional(),
  /** Present for every image not taken by/for the salon (rendered as "Symbolbild"). */
  credit: mediaCredit.optional(),
  /** Seed for the abstract placeholder artwork. */
  seed: z.number().int(),
});
export type MediaAsset = z.infer<typeof mediaAsset>;
/** @deprecated alias kept for readability in components */
export type ImageAsset = MediaAsset;

/* ------------------------------------------------------------------ 3D models */

const vec3 = z.tuple([z.number(), z.number(), z.number()]);

export const model3d = z.object({
  id,
  /** Path under /public today; Supabase Storage URL later. Must be .glb/.gltf. */
  src: z.string().regex(/\.(glb|gltf)$/i),
  title: z.string(),
  description: z.string(),
  /** true = temporary asset, must not be presented as the final photorealistic model. */
  isPlaceholder: z.boolean(),
  hasHair: z.boolean(),
  /** Camera framing in the model's native units (model faces +Z, Y up). */
  focus: z.object({ center: vec3, radius: z.number().positive() }),
  credit: z.object({
    author: z.string(),
    sourceUrl: z.url(),
    license: z.string(),
    licenseUrl: z.url(),
    notes: z.string().nullable(),
  }),
});
export type Model3D = z.infer<typeof model3d>;

export const hotspot = z.object({
  id,
  label: z.string(),
  serviceId: id,
  text: z.string(),
  /** Approximate position in the model's native units; snapped to the surface at runtime (raycast along -normal). */
  position: vec3,
  /** Surface direction; the hotspot fades out when it faces away from the camera. */
  normal: vec3,
});
export type Hotspot = z.infer<typeof hotspot>;

/* ------------------------------------------------------------------ business */

export const businessHour = z.object({
  weekday: z.number().int().min(1).max(7), // ISO, 1 = Montag
  label: z.string(),
  opens: time.nullable(),
  closes: time.nullable(),
});

export const business = z.object({
  name: z.string(),
  shortName: z.string(),
  tagline: z.string(),
  description: z.string(),
  address: z.object({ street: z.string(), postalCode: z.string(), city: z.string(), country: z.string() }),
  phone: z.object({ display: z.string(), e164: z.string().regex(/^\+\d+$/) }),
  email: z.email().nullable(),
  hours: z.array(businessHour).length(7),
  holidays: z.array(z.object({ date: z.string(), label: z.string() })),
  social: z.array(link),
  booking: z.object({
    onlineBookingActive: z.boolean(),
    cancellationPolicy: z.string().nullable(),
    approvalMode: z.enum(["auto", "manual", "hybrid"]).nullable(),
  }),
  legal: z.object({
    ownerName: z.string().nullable(),
    vatId: z.string().nullable(),
    chamber: z.string().nullable(),
    registrationNumber: z.string().nullable(),
  }),
});
export type Business = z.infer<typeof business>;

/* ------------------------------------------------------------------ catalogue */

export const category = z.object({
  id,
  slug: audienceSlug,
  label: z.string(),
  numeral: z.string(),
  order: z.number().int(),
  visible: z.boolean(),
  eyebrow: z.string(),
  title: z.string(),
  titleItalic: z.string(),
  intro: z.string(),
  teaser: z.string(),
  heroImageId: id,
  detailImageId: id,
  principles: z.array(z.object({ title: z.string(), text: z.string() })),
});
export type Category = z.infer<typeof category>;

export const service = z.object({
  id,
  name: z.string(),
  description: z.string().nullable(),
  /** Empty = the salon has not assigned this service to a category yet. */
  audiences: z.array(audienceSlug),
  priceCents: z.number().int().nonnegative().nullable(),
  priceIsFrom: z.boolean(),
  durationMin: z.number().int().positive().nullable(),
  employeeIds: z.array(id),
  source: z.enum(["flyer", "salon"]),
  order: z.number().int(),
  visible: z.boolean(),
});
export type Service = z.infer<typeof service>;

export const employee = z.object({
  id,
  name: z.string(),
  role: z.string().nullable(),
  bio: z.string().nullable(),
  imageId: id.nullable(),
  specializations: z.array(z.string()),
  audiences: z.array(audienceSlug),
  order: z.number().int(),
  visible: z.boolean(),
  bookable: z.boolean(),
});
export type Employee = z.infer<typeof employee>;

/* ------------------------------------------------------------------ gallery */

export const galleryItem = z.object({
  id,
  imageId: id,
  group: z.enum(["damen", "herren", "kinder", "salon"]),
  ratio: z.enum(["portrait", "landscape", "square"]),
  caption: z.string().nullable(),
  /** "inspiration" = licensed stock (labelled), "portfolio" = genuine salon work only. */
  collection: z.enum(["inspiration", "portfolio"]),
  order: z.number().int(),
  visible: z.boolean(),
});
export type GalleryItem = z.infer<typeof galleryItem>;

/* ------------------------------------------------------------------ navigation & site */

export const navigation = z.object({
  primary: z.array(link),
  secondary: z.array(link),
  cta: link,
  menu: z.array(link.extend({ imageId: id, primary: z.boolean() })),
  legal: z.array(link),
});
export type Navigation = z.infer<typeof navigation>;

export const siteSettings = z.object({
  footerTagline: z.string(),
  footerBandWords: z.array(z.string()).min(2),
  /** Predefined monochrome presets only — no free colour picking (brand protection). */
  appearance: z.enum(["noir"]),
  stockLabel: z.string(),
  placeholderLabel: z.string(),
});
export type SiteSettings = z.infer<typeof siteSettings>;

/* ------------------------------------------------------------------ sections */

const sectionBase = z.object({ id, visible: z.boolean().default(true) });
const lines = z.array(z.string()).min(1);

export const section = z.discriminatedUnion("type", [
  sectionBase.extend({
    type: z.literal("hero-cinematic"),
    eyebrow: z.string(),
    /** Chapter order = slide order. Herren must stay first (owner requirement). */
    slides: z.array(z.object({ audience: audienceSlug, imageId: id, insetImageId: id })).min(1),
    edgeLabel: z.string(),
  }),
  sectionBase.extend({ type: z.literal("audience-panels"), titleLines: lines, intro: z.string() }),
  sectionBase.extend({
    type: z.literal("editorial-story"),
    eyebrow: z.string(),
    titleLines: lines,
    paragraphs: z.array(z.string()),
    values: z.array(z.object({ title: z.string(), text: z.string() })),
    cta: link.nullable(),
    imageIds: z.tuple([id, id, id]),
    marqueeWords: z.array(z.string()),
  }),
  sectionBase.extend({
    type: z.literal("cinematic-gallery"),
    eyebrow: z.string(),
    title: z.string(),
    italic: z.string(),
    cta: link.nullable(),
    showHeading: z.boolean(),
  }),
  sectionBase.extend({
    type: z.literal("price-list"),
    marqueeWord: z.string().nullable(),
    titleLines: lines,
    intro: z.string().nullable(),
    note: z.string(),
    cta: link.nullable(),
  }),
  sectionBase.extend({
    type: z.literal("booking-finale"),
    title: z.string(),
    italic: z.string(),
    imageId: id,
    compact: z.boolean(),
  }),
  sectionBase.extend({
    type: z.literal("page-hero"),
    eyebrow: z.string(),
    title: z.string(),
    italic: z.string().nullable(),
    intro: z.string().nullable(),
    imageId: id.nullable(),
    ctas: z.array(cta),
  }),
  sectionBase.extend({
    type: z.literal("principles"),
    audience: audienceSlug,
    eyebrow: z.string(),
    title: z.string(),
    italic: z.string(),
  }),
  sectionBase.extend({
    type: z.literal("service-list"),
    audience: audienceSlug.nullable(),
    eyebrow: z.string(),
    title: z.string(),
    italic: z.string(),
    intro: z.string().nullable(),
    note: z.string(),
  }),
  sectionBase.extend({ type: z.literal("audience-index"), eyebrow: z.string() }),
  sectionBase.extend({ type: z.literal("other-audiences"), current: audienceSlug, eyebrow: z.string() }),
  sectionBase.extend({ type: z.literal("marquee"), words: z.array(z.string()).min(1), tone: z.enum(["light", "dark"]) }),
  sectionBase.extend({ type: z.literal("notice"), title: z.string(), text: z.string() }),
  sectionBase.extend({
    type: z.literal("editorial-split"),
    eyebrow: z.string(),
    titleLines: lines,
    paragraphs: z.array(z.string()),
    imageIds: z.array(id).min(1).max(2),
    tone: z.enum(["light", "dark"]),
  }),
  sectionBase.extend({
    type: z.literal("values"),
    eyebrow: z.string(),
    titleLines: lines,
    items: z.array(z.object({ title: z.string(), text: z.string() })),
  }),
  sectionBase.extend({
    type: z.literal("team"),
    eyebrow: z.string(),
    title: z.string(),
    italic: z.string(),
    emptyText: z.string(),
  }),
  sectionBase.extend({
    type: z.literal("gallery-grid"),
    collection: z.enum(["inspiration", "portfolio"]),
    eyebrow: z.string(),
    title: z.string(),
    italic: z.string(),
    notice: z.string().nullable(),
    emptyText: z.string().nullable(),
  }),
  sectionBase.extend({ type: z.literal("contact-details"), eyebrow: z.string() }),
  sectionBase.extend({ type: z.literal("location"), title: z.string(), linkLabel: z.string(), hint: z.string() }),
  sectionBase.extend({ type: z.literal("booking-flow"), notice: z.string() }),
  sectionBase.extend({
    type: z.literal("legal-text"),
    draftNotice: z.string(),
    blocks: z.array(
      z.object({
        heading: z.string(),
        /** Lines may contain {{business.*}} / {{legal.*}} tokens; null values render as [FEHLT]. */
        lines: z.array(z.string()),
      }),
    ),
  }),
  sectionBase.extend({ type: z.literal("credits"), intro: z.string() }),
  sectionBase.extend({
    type: z.literal("hair-3d"),
    modelId: id,
    eyebrow: z.string(),
    title: z.string(),
    italic: z.string(),
    intro: z.string(),
    category: audienceSlug,
    defaultView: z.enum(["front", "left", "right", "back"]),
    autoRotate: z.object({
      enabled: z.boolean(),
      degreesPerSecond: z.number().min(0).max(90),
      resumeAfterMs: z.number().int().min(0),
    }),
    hotspots: z.array(hotspot).min(1),
    ctaLabel: z.string(),
    fallbackImageId: id,
    assetNotice: z.string(),
  }),
]);
export type Section = z.infer<typeof section>;
export type SectionOf<T extends Section["type"]> = Extract<Section, { type: T }>;

/* ------------------------------------------------------------------ pages */

export const page = z.object({
  slug: z.string(), // "" = homepage
  status: publishStatus,
  visible: z.boolean(),
  seo: z.object({
    title: z.string().nullable(), // null = default site title
    description: z.string(),
    noindex: z.boolean().default(false),
  }),
  sections: z.array(section),
});
export type Page = z.infer<typeof page>;
