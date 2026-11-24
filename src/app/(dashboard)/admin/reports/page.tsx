import { ReportsBoard } from "@/components/dashboard/admin/ReportsBoard";
import { DemoBanner, PageHeader } from "@/components/dashboard/ui";
import { can } from "@/features/dashboard/permissions";
import { DEMO, listAppointments, listAttendance, listCommissionRules, listEmployees } from "@/features/dashboard/repository";

export default async function ReportsPage() {
  const [appointments, attendance, employees, rules] = await Promise.all([listAppointments(), listAttendance(), listEmployees(), listCommissionRules()]);
  return (
    <>
      <PageHeader eyebrow="Auswertung" title="Berichte & Statistiken" description="Leistung, Stunden und Stornos je Mitarbeiter für Tag, Woche, Monat oder einen eigenen Zeitraum – mit Export als CSV oder PDF." />
      <DemoBanner>Alle Zahlen beruhen auf fiktiven Demo-Daten. Geschätzte Terminwerte sind kein Umsatz.</DemoBanner>
      {/* Preview demonstrates the super-admin capability so the setting can be tried. Phase 5B: role from the session. */}
      <ReportsBoard appointments={appointments} attendance={attendance} employees={employees} rules={rules} today={DEMO.today} canCommission={can("super_admin", "commission.manage")} />
    </>
  );
}
