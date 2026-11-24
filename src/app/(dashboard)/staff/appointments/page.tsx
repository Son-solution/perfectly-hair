import { MyAppointments } from "@/components/dashboard/staff/MyAppointments";
import { DemoBanner, PageHeader } from "@/components/dashboard/ui";
import { can } from "@/features/dashboard/permissions";
import { LEAVE_LABEL } from "@/features/dashboard/domain";
import { DEMO, DEMO_STAFF_ID, getEmployee, listAppointmentsForEmployee, listLeaveForEmployee } from "@/features/dashboard/repository";

export default async function StaffAppointmentsPage() {
  const me = (await getEmployee(DEMO_STAFF_ID))!;
  const [appointments, leave] = await Promise.all([listAppointmentsForEmployee(me.id), listLeaveForEmployee(me.id)]);
  return (
    <>
      <PageHeader eyebrow="Mein Bereich" title="Meine Termine" description="Nur deine eigenen Termine – Tag für Tag oder als Liste." />
      <DemoBanner />
      <MyAppointments
        initial={appointments}
        today={DEMO.today}
        me={`${me.firstName} ${me.lastName}`}
        canDecide={can(me.role, "appointments.decide_own")}
        canCancel={can(me.role, "appointments.cancel_own")}
        schedule={me.schedule}
        nowTime={DEMO.now.slice(11, 16)}
        leave={leave.filter((l) => l.status === "genehmigt").map((l) => ({ from: l.from, to: l.to, label: LEAVE_LABEL[l.type] }))}
      />
    </>
  );
}
