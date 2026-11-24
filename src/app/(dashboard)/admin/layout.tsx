import { DashboardShell } from "@/components/dashboard/Shell";
import type { NotificationItem } from "@/components/dashboard/NotificationCenter";
import { fmtDate, fmtTime } from "@/features/dashboard/calc";
import { navBadges, newApplications, openAppointmentRequests, openCallbacks, openCorrectionRequests, openLeaveRequests } from "@/features/dashboard/metrics";
import {
  DEMO, listApplications, listAppointments, listAttendance, listCallbackRequests, listEmployees, listLeave,
} from "@/features/dashboard/repository";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const [appointments, attendance, leave, callbacks, applications, employees] = await Promise.all([
    listAppointments(), listAttendance(), listLeave(), listCallbackRequests(), listApplications(), listEmployees(),
  ]);
  const badges = navBadges({ appointments, attendance, leave, callbacks, applications, today: DEMO.today });
  const name = (id: string) => employees.find((e) => e.id === id)?.firstName ?? "Mitarbeiter";

  // Internal notification centre (demo): derived from open items. Phase 5B: `notifications` table.
  const notifications: NotificationItem[] = [
    ...openCallbacks(callbacks).filter((r) => r.status === "neu").map((r): NotificationItem => ({
      id: `n-${r.id}`, kind: "anfrage", title: `Rückrufwunsch: ${r.name}`, text: `${r.serviceName}, Wunsch ${fmtDate(r.preferredDate)} ${r.preferredTime}`,
      at: r.receivedAt, href: "/admin/callbacks", read: false,
    })),
    ...newApplications(applications).map((b): NotificationItem => ({
      id: `n-${b.id}`, kind: "bewerbung", title: `Neue Bewerbung: ${b.position}`, text: `${b.firstName} ${b.lastName}`, at: b.receivedAt, href: "/admin/applications", read: false,
    })),
    ...openAppointmentRequests(appointments, DEMO.today).slice(0, 3).map((a): NotificationItem => ({
      id: `n-${a.id}`, kind: "termin", title: `Terminanfrage: ${a.serviceName}`, text: `${fmtDate(a.start)} ${fmtTime(a.start)} · ${a.customerName}`,
      at: a.history[0]?.at ?? a.start, href: "/admin/appointments?status=pending", read: false,
    })),
    ...openCorrectionRequests(attendance).map((r): NotificationItem => ({
      id: `n-${r.id}`, kind: "zeit", title: `Korrekturanfrage von ${name(r.employeeId)}`, text: `Eintrag vom ${fmtDate(r.date)}`,
      at: r.requests.find((q) => q.status === "open")?.at ?? `${r.date}T18:00`, href: "/admin/attendance", read: false,
    })),
    ...openLeaveRequests(leave).map((l): NotificationItem => ({
      id: `n-${l.id}`, kind: "urlaub", title: `Abwesenheitsantrag von ${name(l.employeeId)}`, text: `${fmtDate(l.from)} – ${fmtDate(l.to)}`,
      at: `${l.from}T08:00` < DEMO.now ? `${l.from}T08:00` : "2026-11-23T09:00", href: "/admin/leave", read: true,
    })),
  ].sort((a, b) => b.at.localeCompare(a.at));

  return (
    <DashboardShell area="admin" userName="Admin (Demo)" userRole="Admin · Vorschau" badges={badges} notifications={notifications}>
      {children}
    </DashboardShell>
  );
}
