/**
 * Central image registry — the ONLY place to change when real photos arrive.
 *
 * Rules (see public/images/README.md):
 * - Real salon photos: put them in /public/images/<folder>/, set `src`, remove `credit`.
 * - Editorial stock photos (`credit` set) are MOOD imagery only. They are labelled
 *   "Symbolbild" on the site and listed on /bildnachweise. They must never be presented
 *   as the salon, its staff, its customers or its work.
 * - Without `src`, an abstract monochrome artwork labelled "Bild folgt" is rendered.
 * - All photos are stored as true single-channel grayscale (see README).
 */

export type ImageCredit = {
  author: string;
  authorUrl: string;
  sourceUrl: string;
  license: "Unsplash License";
};

export type ImageAsset = {
  /** Path under /public. Empty = placeholder artwork. */
  src?: string;
  alt: string;
  /** Intrinsic size of the file (keeps aspect ratio information explicit). */
  width?: number;
  height?: number;
  /** CSS object-position focal point, e.g. "50% 30%" to keep faces in frame. */
  position?: string;
  /** Set for every image NOT taken by/for the salon. */
  credit?: ImageCredit;
  /** Seed for the placeholder artwork. */
  seed: number;
};

const unsplash = (author: string, handle: string, photoId: string): ImageCredit => ({
  author,
  authorUrl: `https://unsplash.com/@${handle}`,
  sourceUrl: `https://unsplash.com/photos/${photoId}`,
  license: "Unsplash License",
});

/* ------------------------------------------------ Editorial stock (Unsplash) */
/* Licence verified on each photo page on 2026-11-20: "Free to use under the Unsplash License". */

const stock = {
  damenPortraitHair: {
    seed: 101,
    src: "/images/editorial/damen-portrait-hair.jpg",
    width: 2560, height: 1824, position: "62% 38%",
    alt: "Schwarzweiß-Porträt einer Frau mit langem, offenem Haar (Symbolbild)",
    credit: unsplash("Alexander Krivitskiy", "krivitskiy", "GhPVQlqHLDE"),
  },
  damenPortrait: {
    seed: 102,
    src: "/images/editorial/damen-portrait.jpg",
    width: 1800, height: 2701, position: "50% 22%",
    alt: "Frau mit langen dunklen Haaren, die Hände im Haar (Symbolbild)",
    credit: unsplash("Adil (@beingaheart)", "beingaheart", "-rEXYZx7fVk"),
  },
  damenCurls: {
    seed: 103,
    src: "/images/editorial/damen-curls.jpg",
    width: 1800, height: 2700, position: "50% 25%",
    alt: "Lächelnde Frau mit lockigem Haar (Symbolbild)",
    credit: unsplash("Atiyeh Fathi", "atiyehfathi", "EBqcZ3OyySs"),
  },
  damenHairWash: {
    seed: 104,
    src: "/images/editorial/damen-hair-wash.jpg",
    width: 2000, height: 1333, position: "45% 50%",
    alt: "Haarwäsche am Waschbecken eines Friseursalons (Symbolbild)",
    credit: unsplash("Lindsay Cash", "lindsayrc81", "Md_DhaFsnCQ"),
  },
  herrenProfile: {
    seed: 105,
    src: "/images/editorial/herren-profile.jpg",
    width: 1800, height: 2700, position: "50% 30%",
    alt: "Junger Mann im Profil mit frischem Kurzhaarschnitt (Symbolbild)",
    credit: unsplash("Megan Bagshaw", "megbagshaw", "YmaaUNbHHtw"),
  },
  herrenShears: {
    seed: 106,
    src: "/images/editorial/herren-shears.jpg",
    width: 1800, height: 2700, position: "50% 38%",
    alt: "Haarschnitt mit Effilierschere und Kamm, Nahaufnahme (Symbolbild)",
    credit: unsplash("Gulom Nazarov", "modelyano", "DrG4V5skbMY"),
  },
  herrenCut: {
    seed: 107,
    src: "/images/editorial/herren-cut.jpg",
    width: 1800, height: 2250, position: "50% 30%",
    alt: "Herrenhaarschnitt mit Schere und Kamm (Symbolbild)",
    credit: unsplash("Nate Johnston", "natejohnston", "tgPrIYnW3g4"),
  },
  kinderPortrait: {
    seed: 108,
    src: "/images/editorial/kinder-portrait.jpg",
    width: 1800, height: 2700, position: "50% 30%",
    alt: "Junge mit Umhang beim Friseur (Symbolbild)",
    credit: unsplash("Ibrahim Guetar", "himo_beast1996", "4brY7Bwss1I"),
  },
  kinderClipper: {
    seed: 109,
    src: "/images/editorial/kinder-clipper.jpg",
    width: 2400, height: 1600, position: "45% 45%",
    alt: "Kind beim Haarschnitt mit Maschine, von hinten (Symbolbild)",
    credit: unsplash("Jonathan Weiss", "jweiss", "arxAZJT5k2A"),
  },
} satisfies Record<string, ImageAsset>;

export const stockImages: ReadonlyArray<ImageAsset> = Object.values(stock);

/* ------------------------------------------------ Page slots */

export const images = {
  heroOne: stock.damenPortraitHair,
  heroTwo: stock.herrenShears,
  heroThree: stock.kinderClipper,

  damen: stock.damenPortrait,
  herren: stock.herrenProfile,
  kinder: stock.kinderPortrait,

  damenDetail: stock.damenCurls,
  herrenDetail: stock.herrenCut,
  kinderDetail: stock.kinderClipper,

  // Salon slots stay placeholders: stock photos must not suggest they show this salon.
  salonInterior: { seed: 10, alt: "Innenraum des Salons in der Rheinstraße" },
  salonFacade: { seed: 11, alt: "Eingang des Salons, Rheinstraße 33" },
  salonDetail: { seed: 12, alt: "Werkzeug und Details im Salon" },
} satisfies Record<string, ImageAsset>;

export type ImageKey = keyof typeof images;

type GalleryItem = {
  id: string;
  image: ImageAsset;
  group: "damen" | "herren" | "kinder" | "salon";
  ratio: "portrait" | "landscape" | "square";
};

/** Editorial inspiration — stock photography, clearly labelled as such. */
export const inspirationItems: ReadonlyArray<GalleryItem> = [
  { id: "i1", group: "damen", ratio: "portrait", image: stock.damenPortrait },
  { id: "i2", group: "herren", ratio: "portrait", image: stock.herrenShears },
  { id: "i3", group: "kinder", ratio: "landscape", image: stock.kinderClipper },
  { id: "i4", group: "damen", ratio: "square", image: stock.damenCurls },
  { id: "i5", group: "herren", ratio: "portrait", image: stock.herrenProfile },
  { id: "i6", group: "damen", ratio: "landscape", image: stock.damenHairWash },
  { id: "i7", group: "kinder", ratio: "portrait", image: stock.kinderPortrait },
  { id: "i8", group: "herren", ratio: "square", image: stock.herrenCut },
];

/** Genuine salon portfolio — empty slots until the salon supplies its own work. */
export const portfolioItems: ReadonlyArray<GalleryItem> = [
  { id: "p1", group: "salon", ratio: "portrait", image: { seed: 21, alt: "Arbeit aus dem Salon" } },
  { id: "p2", group: "salon", ratio: "landscape", image: { seed: 22, alt: "Arbeit aus dem Salon" } },
  { id: "p3", group: "salon", ratio: "square", image: { seed: 23, alt: "Arbeit aus dem Salon" } },
];

