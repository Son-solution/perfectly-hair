import { MyLeave } from "@/components/dashboard/staff/MyLeave";
import { DemoBanner, PageHeader } from "@/components/dashboard/ui";
import { DEMO, DEMO_STAFF_ID, getEmployee, listLeaveForEmployee } from "@/features/dashboard/repository";

export default async function StaffLeavePage() {
  const me = (await getEmployee(DEMO_STAFF_ID))!;
  const leave = await listLeaveForEmployee(me.id);
  return (
    <>
      <PageHeader eyebrow="Mein Bereich" title="Urlaub" description="Urlaub beantragen und den Status deiner Anträge sehen." />
      <DemoBanner />
      <MyLeave initial={leave} entitlement={me.vacationDaysYear} today={DEMO.today} employeeId={me.id} />
    </>
  );
}
