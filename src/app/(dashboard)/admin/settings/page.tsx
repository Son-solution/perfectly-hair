import { SettingsPanel } from "@/components/dashboard/admin/SettingsPanel";
import { DemoBanner, PageHeader } from "@/components/dashboard/ui";
import { getBusiness } from "@/content/repository";
import { listEmployees } from "@/features/dashboard/repository";

export default async function AdminSettingsPage() {
  const [business, employees] = await Promise.all([getBusiness(), listEmployees()]);
  return (
    <>
      <PageHeader eyebrow="Verwaltung" title="Einstellungen" description="Salon, Buchungsregeln, Arbeitszeiten, Berechtigungen, Benutzer und Benachrichtigungen." />
      <DemoBanner>Einstellungsmasken als Vorschau – Änderungen werden nicht gespeichert.</DemoBanner>
      <SettingsPanel
        hours={business.hours}
        employees={employees}
        salonName={business.name}
        phone={business.phone.display}
        address={`${business.address.street}, ${business.address.postalCode} ${business.address.city}`}
      />
    </>
  );
}
