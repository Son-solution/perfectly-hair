import type { Category, Employee, GalleryItem, Service } from "../schema";

/**
 * Catalogue (mock). Future tables: `service_categories`, `services`, `staff_members`,
 * `staff_services`, `gallery_images`.
 * Copy texts are drafts without unverifiable claims; prices only from the flyer.
 */
export const categories: Category[] = [
  {
    id: "herren", slug: "herren", label: "Herren", numeral: "01", order: 1, visible: true,
    eyebrow: "Friseur für Herren",
    title: "Herren",
    titleItalic: "Klar, präzise, gepflegt.",
    intro: "Vom klassischen Schnitt bis zur Bartrasur: saubere Linien, sorgfältige Arbeit und ein Ergebnis, das zu Ihnen passt.",
    teaser: "Haarschnitt, Bart und Pflege für Herren.",
    heroImageId: "herren-profile",
    detailImageId: "herren-cut",
    principles: [
      { title: "Haarschnitt", text: "Ob klassisch oder modern – präzise geschnitten und sauber ausgearbeitet." },
      { title: "Bart", text: "Rasur und Kontur mit Ruhe und Sorgfalt." },
      { title: "Pflege", text: "Die kleinen Details, die den Unterschied machen." },
    ],
  },
  {
    id: "damen", slug: "damen", label: "Damen", numeral: "02", order: 2, visible: true,
    eyebrow: "Friseur für Damen",
    title: "Damen",
    titleItalic: "Schnitt, Farbe, Form.",
    intro: "Ein Haarschnitt, der zu Ihnen passt – zu Ihrem Gesicht, Ihrem Alltag und Ihrem Stil. Wir hören zu, beraten ehrlich und arbeiten mit Ruhe und Präzision.",
    teaser: "Schnitt, Farbe und Styling für Damen.",
    heroImageId: "damen-portrait",
    detailImageId: "damen-curls",
    principles: [
      { title: "Beratung", text: "Am Anfang steht das Gespräch: Was wünschen Sie sich, was passt zu Ihrem Haar?" },
      { title: "Schnitt", text: "Sorgfältig geschnitten, damit die Form auch nach Wochen noch sitzt." },
      { title: "Farbe & Styling", text: "Von dezenter Auffrischung bis zum neuen Look – abgestimmt auf Sie." },
    ],
  },
  {
    id: "kinder", slug: "kinder", label: "Kinder", numeral: "03", order: 3, visible: true,
    eyebrow: "Friseur für Kinder",
    title: "Kinder",
    titleItalic: "Mit Geduld und Ruhe.",
    intro: "Ein entspannter Friseurbesuch für die Kleinen: mit Zeit, Geduld und einem freundlichen Umgang – damit sich Kinder und Eltern wohlfühlen.",
    teaser: "Entspannte Haarschnitte für Kinder.",
    heroImageId: "kinder-portrait",
    detailImageId: "kinder-clipper",
    principles: [
      { title: "Zeit", text: "Wir nehmen uns die Zeit, die Ihr Kind braucht." },
      { title: "Ruhe", text: "Eine ruhige Atmosphäre, in der sich Kinder sicher fühlen." },
      { title: "Familie", text: "Sie möchten als Familie gemeinsam kommen? Sprechen Sie uns gerne an." },
    ],
  },
];

/**
 * Services with a SEPARATE price per audience (Herren / Damen / Kinder).
 * Starting values = the flyer prices (the flyer has one price per service), copied to every
 * audience so the site shows exactly what it showed before. The salon sets the real
 * per-audience prices, availability and durations in Admin → Leistungen & Preise.
 * Durations unknown → `null`. No employees known → `[]`.
 */
const flyer = (id: string, name: string, priceCents: number, priceIsFrom: boolean, order: number): Service => {
  const p = { available: true, priceCents, priceIsFrom, durationMin: null };
  return {
    id, name, description: null, prices: { herren: { ...p }, damen: { ...p }, kinder: { ...p } },
    employeeIds: [], source: "flyer", order, visible: true,
  };
};

export const services: Service[] = [
  flyer("haarschnitt", "Haarschnitt", 2000, false, 1),
  flyer("bartrasur", "Bartrasur", 1000, true, 2),
  flyer("augenbrauen-zupfen", "Augenbrauen zupfen", 800, false, 3),
  flyer("waschen-styling", "Waschen & Styling", 1000, false, 4),
  flyer("ohren-nase-wax", "Ohren oder Nase mit Wax", 500, false, 5),
  flyer("faerben", "Färben", 2500, false, 6),
];

/** No staff published yet — names, roles and portraits only with the salon's consent. */
export const employees: Employee[] = [];

const g = (
  id: string, imageId: string, group: GalleryItem["group"], ratio: GalleryItem["ratio"],
  collection: GalleryItem["collection"], order: number,
): GalleryItem => ({ id, imageId, group, ratio, caption: null, collection, order, visible: true });

export const gallery: GalleryItem[] = [
  g("i1", "damen-portrait", "damen", "portrait", "inspiration", 1),
  g("i2", "herren-shears", "herren", "portrait", "inspiration", 2),
  g("i3", "kinder-clipper", "kinder", "landscape", "inspiration", 3),
  g("i4", "damen-curls", "damen", "square", "inspiration", 4),
  g("i5", "herren-profile", "herren", "portrait", "inspiration", 5),
  g("i6", "damen-hair-wash", "damen", "landscape", "inspiration", 6),
  g("i7", "kinder-portrait", "kinder", "portrait", "inspiration", 7),
  g("i8", "herren-cut", "herren", "square", "inspiration", 8),
  g("p1", "portfolio-1", "salon", "portrait", "portfolio", 1),
  g("p2", "portfolio-2", "salon", "landscape", "portfolio", 2),
  g("p3", "portfolio-3", "salon", "square", "portfolio", 3),
];
