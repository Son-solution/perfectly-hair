import type { MediaAsset } from "../schema";

/**
 * Media library (mock). Future: `media_assets` table + Supabase Storage bucket.
 * Stock photos: licence verified on each Unsplash photo page (2026-11-20),
 * "Free to use under the Unsplash License". Files are single-channel grayscale.
 * Entries without `src` render the abstract placeholder ("Bild folgt").
 */
const unsplash = (author: string, handle: string, photoId: string) => ({
  author,
  authorUrl: `https://unsplash.com/@${handle}`,
  sourceUrl: `https://unsplash.com/photos/${photoId}`,
  license: "Unsplash License" as const,
});

export const media: MediaAsset[] = [
  {
    id: "damen-portrait-hair", seed: 101, src: "/images/editorial/damen-portrait-hair.jpg",
    width: 2560, height: 1824, position: "62% 38%",
    alt: "Schwarzweiß-Porträt einer Frau mit langem, offenem Haar (Symbolbild)",
    credit: unsplash("Alexander Krivitskiy", "krivitskiy", "GhPVQlqHLDE"),
  },
  {
    id: "damen-portrait", seed: 102, src: "/images/editorial/damen-portrait.jpg",
    width: 1800, height: 2701, position: "50% 22%",
    alt: "Frau mit langen dunklen Haaren, die Hände im Haar (Symbolbild)",
    credit: unsplash("Adil (@beingaheart)", "beingaheart", "-rEXYZx7fVk"),
  },
  {
    id: "damen-curls", seed: 103, src: "/images/editorial/damen-curls.jpg",
    width: 1800, height: 2700, position: "50% 25%",
    alt: "Lächelnde Frau mit lockigem Haar (Symbolbild)",
    credit: unsplash("Atiyeh Fathi", "atiyehfathi", "EBqcZ3OyySs"),
  },
  {
    id: "damen-hair-wash", seed: 104, src: "/images/editorial/damen-hair-wash.jpg",
    width: 2000, height: 1333, position: "45% 50%",
    alt: "Haarwäsche am Waschbecken eines Friseursalons (Symbolbild)",
    credit: unsplash("Lindsay Cash", "lindsayrc81", "Md_DhaFsnCQ"),
  },
  {
    id: "herren-profile", seed: 105, src: "/images/editorial/herren-profile.jpg",
    width: 1800, height: 2700, position: "50% 30%",
    alt: "Junger Mann im Profil mit frischem Kurzhaarschnitt (Symbolbild)",
    credit: unsplash("Megan Bagshaw", "megbagshaw", "YmaaUNbHHtw"),
  },
  {
    id: "herren-shears", seed: 106, src: "/images/editorial/herren-shears.jpg",
    width: 1800, height: 2700, position: "50% 38%",
    alt: "Haarschnitt mit Effilierschere und Kamm, Nahaufnahme (Symbolbild)",
    credit: unsplash("Gulom Nazarov", "modelyano", "DrG4V5skbMY"),
  },
  {
    id: "herren-cut", seed: 107, src: "/images/editorial/herren-cut.jpg",
    width: 1800, height: 2250, position: "50% 30%",
    alt: "Herrenhaarschnitt mit Schere und Kamm (Symbolbild)",
    credit: unsplash("Nate Johnston", "natejohnston", "tgPrIYnW3g4"),
  },
  {
    id: "kinder-portrait", seed: 108, src: "/images/editorial/kinder-portrait.jpg",
    width: 1800, height: 2700, position: "50% 30%",
    alt: "Junge mit Umhang beim Friseur (Symbolbild)",
    credit: unsplash("Ibrahim Guetar", "himo_beast1996", "4brY7Bwss1I"),
  },
  {
    id: "kinder-clipper", seed: 109, src: "/images/editorial/kinder-clipper.jpg",
    width: 2400, height: 1600, position: "45% 45%",
    alt: "Kind beim Haarschnitt mit Maschine, von hinten (Symbolbild)",
    credit: unsplash("Jonathan Weiss", "jweiss", "arxAZJT5k2A"),
  },

  /* Salon-owned slots — intentionally empty until the salon supplies real photos. */
  { id: "salon-interior", seed: 10, alt: "Innenraum des Salons in der Rheinstraße" },
  { id: "salon-facade", seed: 11, alt: "Eingang des Salons, Rheinstraße 33" },
  { id: "salon-detail", seed: 12, alt: "Werkzeug und Details im Salon" },
  { id: "team-placeholder", seed: 31, alt: "Porträts des Teams folgen" },
  { id: "portfolio-1", seed: 21, alt: "Arbeit aus dem Salon" },
  { id: "portfolio-2", seed: 22, alt: "Arbeit aus dem Salon" },
  { id: "portfolio-3", seed: 23, alt: "Arbeit aus dem Salon" },
];
