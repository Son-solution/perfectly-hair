"use client";

import { useState } from "react";
import { ConfirmDialog, Dialog, Tabs, useToast } from "@/components/dashboard/interactive";
import { Badge, Card, EmptyState, Field, Table, Td, Th, btn, inputCls, textareaCls, type BadgeTone } from "@/components/dashboard/ui";
import { fmtDate, fmtTime } from "@/features/dashboard/calc";
import { CALLBACK_STATUS_LABEL, type Appointment, type CallbackRequest, type CallbackStatus, type Customer, type Employee } from "@/features/dashboard/domain";
import type { HourRow, WalkInPolicy } from "@/lib/booking-rules";
import { NewAppointmentDialog, type CatalogueEntry } from "./NewAppointmentDialog";

const TONE: Record<CallbackStatus, BadgeTone> = {
  neu: "solid", in_bearbeitung: "dashed", rueckruf_erfolgt: "outline", termin_vereinbart: "outline", nicht_erreicht: "muted", abgelehnt: "strike",
};
const AUD = { herren: "Herren", damen: "Damen", kinder: "Kinder" } as const;
const OPEN: CallbackStatus[] = ["neu", "in_bearbeitung", "nicht_erreicht"];

export function CallbacksBoard(p: {
  initial: CallbackRequest[];
  employees: Employee[];
  appointments: Appointment[];
  customers: Pick<Customer, "id" | "name" | "phone">[];
  catalogue: Record<string, CatalogueEntry>;
  hours: HourRow[];
  walkIn: WalkInPolicy | null;
  today: string;
  nowTime: string;
  actor: string;
}) {
  const [items, setItems] = useState(p.initial);
  const [appointments, setAppointments] = useState(p.appointments);
  const [tab, setTab] = useState<"offen" | "alle" | CallbackStatus>("offen");
  const [q, setQ] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [rejecting, setRejecting] = useState(false);
  const [converting, setConverting] = useState(false);
  const { toast, toastNode } = useToast();
  const now = `${p.today}T${p.nowTime}`;

  const filtered = items.filter((r) =>
    (tab === "alle" || (tab === "offen" ? OPEN.includes(r.status) : r.status === tab)) &&
    (!q || `${r.name} ${r.phone} ${r.serviceName}`.toLowerCase().includes(q.toLowerCase())));
  const r = items.find((x) => x.id === openId) ?? null;
  const name = (id: string | null) => { const e = p.employees.find((x) => x.id === id); return e ? `${e.firstName} ${e.lastName}` : "Nicht zugewiesen"; };

  function patch(id: string, change: Partial<CallbackRequest>, status?: CallbackStatus, histNote: string | null = null) {
    setItems((list) => list.map((x) => x.id === id ? {
      ...x, ...change,
      ...(status ? { status, history: [...x.history, { at: now, by: p.actor, status, note: histNote }] } : {}),
    } : x));
    if (status) toast(`Status: ${CALLBACK_STATUS_LABEL[status]} – Demo, nicht gespeichert.`);
  }

  const count = (s: CallbackStatus) => items.filter((x) => x.status === s).length;

  return (
    <>
      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <Tabs label="Status" value={tab} onChange={(v) => setTab(v as typeof tab)} tabs={[
          { id: "offen", label: "Offen", count: items.filter((x) => OPEN.includes(x.status)).length },
          { id: "neu", label: "Neu", count: count("neu") },
          { id: "termin_vereinbart", label: "Termin vereinbart" },
          { id: "alle", label: "Alle", count: items.length },
        ]} />
        <div className="lg:w-80">
          <label htmlFor="cb-q" className="sr-only">Suche</label>
          <input id="cb-q" className={inputCls} placeholder="Name, Telefon, Leistung" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
      </div>

      <Card>
        {filtered.length === 0 ? <EmptyState title="Keine Anfragen" text="In diesem Filter gibt es keine Terminanfragen." /> : (
          <Table label="Terminanfragen">
            <thead><tr><Th>Eingang</Th><Th>Name / Telefon</Th><Th>Leistung</Th><Th>Wunschtermin</Th><Th>Zuständig</Th><Th>Status</Th></tr></thead>
            <tbody>
              {filtered.map((x) => (
                <tr key={x.id} className="cursor-pointer hover:bg-dash-raised" onClick={() => setOpenId(x.id)}>
                  <Td className="whitespace-nowrap tabular-nums">
                    <button type="button" className="text-left font-medium underline-offset-4 hover:underline" onClick={(e) => { e.stopPropagation(); setOpenId(x.id); }}>
                      {fmtDate(x.receivedAt)} {fmtTime(x.receivedAt)}
                    </button>
                  </Td>
                  <Td>{x.name}<a href={`tel:${x.phone.replace(/[^+0-9]/g, "")}`} onClick={(e) => e.stopPropagation()} className="block text-xs text-dash-muted underline underline-offset-2">{x.phone}</a></Td>
                  <Td>{x.serviceName}<span className="block text-xs text-dash-muted">{AUD[x.audience]}</span></Td>
                  <Td className="whitespace-nowrap tabular-nums">{fmtDate(x.preferredDate)} · {x.preferredTime}{x.alternativeTime && <span className="block text-xs text-dash-muted">alternativ {x.alternativeTime}</span>}</Td>
                  <Td>{name(x.assigneeId)}</Td>
                  <Td><Badge tone={TONE[x.status]}>{CALLBACK_STATUS_LABEL[x.status]}</Badge></Td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>

      <Dialog
        open={!!r && !converting && !rejecting}
        // The detail closes while the reject/convert dialog opens — keep the selection then.
        onClose={() => { if (!rejecting && !converting) { setOpenId(null); setNote(""); } }}
        wide
        title={r ? `Terminanfrage · ${r.name}` : ""}
        description={r ? `Eingegangen am ${fmtDate(r.receivedAt)} um ${fmtTime(r.receivedAt)} über das Website-Formular (Demo).` : undefined}
        footer={r && <>
          <button type="button" className={btn("ghost")} onClick={() => setOpenId(null)}>Schließen</button>
          <button type="button" className={btn("danger")} disabled={r.status === "abgelehnt" || r.status === "termin_vereinbart"} onClick={() => setRejecting(true)}>Ablehnen</button>
          <button type="button" className={btn("primary")} disabled={r.status === "termin_vereinbart" || r.status === "abgelehnt"} onClick={() => setConverting(true)}>In Termin umwandeln…</button>
        </>}
      >
        {r && (
          <div className="space-y-5 text-sm">
            <div className="flex flex-wrap gap-2">
              <a href={`tel:${r.phone.replace(/[^+0-9]/g, "")}`} className={btn("primary", "sm")}>Anrufen: {r.phone}</a>
              {r.email && <a href={`mailto:${r.email}`} className={btn("secondary", "sm")}>{r.email}</a>}
            </div>
            <dl className="grid grid-cols-2 gap-4">
              <div><dt className="text-xs text-dash-muted">Leistung</dt><dd>{r.serviceName} · {AUD[r.audience]}</dd></div>
              <div><dt className="text-xs text-dash-muted">Wunschtermin</dt><dd>{fmtDate(r.preferredDate, { weekday: "short", day: "2-digit", month: "2-digit" })} · {r.preferredTime} Uhr{r.alternativeTime ? ` (alternativ ${r.alternativeTime})` : ""}</dd></div>
              <div className="col-span-2"><dt className="text-xs text-dash-muted">Wünsche</dt><dd>{r.message ?? "–"}</dd></div>
            </dl>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Zuständig" htmlFor="cb-assign">
                <select id="cb-assign" className={inputCls} value={r.assigneeId ?? ""} onChange={(e) => { patch(r.id, { assigneeId: e.target.value || null }); toast("Zuständigkeit geändert – Demo."); }}>
                  <option value="">Nicht zugewiesen</option>
                  {p.employees.filter((e) => e.active).map((e) => <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>)}
                </select>
              </Field>
              <Field label="Status setzen" htmlFor="cb-status" hint="„Termin vereinbart“ nur über die Umwandlung mit Verfügbarkeitsprüfung.">
                <select id="cb-status" className={inputCls} value={r.status} onChange={(e) => {
                  const s = e.target.value as CallbackStatus;
                  if (s === "abgelehnt") { setRejecting(true); return; }
                  patch(r.id, {}, s);
                }}>
                  {(["neu", "in_bearbeitung", "rueckruf_erfolgt", "nicht_erreicht", "abgelehnt"] as CallbackStatus[]).map((s) => <option key={s} value={s}>{CALLBACK_STATUS_LABEL[s]}</option>)}
                  {r.status === "termin_vereinbart" && <option value="termin_vereinbart" disabled>{CALLBACK_STATUS_LABEL.termin_vereinbart}</option>}
                </select>
              </Field>
            </div>
            {r.appointmentId && <p className="rounded-md border border-dash-strong p-3">Verknüpfter Termin: <strong>{r.appointmentId}</strong> – siehe <a className="underline" href="/admin/appointments">Termine</a>.</p>}
            <div>
              <p className="text-xs font-medium text-dash-muted">Interne Notizen</p>
              <ul className="mt-2 space-y-2">
                {r.notes.map((n) => <li key={n.id} className="rounded-md bg-dash-raised p-2.5">{n.text}<span className="block text-xs text-dash-muted">{n.by} · {fmtDate(n.at)} {fmtTime(n.at)}</span></li>)}
              </ul>
              <div className="mt-2 flex gap-2">
                <label htmlFor="cb-note" className="sr-only">Notiz</label>
                <textarea id="cb-note" rows={1} className={textareaCls} value={note} onChange={(e) => setNote(e.target.value)} placeholder="z. B. Mailbox, später erneut versuchen" />
                <button type="button" className={btn("secondary", "sm")} disabled={note.trim().length < 3} onClick={() => { patch(r.id, { notes: [...r.notes, { id: `n${Date.now()}`, at: now, by: p.actor, text: note.trim() }] }); setNote(""); toast("Notiz gespeichert – Demo."); }}>Hinzufügen</button>
              </div>
            </div>
            <div>
              <p className="text-xs font-medium text-dash-muted">Statusverlauf</p>
              <ol className="mt-2 space-y-1.5 border-l border-dash-border pl-4">
                {r.history.map((h, i) => (
                  <li key={i}><Badge tone={TONE[h.status]}>{CALLBACK_STATUS_LABEL[h.status]}</Badge> <span className="text-xs text-dash-muted">{fmtDate(h.at)} {fmtTime(h.at)} · {h.by}</span>{h.note && <span className="block text-xs">{h.note}</span>}</li>
                ))}
              </ol>
            </div>
          </div>
        )}
      </Dialog>

      <ConfirmDialog
        open={rejecting && !!r}
        onClose={() => setRejecting(false)}
        onConfirm={(reason) => { if (r) patch(r.id, {}, "abgelehnt", reason ?? null); setRejecting(false); }}
        title="Anfrage ablehnen"
        description="Bitte den Grund festhalten (z. B. kein passender Termin, Kunde verzichtet). Der Kunde sollte vorher telefonisch informiert werden."
        confirmLabel="Ablehnen"
        requireReason
      />

      {r && converting && (
        <NewAppointmentDialog
          open
          onClose={() => setConverting(false)}
          onCreate={(a) => {
            setAppointments((list) => [...list, a]);
            patch(r.id, { appointmentId: a.id }, "termin_vereinbart", `Termin ${fmtDate(a.start)} ${fmtTime(a.start)} nach Verfügbarkeitsprüfung angelegt.`);
          }}
          employees={p.employees}
          customers={p.customers}
          catalogue={p.catalogue}
          appointments={appointments}
          hours={p.hours}
          walkIn={p.walkIn}
          today={p.today}
          nowTime={p.nowTime}
          actor={p.actor}
          prefill={{ name: r.name, phone: r.phone, audience: r.audience, serviceId: r.serviceId, date: r.preferredDate, time: r.preferredTime, source: "rueckruf" }}
        />
      )}
      {toastNode}
    </>
  );
}
