import { Suspense } from "react";
import { AppointmentsBoard } from "@/components/dashboard/admin/AppointmentsBoard";
import { AppointmentsFromUrl } from "@/components/dashboard/admin/AppointmentsFromUrl";
import { DemoBanner, PageHeader } from "@/components/dashboard/ui";
import { getBusiness } from "@/content/repository";
import { DEMO, getServiceCatalogue, listAppointments, listCustomers, listEmployees } from "@/features/dashboard/repository";

export default async function AdminAppointmentsPage() {
  const [appointments, employees, customers, catalogue, business] = await Promise.all([
    listAppointments(), listEmployees(), listCustomers(), getServiceCatalogue(), getBusiness(),
  ]);
  const props = {
    initial: appointments, employees, today: DEMO.today, actor: DEMO.admin, nowTime: DEMO.now.slice(11, 16),
    customers: customers.map((c) => ({ id: c.id, name: c.name, phone: c.phone })),
    catalogue, hours: business.hours, walkIn: business.walkIn,
  };
  return (
    <>
      <PageHeader eyebrow="Betrieb" title="Termine" description="Anfragen bestätigen oder ablehnen, telefonische Termine und Laufkundschaft erfassen, Mitarbeiter zuweisen." />
      <DemoBanner />
      {/* ?status=… preselects the filter (read on the client) */}
      <Suspense fallback={<AppointmentsBoard {...props} />}>
        <AppointmentsFromUrl {...props} />
      </Suspense>
    </>
  );
}
