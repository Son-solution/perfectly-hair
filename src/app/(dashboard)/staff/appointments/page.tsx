import { MyAppointments } from "@/components/dashboard/staff/MyAppointments";
import { DemoBanner, PageHeader } from "@/components/dashboard/ui";
import { can } from "@/features/dashboard/permissions";
import { DEMO, DEMO_STAFF_ID, getEmployee, listAppointmentsForEmployee } from "@/features/dashboard/repository";

export default async function StaffAppointmentsPage() {
  const me = (await getEmployee(DEMO_STAFF_ID))!;
  const appointments = await listAppointmentsForEmployee(me.id);
  return (
    <>
      <PageHeader eyebrow="Mein Bereich" title="Meine Termine" description="Nur deine eigenen Termine." />
      <DemoBanner />
      <MyAppointments
        initial={appointments}
        today={DEMO.today}
        me={`${me.firstName} ${me.lastName}`}
        canDecide={can(me.role, "appointments.decide_own")}
        canCancel={can(me.role, "appointments.cancel_own")}
      />
    </>
  );
}
