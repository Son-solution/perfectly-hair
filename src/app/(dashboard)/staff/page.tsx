import Link from "next/link";
import { Badge, Card, DemoBanner, PageHeader, Stat, StatusBadge, btn } from "@/components/dashboard/ui";
import { addDays, effective, fmtDate, fmtDuration, fmtTime, isoWeekday, monthTotals, toMin, workedMinutes } from "@/features/dashboard/calc";
import { DEMO, DEMO_STAFF_ID, getEmployee, listAppointmentsForEmployee, listAttendanceForEmployee } from "@/features/dashboard/repository";

export default async function StaffOverviewPage() {
  const me = (await getEmployee(DEMO_STAFF_ID))!;
  const [appointments, attendance] = await Promise.all([listAppointmentsForEmployee(me.id), listAttendanceForEmployee(me.id)]);
  const today = appointments.filter((a) => a.start.startsWith(DEMO.today) && !["cancelled", "rejected"].includes(a.status));
  const pending = appointments.filter((a) => a.status === "pending" && a.start >= DEMO.today);
  const next = appointments.find((a) => a.start > DEMO.now && a.status === "confirmed");
  const rec = attendance.find((r) => r.date === DEMO.today);
  const inSince = rec ? effective(rec).clockIn : null;
  const workedToday = inSince ? Math.max(0, toMin(DEMO.now) - toMin(inSince)) : 0;
  const monday = addDays(DEMO.today, -(isoWeekday(DEMO.today) - 1));
  const week = attendance.filter((r) => r.date >= monday && r.date < DEMO.today).reduce((s, r) => s + (workedMinutes(effective(r)) ?? 0), 0);
  const month = monthTotals(me, attendance, DEMO.today.slice(0, 7), DEMO.today);
  const shifts = Array.from({ length: 7 }, (_, i) => addDays(DEMO.today, i + 1))
    .map((d) => ({ d, s: me.schedule[String(isoWeekday(d))] }))
    .filter((x) => x.s)
    .slice(0, 4);

  return (
    <>
      <PageHeader eyebrow={fmtDate(DEMO.today, { weekday: "long", day: "numeric", month: "long" })} title={`Hallo ${me.firstName}.`} description="Dein Tag im Überblick." />
      <DemoBanner />
      <Card className="mb-4" padded={false}>
        <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
          <div className="flex-1">
            <p className="text-xs text-dash-muted">Status</p>
            <p className="mt-1 font-display text-2xl">{inSince ? `Eingestempelt seit ${fmtTime(inSince)}` : "Noch nicht eingestempelt"}</p>
          </div>
          <Link href="/staff/attendance" className={btn("primary")}>{inSince ? "Zeiterfassung öffnen" : "Arbeitsbeginn stempeln"}</Link>
        </div>
      </Card>
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <Stat label="Termine heute" value={today.length} emphasis />
        <Stat label="Offene Anfragen" value={pending.length} />
        <Stat label="Heute gearbeitet" value={fmtDuration(workedToday)} hint="Stand Demo-Uhrzeit" />
        <Stat label="Diese Woche" value={fmtDuration(week + workedToday)} hint={`Monat: ${fmtDuration(month.worked)}`} />
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
