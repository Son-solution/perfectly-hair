import { CallbacksBoard } from "@/components/dashboard/admin/CallbacksBoard";
import { DemoBanner, PageHeader } from "@/components/dashboard/ui";
import { getBusiness } from "@/content/repository";
import { DEMO, getServiceCatalogue, listAppointments, listCallbackRequests, listCustomers, listEmployees } from "@/features/dashboard/repository";

export default async function CallbacksPage() {
  const [requests, employees, appointments, customers, catalogue, business] = await Promise.all([
    listCallbackRequests(), listEmployees(), listAppointments(), listCustomers(), getServiceCatalogue(), getBusiness(),
  ]);
  return (
    <>
      <PageHeader
        eyebrow="Betrieb"
        title="Terminanfragen"
        description="Rückrufwünsche aus dem Website-Formular „Termin anfragen & Rückruf erhalten“. Ein Termin entsteht erst nach Rückruf und Verfügbarkeitsprüfung – nie automatisch."
      />
      <DemoBanner>Fiktive Anfragen. Das öffentliche Formular ist noch nicht aktiv und sendet nichts. Eingang, E-Mail-Benachrichtigung, Spamschutz und Dublettenerkennung folgen mit Phase 5B.</DemoBanner>
      <CallbacksBoard
        initial={requests}
        employees={employees}
        appointments={appointments}
        customers={customers.map((c) => ({ id: c.id, name: c.name, phone: c.phone }))}
        catalogue={catalogue}
        hours={business.hours}
        walkIn={business.walkIn}
        today={DEMO.today}
        nowTime={DEMO.now.slice(11, 16)}
        actor={DEMO.admin}
      />
    </>
  );
}
