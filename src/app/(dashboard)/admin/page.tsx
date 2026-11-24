import Link from "next/link";
import { Avatar, Badge, Card, DemoBanner, PageHeader, Stat, StatusBadge, btn } from "@/components/dashboard/ui";
import { effective, fmtDate, fmtDuration, fmtEuro, fmtTime, monthTotals } from "@/features/dashboard/calc";
import { LEAVE_LABEL } from "@/features/dashboard/domain";
import { DEMO, listAppointments, listAttendance, listEmployees, listLeave } from "@/features/dashboard/repository";

export default async function AdminOverviewPage() {
  const [appointments, attendance, employees, leave] = await Promise.all([listAppointments(), listAttendance(), listEmployees(), listLeave()]);
  const name = (id: string | null) => {
    const e = employees.find((x) => x.id === id);
    return e ? `${e.firstName} ${e.lastName}` : "Nicht zugewiesen";
  };
  const today = appointments.filter((a) => a.start.startsWith(DEMO.today));
  const pending = appointments.filter((a) => a.status === "pending" && a.start >= DEMO.today);
  const confirmedUpcoming = appointments.filter((a) => a.status === "confirmed" && a.start >= DEMO.today);
  const active = employees.filter((e) => e.active);
  const clockedIn = attendance.filter((r) => r.date === DEMO.today && effective(r).clockIn && !effective(r).clockOut);
  const month = DEMO.today.slice(0, 7);
  const workedMonth = active.reduce((s, e) => s + monthTotals(e, attendance, month, DEMO.today).worked, 0);
  const upcomingLeave = leave.filter((l) => l.to >= DEMO.today && l.status !== "abgelehnt").sort((a, b) => a.from.localeCompare(b.from)).slice(0, 4);
  const mockRevenue = appointments.filter((a) => a.status === "completed" && a.start.startsWith(month)).reduce((s, a) => s + (a.priceCents ?? 0), 0);

  return (
    <>
      <PageHeader
        eyebrow={fmtDate(DEMO.today, { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
        title="Guten Morgen."
        description="Der Salon auf einen Blick: heutige Termine, offene Anfragen, Anwesenheit und Abwesenheiten."
        actions={<Link href="/admin/appointments" className={btn("primary")}>Zum Terminkalender</Link>}
      />
      <DemoBanner />

      <div className="grid grid-cols-2 gap-3 md:gap-4 xl:grid-cols-4">
        <Stat label="Termine heute" value={today.filter((a) => !["cancelled", "rejected"].includes(a.status)).length} hint={`${today.filter((a) => a.status === "completed").length} bereits abgeschlossen`} emphasis />
        <Stat label="Offene Anfragen" value={pending.length} hint="warten auf Bestätigung" />
        <Stat label="Bestätigt (kommend)" value={confirmedUpcoming.length} hint="ab heute" />
        <Stat label="Aktive Mitarbeiter" value={active.length} hint={`${clockedIn.length} gerade eingestempelt`} />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <Card
          className="xl:col-span-2"
          title="Heute im Salon"
          description={`${today.length} Termine`}
          action={<Link href="/admin/appointments" className={btn("ghost", "sm")}>Alle anzeigen</Link>}
          padded={false}
        >
          <ul className="divide-y divide-dash-border">
            {today.slice(0, 8).map((a) => (
              <li key={a.id} className="flex items-center gap-4 px-5 py-3">
                <span className="w-12 font-display text-lg tabular-nums">{fmtTime(a.start)}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{a.customerName}</p>
                  <p className="truncate text-xs text-dash-muted">{a.serviceName} · {name(a.employeeId)}</p>
                </div>
                <StatusBadge status={a.status} />
              </li>
            ))}
          </ul>
        </Card>

        <Card title="Anwesenheit jetzt" description="Selbst erfasst durch Mitarbeiter" action={<Link href="/admin/attendance" className={btn("ghost", "sm")}>Details</Link>}>
          <ul className="space-y-3">
            {active.map((e) => {
              const rec = attendance.find((r) => r.employeeId === e.id && r.date === DEMO.today);
              const v = rec ? effective(rec) : null;
              const state = v?.clockIn && !v.clockOut ? "Eingestempelt" : e.schedule["2"] ? "Nicht eingestempelt" : "Frei";
              return (
                <li key={e.id} className="flex items-center gap-3">
                  <Avatar name={`${e.firstName} ${e.lastName}`} size={30} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm">{e.firstName} {e.lastName}</p>
                    <p className="text-xs text-dash-muted">{v?.clockIn ? `seit ${fmtTime(v.clockIn)}` : e.schedule["2"] ? `Schicht ab ${e.schedule["2"]?.start}` : "kein Dienst"}</p>
                  </div>
                  <Badge tone={state === "Eingestempelt" ? "solid" : state === "Frei" ? "muted" : "dashed"}>{state}</Badge>
                </li>
              );
            })}
          </ul>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Card title="Offene Anfragen" action={<Link href="/admin/appointments?status=pending" className={btn("ghost", "sm")}>Bearbeiten</Link>} padded={false}>
          <ul className="divide-y divide-dash-border">
            {pending.slice(0, 5).map((a) => (
              <li key={a.id} className="px-5 py-3">
                <p className="text-sm font-medium">{a.serviceName} · {a.customerName}</p>
                <p className="text-xs text-dash-muted">{fmtDate(a.start)} {fmtTime(a.start)} · {name(a.employeeId)}</p>
              </li>
            ))}
          </ul>
        </Card>
        <Card title="Kommende Abwesenheiten" action={<Link href="/admin/leave" className={btn("ghost", "sm")}>Kalender</Link>} padded={false}>
          <ul className="divide-y divide-dash-border">
            {upcomingLeave.map((l) => (
              <li key={l.id} className="flex items-center justify-between gap-3 px-5 py-3">
                <div>
                  <p className="text-sm font-medium">{name(l.employeeId)}</p>
                  <p className="text-xs text-dash-muted">{LEAVE_LABEL[l.type]} · {fmtDate(l.from)} – {fmtDate(l.to)}</p>
                </div>
                <Badge tone={l.status === "genehmigt" ? "solid" : "dashed"}>{l.status === "genehmigt" ? "Genehmigt" : "Beantragt"}</Badge>
              </li>
            ))}
          </ul>
        </Card>
        <Card title="Monat im Überblick" description="November 2026">
          <dl className="space-y-4">
            <div className="flex items-baseline justify-between">
              <dt className="text-sm text-dash-muted">Gearbeitete Stunden (Team)</dt>
              <dd className="font-display text-2xl tabular-nums">{fmtDuration(workedMonth)}</dd>
            </div>
            <div className="flex items-baseline justify-between">
              <dt className="text-sm text-dash-muted">Umsatz aus Terminen</dt>
              <dd className="font-display text-2xl tabular-nums">{fmtEuro(mockRevenue)}</dd>
            </div>
            <p className="rounded-md border border-dashed border-dash-muted p-3 text-xs leading-relaxed text-dash-muted">
              Umsatzwerte sind <strong className="text-dash-text">Demo-Platzhalter</strong> aus fiktiven Terminen. Echte Umsätze erst nach Anbindung an Kasse/Buchungssystem.
            </p>
          </dl>
        </Card>
      </div>
    </>
  );
}
