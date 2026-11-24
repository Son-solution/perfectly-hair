import { LeaveBoard } from "@/components/dashboard/admin/LeaveBoard";
import { DemoBanner, PageHeader } from "@/components/dashboard/ui";
import { DEMO, listEmployees, listLeave } from "@/features/dashboard/repository";

export default async function AdminLeavePage() {
  const [leave, employees] = await Promise.all([listLeave(), listEmployees()]);
  return (
    <>
      <PageHeader eyebrow="Betrieb" title="Abwesenheiten" description="Urlaubsanträge genehmigen, Krankheitstage dokumentieren und die Besetzung im Kalender planen." />
      <DemoBanner />
      <LeaveBoard initial={leave} employees={employees} today={DEMO.today} actor={DEMO.admin} />
    </>
  );
}
