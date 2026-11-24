"use client";

import { useState } from "react";
import { ConfirmDialog, Dialog, useToast } from "@/components/dashboard/interactive";
import { Badge, Card, Field, Stat, Table, Td, Th, btn, inputCls, textareaCls } from "@/components/dashboard/ui";
import { fmtDuration, fmtEuro, monthTotals, payrollPreview } from "@/features/dashboard/calc";
import { payrollAdjustment, type AttendanceRecord, type Employee, type PayrollAdjustment, type PayrollProfile } from "@/features/dashboard/domain";

const KIND_LABEL = { bonus: "Bonus", abzug: "Abzug", korrektur: "Korrektur" } as const;

export function PayrollBoard({
  employees, profiles, attendance, initialAdjustments, today, actor,
}: {
  employees: Employee[]; profiles: PayrollProfile[]; attendance: AttendanceRecord[];
  initialAdjustments: PayrollAdjustment[]; today: string; actor: string;
}) {
  const month = today.slice(0, 7);
  const [adjustments, setAdjustments] = useState(initialAdjustments);
  const [adding, setAdding] = useState(false);
  const [rejectId, setRejectId] = useState<string | null>(null);
  const { toast, toastNode } = useToast();

  const rows = employees.map((e) => {
    const p = profiles.find((x) => x.employeeId === e.id)!;
    const t = monthTotals(e, attendance, month, today);
    const adj = adjustments.filter((a) => a.employeeId === e.id && a.month === month);
    return { e, p, t, adj, preview: payrollPreview(p, e, t, adj) };
  });
  const totalGross = rows.reduce((s, r) => s + r.preview.gross, 0);
  const totalHours = rows.reduce((s, r) => s + r.t.worked, 0);
  const pendingCount = adjustments.filter((a) => a.status === "vorgeschlagen").length;
  const name = (id: string) => { const e = employees.find((x) => x.id === id)!; return `${e.firstName} ${e.lastName}`; };

  const exportCsv = () => {
    const header = ["Mitarbeiter", "Art", "Vertrag h/Woche", "Satz/Gehalt EUR", "Ist-Stunden", "Überstunden", "Grund EUR", "Überstunden EUR", "Freigegebene Anpassungen EUR", "Offene Vorschläge EUR", "Brutto-Vorschau EUR"];
    const lines = rows.map(({ e, p, t, preview }) => [
      `${e.firstName} ${e.lastName}`, p.type, e.contractHoursWeek, ((p.hourlyRateCents ?? p.monthlySalaryCents ?? 0) / 100).toFixed(2),
      (t.worked / 60).toFixed(2), (Math.max(0, t.overtime) / 60).toFixed(2), (preview.base / 100).toFixed(2), (preview.overtimePay / 100).toFixed(2),
      (preview.approved / 100).toFixed(2), (preview.pending / 100).toFixed(2), (preview.gross / 100).toFixed(2),
    ]);
    const csv = [header, ...lines].map((l) => l.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(";")).join("\n");
    const url = URL.createObjectURL(new Blob([`﻿# DEMO-DATEN – keine Lohnabrechnung\n${csv}`], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url; a.download = `lohnvorbereitung-${month}-DEMO.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <div role="note" className="mb-6 rounded-lg border border-dash-strong bg-dash-surface p-4 text-sm leading-relaxed">
        <p className="font-semibold">Lohnvorbereitung – keine Lohnabrechnung</p>
        <p className="mt-1 text-dash-muted">
          Diese Übersicht bereitet Daten für Steuerberatung bzw. Lohnbüro vor. Sie berechnet <strong className="text-dash-text">keine Steuern, Sozialabgaben oder Nettobeträge</strong> und ersetzt keine zertifizierte Lohnsoftware.
          Es werden <strong className="text-dash-text">niemals automatisch Abzüge</strong> wegen Verspätung oder Abwesenheit vorgenommen; jeder Abzug braucht Begründung, Freigabe und rechtliche Prüfung.
        </p>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-3 xl:grid-cols-4">
        <Stat label="Brutto-Vorschau gesamt" value={fmtEuro(totalGross)} hint="nur freigegebene Anpassungen" emphasis />
        <Stat label="Erfasste Stunden (Team)" value={fmtDuration(totalHours)} hint="November, bis gestern" />
        <Stat label="Offene Vorschläge" value={pendingCount} hint="warten auf Freigabe" />
        <Stat label="Mitarbeiter" value={rows.length} hint="mit Vergütungsprofil" />
      </div>

      <Card
        title="Monatsübersicht November 2026"
        description="Exportfähiges Layout · Werte sind Demonstrationsdaten"
        action={<div className="flex gap-2 print:hidden"><button type="button" className={btn("secondary", "sm")} onClick={() => window.print()}>Drucken</button><button type="button" className={btn("primary", "sm")} onClick={exportCsv}>CSV exportieren</button></div>}
        className="mb-4"
      >
        <Table label="Lohnvorbereitung">
          <thead><tr><Th>Mitarbeiter</Th><Th>Art</Th><Th>Satz / Gehalt</Th><Th>Ist / Soll</Th><Th>Überstd.</Th><Th className="text-right">Grund</Th><Th className="text-right">Überstd. €</Th><Th className="text-right">Anpassungen</Th><Th className="text-right">Brutto-Vorschau</Th></tr></thead>
          <tbody>
            {rows.map(({ e, p, t, preview }) => (
              <tr key={e.id}>
                <Td className="font-medium">{e.firstName} {e.lastName}<span className="block text-xs font-normal text-dash-muted">{e.contractHoursWeek} h/Woche</span></Td>
                <Td><Badge tone="muted">{p.type === "stundenlohn" ? "Stundenlohn" : "Festgehalt"}</Badge></Td>
                <Td className="tabular-nums">{p.type === "stundenlohn" ? `${fmtEuro(p.hourlyRateCents ?? 0)}/h` : `${fmtEuro(p.monthlySalaryCents ?? 0)}/Monat`}</Td>
                <Td className="tabular-nums">{fmtDuration(t.worked)}<span className="block text-xs text-dash-muted">{fmtDuration(t.scheduled)}</span></Td>
                <Td className="tabular-nums">{fmtDuration(Math.max(0, t.overtime))}</Td>
                <Td className="text-right tabular-nums">{fmtEuro(preview.base)}</Td>
                <Td className="text-right tabular-nums">{fmtEuro(preview.overtimePay)}</Td>
                <Td className="text-right tabular-nums">{fmtEuro(preview.approved)}{preview.pending !== 0 && <span className="block text-xs text-dash-muted">offen {fmtEuro(preview.pending)}</span>}</Td>
                <Td className="text-right font-semibold tabular-nums">{fmtEuro(preview.gross)}</Td>
              </tr>
            ))}
          </tbody>
          <tfoot><tr><Td className="font-semibold" colSpan={8}>Summe Brutto-Vorschau</Td><Td className="text-right font-semibold tabular-nums">{fmtEuro(totalGross)}</Td></tr></tfoot>
        </Table>
      </Card>

      <Card
        title="Anpassungen (Bonus, Abzug, Korrektur)"
        description="Jede Anpassung braucht eine Begründung und eine Freigabe. Erst freigegebene Beträge fließen in die Vorschau ein."
        action={<button type="button" className={btn("primary", "sm")} onClick={() => setAdding(true)}>Anpassung vorschlagen</button>}
        padded={false}
      >
        <ul className="divide-y divide-dash-border">
          {adjustments.map((a) => (
            <li key={a.id} className="flex flex-col gap-3 px-5 py-4 md:flex-row md:items-center">
              <div className="flex-1 text-sm">
                <p className="flex flex-wrap items-center gap-2 font-medium">
                  {name(a.employeeId)} · {KIND_LABEL[a.kind]} <span className="tabular-nums">{fmtEuro(a.amountCents)}</span>
                  <Badge tone={a.status === "freigegeben" ? "solid" : a.status === "abgelehnt" ? "strike" : "dashed"}>{a.status[0].toUpperCase() + a.status.slice(1)}</Badge>
                </p>
                <p className="mt-0.5 text-dash-muted">„{a.reason}“</p>
                <p className="mt-0.5 text-xs text-dash-muted">Vorgeschlagen von {a.proposedBy}{a.reviewedBy && ` · geprüft von ${a.reviewedBy}`}</p>
                {a.kind === "abzug" && a.status === "vorgeschlagen" && (
                  <p className="mt-1 text-xs font-medium">Hinweis: Abzüge vom Lohn nur mit Rechtsgrundlage (z. B. schriftliche Vereinbarung) und nach rechtlicher Prüfung.</p>
                )}
              </div>
              {a.status === "vorgeschlagen" && (
                <div className="flex gap-2">
                  <button type="button" className={btn("secondary", "sm")} onClick={() => setRejectId(a.id)}>Ablehnen</button>
                  <button type="button" className={btn("primary", "sm")} onClick={() => {
                    setAdjustments((list) => list.map((x) => (x.id === a.id ? { ...x, status: "freigegeben", reviewedBy: actor } : x)));
                    toast("Anpassung freigegeben");
                  }}>Freigeben</button>
                </div>
              )}
            </li>
          ))}
        </ul>
      </Card>

      <AdjustmentDialog
        open={adding}
        employees={employees}
        month={month}
        actor={actor}
        onClose={() => setAdding(false)}
        onAdd={(adj) => { setAdjustments((l) => [adj, ...l]); setAdding(false); toast("Vorschlag erstellt – Freigabe erforderlich"); }}
      />
      <ConfirmDialog
        open={!!rejectId}
        onClose={() => setRejectId(null)}
        title="Anpassung ablehnen?"
        confirmLabel="Ablehnen"
        requireReason
        onConfirm={(reason) => {
          setAdjustments((list) => list.map((x) => (x.id === rejectId ? { ...x, status: "abgelehnt", reviewedBy: actor, reason: `${x.reason} — Abgelehnt: ${reason}` } : x)));
          toast("Anpassung abgelehnt");
        }}
      />
      {toastNode}
    </>
  );
}

function AdjustmentDialog({ open, employees, month, actor, onClose, onAdd }: {
  open: boolean; employees: Employee[]; month: string; actor: string; onClose: () => void; onAdd: (a: PayrollAdjustment) => void;
}) {
  const [who, setWho] = useState(employees[0]?.id ?? "");
  const [kind, setKind] = useState<PayrollAdjustment["kind"]>("bonus");
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const submit = () => {
    const euros = Number(amount.replace(",", "."));
    if (!euros || euros <= 0) return setError("Bitte einen positiven Betrag eingeben.");
    const cents = Math.round(euros * 100) * (kind === "abzug" ? -1 : 1);
    const candidate = { id: `p${Date.now()}`, employeeId: who, month, kind, amountCents: cents, reason: reason.trim(), status: "vorgeschlagen" as const, proposedBy: actor, reviewedBy: null };
    const r = payrollAdjustment.safeParse(candidate);
    if (!r.success) return setError(r.error.issues[0].message);
    onAdd(r.data);
    setAmount(""); setReason(""); setError(null);
  };
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Anpassung vorschlagen"
      description="Der Vorschlag wird erst nach Freigabe wirksam."
      footer={<><button type="button" className={btn("secondary")} onClick={onClose}>Abbrechen</button><button type="button" className={btn("primary")} onClick={submit}>Vorschlagen</button></>}
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Mitarbeiter" htmlFor="j-who"><select id="j-who" className={inputCls} value={who} onChange={(e) => setWho(e.target.value)}>{employees.map((e) => <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>)}</select></Field>
          <Field label="Art" htmlFor="j-kind"><select id="j-kind" className={inputCls} value={kind} onChange={(e) => setKind(e.target.value as PayrollAdjustment["kind"])}><option value="bonus">Bonus</option><option value="korrektur">Korrektur (Nachzahlung)</option><option value="abzug">Abzug</option></select></Field>
        </div>
        <Field label="Betrag (EUR)" htmlFor="j-amount"><input id="j-amount" inputMode="decimal" className={inputCls} value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="z. B. 50,00" /></Field>
        {kind === "abzug" && <p className="rounded-md border border-dash-strong p-3 text-xs">Abzüge nur mit nachweisbarer Rechtsgrundlage. Keine automatischen Abzüge wegen Verspätung oder Abwesenheit.</p>}
        <Field label="Begründung (Pflichtfeld)" htmlFor="j-reason" error={error ?? undefined}><textarea id="j-reason" rows={3} className={textareaCls} value={reason} onChange={(e) => { setReason(e.target.value); setError(null); }} /></Field>
      </div>
    </Dialog>
  );
}
