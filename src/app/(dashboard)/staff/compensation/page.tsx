import { Card, DemoBanner, PageHeader, Stat } from "@/components/dashboard/ui";
import { fmtDuration, fmtEuro, monthTotals, payrollPreview } from "@/features/dashboard/calc";
import { can } from "@/features/dashboard/permissions";
import { DEMO, DEMO_STAFF_ID, getEmployee, getOwnPayroll, listAttendanceForEmployee } from "@/features/dashboard/repository";

/** Only the employee's OWN figures; another employee's pay is never loaded here. */
export default async function StaffCompensationPage() {
  const me = (await getEmployee(DEMO_STAFF_ID))!;
  if (!can(me.role, "payroll.view_own")) {
    return <PageHeader title="Vergütung" description="Diese Ansicht ist für dich nicht freigeschaltet." />;
  }
  const [{ profile, adjustments }, attendance] = await Promise.all([getOwnPayroll(me.id), listAttendanceForEmployee(me.id)]);
  const month = DEMO.today.slice(0, 7);
  const t = monthTotals(me, attendance, month, DEMO.today);
  const p = profile ? payrollPreview(profile, me, t, adjustments.filter((a) => a.month === month)) : null;
  return (
    <>
      <PageHeader eyebrow="Mein Bereich · vertraulich" title="Meine Vergütung" description="Persönliche Übersicht – nur deine eigenen Werte." />
      <DemoBanner>Demo-Werte. Verbindlich ist ausschließlich deine Lohnabrechnung vom Lohnbüro bzw. der Steuerberatung.</DemoBanner>
      {profile && p ? (
        <>
          <div className="mb-4 grid grid-cols-2 gap-3 xl:grid-cols-4">
            <Stat label="Brutto-Vorschau November" value={fmtEuro(p.gross)} emphasis />
            <Stat label="Erfasste Stunden" value={fmtDuration(t.worked)} hint={`Soll ${fmtDuration(t.scheduled)}`} />
            <Stat label="Überstunden" value={fmtDuration(Math.max(0, t.overtime))} />
            <Stat
              label="Vergütungsart"
              value={profile.type === "stundenlohn" ? "Stundenlohn" : "Festgehalt"}
              hint={profile.type === "stundenlohn" ? `${fmtEuro(profile.hourlyRateCents ?? 0)}/h` : `${fmtEuro(profile.monthlySalaryCents ?? 0)}/Monat`}
            />
          </div>
          <Card title="Zusammensetzung (Vorschau)">
            <dl className="max-w-md space-y-3 text-sm">
              <div className="flex justify-between"><dt>Grundvergütung</dt><dd className="tabular-nums">{fmtEuro(p.base)}</dd></div>
              <div className="flex justify-between"><dt>Überstunden</dt><dd className="tabular-nums">{fmtEuro(p.overtimePay)}</dd></div>
              <div className="flex justify-between"><dt>Freigegebene Anpassungen</dt><dd className="tabular-nums">{fmtEuro(p.approved)}</dd></div>
              <div className="flex justify-between border-t border-dash-border pt-3 font-semibold"><dt>Brutto-Vorschau</dt><dd className="tabular-nums">{fmtEuro(p.gross)}</dd></div>
            </dl>
            <p className="mt-4 text-xs text-dash-muted">Ohne Steuern und Sozialabgaben. Keine Netto-Berechnung.</p>
          </Card>
        </>
      ) : <Card><p className="text-sm text-dash-muted">Kein Vergütungsprofil hinterlegt.</p></Card>}
    </>
  );
}
