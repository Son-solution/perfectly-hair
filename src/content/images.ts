/**
 * Central image registry — the ONLY place to change when real photos arrive.
 *
 * Rules (see public/images/README.md):
 * - Only photos of the real salon / real work, used with consent, or clearly
 *   licensed editorial imagery that does not pretend to show this salon.
 * - Put files in /public/images/<folder>/ and set `src` (e.g. "/images/hero/salon-01.jpg").
 * - Without `src`, an abstract monochrome artwork labelled "Bild folgt" is rendered.
 * - `alt` is required and must describe what the real photo shows.
 */

export type ImageAsset = {
  /** Path under /public, e.g. "/images/hero/salon-01.jpg". Empty = placeholder. */
  src?: string;
  alt: string;
  /** Required for any image not taken by/for the salon. */
  credit?: { author: string; source: string; license: string };
  /** Seed for the placeholder artwork so neighbouring slots look different. */
  seed: number;
};

export const images = {
  heroOne: { seed: 1, alt: "Blick in den Salon Perfectly Hair by Gabriel" },
  heroTwo: { seed: 2, alt: "Arbeitsplatz im Salon" },
  heroThree: { seed: 3, alt: "Detail einer Frisur" },

  damen: { seed: 4, alt: "Frisur für Damen" },
  herren: { seed: 5, alt: "Haarschnitt für Herren" },
  kinder: { seed: 6, alt: "Haarschnitt für Kinder" },

  damenDetail: { seed: 7, alt: "Detailaufnahme Damenfrisur" },
  herrenDetail: { seed: 8, alt: "Detailaufnahme Bart und Schnitt" },
  kinderDetail: { seed: 9, alt: "Detailaufnahme Kinderhaarschnitt" },

  salonInterior: { seed: 10, alt: "Innenraum des Salons in der Rheinstraße" },
  salonFacade: { seed: 11, alt: "Eingang des Salons, Rheinstraße 33" },
  salonDetail: { seed: 12, alt: "Werkzeug und Details im Salon" },
} satisfies Record<string, ImageAsset>;

export type ImageKey = keyof typeof images;

/** Gallery slots. Replace or extend with real, published work only. */
export const galleryItems: ReadonlyArray<{
  id: string;
  image: ImageAsset;
  group: "damen" | "herren" | "kinder" | "salon";
  ratio: "portrait" | "landscape" | "square";
}> = [
  { id: "g1", group: "damen", ratio: "portrait", image: { seed: 21, alt: "Damenfrisur" } },
  { id: "g2", group: "salon", ratio: "landscape", image: { seed: 22, alt: "Salon" } },
  { id: "g3", group: "herren", ratio: "square", image: { seed: 23, alt: "Herrenschnitt" } },
  { id: "g4", group: "kinder", ratio: "portrait", image: { seed: 24, alt: "Kinderhaarschnitt" } },
  { id: "g5", group: "damen", ratio: "square", image: { seed: 25, alt: "Farbe" } },
  { id: "g6", group: "herren", ratio: "portrait", image: { seed: 26, alt: "Bart" } },
  { id: "g7", group: "salon", ratio: "portrait", image: { seed: 27, alt: "Arbeitsplatz" } },
  { id: "g8", group: "kinder", ratio: "landscape", image: { seed: 28, alt: "Kinder im Salon" } },
  { id: "g9", group: "damen", ratio: "landscape", image: { seed: 29, alt: "Styling" } },
];
