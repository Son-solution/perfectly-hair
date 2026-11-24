"use client";

import { useState } from "react";
import { useToast } from "@/components/dashboard/interactive";
import { Badge, Card, Field, Stat, btn, inputCls, textareaCls } from "@/components/dashboard/ui";
import { fmtDate } from "@/features/dashboard/calc";
import { LEAVE_LABEL, type LeaveRequest } from "@/features/dashboard/domain";

export function MyLeave({ initial, entitlement, today, employeeId }: { initial: LeaveRequest[]; entitlement: number; today: string; employeeId: string }) {
  const [items, setItems] = useState(initial);
  const [type, setType] = useState<"urlaub" | "sonstiges">("urlaub");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { toast, toastNode } = useToast();

  const used = items.filter((l) => l.type === "urlaub" && l.status === "genehmigt" && l.from.startsWith("2026")).reduce((s, l) => s + l.days, 0);
  const pending = items.filter((l) => l.type === "urlaub" && l.status === "beantragt").reduce((s, l) => s + l.days, 0);

  const submit = () => {
    if (!from || !to) return setError("Bitte Zeitraum angeben.");
    if (to < from) return setError("Das Ende muss nach dem Beginn liegen.");
    if (from < today) return setError("Urlaub kann nicht rückwirkend beantragt werden.");
    let days = 0;
    for (let d = new Date(`${from}T12:00:00Z`); d <= new Date(`${to}T12:00:00Z`); d.setUTCDate(d.getUTCDate() + 1)) {
      const wd = d.getUTCDay();
      if (wd !== 0 && wd !== 1) days++; // salon closed Sunday + Monday
    }
    setItems((l) => [{ id: `l${Date.now()}`, employeeId, type, from, to, days, status: "beantragt", note: note || null, decidedBy: null }, ...l]);
    setFrom(""); setTo(""); setNote(""); setError(null);
    toast(`Antrag über ${days} Arbeitstag(e) gesendet`);
  };

  return (
    <>
      <div className="mb-4 grid grid-cols-3 gap-3">
        <Stat label="Resturlaub" value={entitlement - used} hint={`von ${entitlement} Tagen`} emphasis />
        <Stat label="Genommen" value={used} hint="2026" />
        <Stat label="Beantragt" value={pending} hint="in Prüfung" />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Urlaub beantragen" action={<button type="button" className={btn("primary", "sm")} onClick={submit}>Antrag senden</button>}>
          <div className="space-y-4">
            <Field label="Art" htmlFor="v-type">
              <select id="v-type" className={inputCls} value={type} onChange={(e) => setType(e.target.value as "urlaub" | "sonstiges")}>
                <option value="urlaub">Urlaub</option><option value="sonstiges">Sonstige Abwesenheit</option>
              </select>
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Von" htmlFor="v-from"><input id="v-from" type="date" min={today} className={inputCls} value={from} onChange={(e) => { setFrom(e.target.value); setError(null); }} /></Field>
              <Field label="Bis" htmlFor="v-to"><input id="v-to" type="date" min={from || today} className={inputCls} value={to} onChange={(e) => { setTo(e.target.value); setError(null); }} /></Field>
            </div>
            <Field label="Notiz (optional)" htmlFor="v-note" error={error ?? undefined}><textarea id="v-note" rows={2} className={textareaCls} value={note} onChange={(e) => setNote(e.target.value)} /></Field>
            <p className="text-xs text-dash-muted">Krankmeldungen bitte direkt an die Salonleitung. Sonntag und Montag zählen nicht als Urlaubstage (geschlossen).</p>
          </div>
        </Card>
        <Card title="Meine Anträge" padded={false}>
          <ul className="divide-y divide-dash-border">
            {items.map((l) => (
              <li key={l.id} className="flex items-center justify-between gap-3 px-5 py-3 text-sm">
                <span><span className="font-medium">{LEAVE_LABEL[l.type]}</span> · {fmtDate(l.from)} – {fmtDate(l.to)} · {l.days} Tag(e){l.note && <span className="block text-xs text-dash-muted">{l.note}</span>}</span>
                <Badge tone={l.status === "genehmigt" ? "solid" : l.status === "abgelehnt" ? "strike" : "dashed"}>{l.status[0].toUpperCase() + l.status.slice(1)}</Badge>
              </li>
            ))}
          </ul>
        </Card>
      </div>
      {toastNode}
    </>
  );
}
