"use client";

import { useState } from "react";
import { ConfirmDialog, Dialog, Segmented, useToast } from "@/components/dashboard/interactive";
import { Badge, Card, EmptyState, Field, Stat, Table, Td, Th, btn, inputCls, textareaCls } from "@/components/dashboard/ui";
import {
  FLAG_LABEL, effective, flags, fmtDate, fmtDuration, fmtTime, scheduledMinutes, workedMinutes, type AttendanceFlag,
} from "@/features/dashboard/calc";
import { attendanceCorrection, type AttendanceRecord, type AttendanceValues, type Employee } from "@/features/dashboard/domain";

type Filter = "alle" | AttendanceFlag;

export function AttendanceManager({ initial, employees, today, actor }: { initial: AttendanceRecord[]; employees: Employee[]; today: string; actor: string }) {
  const [records, setRecords] = useState(initial);
  const [who, setWho] = useState("alle");
  const [from, setFrom] = useState("2026-11-01");
  const [to, setTo] = useState(today);
  const [filter, setFilter] = useState<Filter>("alle");
  const [editId, setEditId] = useState<string | null>(null);
  const [historyId, setHistoryId] = useState<string | null>(null);
  const [declineId, setDeclineId] = useState<{ rec: string; req: string } | null>(null);
  const [adding, setAdding] = useState(false);
  const { toast, toastNode } = useToast();

  const emp = (id: string) => employees.find((e) => e.id === id)!;
  const rows = records.filter((r) =>
    (who === "alle" || r.employeeId === who) && r.date >= from && r.date <= to &&
    (filter === "alle" || flags(r, emp(r.employeeId), today).includes(filter)),
  );
  const all = records.filter((r) => r.date <= today);
  const missing = all.filter((r) => flags(r, emp(r.employeeId), today).includes("fehlendes-ausstempeln")).length;
  const late = all.filter((r) => r.date.startsWith(today.slice(0, 7)) && flags(r, emp(r.employeeId), today).includes("verspaetet")).length;
  const openReq = records.flatMap((r) => r.requests.filter((q) => q.status === "open").map((q) => ({ rec: r, req: q })));

  const now = () => `${today}T${new Date().toTimeString().slice(0, 5)}`;

  function applyCorrection(recordId: string, after: AttendanceValues, reason: string, requestId?: string) {
    setRecords((list) => list.map((r) => {
      if (r.id !== recordId) return r;
      return {
        ...r,
        corrections: [...r.corrections, { id: `c${Date.now()}`, at: now(), by: actor, reason, before: effective(r), after }],
        requests: r.requests.map((q) => (q.id === requestId ? { ...q, status: "accepted" as const } : q)),
      };
    }));
    toast("Korrektur gespeichert – Original bleibt erhalten");
  }

  const editing = records.find((r) => r.id === editId) ?? null;
  const showing = records.find((r) => r.id === historyId) ?? null;

  return (
    <>
      <div className="mb-4 grid grid-cols-2 gap-3 xl:grid-cols-4">
        <Stat label="Fehlendes Ausstempeln" value={missing} hint="vergangene Tage" emphasis={missing > 0} />
        <Stat label="Verspätungen (Monat)" value={late} hint="> 5 Min. nach Schichtbeginn" />
        <Stat label="Offene Korrekturanfragen" value={openReq.length} hint="von Mitarbeitern" />
        <Stat label="Korrigierte Einträge" value={records.filter((r) => r.corrections.length).length} hint="mit Audit-Verlauf" />
      </div>

      {openReq.length > 0 && (
        <Card title="Korrekturanfragen" description="Mitarbeiter können Einträge nicht selbst ändern – sie beantragen eine Korrektur." className="mb-4" padded={false}>
          <ul className="divide-y divide-dash-border">
            {openReq.map(({ rec, req }) => {
              const e = emp(rec.employeeId);
              return (
                <li key={req.id} className="flex flex-col gap-3 px-5 py-4 md:flex-row md:items-center">
                  <div className="flex-1 text-sm">
                    <p className="font-medium">{e.firstName} {e.lastName} · {fmtDate(rec.date, { weekday: "long", day: "numeric", month: "long" })}</p>
                    <p className="mt-0.5 text-dash-muted">„{req.message}“</p>
                  </div>
                  <div className="flex gap-2">
                    <button type="button" className={btn("secondary", "sm")} onClick={() => setDeclineId({ rec: rec.id, req: req.id })}>Ablehnen</button>
                    <button type="button" className={btn("primary", "sm")} onClick={() => setEditId(rec.id)}>Prüfen & korrigieren</button>
                  </div>
                </li>
              );
            })}
          </ul>
        </Card>
      )}

      <Card padded>
        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 lg:w-[560px]">
            <Field label="Mitarbeiter" htmlFor="a-who">
              <select id="a-who" className={inputCls} value={who} onChange={(e) => setWho(e.target.value)}>
                <option value="alle">Alle</option>
                {employees.map((e) => <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>)}
              </select>
            </Field>
            <Field label="Von" htmlFor="a-from"><input id="a-from" type="date" className={inputCls} value={from} onChange={(e) => setFrom(e.target.value)} /></Field>
            <Field label="Bis" htmlFor="a-to"><input id="a-to" type="date" className={inputCls} value={to} onChange={(e) => setTo(e.target.value)} /></Field>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Segmented<Filter> label="Hinweisfilter" value={filter} onChange={setFilter} options={[
              { id: "alle", label: "Alle" }, { id: "fehlendes-ausstempeln", label: "Ausstempeln fehlt" },
              { id: "verspaetet", label: "Verspätet" }, { id: "korrigiert", label: "Korrigiert" },
            ]} />
            <button type="button" className={btn("secondary", "sm")} onClick={() => setAdding(true)}>Eintrag nachtragen</button>
          </div>
        </div>

        {rows.length === 0 ? <EmptyState title="Keine Einträge im Zeitraum" /> : (
          <Table label="Zeiterfassung">
            <thead><tr><Th>Datum</Th><Th>Mitarbeiter</Th><Th>Kommen</Th><Th>Gehen</Th><Th>Pause</Th><Th>Ist / Soll</Th><Th>Hinweise</Th><Th className="text-right">Aktion</Th></tr></thead>
            <tbody>
              {rows.slice(0, 120).map((r) => {
                const e = emp(r.employeeId);
                const v = effective(r);
                const w = workedMinutes(v);
                const corrected = r.corrections.length > 0;
                return (
                  <tr key={r.id} className="hover:bg-dash-raised">
                    <Td className="whitespace-nowrap">{fmtDate(r.date)}</Td>
                    <Td>{e.firstName} {e.lastName}</Td>
                    <Td className="tabular-nums">{fmtTime(v.clockIn)}{corrected && r.original.clockIn !== v.clockIn && <span className="block text-xs text-dash-muted line-through">{fmtTime(r.original.clockIn)}</span>}</Td>
                    <Td className="tabular-nums">{fmtTime(v.clockOut)}{corrected && r.original.clockOut !== v.clockOut && <span className="block text-xs text-dash-muted line-through">{fmtTime(r.original.clockOut)}</span>}</Td>
                    <Td className="tabular-nums">{v.breakMin} Min.</Td>
                    <Td className="tabular-nums">{w !== null ? fmtDuration(w) : "—"}<span className="block text-xs text-dash-muted">Soll {fmtDuration(scheduledMinutes(e, r.date))}</span></Td>
                    <Td><span className="flex flex-wrap gap-1">{flags(r, e, today).map((f) => <Badge key={f} tone={f === "fehlendes-ausstempeln" ? "solid" : "dashed"}>{FLAG_LABEL[f]}</Badge>)}</span></Td>
                    <Td className="whitespace-nowrap text-right">
                      {corrected && <button type="button" className={btn("ghost", "sm")} onClick={() => setHistoryId(r.id)}>Verlauf</button>}
                      <button type="button" className={btn("secondary", "sm")} onClick={() => setEditId(r.id)} disabled={r.date === today && !v.clockOut} title={r.date === today && !v.clockOut ? "Läuft noch" : undefined}>Korrigieren</button>
                    </Td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        )}
      </Card>

      {editing && (
        <CorrectionDialog
          key={editing.id}
          record={editing}
          employee={emp(editing.employeeId)}
          openRequest={editing.requests.find((q) => q.status === "open") ?? null}
          onClose={() => setEditId(null)}
          onSave={(after, reason, requestId) => { applyCorrection(editing.id, after, reason, requestId); setEditId(null); }}
        />
      )}

      <Dialog open={!!showing} onClose={() => setHistoryId(null)} wide title="Audit-Verlauf" description="Unveränderlich: Original und jede Korrektur bleiben dauerhaft sichtbar.">
        {showing && (
          <ol className="space-y-4 border-l border-dash-border pl-5 text-sm">
            <li className="relative">
              <span aria-hidden="true" className="absolute -left-[25px] top-1 h-2.5 w-2.5 rounded-full border-2 border-dash-strong bg-dash-surface" />
              <p className="font-medium">Original (selbst erfasst)</p>
              <p className="tabular-nums text-dash-muted">{fmtTime(showing.original.clockIn)} – {fmtTime(showing.original.clockOut)} · Pause {showing.original.breakMin} Min.</p>
            </li>
            {showing.corrections.map((c) => (
              <li key={c.id} className="relative">
                <span aria-hidden="true" className="absolute -left-[25px] top-1 h-2.5 w-2.5 rounded-full bg-dash-strong" />
                <p className="font-medium">Korrektur durch {c.by}</p>
                <p className="text-xs text-dash-muted">{fmtDate(c.at, { day: "numeric", month: "long", year: "numeric" })}, {fmtTime(c.at)} Uhr</p>
                <p className="mt-1 tabular-nums"><span className="text-dash-muted line-through">{fmtTime(c.before.clockIn)} – {fmtTime(c.before.clockOut)} · {c.before.breakMin} Min.</span> → <strong>{fmtTime(c.after.clockIn)} – {fmtTime(c.after.clockOut)} · {c.after.breakMin} Min.</strong></p>
                <p className="mt-1">Begründung: „{c.reason}“</p>
              </li>
            ))}
            {showing.requests.map((q) => (
              <li key={q.id} className="relative">
                <span aria-hidden="true" className="absolute -left-[25px] top-1 h-2.5 w-2.5 rounded-full border border-dashed border-dash-strong bg-dash-surface" />
                <p className="font-medium">Anfrage der Mitarbeiterin ({q.status === "accepted" ? "angenommen" : q.status === "declined" ? "abgelehnt" : "offen"})</p>
                <p className="text-dash-muted">„{q.message}“</p>
              </li>
            ))}
          </ol>
        )}
      </Dialog>

      <ConfirmDialog
        open={!!declineId}
        onClose={() => setDeclineId(null)}
        title="Korrekturanfrage ablehnen?"
        confirmLabel="Ablehnen"
        requireReason
        onConfirm={(reason) => {
          if (!declineId) return;
          setRecords((list) => list.map((r) => (r.id === declineId.rec ? { ...r, requests: r.requests.map((q) => (q.id === declineId.req ? { ...q, status: "declined" as const, message: `${q.message} — Abgelehnt: ${reason}` } : q)) } : r)));
          toast("Anfrage abgelehnt");
        }}
      />

      <AddEntryDialog
        open={adding}
        employees={employees}
        today={today}
        onClose={() => setAdding(false)}
        onAdd={(employeeId, date, values, reason) => {
          const empty: AttendanceValues = { clockIn: null, clockOut: null, breakMin: 0 };
          setRecords((list) => [{
            id: `a-${employeeId}-${date}-${Date.now()}`, employeeId, date, original: empty, requests: [],
            corrections: [{ id: `c${Date.now()}`, at: now(), by: actor, reason: `Nachtrag: ${reason}`, before: empty, after: values }],
          }, ...list]);
          setAdding(false);
          toast("Eintrag nachgetragen (als Korrektur protokolliert)");
        }}
      />
      {toastNode}
    </>
  );
}

/* ------------------------------------------------------------------ dialogs */

function timeInput(date: string, iso: string | null) {
  return iso ? iso.slice(11, 16) : "";
}

function CorrectionDialog({ record, employee, openRequest, onClose, onSave }: {
  record: AttendanceRecord; employee: Employee; openRequest: { id: string; message: string } | null;
  onClose: () => void; onSave: (after: AttendanceValues, reason: string, requestId?: string) => void;
}) {
  const v = effective(record);
  const [inT, setIn] = useState(timeInput(record.date, v.clockIn));
  const [outT, setOut] = useState(timeInput(record.date, v.clockOut));
  const [brk, setBrk] = useState(String(v.breakMin));
  const [reason, setReason] = useState(openRequest ? `Auf Anfrage der Mitarbeiterin: ${openRequest.message}` : "");
  const [error, setError] = useState<string | null>(null);

  const save = () => {
    const after: AttendanceValues = {
      clockIn: inT ? `${record.date}T${inT}` : null,
      clockOut: outT ? `${record.date}T${outT}` : null,
      breakMin: Number(brk) || 0,
    };
    if (after.clockIn && after.clockOut && after.clockOut <= after.clockIn) return setError("„Gehen“ muss nach „Kommen“ liegen.");
    const parsed = attendanceCorrection.shape.reason.safeParse(reason.trim());
    if (!parsed.success) return setError(parsed.error.issues[0].message);
    if (after.clockIn === v.clockIn && after.clockOut === v.clockOut && after.breakMin === v.breakMin) return setError("Keine Änderung erkannt.");
    onSave(after, reason.trim(), openRequest?.id);
  };

  return (
    <Dialog
      open
      onClose={onClose}
      title={`Eintrag korrigieren · ${employee.firstName} ${employee.lastName}`}
      description={`${fmtDate(record.date, { weekday: "long", day: "numeric", month: "long" })} · Das Original bleibt gespeichert und sichtbar.`}
      footer={<><button type="button" className={btn("secondary")} onClick={onClose}>Abbrechen</button><button type="button" className={btn("primary")} onClick={save}>Korrektur speichern</button></>}
    >
      <div className="space-y-4">
        <div className="rounded-md bg-dash-raised p-3 text-xs text-dash-muted">
          Aktuell: <span className="tabular-nums text-dash-text">{fmtTime(v.clockIn)} – {fmtTime(v.clockOut)} · Pause {v.breakMin} Min.</span>
          {record.corrections.length > 0 && <> · Original: <span className="tabular-nums">{fmtTime(record.original.clockIn)} – {fmtTime(record.original.clockOut)}</span></>}
        </div>
        <div className="grid grid-cols-3 gap-3">
          <Field label="Kommen" htmlFor="c-in"><input id="c-in" type="time" className={inputCls} value={inT} onChange={(e) => setIn(e.target.value)} /></Field>
          <Field label="Gehen" htmlFor="c-out"><input id="c-out" type="time" className={inputCls} value={outT} onChange={(e) => setOut(e.target.value)} /></Field>
          <Field label="Pause (Min.)" htmlFor="c-brk"><input id="c-brk" type="number" min={0} className={inputCls} value={brk} onChange={(e) => setBrk(e.target.value)} /></Field>
        </div>
        <Field label="Begründung (Pflichtfeld, wird protokolliert)" htmlFor="c-reason" error={error ?? undefined}>
          <textarea id="c-reason" rows={3} className={textareaCls} value={reason} onChange={(e) => { setReason(e.target.value); setError(null); }} placeholder="z. B. Ausstempeln vergessen – laut Kassenabschluss 18:15" />
        </Field>
      </div>
    </Dialog>
  );
}

function AddEntryDialog({ open, employees, today, onClose, onAdd }: {
  open: boolean; employees: Employee[]; today: string; onClose: () => void;
  onAdd: (employeeId: string, date: string, values: AttendanceValues, reason: string) => void;
}) {
  const [who, setWho] = useState(employees[0]?.id ?? "");
  const [date, setDate] = useState(today);
  const [inT, setIn] = useState("09:00");
  const [outT, setOut] = useState("17:00");
  const [brk, setBrk] = useState("30");
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Fehlenden Eintrag nachtragen"
      description="Wird als Admin-Korrektur mit Begründung protokolliert."
      footer={<><button type="button" className={btn("secondary")} onClick={onClose}>Abbrechen</button><button type="button" className={btn("primary")} onClick={() => {
        if (reason.trim().length < 5) return setError("Bitte eine Begründung (mind. 5 Zeichen) angeben.");
        if (outT <= inT) return setError("„Gehen“ muss nach „Kommen“ liegen.");
        onAdd(who, date, { clockIn: `${date}T${inT}`, clockOut: `${date}T${outT}`, breakMin: Number(brk) || 0 }, reason.trim());
        setReason(""); setError(null);
      }}>Nachtragen</button></>}
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Mitarbeiter" htmlFor="n-who"><select id="n-who" className={inputCls} value={who} onChange={(e) => setWho(e.target.value)}>{employees.map((e) => <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>)}</select></Field>
          <Field label="Datum" htmlFor="n-date"><input id="n-date" type="date" max={today} className={inputCls} value={date} onChange={(e) => setDate(e.target.value)} /></Field>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <Field label="Kommen" htmlFor="n-in"><input id="n-in" type="time" className={inputCls} value={inT} onChange={(e) => setIn(e.target.value)} /></Field>
          <Field label="Gehen" htmlFor="n-out"><input id="n-out" type="time" className={inputCls} value={outT} onChange={(e) => setOut(e.target.value)} /></Field>
          <Field label="Pause (Min.)" htmlFor="n-brk"><input id="n-brk" type="number" min={0} className={inputCls} value={brk} onChange={(e) => setBrk(e.target.value)} /></Field>
        </div>
        <Field label="Begründung (Pflichtfeld)" htmlFor="n-reason" error={error ?? undefined}>
          <textarea id="n-reason" rows={2} className={textareaCls} value={reason} onChange={(e) => { setReason(e.target.value); setError(null); }} />
        </Field>
      </div>
    </Dialog>
  );
}
