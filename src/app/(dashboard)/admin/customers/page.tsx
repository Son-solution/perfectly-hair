import { Suspense } from "react";
import { CustomersBoard, CustomersFromUrl } from "@/components/dashboard/admin/CustomersBoard";
import { DemoBanner, PageHeader } from "@/components/dashboard/ui";
import { can } from "@/features/dashboard/permissions";
import { DEMO, listAppointments, listCustomers, listEmployees } from "@/features/dashboard/repository";

export default async function CustomersPage() {
  const [customers, appointments, employees] = await Promise.all([listCustomers(), listAppointments(), listEmployees()]);
  const props = {
    customers, appointments, today: DEMO.today, actor: DEMO.admin,
    staffNames: Object.fromEntries(employees.map((e) => [e.id, `${e.firstName} ${e.lastName}`])),
    // Preview role = admin. Phase 5B: from the session + RLS on `customer_notes`.
    canNotes: can("admin", "customers.notes"),
  };
  return (
    <>
      <PageHeader eyebrow="Betrieb" title="Kunden" description="Profile, Kontaktdaten, Termin- und Besuchshistorie sowie interne Notizen." />
      <DemoBanner>Fiktive Kundendaten. In Phase 5B nur mit Einwilligung gespeichert; Löschung/Auskunft nach DSGVO Art. 15–17.</DemoBanner>
      <Suspense fallback={<CustomersBoard {...props} />}>
        <CustomersFromUrl {...props} />
      </Suspense>
    </>
  );
}
