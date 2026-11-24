"use client";

import { useState } from "react";
import { Tabs } from "@/components/dashboard/interactive";
import { Avatar, Badge, Card, Stat, StatusBadge, Table, Td, Th, textareaCls } from "@/components/dashboard/ui";
import {
  FLAG_LABEL, effective, flags, fmtDate, fmtDuration, fmtEuro, fmtTime, monthTotals, payrollPreview, scheduledMinutes, workedMinutes,
} from "@/features/dashboard/calc";
import {
  LEAVE_LABEL, ROLE_LABEL,
  type Appointment, type AttendanceRecord, type Employee, type LeaveRequest, type PayrollAdjustment, type PayrollProfile,
} from "@/features/dashboard/domain";
import { PERMISSION_LABEL, ROLE_PERMISSIONS } from "@/features/dashboard/permissions";

const WEEKDAYS = ["Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag", "Sonntag"];

export function EmployeeProfile({
  employee: e, today, appointments, attendance, leave, payroll, adjustments, services,
}: {
  employee: Employee;
  today: string;
  appointments: Appointment[];
  attendance: AttendanceRecord[];
  leave: LeaveRequest[];
  payroll: PayrollProfile | null;
  adjustments: PayrollAdjustment[];
  services: { id: string; name: string }[];
}) {
  const [tab, setTab] = useState("uebersicht");
  const month = today.slice(0, 7);
  const t = monthTotals(e, attendance, month, today);
  const usedVacation = leave.filter((l) => l.type === "urlaub" && l.status === "genehmigt" && l.from.startsWith("2026")).reduce((s, l) => s + l.days, 0);
  const past = appointments.filter((a) => a.start < today);
  const completed = past.filter((a) => a.status === "completed");
  const noShow = past.filter((a) => a.status === "no_show");
  const preview = payroll ? payrollPreview(payroll, e, t, adjustments.filter((a) => a.month === month)) : null;
  const weekHours = Object.values(e.schedule).reduce((s, d) => {
    if (!d) return s;
    const [sh, sm] = d.start.split(":").map(Number);
    const [eh, em] = d.end.split(":").map(Number);
    return s + (eh * 60 + em - sh * 60 - sm - d.breakMin);
  }, 0);

  return (
    <>
      <header className="mb-6 flex flex-col gap-4 md:flex-row md:items-center">
        <Avatar name={`${e.firstName} ${e.lastName}`} size={64} />
        <div className="flex-1">
          <h1 className="font-display text-3xl md:text-4xl">{e.firstName} {e.lastName}</h1>
          <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-dash-muted">
            {e.position} <Badge tone="outline">{ROLE_LABEL[e.role]}</Badge> {e.active ? <Badge tone="solid">Aktiv</Badge> : <Badge tone="muted">Inaktiv</Badge>}
          </p>
        </div>
      </header>

      <div className="mb-6 grid grid-cols-2 gap-3 xl:grid-cols-4">
        <Stat label="Stunden diesen Monat" value={fmtDuration(t.worked)} hint={`Soll ${fmtDuration(t.scheduled)}`} />
        <Stat label="Über-/Unterstunden" value={`${t.overtime >= 0 ? "+" : ""}${fmtDuration(t.overtime)}`} hint="laut Dienstplan" emphasis={t.overtime > 0} />
        <Stat label="Resturlaub 2026" value={`${e.vacationDaysYear - usedVacation} Tage`} hint={`${usedVacation} von ${e.vacationDaysYear} genommen`} />
        <Stat label="Termine (vergangen)" value={completed.length} hint={`${noShow.length} nicht erschienen`} />
      </div>

      <Tabs
        label="Profilbereiche"
        value={tab}
        onChange={setTab}
        tabs={[
          { id: "uebersicht", label: "Übersicht" },
          { id: "dienstplan", label: "Dienstplan" },
          { id: "zeit", label: "Zeiterfassung", count: t.incomplete || undefined },
          { id: "abwesenheit", label: "Abwesenheiten" },
          { id: "leistung", label: "Leistung" },
          { id: "verguetung", label: "Vergütung" },
          { id: "notizen", label: "Notizen" },
        ]}
      />

      <div className="mt-6" role="tabpanel">
        {tab === "uebersicht" && (
          <div className="grid gap-4 lg:grid-cols-3">
            <Card title="Persönliche & berufliche Daten">
              <dl className="space-y-3 text-sm">
                {[
                  ["E-Mail", e.email], ["Telefon", e.phone], ["Position", e.position],
                  ["Beschäftigt seit", fmtDate(e.employmentStart, { day: "numeric", month: "long", year: "numeric" })],
                  ["Vertrag", `${e.contractHoursWeek} Stunden/Woche`], ["Bereiche", e.audiences.map((a) => a[0].toUpperCase() + a.slice(1)).join(", ")],
                ].map(([k, v]) => (
                  <div key={k}><dt className="text-xs text-dash-muted">{k}</dt><dd>{v}</dd></div>
                ))}
              </dl>
            </Card>
            <Card title="Rolle & Berechtigungen" description="Durchgesetzt später serverseitig (Auth + RLS)">
              <ul className="space-y-2 text-sm">
                {[...ROLE_PERMISSIONS[e.role]].map((p) => (
                  <li key={p} className="flex gap-2"><span aria-hidden="true">✓</span><span>{PERMISSION_LABEL[p]}</span></li>
                ))}
              </ul>
            </Card>
            <Card title="Zugewiesene Leistungen">
              <ul className="flex flex-wrap gap-2">
                {services.map((s) => (
                  <li key={s.id}><Badge tone={e.serviceIds.includes(s.id) ? "solid" : "muted"}>{s.name}</Badge></li>
                ))}
              </ul>
              <p className="mt-4 text-xs text-dash-muted">Gefüllt = bucht diese Leistung. Pflege später über Website → Leistungen.</p>
            </Card>
          </div>
        )}

        {tab === "dienstplan" && (
          <Card title="Wöchentlicher Dienstplan" description={`Geplant: ${fmtDuration(weekHours)} pro Woche · Vertrag ${e.contractHoursWeek}:00 h`}>
            <ul className="divide-y divide-dash-border">
              {WEEKDAYS.map((d, i) => {
                const s = e.schedule[String(i + 1)];
                return (
                  <li key={d} className="flex items-center justify-between py-3 text-sm">
                    <span className="w-28 font-medium">{d}</span>
                    {s ? (
                      <span className="flex-1 tabular-nums">{s.start} – {s.end} Uhr <span className="text-dash-muted">· Pause {s.breakMin} Min.</span></span>
                    ) : <span className="flex-1 text-dash-muted">Frei</span>}
                    {s && <div className="hidden h-2 flex-1 overflow-hidden rounded-full bg-dash-subtle md:block"><div className="h-full rounded-full bg-dash-strong" style={{ marginLeft: `${((Number(s.start.slice(0, 2)) - 8) / 12) * 100}%`, width: `${((Number(s.end.slice(0, 2)) - Number(s.start.slice(0, 2))) / 12) * 100}%` }} /></div>}
                  </li>
                );
              })}
            </ul>
          </Card>
        )}

        {tab === "zeit" && (
          <Card title="Zeiterfassung" description="Ein- und Ausstempeln durch die Mitarbeiterin selbst · Korrekturen über Zeiterfassung (Admin)">
            <Table label="Zeiteinträge">
              <thead><tr><Th>Datum</Th><Th>Kommen</Th><Th>Gehen</Th><Th>Pause</Th><Th>Ist</Th><Th>Soll</Th><Th>Hinweise</Th></tr></thead>
              <tbody>
                {attendance.slice(0, 22).map((r) => {
                  const v = effective(r);
                  const w = workedMinutes(v);
                  return (
                    <tr key={r.id}>
                      <Td className="whitespace-nowrap">{fmtDate(r.date)}</Td>
                      <Td className="tabular-nums">{fmtTime(v.clockIn)}</Td>
                      <Td className="tabular-nums">{fmtTime(v.clockOut)}</Td>
                      <Td className="tabular-nums">{v.breakMin} Min.</Td>
                      <Td className="tabular-nums">{w !== null ? fmtDuration(w) : "—"}</Td>
                      <Td className="tabular-nums text-dash-muted">{fmtDuration(scheduledMinutes(e, r.date))}</Td>
                      <Td><span className="flex flex-wrap gap-1">{flags(r, e, today).map((f) => <Badge key={f} tone={f === "fehlendes-ausstempeln" ? "solid" : "dashed"}>{FLAG_LABEL[f]}</Badge>)}</span></Td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </Card>
        )}

        {tab === "abwesenheit" && (
          <Card title="Abwesenheiten & Urlaub" description={`Urlaubsanspruch ${e.vacationDaysYear} Tage · Rest ${e.vacationDaysYear - usedVacation} Tage`}>
            <ul className="divide-y divide-dash-border">
              {leave.length === 0 && <li className="py-3 text-sm text-dash-muted">Keine Einträge.</li>}
              {leave.map((l) => (
                <li key={l.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                  <span><span className="font-medium">{LEAVE_LABEL[l.type]}</span> · {fmtDate(l.from)} – {fmtDate(l.to)} · {l.days} Tag(e){l.note && <span className="block text-xs text-dash-muted">{l.note}</span>}</span>
                  <Badge tone={l.status === "genehmigt" ? "solid" : l.status === "abgelehnt" ? "strike" : "dashed"}>{l.status[0].toUpperCase() + l.status.slice(1)}</Badge>
                </li>
              ))}
            </ul>
          </Card>
        )}

        {tab === "leistung" && (
          <div className="grid gap-4 lg:grid-cols-3">
            <Card title="Kennzahlen (vergangene 14 Tage, Demo)">
              <dl className="space-y-3 text-sm">
                <div className="flex justify-between"><dt className="text-dash-muted">Abgeschlossen</dt><dd className="tabular-nums">{completed.length}</dd></div>
                <div className="flex justify-between"><dt className="text-dash-muted">Nicht erschienen</dt><dd className="tabular-nums">{noShow.length}</dd></div>
                <div className="flex justify-between"><dt className="text-dash-muted">No-Show-Quote</dt><dd className="tabular-nums">{past.length ? Math.round((noShow.length / past.length) * 100) : 0} %</dd></div>
                <div className="flex justify-between"><dt className="text-dash-muted">Umsatz (Demo)</dt><dd className="tabular-nums">{fmtEuro(completed.reduce((s, a) => s + (a.priceCents ?? 0), 0))}</dd></div>
              </dl>
            </Card>
            <Card title="Letzte Termine" className="lg:col-span-2">
              <ul className="divide-y divide-dash-border">
                {past.slice(-8).reverse().map((a) => (
                  <li key={a.id} className="flex items-center justify-between py-2.5 text-sm">
                    <span>{fmtDate(a.start)} {fmtTime(a.start)} · {a.serviceName} · {a.customerName}</span>
                    <StatusBadge status={a.status} />
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        )}

        {tab === "verguetung" && (
          <Card title="Vergütung (Vorschau November)" description="Nur für berechtigte Rollen sichtbar · keine Lohnabrechnung">
            {payroll && preview ? (
              <div className="grid gap-6 md:grid-cols-2">
                <dl className="space-y-3 text-sm">
                  <div className="flex justify-between"><dt className="text-dash-muted">Vergütungsart</dt><dd>{payroll.type === "stundenlohn" ? "Stundenlohn" : "Festgehalt"}</dd></div>
                  <div className="flex justify-between"><dt className="text-dash-muted">{payroll.type === "stundenlohn" ? "Stundensatz" : "Monatsgehalt"}</dt><dd className="tabular-nums">{fmtEuro(payroll.hourlyRateCents ?? payroll.monthlySalaryCents ?? 0)}</dd></div>
                  <div className="flex justify-between"><dt className="text-dash-muted">Erfasste Stunden</dt><dd className="tabular-nums">{fmtDuration(t.worked)}</dd></div>
                  <div className="flex justify-between"><dt className="text-dash-muted">Überstunden</dt><dd className="tabular-nums">{fmtDuration(Math.max(0, t.overtime))}</dd></div>
                </dl>
                <dl className="space-y-3 rounded-lg bg-dash-raised p-4 text-sm">
                  <div className="flex justify-between"><dt>Grundvergütung</dt><dd className="tabular-nums">{fmtEuro(preview.base)}</dd></div>
                  <div className="flex justify-between"><dt>Überstunden</dt><dd className="tabular-nums">{fmtEuro(preview.overtimePay)}</dd></div>
                  <div className="flex justify-between"><dt>Freigegebene Anpassungen</dt><dd className="tabular-nums">{fmtEuro(preview.approved)}</dd></div>
                  <div className="flex justify-between border-t border-dash-border pt-3 font-semibold"><dt>Brutto-Vorschau</dt><dd className="tabular-nums">{fmtEuro(preview.gross)}</dd></div>
                  {preview.pending !== 0 && <p className="text-xs text-dash-muted">Nicht enthalten: offene Vorschläge {fmtEuro(preview.pending)} (Freigabe erforderlich).</p>}
                </dl>
              </div>
            ) : <p className="text-sm text-dash-muted">Kein Vergütungsprofil hinterlegt.</p>}
          </Card>
        )}

        {tab === "notizen" && (
          <Card title="Administrative Notizen" description="Nur für Admins sichtbar, nicht für die Mitarbeiterin">
            <label htmlFor="notes" className="sr-only">Notizen</label>
            <textarea id="notes" rows={6} defaultValue={e.notes} className={textareaCls} placeholder="Keine Notizen" />
            <p className="mt-2 text-xs text-dash-muted">Speichern verfügbar nach Anbindung (Phase 5B).</p>
          </Card>
        )}
      </div>
    </>
  );
}
