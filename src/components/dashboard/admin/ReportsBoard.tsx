"use client";

import { useState } from "react";
import { downloadCsv, printAsPdf } from "@/components/dashboard/export";
import { Segmented, useToast } from "@/components/dashboard/interactive";
import { Avatar, Badge, Card, Field, Stat, Table, Td, Th, btn, inputCls } from "@/components/dashboard/ui";
import { fmtDate, fmtDuration, fmtEuro } from "@/features/dashboard/calc";
import type { Appointment, AttendanceRecord, CommissionRule, Employee } from "@/features/dashboard/domain";
import { employeeReport, inPeriod, periodFor, plannedValueCents, type Period, type PeriodKind } from "@/features/dashboard/metrics";

export function ReportsBoard({ appointments, attendance, employees, rules, today, canCommission }: {
  appointments: Appointment[];
  attendance: AttendanceRecord[];
  employees: Employee[];
  rules: CommissionRule[];
  today: string;
  canCommission: boolean;
}) {
  const [kind, setKind] = useState<PeriodKind>("monat");
  const [custom, setCustom] = useState<Period>({ from: `${today.slice(0, 7)}-01`, to: today });
  const [who, setWho] = useState("alle");
  const [commission, setCommission] = useState(rules);
  const { toast, toastNode } = useToast();

  const period: Period = kind === "individuell" ? (custom.from <= custom.to ? custom : { from: custom.to, to: custom.from }) : periodFor(kind, today);
  const staff = employees.filter((e) => e.role === "staff" && (who === "alle" || e.id === who));
  const reports = staff.map((e) => employeeReport(e, appointments, attendance, period, today, commission.find((r) => r.employeeId === e.id)));
  const sum = (k: "completed" | "noShow" | "cancelled" | "workedMin" | "scheduledMin" | "estimatedRevenueCents") => reports.reduce((s, r) => s + r[k], 0);
  const inScope = appointments.filter((a) => inPeriod(a.start, period) && (who === "alle" || a.employeeId === who));
  const planned = plannedValueCents(inScope, period, today);
  const anyCommission = commission.some((c) => c.enabled);
  const label = `${fmtDate(period.from)} – ${fmtDate(period.to)}`;
  const empName = (id: string) => { const e = employees.find((x) => x.id === id)!; return `${e.firstName} ${e.lastName}`; };

  function exportCsv() {
    downloadCsv(`mitarbeiterbericht-${period.from}_${period.to}-DEMO.csv`,
      ["Mitarbeiter", "Abgeschlossen", "Storniert/abgelehnt", "Nicht erschienen", "Ist-Stunden", "Soll-Stunden", "Geschätzter Terminwert (EUR)", ...(anyCommission ? ["Provision Vorschau (EUR)"] : [])],
      reports.map((r) => [empName(r.employeeId), r.completed, r.cancelled, r.noShow, fmtDuration(r.workedMin), fmtDuration(r.scheduledMin), (r.estimatedRevenueCents / 100).toFixed(2).replace(".", ","), ...(anyCommission ? [r.commissionCents === null ? "" : (r.commissionCents / 100).toFixed(2).replace(".", ",")] : [])]),
      `DEMO-DATEN – Zeitraum ${label}. Terminwert = Katalogpreise, kein tatsächlicher Umsatz.`);
    toast("CSV erstellt (Demo-Daten).");
  }

  return (
    <>
      <Card className="mb-4 print:hidden">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div className="flex flex-col gap-3 md:flex-row md:items-end">
            <div>
              <p className="mb-1.5 text-xs font-medium">Zeitraum</p>
              <Segmented<PeriodKind> label="Zeitraum" value={kind} onChange={setKind} options={[
                { id: "tag", label: "Tag" }, { id: "woche", label: "Woche" }, { id: "monat", label: "Monat" }, { id: "individuell", label: "Individuell" },
              ]} />
            </div>
            {kind === "individuell" && (
              <div className="grid grid-cols-2 gap-2">
                <Field label="Von" htmlFor="r-from"><input id="r-from" type="date" className={inputCls} value={custom.from} onChange={(e) => setCustom((c) => ({ ...c, from: e.target.value }))} /></Field>
                <Field label="Bis" htmlFor="r-to"><input id="r-to" type="date" className={inputCls} value={custom.to} onChange={(e) => setCustom((c) => ({ ...c, to: e.target.value }))} /></Field>
              </div>
            )}
            <Field label="Mitarbeiter" htmlFor="r-who">
              <select id="r-who" className={inputCls} value={who} onChange={(e) => setWho(e.target.value)}>
                <option value="alle">Alle Mitarbeiter</option>
                {employees.filter((e) => e.role === "staff").map((e) => <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>)}
              </select>
            </Field>
          </div>
          <div className="flex gap-2">
            <button type="button" className={btn("secondary", "sm")} onClick={printAsPdf}>PDF / Drucken</button>
            <button type="button" className={btn("primary", "sm")} onClick={exportCsv}>CSV exportieren</button>
          </div>
        </div>
      </Card>

      <p className="mb-3 text-sm text-dash-muted">Zeitraum: <strong className="text-dash-text">{label}</strong></p>
      <div className="grid grid-cols-2 gap-3 md:gap-4 xl:grid-cols-4">
        <Stat label="Abgeschlossene Termine" value={sum("completed")} hint="Status „Abgeschlossen“" emphasis />
        <Stat label="Stornos & Ablehnungen" value={sum("cancelled")} hint={`${sum("noShow")} nicht erschienen`} />
        <Stat label="Gearbeitete Stunden" value={fmtDuration(sum("workedMin"))} hint={`Soll ${fmtDuration(sum("scheduledMin"))} · nur abgeschlossene Tage`} />
        <Stat label="Geschätzter Terminwert" value={fmtEuro(sum("estimatedRevenueCents"))} hint="Katalogpreise abgeschlossener Termine" />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2" title="Leistung je Mitarbeiter" padded>
          <Table label="Mitarbeiterbericht">
            <thead><tr><Th>Mitarbeiter</Th><Th className="text-right">Abgeschl.</Th><Th className="text-right">Storno</Th><Th className="text-right">Nicht ersch.</Th><Th className="text-right">Ist / Soll</Th><Th className="text-right">Terminwert (geschätzt)</Th>{anyCommission && <Th className="text-right">Provision (Vorschau)</Th>}</tr></thead>
            <tbody>
              {reports.map((r) => (
                <tr key={r.employeeId}>
                  <Td><span className="flex items-center gap-2.5"><Avatar name={empName(r.employeeId)} size={28} />{empName(r.employeeId)}</span></Td>
                  <Td className="text-right tabular-nums">{r.completed}</Td>
                  <Td className="text-right tabular-nums">{r.cancelled}</Td>
                  <Td className="text-right tabular-nums">{r.noShow}</Td>
                  <Td className="text-right tabular-nums">{fmtDuration(r.workedMin)}<span className="block text-xs text-dash-muted">{fmtDuration(r.scheduledMin)}</span></Td>
                  <Td className="text-right tabular-nums">{fmtEuro(r.estimatedRevenueCents)}</Td>
                  {anyCommission && <Td className="text-right tabular-nums">{r.commissionCents === null ? "–" : fmtEuro(r.commissionCents)}</Td>}
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>

        <Card title="Umsatz – klar getrennt">
          <dl className="space-y-4 text-sm">
            <div className="flex items-baseline justify-between gap-3"><dt className="text-dash-muted">Geschätzter Terminwert (abgeschlossen)</dt><dd className="font-display text-xl tabular-nums">{fmtEuro(sum("estimatedRevenueCents"))}</dd></div>
            <div className="flex items-baseline justify-between gap-3"><dt className="text-dash-muted">Geplanter Wert (kommende Termine)</dt><dd className="font-display text-xl tabular-nums">{fmtEuro(planned)}</dd></div>
            <div className="flex items-baseline justify-between gap-3 border-t border-dash-border pt-4"><dt className="font-medium">Tatsächlich kassiert</dt><dd><Badge tone="dashed">Backend erforderlich</Badge></dd></div>
          </dl>
          <p className="mt-4 text-xs leading-relaxed text-dash-muted">Tatsächliche Einnahmen kommen ausschließlich aus einer angebundenen Kasse (TSE/KassenSichV). Bis dahin werden keine Umsätze erfunden – Schätzwerte basieren auf Katalogpreisen.</p>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-2">
        <Card title="Kennzahlen – Definitionen" description="Gilt einheitlich für Übersicht, Badges und Berichte.">
          <dl className="space-y-3 text-sm">
            {[
              ["Termine heute", "Termine mit heutigem Datum, ohne storniert/abgelehnt (inkl. ausstehend, bestätigt, abgeschlossen, nicht erschienen)."],
              ["Offene Terminanfragen", "Status „Ausstehend“ mit Datum ab heute. Identisch mit dem Badge bei „Termine“."],
              ["Rückrufwünsche offen", "Terminanfragen mit Status Neu, In Bearbeitung oder Nicht erreicht."],
              ["Abgeschlossen", "Status „Abgeschlossen“ im Zeitraum, dem Mitarbeiter zugeordnet."],
              ["Stornos", "Storniert + abgelehnt im Zeitraum. „Nicht erschienen“ separat."],
              ["Gearbeitete Stunden", "Wirksame Zeiten (inkl. Korrekturen) abzüglich Pause, nur abgeschlossene Tage vor heute."],
              ["Geschätzter Terminwert", "Summe der Katalogpreise abgeschlossener Termine – kein Umsatz."],
            ].map(([t, d]) => <div key={t}><dt className="font-medium">{t}</dt><dd className="text-dash-muted">{d}</dd></div>)}
          </dl>
        </Card>

        <Card title="Provision (optional)" description="Standardmäßig deaktiviert. Nur Vorschau – keine automatische Auszahlung oder Lohnänderung.">
          {!canCommission ? <p className="text-sm text-dash-muted">Nur der Super-Admin kann Provisionsregeln festlegen.</p> : null}
          <ul className="divide-y divide-dash-border">
            {commission.map((c) => (
              <li key={c.employeeId} className="flex flex-wrap items-center gap-3 py-3 text-sm">
                <span className="flex-1">{empName(c.employeeId)}</span>
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="h-4 w-4 accent-current" checked={c.enabled} disabled={!canCommission}
                    onChange={(e) => setCommission((list) => list.map((x) => x.employeeId === c.employeeId ? { ...x, enabled: e.target.checked, percent: x.percent || 10 } : x))} />
                  aktiv
                </label>
                <label className="flex items-center gap-2">
                  <span className="sr-only">Prozent für {empName(c.employeeId)}</span>
                  <input type="number" min={0} max={50} step={1} className={inputCls + " w-20"} disabled={!canCommission || !c.enabled} value={c.percent}
                    onChange={(e) => setCommission((list) => list.map((x) => x.employeeId === c.employeeId ? { ...x, percent: Math.min(50, Math.max(0, Number(e.target.value) || 0)) } : x))} />
                  %
                </label>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-dash-muted">Basis: geschätzter Terminwert abgeschlossener Termine. Demo – Einstellungen werden nicht gespeichert. Provisionen sind arbeitsvertraglich zu regeln.</p>
        </Card>
      </div>
      {toastNode}
    </>
  );
}
