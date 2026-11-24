import { SettingsPanel } from "@/components/dashboard/admin/SettingsPanel";
import { DemoBanner, PageHeader } from "@/components/dashboard/ui";
import { getBusiness, getPage, getSiteSettings } from "@/content/repository";
import { listEmployees } from "@/features/dashboard/repository";

export default async function AdminSettingsPage() {
  const [business, employees, settings, karriere] = await Promise.all([getBusiness(), listEmployees(), getSiteSettings(), getPage("karriere")]);
  const form = karriere?.sections.find((s) => s.type === "application-form");
  return (
    <>
      <PageHeader eyebrow="Verwaltung" title="Einstellungen" description="Salon, Buchungsregeln, Arbeitszeiten, Berechtigungen, Benutzer, Benachrichtigungen sowie Website-Hinweise und Formulare." />
      <DemoBanner>Einstellungsmasken als Vorschau – Änderungen werden nicht gespeichert.</DemoBanner>
      <SettingsPanel
        hours={business.hours}
        employees={employees}
        salonName={business.name}
        phone={business.phone.display}
        address={`${business.address.street}, ${business.address.postalCode} ${business.address.city}`}
        site={{
          walkIn: business.walkIn,
          features: settings.features,
          notificationEmail: settings.notificationEmail,
          application: form?.type === "application-form" ? { positions: form.positions, employmentOptions: form.employmentOptions, cvMaxMb: form.cvMaxMb } : null,
        }}
      />
    </>
  );
}
