import type { Business, MediaAsset, SectionOf } from "@/content/schema";

/**
 * Legal text with tokens. `{{business.x}}` / `{{legal.x}}` are filled from business settings;
 * missing values (null) render as a clearly marked [FEHLT: …] — never invented.
 */
const LABELS: Record<string, string> = {
  "legal.ownerName": "vollständiger Name des Inhabers",
  "legal.vatId": "USt-IdNr. oder Hinweis auf Kleinunternehmerregelung",
  "legal.chamber": "zuständige Handwerkskammer",
  "legal.registrationNumber": "Betriebsnummer",
  "business.email": "E-Mail-Adresse",
};

function tokenValue(token: string, b: Business): string | null {
  switch (token) {
    case "business.name": return b.name;
    case "business.street": return b.address.street;
    case "business.postalCode": return b.address.postalCode;
    case "business.city": return b.address.city;
    case "business.phone": return b.phone.display;
    case "business.email": return b.email;
    case "legal.ownerName": return b.legal.ownerName;
    case "legal.vatId": return b.legal.vatId;
    case "legal.chamber": return b.legal.chamber;
    case "legal.registrationNumber": return b.legal.registrationNumber;
    default: return null;
  }
}

function Missing({ children }: { children: string }) {
  return <mark className="border border-dashed border-ink bg-bone px-2 py-0.5 text-ink">[FEHLT: {children}]</mark>;
}

function renderLine(line: string, b: Business) {
  return line.split(/(\{\{[^}]+\}\})/g).filter(Boolean).map((part, i) => {
    const m = part.match(/^\{\{([^}]+)\}\}$/);
    if (!m) return <span key={i}>{part}</span>;
    const token = m[1];
    if (token.startsWith("missing:")) return <Missing key={i}>{token.slice(8)}</Missing>;
    const value = tokenValue(token, b);
    return value ? <span key={i}>{value}</span> : <Missing key={i}>{LABELS[token] ?? token}</Missing>;
  });
}

export function LegalTextSection({ section, business }: { section: SectionOf<"legal-text">; business: Business }) {
  return (
    <section className="bg-paper py-20 md:py-28">
      <div className="container-luxe max-w-3xl">
        <p role="note" className="border border-ink p-5 leading-relaxed text-ink">{section.draftNotice}</p>
        {section.blocks.map((b) => (
          <div key={b.heading} className="mt-14">
            <h2 className="font-display text-3xl">{b.heading}</h2>
            <div className="mt-5 space-y-1.5 leading-relaxed text-graphite">
              {b.lines.map((l, i) => (
                <p key={i}>{renderLine(l, business)}</p>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function CreditsSection({ section, stock }: { section: SectionOf<"credits">; stock: MediaAsset[] }) {
  return (
    <section className="bg-paper py-20 md:py-28">
      <div className="container-luxe max-w-3xl">
        <p className="leading-relaxed text-graphite">
          {section.intro}{" "}
          <a href="https://unsplash.com/license" target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">
            Unsplash License
          </a>
        </p>
        <h2 className="mt-14 font-display text-3xl">Fotografien</h2>
        <ul className="mt-6 divide-y divide-mist border-y border-mist">
          {stock.map((img) =>
            img.credit ? (
              <li key={img.id} className="flex flex-col gap-1 py-4 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
                <span className="text-ink">{img.alt.replace(" (Symbolbild)", "")}</span>
                <span className="text-sm text-graphite">
                  Foto:{" "}
                  <a href={img.credit.authorUrl} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">{img.credit.author}</a>{" "}
                  ·{" "}
                  <a href={img.credit.sourceUrl} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">Unsplash</a>
                </span>
              </li>
            ) : null,
          )}
        </ul>
        <h2 className="mt-14 font-display text-3xl">Logo</h2>
        <p className="mt-5 leading-relaxed text-graphite">Das Logo ist Eigentum von Perfectly Hair by Gabriel.</p>
      </div>
    </section>
  );
}
