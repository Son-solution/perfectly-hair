import type { Page, Section } from "../schema";

/**
 * Pages and their sections (mock). Future tables: `site_pages`, `page_sections`
 * (ordered, typed JSON validated by the same Zod schema), `page_revisions`.
 * Section order in the array = display order. `visible: false` hides a section.
 */

const finale = (id: string, title = "Ihr nächster Termin", italic = "beginnt mit einem Anruf.", imageId = "damen-portrait"): Section => ({
  id, type: "booking-finale", visible: true, title, italic, imageId, compact: true,
});

const audiencePage = (slug: "herren" | "damen" | "kinder", label: string, seoTitle: string, seoDescription: string): Page => ({
  slug, status: "published", visible: true,
  seo: { title: seoTitle, description: seoDescription, noindex: false },
  sections: [
    // page-hero content for audience pages comes from the category (single source of truth)
    { id: `${slug}-hero`, type: "page-hero", visible: true, eyebrow: "", title: "", italic: null, intro: null, imageId: null, ctas: [] },
    // Herren: walk-in announcement (texts from business.walkIn). Damen/Kinder unchanged.
    ...(slug === "herren" ? [{ id: "herren-walkin", type: "walk-in-announcement", visible: true, variant: "card", tone: "light" } satisfies Section] : []),
    { id: `${slug}-principles`, type: "principles", visible: true, audience: slug, eyebrow: "Unser Ansatz", title: "Sorgfalt", italic: "in jedem Detail." },
    { id: `${slug}-band`, type: "marquee", visible: true, words: [label, "Wiesbaden", "Rheinstraße 33"], tone: "dark" },
    {
      id: `${slug}-services`, type: "service-list", visible: true, audience: slug,
      eyebrow: "Leistungen & Preise", title: "Leistungen", italic: "& Preise",
      intro: `Eine eigene Preisliste für ${label} folgt. Bis dahin finden Sie hier die Preise aus unserem aktuellen Flyer.`,
      note: "Preise laut aktuellem Flyer. Der Flyer unterscheidet nicht zwischen Damen, Herren und Kindern – je nach Haarlänge und Aufwand kann der Preis abweichen.",
    },
    { id: `${slug}-others`, type: "other-audiences", visible: true, current: slug, eyebrow: "Ebenfalls bei uns" },
    finale(`${slug}-finale`),
  ],
});

