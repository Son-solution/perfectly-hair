import { AttendanceManager } from "@/components/dashboard/admin/AttendanceManager";
import { DemoBanner, PageHeader } from "@/components/dashboard/ui";
import { DEMO, listAttendance, listEmployees } from "@/features/dashboard/repository";

export default async function AdminAttendancePage() {
  const [records, employees] = await Promise.all([listAttendance(), listEmployees()]);
  return (
    <>
      <PageHeader
        eyebrow="Betrieb"
        title="Zeiterfassung"
        description="Mitarbeiter stempeln selbst ein und aus. Hier prüfen und korrigieren Sie Einträge – jede Korrektur braucht eine Begründung und bleibt mit Original im Verlauf erhalten."
      />
      <DemoBanner />
      <AttendanceManager initial={records} employees={employees} today={DEMO.today} actor={DEMO.admin} />
    </>
  );
}
