import type { Metadata } from "next";
import { LegalPage, Missing } from "@/components/site/LegalPage";
import { site } from "@/config/site";

export const metadata: Metadata = {
  title: "Impressum",
  robots: { index: false }, // until the legal information is complete
};

export default function ImpressumPage() {
  return (
    <LegalPage title="Impressum">
      <p className="border border-ink p-4 text-ink">
        Entwurf – dieses Impressum ist unvollständig und muss vor Veröffentlichung vom
        Inhaber ergänzt und rechtlich geprüft werden.
      </p>

      <h2>Angaben gemäß § 5 DDG</h2>
      <p>
        {site.name}
        <br />
        Inhaber: <Missing>vollständiger Name des Inhabers</Missing>
        <br />
        {site.address.street}
        <br />
        {site.address.postalCode} {site.address.city}
      </p>

      <h2>Kontakt</h2>
      <p>
        Telefon: {site.phone.display}
        <br />
        E-Mail: <Missing>E-Mail-Adresse</Missing>
      </p>

      <h2>Umsatzsteuer</h2>
      <p>
        Umsatzsteuer-Identifikationsnummer gemäß § 27a UStG:{" "}
        <Missing>USt-IdNr. oder Hinweis auf Kleinunternehmerregelung</Missing>
      </p>

      <h2>Berufsrechtliche Angaben</h2>
      <p>
        Zuständige Handwerkskammer: <Missing>Handwerkskammer</Missing>
        <br />
        Eintragung in die Handwerksrolle: <Missing>Betriebsnummer</Missing>
      </p>
    </LegalPage>
  );
}
