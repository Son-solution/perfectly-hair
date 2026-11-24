import Link from "next/link";
import { notFound } from "next/navigation";
import { EmployeeProfile } from "@/components/dashboard/admin/EmployeeProfile";
import { DemoBanner } from "@/components/dashboard/ui";
import {
  DEMO, getEmployee, getServiceCatalogue, listAppointments, listAttendance, listEmployees, listLeave,
  listPayrollAdjustments, listPayrollProfiles,
} from "@/features/dashboard/repository";

export async function generateStaticParams() {
  return (await listEmployees()).map((e) => ({ id: e.id }));
}

export default async function EmployeeProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const employee = await getEmployee(id);
  if (!employee) notFound();
  const [appointments, attendance, leave, profiles, adjustments, services] = await Promise.all([
    listAppointments(), listAttendance(), listLeave(), listPayrollProfiles(), listPayrollAdjustments(), getServiceCatalogue(),
  ]);
  return (
    <>
      <Link href="/admin/employees" className="mb-4 inline-flex text-xs text-dash-muted hover:text-dash-text">← Alle Mitarbeiter</Link>
      <DemoBanner />
      <EmployeeProfile
        employee={employee}
        today={DEMO.today}
        appointments={appointments.filter((a) => a.employeeId === id)}
        attendance={attendance.filter((r) => r.employeeId === id)}
        leave={leave.filter((l) => l.employeeId === id)}
        payroll={profiles.find((p) => p.employeeId === id) ?? null}
        adjustments={adjustments.filter((a) => a.employeeId === id)}
        services={Object.entries(services).map(([sid, s]) => ({ id: sid, name: s.name }))}
      />
    </>
  );
}
