import type { Audience } from "@/config/site";
import { images, type ImageAsset } from "./images";

/**
 * Editorial copy for the Damen / Herren / Kinder pages.
 * Draft texts — deliberately free of unverifiable claims (no awards, years,
 * certifications, reviews). The owner can refine them; later they move to the CMS.
 */

export type AudienceContent = {
  slug: Audience;
  label: string;
  numeral: string;
  eyebrow: string;
  title: string;
  titleItalic: string;
  intro: string;
  teaser: string;
  hero: ImageAsset;
  detail: ImageAsset;
  principles: ReadonlyArray<{ title: string; text: string }>;
};

export const audienceContent: Record<Audience, AudienceContent> = {
  damen: {
    slug: "damen",
    label: "Damen",
    numeral: "I",
    eyebrow: "Friseur für Damen",
    title: "Damen",
    titleItalic: "Schnitt, Farbe, Form.",
    intro:
      "Ein Haarschnitt, der zu Ihnen passt – zu Ihrem Gesicht, Ihrem Alltag und Ihrem Stil. Wir hören zu, beraten ehrlich und arbeiten mit Ruhe und Präzision.",
    teaser: "Schnitt, Farbe und Styling für Damen.",
    hero: images.damen,
    detail: images.damenDetail,
    principles: [
      { title: "Beratung", text: "Am Anfang steht das Gespräch: Was wünschen Sie sich, was passt zu Ihrem Haar?" },
      { title: "Schnitt", text: "Sorgfältig geschnitten, damit die Form auch nach Wochen noch sitzt." },
      { title: "Farbe & Styling", text: "Von dezenter Auffrischung bis zum neuen Look – abgestimmt auf Sie." },
    ],
  },
  herren: {
    slug: "herren",
    label: "Herren",
    numeral: "II",
    eyebrow: "Friseur für Herren",
    title: "Herren",
    titleItalic: "Klar, präzise, gepflegt.",
    intro:
      "Vom klassischen Schnitt bis zur Bartrasur: saubere Linien, sorgfältige Arbeit und ein Ergebnis, das zu Ihnen passt.",
    teaser: "Haarschnitt, Bart und Pflege für Herren.",
    hero: images.herren,
    detail: images.herrenDetail,
    principles: [
      { title: "Haarschnitt", text: "Ob klassisch oder modern – präzise geschnitten und sauber ausgearbeitet." },
      { title: "Bart", text: "Rasur und Kontur mit Ruhe und Sorgfalt." },
      { title: "Pflege", text: "Die kleinen Details, die den Unterschied machen." },
    ],
  },
  kinder: {
    slug: "kinder",
    label: "Kinder",
    numeral: "III",
    eyebrow: "Friseur für Kinder",
    title: "Kinder",
    titleItalic: "Mit Geduld und Ruhe.",
    intro:
      "Ein entspannter Friseurbesuch für die Kleinen: mit Zeit, Geduld und einem freundlichen Umgang – damit sich Kinder und Eltern wohlfühlen.",
    teaser: "Entspannte Haarschnitte für Kinder.",
    hero: images.kinder,
    detail: images.kinderDetail,
    principles: [
      { title: "Zeit", text: "Wir nehmen uns die Zeit, die Ihr Kind braucht." },
      { title: "Ruhe", text: "Eine ruhige Atmosphäre, in der sich Kinder sicher fühlen." },
      { title: "Familie", text: "Sie möchten als Familie gemeinsam kommen? Sprechen Sie uns gerne an." },
    ],
  },
};

export const audienceList = [
  audienceContent.damen,
  audienceContent.herren,
  audienceContent.kinder,
] as const;
