import { Suspense } from "react";
import { AppointmentsBoard } from "@/components/dashboard/admin/AppointmentsBoard";
import { AppointmentsFromUrl } from "@/components/dashboard/admin/AppointmentsFromUrl";
import { DemoBanner, PageHeader } from "@/components/dashboard/ui";
import { DEMO, listAppointments, listEmployees } from "@/features/dashboard/repository";

export default async function AdminAppointmentsPage() {
  const [appointments, employees] = await Promise.all([listAppointments(), listEmployees()]);
  const props = { initial: appointments, employees, today: DEMO.today, actor: DEMO.admin };
  return (
    <>
      <PageHeader eyebrow="Betrieb" title="Termine" description="Anfragen bestätigen oder ablehnen, Mitarbeiter zuweisen und den Kalender im Blick behalten." />
      <DemoBanner />
      {/* ?status=… preselects the filter (read on the client) */}
      <Suspense fallback={<AppointmentsBoard {...props} />}>
        <AppointmentsFromUrl {...props} />
      </Suspense>
    </>
  );
}
