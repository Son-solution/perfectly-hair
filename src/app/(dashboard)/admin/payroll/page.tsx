import { PayrollBoard } from "@/components/dashboard/admin/PayrollBoard";
import { DemoBanner, PageHeader } from "@/components/dashboard/ui";
import { DEMO, listAttendance, listEmployees, listPayrollAdjustments, listPayrollProfiles } from "@/features/dashboard/repository";

/** Sensitive: later visible only to roles with "payroll.view" (server check + RLS). */
export default async function AdminPayrollPage() {
  const [employees, profiles, attendance, adjustments] = await Promise.all([listEmployees(), listPayrollProfiles(), listAttendance(), listPayrollAdjustments()]);
  return (
    <>
      <PageHeader eyebrow="Betrieb · vertraulich" title="Lohnvorbereitung" description="Monatliche Vorbereitung der Vergütung auf Basis erfasster Stunden – zur Weitergabe an Steuerberatung oder Lohnbüro." />
      <DemoBanner />
      <PayrollBoard employees={employees} profiles={profiles} attendance={attendance} initialAdjustments={adjustments} today={DEMO.today} actor={DEMO.admin} />
    </>
  );
}
