"use client";

import { useState } from "react";
import { Dialog, Tabs, useToast } from "@/components/dashboard/interactive";
import { Badge, Card, EmptyState, Field, Table, Td, Th, btn, inputCls, textareaCls, type BadgeTone } from "@/components/dashboard/ui";
import { fmtDate, fmtTime } from "@/features/dashboard/calc";
import { APPLICATION_STATUS_LABEL, type ApplicationStatus, type JobApplication } from "@/features/dashboard/domain";

const TONE: Record<ApplicationStatus, BadgeTone> = { neu: "solid", in_pruefung: "dashed", gespraech: "outline", angenommen: "outline", abgelehnt: "strike" };
const STATUSES = Object.keys(APPLICATION_STATUS_LABEL) as ApplicationStatus[];

/** Retention (proposal, to be confirmed by the owner/legal): delete 6 months after a rejection. */
const plusMonths = (d: string, n: number) => { const x = new Date(`${d}T12:00:00Z`); x.setUTCMonth(x.getUTCMonth() + n); return x.toISOString().slice(0, 10); };

export function ApplicationsBoard({ initial, today, actor }: { initial: JobApplication[]; today: string; actor: string }) {
  const [items, setItems] = useState(initial);
  const [tab, setTab] = useState<"alle" | ApplicationStatus>("alle");
  const [q, setQ] = useState("");
  const [position, setPosition] = useState("alle");
  const [openId, setOpenId] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const { toast, toastNode } = useToast();
  const now = () => `${today}T${new Date().toTimeString().slice(0, 5)}`;

  const positions = [...new Set(items.map((a) => a.position))];
  const filtered = items.filter((a) =>
    (tab === "alle" || a.status === tab) && (position === "alle" || a.position === position) &&
    (!q || `${a.firstName} ${a.lastName} ${a.email} ${a.position}`.toLowerCase().includes(q.toLowerCase())));
  const a = items.find((x) => x.id === openId) ?? null;

  function patch(id: string, change: Partial<JobApplication>, msg: string) {
    setItems((list) => list.map((x) => (x.id === id ? { ...x, ...change } : x)));
    toast(`${msg} – Demo, nicht gespeichert.`);
  }

  return (
    <>
      <div className="mb-4 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <Tabs label="Status" value={tab} onChange={(v) => setTab(v as typeof tab)} tabs={[
          { id: "alle", label: "Alle", count: items.length },
          ...STATUSES.map((s) => ({ id: s, label: APPLICATION_STATUS_LABEL[s], count: items.filter((x) => x.status === s).length })),
        ]} />
        <div className="grid gap-2 sm:grid-cols-2 xl:w-[480px]">
          <label htmlFor="ap-q" className="sr-only">Suche</label>
          <input id="ap-q" className={inputCls} placeholder="Name, E-Mail, Position" value={q} onChange={(e) => setQ(e.target.value)} />
          <label htmlFor="ap-pos" className="sr-only">Position</label>
          <select id="ap-pos" className={inputCls} value={position} onChange={(e) => setPosition(e.target.value)}>
            <option value="alle">Alle Positionen</option>
            {positions.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
      </div>

      <Card>
        {filtered.length === 0 ? <EmptyState title="Keine Bewerbungen" /> : (
          <Table label="Bewerbungen">
            <thead><tr><Th>Eingang</Th><Th>Name</Th><Th>Position</Th><Th>Art / Erfahrung</Th><Th>Lebenslauf</Th><Th>Status</Th></tr></thead>
            <tbody>
              {filtered.map((x) => (
                <tr key={x.id} className="cursor-pointer hover:bg-dash-raised" onClick={() => setOpenId(x.id)}>
                  <Td className="whitespace-nowrap tabular-nums">{fmtDate(x.receivedAt)}</Td>
                  <Td>
                    <button type="button" className="text-left font-medium underline-offset-4 hover:underline" onClick={(e) => { e.stopPropagation(); setOpenId(x.id); }}>{x.firstName} {x.lastName}</button>
                    <span className="block text-xs text-dash-muted">{x.email}</span>
                  </Td>
                  <Td>{x.position}</Td>
                  <Td>{x.employment}<span className="block text-xs text-dash-muted">{x.experience}</span></Td>
                  <Td>{x.cvFileName ? <Badge tone="outline">PDF</Badge> : <span className="text-dash-muted">–</span>}</Td>
                  <Td><Badge tone={TONE[x.status]}>{APPLICATION_STATUS_LABEL[x.status]}</Badge></Td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>

      <Dialog open={!!a} onClose={() => { setOpenId(null); setNote(""); }} wide title={a ? `${a.firstName} ${a.lastName}` : ""} description={a ? `Bewerbung als ${a.position} · eingegangen am ${fmtDate(a.receivedAt)} um ${fmtTime(a.receivedAt)}` : undefined}>
        {a && (
          <div className="space-y-5 text-sm">
            <div className="flex flex-wrap gap-2">
              <a href={`mailto:${a.email}`} className={btn("secondary", "sm")}>{a.email}</a>
              <a href={`tel:${a.phone.replace(/[^+0-9]/g, "")}`} className={btn("secondary", "sm")}>{a.phone}</a>
            </div>
            <dl className="grid grid-cols-2 gap-4">
              <div><dt className="text-xs text-dash-muted">Beschäftigungsart</dt><dd>{a.employment}</dd></div>
              <div><dt className="text-xs text-dash-muted">Berufserfahrung</dt><dd>{a.experience}</dd></div>
              <div className="col-span-2"><dt className="text-xs text-dash-muted">Nachricht</dt><dd className="whitespace-pre-line">{a.message ?? "–"}</dd></div>
            </dl>
            <div className="rounded-md border border-dashed border-dash-muted p-3">
              <p className="font-medium">Lebenslauf</p>
              {a.cvFileName ? (
                <div className="mt-2 flex flex-wrap items-center gap-3">
                  <span>{a.cvFileName}</span>
                  <button type="button" className={btn("secondary", "sm")} disabled title="Backend erforderlich">Öffnen (Backend erforderlich)</button>
                </div>
              ) : <p className="mt-1 text-dash-muted">Kein Lebenslauf beigefügt.</p>}
              <p className="mt-2 text-xs text-dash-muted">Phase 5B: Datei im privaten Storage-Bucket, Zugriff nur für Admins über kurzlebige signierte Links. Nie per E-Mail versendet.</p>
            </div>
            <Field label="Status" htmlFor="ap-status">
              <select id="ap-status" className={inputCls} value={a.status} onChange={(e) => {
                const s = e.target.value as ApplicationStatus;
                const ended = s === "abgelehnt" || s === "angenommen";
                patch(a.id, { status: s, deleteAfter: s === "abgelehnt" ? plusMonths(today, 6) : ended ? null : a.deleteAfter }, `Status: ${APPLICATION_STATUS_LABEL[s]}`);
              }}>
                {STATUSES.map((s) => <option key={s} value={s}>{APPLICATION_STATUS_LABEL[s]}</option>)}
              </select>
            </Field>
            {a.deleteAfter && <p className="rounded-md bg-dash-raised p-3 text-xs">Löschfrist: <strong>{fmtDate(a.deleteAfter)}</strong> (Vorschlag: 6 Monate nach Absage, AGG-Fristen; rechtlich zu bestätigen).</p>}
            <div>
              <p className="text-xs font-medium text-dash-muted">Interne Notizen (vertraulich)</p>
              <ul className="mt-2 space-y-2">
                {a.notes.map((n) => <li key={n.id} className="rounded-md bg-dash-raised p-2.5">{n.text}<span className="block text-xs text-dash-muted">{n.by} · {fmtDate(n.at)}</span></li>)}
                {a.notes.length === 0 && <li className="text-dash-muted">Noch keine Notizen.</li>}
              </ul>
              <div className="mt-2 flex gap-2">
                <label htmlFor="ap-note" className="sr-only">Notiz</label>
                <textarea id="ap-note" rows={1} className={textareaCls} value={note} onChange={(e) => setNote(e.target.value)} />
                <button type="button" className={btn("secondary", "sm")} disabled={note.trim().length < 3} onClick={() => { patch(a.id, { notes: [...a.notes, { id: `n${Date.now()}`, at: now(), by: actor, text: note.trim() }] }, "Notiz gespeichert"); setNote(""); }}>Hinzufügen</button>
              </div>
            </div>
          </div>
        )}
      </Dialog>
      {toastNode}
    </>
  );
}
