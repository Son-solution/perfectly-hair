"use client";

import { useState } from "react";
import { ConfirmDialog, Tabs, useToast } from "@/components/dashboard/interactive";
import { Avatar, Badge, Card, EmptyState, btn } from "@/components/dashboard/ui";
import { fmtDate } from "@/features/dashboard/calc";
import { LEAVE_LABEL, type Employee, type LeaveRequest } from "@/features/dashboard/domain";
import { cn } from "@/lib/utils";

const addDays = (date: string, n: number) => { const d = new Date(`${date}T12:00:00Z`); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };

export function LeaveBoard({ initial, employees, today, actor }: { initial: LeaveRequest[]; employees: Employee[]; today: string; actor: string }) {
  const [items, setItems] = useState(initial);
  const [tab, setTab] = useState("offen");
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [monthStart, setMonthStart] = useState("2026-12-01");
  const { toast, toastNode } = useToast();
  const name = (id: string) => { const e = employees.find((x) => x.id === id)!; return `${e.firstName} ${e.lastName}`; };

  const shown = items.filter((l) => (tab === "offen" ? l.status === "beantragt" : tab === "genehmigt" ? l.status === "genehmigt" : l.status === "abgelehnt"));
  const used = (id: string) => items.filter((l) => l.employeeId === id && l.type === "urlaub" && l.status === "genehmigt" && l.from.startsWith("2026")).reduce((s, l) => s + l.days, 0);
  const planned = (id: string) => items.filter((l) => l.employeeId === id && l.type === "urlaub" && l.status === "beantragt" && l.from.startsWith("2026")).reduce((s, l) => s + l.days, 0);

  // Month calendar
  const days: string[] = [];
  for (let d = monthStart; d.slice(0, 7) === monthStart.slice(0, 7); d = addDays(d, 1)) days.push(d);
  const shiftMonth = (n: number) => { const d = new Date(`${monthStart}T12:00:00Z`); d.setUTCMonth(d.getUTCMonth() + n); setMonthStart(d.toISOString().slice(0, 10)); };

  return (
    <>
      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2" padded={false}>
          <div className="px-5 pt-3">
            <Tabs label="Anträge" value={tab} onChange={setTab} tabs={[
              { id: "offen", label: "Offen", count: items.filter((l) => l.status === "beantragt").length },
              { id: "genehmigt", label: "Genehmigt" }, { id: "abgelehnt", label: "Abgelehnt" },
            ]} />
          </div>
          {shown.length === 0 ? <div className="p-5"><EmptyState title="Keine Anträge in dieser Ansicht" /></div> : (
            <ul className="divide-y divide-dash-border">
              {shown.map((l) => (
                <li key={l.id} className="flex flex-col gap-3 px-5 py-4 md:flex-row md:items-center">
                  <Avatar name={name(l.employeeId)} size={34} />
                  <div className="flex-1 text-sm">
                    <p className="font-medium">{name(l.employeeId)} · {LEAVE_LABEL[l.type]}</p>
                    <p className="text-dash-muted">{fmtDate(l.from, { weekday: "short", day: "numeric", month: "short" })} – {fmtDate(l.to, { weekday: "short", day: "numeric", month: "short", year: "numeric" })} · {l.days} Arbeitstag(e)</p>
                    {l.note && <p className="mt-0.5 text-xs text-dash-muted">„{l.note}“</p>}
                    {l.decidedBy && <p className="mt-0.5 text-xs text-dash-muted">Entschieden von {l.decidedBy}</p>}
                  </div>
                  {l.status === "beantragt" ? (
                    <div className="flex gap-2">
                      <button type="button" className={btn("secondary", "sm")} onClick={() => setRejectId(l.id)}>Ablehnen</button>
                      <button type="button" className={btn("primary", "sm")} onClick={() => { setItems((list) => list.map((x) => (x.id === l.id ? { ...x, status: "genehmigt", decidedBy: actor } : x))); toast("Antrag genehmigt"); }}>Genehmigen</button>
                    </div>
                  ) : <Badge tone={l.status === "genehmigt" ? "solid" : "strike"}>{l.status === "genehmigt" ? "Genehmigt" : "Abgelehnt"}</Badge>}
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card title="Urlaubskonto 2026" description="Anspruch · genommen · beantragt">
          <ul className="space-y-4">
            {employees.map((e) => {
              const u = used(e.id), p = planned(e.id);
              return (
                <li key={e.id}>
                  <p className="flex justify-between text-sm"><span>{e.firstName} {e.lastName}</span><span className="tabular-nums text-dash-muted">Rest <strong className="text-dash-text">{e.vacationDaysYear - u}</strong> / {e.vacationDaysYear}</span></p>
                  <div className="mt-1.5 flex h-2 overflow-hidden rounded-full bg-dash-subtle" aria-hidden="true">
                    <div className="bg-dash-strong" style={{ width: `${(u / e.vacationDaysYear) * 100}%` }} />
                    <div className="bg-dash-muted opacity-50" style={{ width: `${(p / e.vacationDaysYear) * 100}%` }} />
                  </div>
                </li>
              );
            })}
          </ul>
          <p className="mt-4 text-xs text-dash-muted">Schwarz = genommen · Grau = beantragt</p>
        </Card>
      </div>

      <Card
        className="mt-4"
        title="Abwesenheitskalender"
        description={fmtDate(monthStart, { month: "long", year: "numeric" })}
        action={<div className="flex gap-1"><button type="button" className={btn("secondary", "sm")} onClick={() => shiftMonth(-1)} aria-label="Vorheriger Monat">‹</button><button type="button" className={btn("secondary", "sm")} onClick={() => shiftMonth(1)} aria-label="Nächster Monat">›</button></div>}
      >
        <div className="-mx-5 overflow-x-auto px-5">
          <table className="w-full min-w-[900px] border-collapse text-[0.6875rem]" aria-label="Abwesenheitskalender">
            <thead>
              <tr>
                <th scope="col" className="w-40 py-2 text-left font-medium text-dash-muted">Mitarbeiter</th>
                {days.map((d) => {
                  const wd = new Date(`${d}T12:00:00Z`).getUTCDay();
                  return <th key={d} scope="col" className={cn("w-7 py-2 text-center font-medium tabular-nums", (wd === 0 || wd === 1) ? "text-dash-muted opacity-50" : "text-dash-muted", d === today && "text-dash-text")}>{Number(d.slice(8))}</th>;
                })}
              </tr>
            </thead>
            <tbody>
              {employees.map((e) => (
                <tr key={e.id} className="border-t border-dash-border">
                  <th scope="row" className="py-2 text-left text-xs font-normal">{e.firstName} {e.lastName}</th>
                  {days.map((d) => {
                    const l = items.find((x) => x.employeeId === e.id && x.status !== "abgelehnt" && d >= x.from && d <= x.to);
                    const wd = new Date(`${d}T12:00:00Z`).getUTCDay();
                    return (
                      <td key={d} className="p-0.5" title={l ? `${LEAVE_LABEL[l.type]} (${l.status})` : undefined}>
                        <div className={cn("h-6 rounded-sm", l ? (l.status === "genehmigt" ? (l.type === "krank" ? "bg-dash-muted" : "bg-dash-strong") : "border border-dashed border-dash-strong") : (wd === 0 || wd === 1) ? "bg-dash-subtle opacity-40" : "bg-dash-subtle")} />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 flex flex-wrap gap-4 text-xs text-dash-muted">
          <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-sm bg-dash-strong" /> Urlaub genehmigt</span>
          <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-sm bg-dash-muted" /> Krankheit</span>
          <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-sm border border-dashed border-dash-strong" /> Beantragt</span>
          <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-sm bg-dash-subtle opacity-40" /> Salon geschlossen (So/Mo)</span>
        </p>
      </Card>

      <ConfirmDialog
        open={!!rejectId}
        onClose={() => setRejectId(null)}
        title="Antrag ablehnen?"
        confirmLabel="Ablehnen"
        requireReason
        onConfirm={(reason) => { setItems((list) => list.map((x) => (x.id === rejectId ? { ...x, status: "abgelehnt", decidedBy: actor, note: `${x.note ? `${x.note} — ` : ""}Abgelehnt: ${reason}` } : x))); toast("Antrag abgelehnt"); }}
      />
      {toastNode}
    </>
  );
}
