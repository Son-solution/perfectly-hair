import type { Metadata } from "next";
import { LegalPage, Missing } from "@/components/site/LegalPage";
import { site } from "@/config/site";

export const metadata: Metadata = {
  title: "Datenschutz",
  robots: { index: false }, // until the policy is complete
};

export default function DatenschutzPage() {
  return (
    <LegalPage title="Datenschutzerklärung">
      <p className="border border-ink p-4 text-ink">
        Entwurf – diese Datenschutzerklärung ist ein Platzhalter. Sie muss vor
        Veröffentlichung vollständig erstellt und rechtlich geprüft werden (DSGVO).
      </p>

      <h2>Verantwortlicher</h2>
      <p>
        <Missing>Name des Inhabers</Missing>, {site.address.street},{" "}
        {site.address.postalCode} {site.address.city}, Telefon {site.phone.display},
        E-Mail <Missing>E-Mail-Adresse</Missing>
      </p>

      <h2>Noch zu beschreibende Verarbeitungen</h2>
      <ul className="list-disc space-y-2 pl-6">
        <li>Hosting (Vercel) und Server-Logfiles</li>
        <li>Datenbank und Anmeldung (Supabase) – Kundenkonto und Terminbuchung</li>
        <li>E-Mail-Versand von Terminbestätigungen (Resend)</li>
        <li>Optionale Browser-Benachrichtigungen</li>
        <li>Eingebundene Schriftarten (lokal ausgeliefert über Next.js)</li>
        <li>Speicherdauer, Rechte der Betroffenen, Beschwerderecht</li>
      </ul>
      <p>
        <Missing>vollständiger, geprüfter Text</Missing>
      </p>
    </LegalPage>
  );
}
