import { ApplicationsBoard } from "@/components/dashboard/admin/ApplicationsBoard";
import { DemoBanner, PageHeader } from "@/components/dashboard/ui";
import { DEMO, listApplications } from "@/features/dashboard/repository";

export default async function ApplicationsPage() {
  const applications = await listApplications();
  return (
    <>
      <PageHeader eyebrow="Verwaltung · vertraulich" title="Bewerbungen" description="Eingänge aus dem Karriere-Formular: Übersicht, Details, Status und interne Notizen. Nur für Admins." />
      <DemoBanner>Fiktive Bewerbungen. Das öffentliche Formular ist noch nicht aktiv; es werden keine Daten oder Dateien empfangen. Speicherung, privater Datei-Bucket und E-Mail-Hinweis folgen mit Phase 5B.</DemoBanner>
      <ApplicationsBoard initial={applications} today={DEMO.today} actor={DEMO.admin} />
    </>
  );
}