export const pages: Page[] = [
  /* ---------------------------------------------------------------- home */
  {
    slug: "", status: "published", visible: true,
    seo: { title: null, description: "Friseursalon für Damen, Herren und Kinder in Wiesbaden – Rheinstraße 33.", noindex: false },
    sections: [
      {
        id: "home-hero", type: "hero-cinematic", visible: true,
        eyebrow: "Friseursalon · Wiesbaden",
        // Owner requirement: HERREN first, then DAMEN, then KINDER.
        slides: [
          { audience: "herren", imageId: "herren-shears", insetImageId: "herren-profile" },
          { audience: "damen", imageId: "damen-portrait-hair", insetImageId: "damen-curls" },
          { audience: "kinder", imageId: "kinder-clipper", insetImageId: "kinder-portrait" },
        ],
        edgeLabel: "Rheinstraße 33 · Wiesbaden",
      },
      {
        id: "home-panels", type: "audience-panels", visible: true,
        titleLines: ["Drei Welten.", "*Ein Atelier.*"],
        intro: "Herren, Damen und Kinder – jede Welt mit eigenem Charakter. Bewegen Sie die Maus über die Bilder oder tippen Sie auf eine Welt.",
      },
      { id: "home-walkin", type: "walk-in-announcement", visible: true, variant: "band", tone: "light" },
      {
        id: "home-story", type: "editorial-story", visible: true,
        eyebrow: "Das Atelier",
        titleLines: ["Ein Salon", "für die *ganze*", "*Familie.*"],
        paragraphs: [
          "Damen, Herren und Kinder – bei Perfectly Hair by Gabriel nehmen wir uns Zeit für Ihre Wünsche und arbeiten mit Ruhe und Sorgfalt.",
        ],
        values: [
          { title: "Ruhe", text: "Ein Ort, an dem Sie sich Zeit nehmen dürfen." },
          { title: "Sorgfalt", text: "Präzise Arbeit bis ins letzte Detail." },
          { title: "Familie", text: "Damen, Herren und Kinder – willkommen sind alle." },
        ],
        cta: { label: "Mehr über den Salon", href: "/salon" },
        imageIds: ["damen-curls", "herren-profile", "kinder-clipper"],
        marqueeWords: ["Atelier", "Familie", "Handwerk"],
      },
      {
        id: "home-gallery", type: "cinematic-gallery", visible: true,
        eyebrow: "Galerie", title: "Handwerk", italic: "in Bewegung.",
        cta: { label: "Zur Galerie", href: "/galerie" }, showHeading: true,
      },
      {
        id: "home-prices", type: "price-list", visible: true,
        marqueeWord: "Preise", titleLines: ["Klar.", "*Ohne Umwege.*"], intro: null,
        note: "Preise laut aktuellem Flyer des Salons. Der Flyer unterscheidet nicht zwischen Damen, Herren und Kindern – je nach Haarlänge und Aufwand kann der Preis abweichen.",
        cta: { label: "Alle Preise", href: "/preise" },
      },
      { id: "home-finale", type: "booking-finale", visible: true, title: "Ihr Termin", italic: "beginnt mit einem Anruf.", imageId: "damen-portrait", compact: false },
    ],
  },

  /* ---------------------------------------------------------------- audiences */
  audiencePage("herren", "Herren", "Friseur für Herren in Wiesbaden", "Haarschnitt, Bart und Pflege für Herren – Perfectly Hair by Gabriel, Rheinstraße 33, Wiesbaden."),
  audiencePage("damen", "Damen", "Friseur für Damen in Wiesbaden", "Schnitt, Farbe und Styling für Damen – Perfectly Hair by Gabriel, Rheinstraße 33, Wiesbaden."),
  audiencePage("kinder", "Kinder", "Friseur für Kinder in Wiesbaden", "Entspannte Haarschnitte für Kinder – Perfectly Hair by Gabriel, Rheinstraße 33, Wiesbaden."),

  /* ---------------------------------------------------------------- leistungen */
  {
    slug: "leistungen", status: "published", visible: true,
    seo: { title: "Leistungen", description: "Leistungen für Herren, Damen und Kinder bei Perfectly Hair by Gabriel in Wiesbaden.", noindex: false },
    sections: [
      {
        id: "leistungen-hero", type: "page-hero", visible: true, eyebrow: "Leistungen",
        title: "Für jeden", italic: "die passende Form.",
        intro: "Herren, Damen oder Kinder – wählen Sie Ihren Bereich oder sehen Sie sich direkt alle Leistungen an.",
        imageId: "herren-shears",
        ctas: [{ label: "Termin anfragen", href: "/termin", variant: "solid" }, { label: "Preise", href: "/preise", variant: "outline" }],
      },
      { id: "leistungen-index", type: "audience-index", visible: true, eyebrow: "Drei Bereiche" },
      {
        id: "leistungen-all", type: "service-list", visible: true, audience: null,
        eyebrow: "Alle Leistungen", title: "Leistungen", italic: "im Überblick",
        intro: "Wählen Sie eine Leistung, um die Terminvorschau mit dieser Auswahl zu öffnen.",
        note: "Preise laut aktuellem Flyer. Dauer und Zuordnung zu Damen, Herren und Kindern werden vom Salon ergänzt.",
      },
      finale("leistungen-finale"),
    ],
  },

  /* ---------------------------------------------------------------- preise */
  {
    slug: "preise", status: "published", visible: true,
    seo: { title: "Preise", description: "Aktuelle Preise von Perfectly Hair by Gabriel, Rheinstraße 33, Wiesbaden.", noindex: false },
    sections: [
      {
        id: "preise-hero", type: "page-hero", visible: true, eyebrow: "Preise",
        title: "Preisliste", italic: "transparent & klar.",
        intro: "Die folgenden Preise stammen aus unserem aktuellen Flyer.", imageId: null, ctas: [],
      },
      {
        id: "preise-list", type: "price-list", visible: true, marqueeWord: "Preise",
        titleLines: ["Laut", "*aktuellem Flyer.*"],
        intro: "Eine ausführliche Preisliste für jeden Bereich folgt.",
        note: "Der Flyer unterscheidet nicht zwischen Damen, Herren und Kindern. Je nach Haarlänge, Aufwand und Wunsch kann der Preis abweichen. Fragen Sie uns gern vorab telefonisch. Alle Preise in Euro.",
        cta: { label: "Termin anfragen", href: "/termin" },
      },
      finale("preise-finale"),
    ],
  },

  /* ---------------------------------------------------------------- team */
  {
    slug: "team", status: "published", visible: true,
    seo: { title: "Team", description: "Das Team von Perfectly Hair by Gabriel in Wiesbaden.", noindex: false },
    sections: [
      {
        id: "team-hero", type: "page-hero", visible: true, eyebrow: "Team",
        title: "Die Menschen", italic: "hinter jedem Schnitt.",
        intro: "Hier stellt sich unser Team bald persönlich vor.", imageId: null, ctas: [],
      },
      {
        id: "team-grid", type: "team", visible: true, eyebrow: "In Vorbereitung",
        title: "Persönlich,", italic: "nicht anonym.",
        emptyText: "Wir zeigen Ihnen hier in Kürze, wer Sie im Salon erwartet – mit Namen, Schwerpunkten und Porträts. Bis dahin lernen Sie uns am besten direkt im Salon kennen.",
      },
      finale("team-finale", "Lernen Sie uns kennen", "direkt im Salon."),
    ],
  },

  /* ---------------------------------------------------------------- galerie */
  {
    slug: "galerie", status: "published", visible: true,
    seo: { title: "Galerie", description: "Inspiration für Herren, Damen und Kinder – Perfectly Hair by Gabriel, Wiesbaden.", noindex: false },
    sections: [
      {
        id: "galerie-hero", type: "page-hero", visible: true, eyebrow: "Galerie",
        title: "Galerie", italic: "Inspiration in Schwarzweiß.",
        intro: "Ideen für Herren, Damen und Kinder – und bald auch Arbeiten direkt aus unserem Salon.", imageId: null, ctas: [],
      },
      { id: "galerie-strip", type: "cinematic-gallery", visible: true, eyebrow: "", title: "", italic: "", cta: null, showHeading: false },
      {
        id: "galerie-inspiration", type: "gallery-grid", visible: true, collection: "inspiration",
        eyebrow: "Inspiration", title: "Ideen", italic: "für Ihren nächsten Look.",
        notice: "Diese Fotos sind lizenzierte Symbolbilder (Unsplash) und dienen als Inspiration. Sie zeigen keine Arbeiten, Mitarbeiter oder Kunden des Salons.",
        emptyText: null,
      },
      {
        id: "galerie-portfolio", type: "gallery-grid", visible: true, collection: "portfolio",
        eyebrow: "Aus unserem Salon", title: "Unsere Arbeiten", italic: "folgen in Kürze.",
        notice: null, emptyText: "Hier zeigen wir bald echte Arbeiten aus dem Salon in der Rheinstraße.",
      },
      finale("galerie-finale"),
    ],
  },

  /* ---------------------------------------------------------------- salon */
  {
    slug: "salon", status: "published", visible: true,
    seo: { title: "Der Salon", description: "Perfectly Hair by Gabriel – Friseursalon für Damen, Herren und Kinder in der Rheinstraße 33, Wiesbaden.", noindex: false },
    sections: [
      {
        id: "salon-hero", type: "page-hero", visible: true, eyebrow: "Der Salon",
        title: "Perfectly Hair", italic: "by Gabriel",
        intro: "Ihr Friseursalon für Damen, Herren und Kinder in der Rheinstraße 33 in Wiesbaden.",
        imageId: "salon-interior", ctas: [{ label: "Kontakt & Anfahrt", href: "/kontakt", variant: "outline" }],
      },
      {
        id: "salon-values", type: "values", visible: true, eyebrow: "Wofür wir stehen",
        titleLines: ["Drei Worte,", "*ein Anspruch.*"],
        items: [
          { title: "Ruhe", text: "Ein Ort, an dem Sie sich Zeit nehmen dürfen." },
          { title: "Sorgfalt", text: "Präzise Arbeit, vom ersten Schnitt bis zum letzten Detail." },
          { title: "Familie", text: "Damen, Herren und Kinder – willkommen sind alle." },
        ],
      },
      { id: "salon-band", type: "marquee", visible: true, words: ["Herren", "Damen", "Kinder"], tone: "light" },
      {
        id: "salon-story", type: "editorial-split", visible: true, eyebrow: "Der Ort",
        titleLines: ["Mitten in", "*Wiesbaden.*"],
        paragraphs: [
          "Sie finden uns in der Rheinstraße 33. Rufen Sie uns an – wir beraten Sie gern und finden einen passenden Termin.",
        ],
        imageIds: ["salon-detail", "salon-facade"], tone: "light",
      },
      { id: "salon-contact", type: "contact-details", visible: true, eyebrow: "Besuch" },
      finale("salon-finale"),
    ],
  },

  /* ---------------------------------------------------------------- kontakt */
  {
    slug: "kontakt", status: "published", visible: true,
    seo: { title: "Kontakt & Anfahrt", description: "Perfectly Hair by Gabriel, Rheinstraße 33, 65185 Wiesbaden. Telefon 0611 307674.", noindex: false },
    sections: [
      {
        id: "kontakt-hero", type: "page-hero", visible: true, eyebrow: "Kontakt",
        title: "Wir freuen uns", italic: "auf Ihren Besuch.",
        intro: "Termine vereinbaren Sie am einfachsten telefonisch.", imageId: null,
        ctas: [{ label: "Anrufen", href: "tel:", variant: "solid" }],
      },
      { id: "kontakt-details", type: "contact-details", visible: true, eyebrow: "Kontakt" },
      { id: "kontakt-map", type: "location", visible: true, title: "Anfahrt", linkLabel: "In Google Maps öffnen", hint: "Öffnet eine externe Website. Wir binden keine Karte ein, damit ohne Ihre Zustimmung keine Daten an Dritte gehen." },
    ],
  },

  /* ---------------------------------------------------------------- termin */
  {
    slug: "termin", status: "published", visible: true,
    seo: { title: "Termin", description: "Termin bei Perfectly Hair by Gabriel vereinbaren – telefonisch unter 0611 307674.", noindex: false },
    sections: [
      {
        id: "termin-hero", type: "page-hero", visible: true, eyebrow: "Termin",
        title: "Termin", italic: "vereinbaren.",
        intro: "Aktuell vereinbaren Sie Ihren Termin telefonisch. Die Online-Buchung befindet sich im Aufbau.", imageId: null,
        ctas: [{ label: "Jetzt anrufen", href: "tel:", variant: "solid" }],
      },
      { id: "termin-walkin", type: "walk-in-announcement", visible: true, variant: "card", tone: "light" },
      {
        id: "termin-callback", type: "callback-form", visible: true,
        eyebrow: "Rückruf",
        title: "Termin anfragen & Rückruf erhalten",
        description: "Teilen Sie uns Ihren Wunschtermin mit. Wir melden uns persönlich bei Ihnen.",
        disclaimer: "Ihre Anfrage ist noch keine verbindliche Terminbestätigung.",
        privacyText: "Ich habe die Datenschutzerklärung gelesen und bin einverstanden, dass meine Angaben zur Bearbeitung meiner Anfrage verwendet werden.",
        unavailableNotice: "Das Anfrageformular ist noch nicht aktiv. Es werden keine Daten gesendet oder gespeichert. Bitte rufen Sie uns an – wir sind gern für Sie da.",
      },
      {
        id: "termin-flow", type: "booking-flow", visible: true,
        notice: "Die Online-Terminbuchung ist noch nicht aktiv. Sie sehen eine Vorschau des Ablaufs – es wird kein Termin gebucht und es werden keine Daten übermittelt.",
      },
    ],
  },

  /* ---------------------------------------------------------------- karriere */
  // Visibility: siteSettings.features.careersPageVisible. No salaries, benefits or vacancies are stated.
  {
    slug: "karriere", status: "published", visible: true,
    seo: { title: "Karriere", description: "Arbeiten bei Perfectly Hair by Gabriel in Wiesbaden – jetzt initiativ bewerben.", noindex: false },
    sections: [
      {
        id: "karriere-hero", type: "page-hero", visible: true, eyebrow: "Karriere",
        title: "Werden Sie Teil", italic: "unseres Teams.",
        intro: "Sie lieben Ihr Handwerk und arbeiten gern mit Menschen? Wir freuen uns, Sie kennenzulernen.",
        imageId: "herren-cut", ctas: [{ label: "Zur Bewerbung", href: "#bewerbung", variant: "solid" }],
      },
      {
        id: "karriere-intro", type: "editorial-split", visible: true, eyebrow: "Über uns",
        titleLines: ["Ein Salon", "für die *ganze Familie.*"],
        paragraphs: [
          "Perfectly Hair by Gabriel ist ein Friseursalon für Damen, Herren und Kinder in der Rheinstraße 33 in Wiesbaden.",
          "Wir arbeiten mit Ruhe und Sorgfalt und nehmen uns Zeit für unsere Kundinnen und Kunden. Wenn Sie diese Haltung teilen, senden Sie uns gern Ihre Bewerbung – auch initiativ.",
        ],
        imageIds: ["salon-detail", "salon-facade"], tone: "light",
      },
      {
        id: "karriere-form", type: "application-form", visible: true,
        eyebrow: "Bewerbung",
        title: "Jetzt bewerben",
        intro: "Erzählen Sie uns kurz von sich. Einen Lebenslauf können Sie optional als PDF beifügen.",
        positions: ["Friseur/in", "Barbier/in", "Auszubildende/r", "Initiativbewerbung"],
        employmentOptions: ["Vollzeit", "Teilzeit", "Minijob", "Ausbildung", "Noch offen"],
        experienceOptions: ["Keine", "Unter 1 Jahr", "1–2 Jahre", "3–5 Jahre", "Mehr als 5 Jahre"],
        cvMaxMb: 5,
        privacyText: "Ich habe die Datenschutzhinweise zur Bewerbung gelesen und bin einverstanden, dass meine Angaben zur Bearbeitung meiner Bewerbung verwendet werden.",
        unavailableNotice: "Das Bewerbungsformular ist noch nicht aktiv. Es werden keine Daten oder Dateien gesendet oder gespeichert. Bitte bewerben Sie sich bis dahin persönlich im Salon oder telefonisch.",
      },
      { id: "karriere-contact", type: "contact-details", visible: true, eyebrow: "Salon" },
    ],
  },

  /* ---------------------------------------------------------------- legal */
  {
    slug: "impressum", status: "published", visible: true,
    seo: { title: "Impressum", description: "Impressum von Perfectly Hair by Gabriel.", noindex: true },
    sections: [
      { id: "impressum-hero", type: "page-hero", visible: true, eyebrow: "Rechtliches", title: "Impressum", italic: null, intro: null, imageId: null, ctas: [] },
      {
        id: "impressum-text", type: "legal-text", visible: true,
        draftNotice: "Entwurf – dieses Impressum ist unvollständig und muss vor Veröffentlichung vom Inhaber ergänzt und rechtlich geprüft werden.",
        blocks: [
          { heading: "Angaben gemäß § 5 DDG", lines: ["{{business.name}}", "Inhaber: {{legal.ownerName}}", "{{business.street}}", "{{business.postalCode}} {{business.city}}"] },
          { heading: "Kontakt", lines: ["Telefon: {{business.phone}}", "E-Mail: {{business.email}}"] },
          { heading: "Umsatzsteuer", lines: ["Umsatzsteuer-Identifikationsnummer gemäß § 27a UStG: {{legal.vatId}}"] },
          { heading: "Berufsrechtliche Angaben", lines: ["Zuständige Handwerkskammer: {{legal.chamber}}", "Eintragung in die Handwerksrolle: {{legal.registrationNumber}}"] },
        ],
      },
    ],
  },
  {
    slug: "datenschutz", status: "published", visible: true,
    seo: { title: "Datenschutz", description: "Datenschutzerklärung von Perfectly Hair by Gabriel.", noindex: true },
    sections: [
      { id: "datenschutz-hero", type: "page-hero", visible: true, eyebrow: "Rechtliches", title: "Datenschutz", italic: "Erklärung", intro: null, imageId: null, ctas: [] },
      {
        id: "datenschutz-text", type: "legal-text", visible: true,
        draftNotice: "Entwurf – diese Datenschutzerklärung ist ein Platzhalter. Sie muss vor Veröffentlichung vollständig erstellt und rechtlich geprüft werden (DSGVO).",
        blocks: [
          { heading: "Verantwortlicher", lines: ["{{legal.ownerName}}, {{business.street}}, {{business.postalCode}} {{business.city}}", "Telefon {{business.phone}}, E-Mail {{business.email}}"] },
          {
            heading: "Noch zu beschreibende Verarbeitungen",
            lines: [
              "Hosting (Vercel) und Server-Logfiles",
              "Datenbank und Anmeldung (Supabase) – Kundenkonto und Terminbuchung",
              "E-Mail-Versand von Terminbestätigungen (Resend)",
              "Optionale Browser-Benachrichtigungen",
              "Schriftarten werden lokal über den eigenen Server ausgeliefert",
              "Speicherdauer, Rechte der Betroffenen, Beschwerderecht",
            ],
          },
          { heading: "Vollständiger Text", lines: ["{{missing:vollständiger, geprüfter Text}}"] },
        ],
      },
    ],
  },
  {
    slug: "bildnachweise", status: "published", visible: true,
    seo: { title: "Bildnachweise", description: "Nachweise der auf dieser Website verwendeten Symbolbilder.", noindex: false },
    sections: [
      { id: "bildnachweise-hero", type: "page-hero", visible: true, eyebrow: "Rechtliches", title: "Bildnachweise", italic: null, intro: null, imageId: null, ctas: [] },
      {
        id: "bildnachweise-list", type: "credits", visible: true,
        intro: "Die Fotografien auf dieser Website sind – soweit nicht anders angegeben – Symbolbilder. Sie zeigen keine Mitarbeiter, Kunden oder Arbeiten von Perfectly Hair by Gabriel. Sie stammen von Unsplash und werden unter der Unsplash License verwendet; für die Website wurden sie in Schwarzweiß umgewandelt und zugeschnitten.",
      },
    ],
  },
  /* ---------------------------------------------------------------- 3D prototype (isolated) */
  // noindex → excluded from sitemap; not linked in navigation. Owner approval needed before use elsewhere.
  {
    slug: "3d-preview", status: "published", visible: true,
    seo: { title: "3D-Vorschau (Prototyp)", description: "Interaktiver 3D-Prototyp – nicht öffentlich verlinkt.", noindex: true },
    sections: [
      {
        id: "preview-3d", type: "hair-3d", visible: true,
        modelId: "head-scan",
        eyebrow: "Herren · 3D-Prototyp",
        title: "Schnitt",
        italic: "aus jedem Blickwinkel.",
        intro: "Drehen Sie den Kopf, wählen Sie eine Ansicht und entdecken Sie unsere Leistungen für Haar und Bart.",
        category: "herren",
        defaultView: "front",
        autoRotate: { enabled: true, degreesPerSecond: 9, resumeAfterMs: 3500 },
        hotspots: [
          { id: "oberkopf", label: "Haarschnitt", serviceId: "haarschnitt", text: "Schnitt und Form am Oberkopf – präzise auf Ihr Haar abgestimmt.", position: [0, 3.95, -0.1], normal: [0, 1, 0.1] },
          { id: "seiten", label: "Konturen & Seiten", serviceId: "haarschnitt", text: "Saubere Übergänge an den Seiten, wie bei einem modernen Fade.", position: [1.65, 2.45, -0.35], normal: [1, 0.2, -0.1] },
          { id: "bart", label: "Bartrasur", serviceId: "bartrasur", text: "Rasur und Kontur des Bartes mit Ruhe und Sorgfalt.", position: [0, 0.15, 2], normal: [0, -0.35, 1] },
          { id: "augenbrauen", label: "Augenbrauen", serviceId: "augenbrauen-zupfen", text: "Augenbrauen in Form gebracht – dezent und gepflegt.", position: [0.55, 2.05, 2.05], normal: [0.15, 0.15, 1] },
          { id: "ohr", label: "Ohren & Nase", serviceId: "ohren-nase-wax", text: "Ohren oder Nase mit Wax – für ein gepflegtes Gesamtbild.", position: [-1.85, 1.5, -0.15], normal: [-1, 0, 0] },
          { id: "nacken", label: "Waschen & Styling", serviceId: "waschen-styling", text: "Waschen und Styling als Abschluss Ihres Besuchs.", position: [0, 2.4, -1.95], normal: [0, 0.15, -1] },
        ],
        ctaLabel: "Termin für diese Leistung",
        fallbackImageId: "herren-profile",
        assetNotice: "Prototyp: Das 3D-Modell ist ein lizenzierter Kopfscan ohne Haare (Platzhalter). Das finale Modell mit modernem Fade-Haarschnitt fehlt noch.",
      },
    ],
  },

];
