import { DashboardShell } from "@/components/dashboard/Shell";
import { DEMO, listAppointments, listAttendance, listLeave } from "@/features/dashboard/repository";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const [appointments, attendance, leave] = await Promise.all([listAppointments(), listAttendance(), listLeave()]);
  const badges = {
    "/admin/appointments": appointments.filter((a) => a.status === "pending" && a.start >= DEMO.today).length,
    "/admin/attendance": attendance.filter((r) => r.requests.some((q) => q.status === "open")).length,
    "/admin/leave": leave.filter((l) => l.status === "beantragt").length,
  };
  return (
    <DashboardShell area="admin" userName="Admin (Demo)" userRole="Admin · Vorschau" badges={badges}>
      {children}
    </DashboardShell>
  );
}
