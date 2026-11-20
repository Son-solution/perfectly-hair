import type { Metadata } from "next";
import { LegalPage } from "@/components/site/LegalPage";
import { stockImages } from "@/content/images";

export const metadata: Metadata = {
  title: "Bildnachweise",
  description: "Nachweise der auf dieser Website verwendeten Symbolbilder.",
  alternates: { canonical: "/bildnachweise" },
};

export default function BildnachweisePage() {
  return (
    <LegalPage title="Bildnachweise">
      <p>
        Die Fotografien auf dieser Website sind – soweit nicht anders angegeben –{" "}
        <strong>Symbolbilder</strong>. Sie zeigen keine Mitarbeiter, Kunden oder Arbeiten
        von Perfectly Hair by Gabriel. Sie stammen von{" "}
        <a href="https://unsplash.com" target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">
          Unsplash
        </a>{" "}
        und werden unter der{" "}
        <a href="https://unsplash.com/license" target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">
          Unsplash License
        </a>{" "}
        verwendet. Für die Website wurden sie in Schwarzweiß umgewandelt und zugeschnitten.
      </p>

      <h2>Fotografien</h2>
      <ul className="divide-y divide-mist border-y border-mist">
        {stockImages.map((img) =>
          img.credit ? (
            <li key={img.src} className="flex flex-col gap-1 py-4 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
              <span className="text-ink">{img.alt.replace(" (Symbolbild)", "")}</span>
              <span className="text-sm">
                Foto:{" "}
                <a href={img.credit.authorUrl} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">
                  {img.credit.author}
                </a>{" "}
                ·{" "}
                <a href={img.credit.sourceUrl} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">
                  Unsplash
                </a>
              </span>
            </li>
          ) : null,
        )}
      </ul>

      <h2>Logo</h2>
      <p>Das Logo ist Eigentum von Perfectly Hair by Gabriel.</p>
    </LegalPage>
  );
}
