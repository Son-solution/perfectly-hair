import Link from "next/link";
import { PendingRequests } from "@/components/dashboard/staff/PendingRequests";
import { TimeClock } from "@/components/dashboard/staff/TimeClock";
import { Badge, Card, DemoBanner, PageHeader, Stat, StatusBadge, btn } from "@/components/dashboard/ui";
import { addDays, effective, fmtDate, fmtTime, isoWeekday, monthTotals, scheduledMinutes, workedMinutes } from "@/features/dashboard/calc";
import { appointmentsToday, openAppointmentRequests } from "@/features/dashboard/metrics";
import { can } from "@/features/dashboard/permissions";
import { DEMO, DEMO_STAFF_ID, getEmployee, listAppointmentsForEmployee, listAttendanceForEmployee } from "@/features/dashboard/repository";

export default async function StaffOverviewPage() {
  const me = (await getEmployee(DEMO_STAFF_ID))!;
  const [appointments, attendance] = await Promise.all([listAppointmentsForEmployee(me.id), listAttendanceForEmployee(me.id)]);
  // Same definitions as the admin overview (features/dashboard/metrics.ts).
  const today = appointmentsToday(appointments, DEMO.today);
  const pending = openAppointmentRequests(appointments, DEMO.today);
  const next = appointments.find((a) => a.start > DEMO.now && a.status === "confirmed");
  const monday = addDays(DEMO.today, -(isoWeekday(DEMO.today) - 1));
  const week = attendance.filter((r) => r.date >= monday && r.date < DEMO.today).reduce((s, r) => s + (workedMinutes(effective(r)) ?? 0), 0);
  const month = monthTotals(me, attendance, DEMO.today.slice(0, 7), DEMO.today);
  const shiftToday = me.schedule[String(isoWeekday(DEMO.today))];
  const shifts = Array.from({ length: 7 }, (_, i) => addDays(DEMO.today, i + 1))
    .map((d) => ({ d, s: me.schedule[String(isoWeekday(d))] }))
    .filter((x) => x.s)
    .slice(0, 4);

  return (
    <>
      <PageHeader eyebrow={fmtDate(DEMO.today, { weekday: "long", day: "numeric", month: "long" })} title={`Hallo ${me.firstName}.`} description="Dein Tag im Überblick – Zeiterfassung direkt hier." />
      <DemoBanner>Demo: Stempelungen und Entscheidungen werden nur in dieser Ansicht simuliert und nicht gespeichert.</DemoBanner>

      <div className="grid gap-4 xl:grid-cols-[1.2fr_1fr]">
        <div>
          <TimeClock
            variant="compact"
            today={DEMO.today}
            now={DEMO.now}
            todayRecord={attendance.find((r) => r.date === DEMO.today) ?? null}
            history={attendance}
            weekWorked={week}
            monthWorked={month.worked}
            scheduledToday={scheduledMinutes(me, DEMO.today)}
            shiftLabel={shiftToday ? `${shiftToday.start}–${shiftToday.end}` : null}
          />
          <Link href="/staff/attendance" className={btn("ghost", "sm")}>Verlauf & Korrekturanfragen →</Link>
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Stat label="Termine heute" value={today.length} hint="ohne Stornos" emphasis />
            <Stat label="Offene Anfragen" value={pending.length} />
          </div>
          <PendingRequests initial={pending} today={DEMO.today} me={`${me.firstName} ${me.lastName}`} canDecide={can(me.role, "appointments.decide_own")} />
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card title="Nächster Termin">
          {next ? (
            <div>
              <p className="font-display text-4xl tabular-nums">{fmtTime(next.start)}</p>
              <p className="mt-2 text-sm font-medium">{next.serviceName}</p>
              <p className="text-sm text-dash-muted">{next.customerName} · {fmtDate(next.start)}</p>
            </div>
          ) : <p className="text-sm text-dash-muted">Kein weiterer Termin.</p>}
        </Card>
        <Card title="Heute" padded={false} action={<Link href="/staff/appointments" className={btn("ghost", "sm")}>Alle</Link>}>
          <ul className="divide-y divide-dash-border">
            {today.slice(0, 5).map((a) => (
              <li key={a.id} className="flex items-center gap-3 px-5 py-3 text-sm">
                <span className="w-12 tabular-nums">{fmtTime(a.start)}</span>
                <span className="flex-1 truncate">{a.serviceName}</span>
                <StatusBadge status={a.status} />
              </li>
            ))}
            {today.length === 0 && <li className="px-5 py-3 text-sm text-dash-muted">Keine Termine.</li>}
          </ul>
        </Card>
        <Card title="Nächste Schichten" padded={false} action={<Link href="/staff/schedule" className={btn("ghost", "sm")}>Dienstplan</Link>}>
          <ul className="divide-y divide-dash-border">
            {shifts.map(({ d, s }) => (
              <li key={d} className="flex items-center justify-between px-5 py-3 text-sm">
                <span>{fmtDate(d, { weekday: "long", day: "numeric", month: "short" })}</span>
                <Badge tone="outline">{s!.start} – {s!.end}</Badge>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </>
  );
}
