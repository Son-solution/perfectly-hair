"use client";

import { useMemo, useState } from "react";
import { ConfirmDialog, Dialog, Segmented, useToast } from "@/components/dashboard/interactive";
import { Badge, Card, EmptyState, StatusBadge, Table, Td, Th, btn, inputCls } from "@/components/dashboard/ui";
import { conflictIds, fmtDate, fmtEuro, fmtTime, toMin } from "@/features/dashboard/calc";
import { STATUS_LABEL, type Appointment, type AppointmentStatus, type Employee } from "@/features/dashboard/domain";
import { cn } from "@/lib/utils";

type View = "liste" | "tag" | "woche" | "monat";
const DAY_START = 9 * 60, DAY_END = 19 * 60, PX_PER_MIN = 1.1;

const addDays = (date: string, n: number) => {
  const d = new Date(`${date}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
};
const mondayOf = (date: string) => {
  const wd = (new Date(`${date}T12:00:00Z`).getUTCDay() + 6) % 7;
  return addDays(date, -wd);
};

export function AppointmentsBoard({
  initial, employees, today, actor, initialStatus,
}: {
  initial: Appointment[];
  employees: Employee[];
  today: string;
  actor: string;
  initialStatus?: string | null;
}) {
  const [items, setItems] = useState(initial);
  const [view, setView] = useState<View>("liste");
  const [cursor, setCursor] = useState(today);
  const [status, setStatus] = useState<AppointmentStatus | "alle">(
    initialStatus && initialStatus in STATUS_LABEL ? (initialStatus as AppointmentStatus) : "alle",
  );
  const [staff, setStaff] = useState<string>("alle");
  const [q, setQ] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<null | "reject" | "cancel">(null);
  const { toast, toastNode } = useToast();

  const conflicts = useMemo(() => conflictIds(items), [items]);
  const staffList = employees.filter((e) => e.role === "staff" || e.serviceIds.length);
  const name = (id: string | null) => {
    const e = employees.find((x) => x.id === id);
    return e ? `${e.firstName} ${e.lastName}` : "Nicht zugewiesen";
  };

  const filtered = items.filter((a) =>
    (status === "alle" || a.status === status) &&
    (staff === "alle" || (staff === "none" ? !a.employeeId : a.employeeId === staff)) &&
    (!q || `${a.customerName} ${a.serviceName}`.toLowerCase().includes(q.toLowerCase())),
  );

  const range = (() => {
    if (view === "tag") return { from: cursor, to: cursor };
    if (view === "woche") { const m = mondayOf(cursor); return { from: m, to: addDays(m, 6) }; }
    if (view === "monat") { const m = cursor.slice(0, 7); return { from: `${m}-01`, to: `${m}-31` }; }
    return { from: today, to: "9999" };
  })();
  const inRange = filtered.filter((a) => a.start.slice(0, 10) >= range.from && a.start.slice(0, 10) <= range.to);

  const open = items.find((a) => a.id === openId) ?? null;

  function update(id: string, patch: Partial<Appointment>, action: string, note: string | null = null) {
    setItems((list) => list.map((a) => (a.id === id
      ? { ...a, ...patch, history: [...a.history, { at: `${today}T${new Date().toTimeString().slice(0, 5)}`, by: actor, action, note }] }
      : a)));
    toast(`${action}.`);
  }

  const step = (dir: number) => {
    if (view === "tag") setCursor(addDays(cursor, dir));
    else if (view === "woche") setCursor(addDays(cursor, dir * 7));
    else if (view === "monat") { const d = new Date(`${cursor.slice(0, 7)}-15T12:00:00Z`); d.setUTCMonth(d.getUTCMonth() + dir); setCursor(d.toISOString().slice(0, 10)); }
  };

  const rangeLabel =
    view === "tag" ? fmtDate(cursor, { weekday: "long", day: "numeric", month: "long" })
    : view === "woche" ? `${fmtDate(range.from, { day: "numeric", month: "short" })} – ${fmtDate(range.to, { day: "numeric", month: "short", year: "numeric" })}`
    : view === "monat" ? fmtDate(cursor, { month: "long", year: "numeric" })
    : "Ab heute";

  return (
    <>
      {/* Toolbar */}
      <div className="mb-4 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <Segmented label="Ansicht" value={view} onChange={setView} options={[{ id: "liste", label: "Liste" }, { id: "tag", label: "Tag" }, { id: "woche", label: "Woche" }, { id: "monat", label: "Monat" }]} />
          {view !== "liste" && (
            <div className="flex items-center gap-1">
              <button type="button" className={btn("secondary", "sm")} onClick={() => step(-1)} aria-label="Zurück">‹</button>
              <button type="button" className={btn("secondary", "sm")} onClick={() => setCursor(today)}>Heute</button>
              <button type="button" className={btn("secondary", "sm")} onClick={() => step(1)} aria-label="Weiter">›</button>
              <span className="ml-2 text-sm font-medium">{rangeLabel}</span>
            </div>
          )}
        </div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 xl:w-[620px]">
          <label className="sr-only" htmlFor="f-q">Suche</label>
          <input id="f-q" className={inputCls} placeholder="Kunde oder Leistung suchen" value={q} onChange={(e) => setQ(e.target.value)} />
          <label className="sr-only" htmlFor="f-status">Status</label>
          <select id="f-status" className={inputCls} value={status} onChange={(e) => setStatus(e.target.value as AppointmentStatus | "alle")}>
            <option value="alle">Alle Status</option>
            {Object.entries(STATUS_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          <label className="sr-only" htmlFor="f-staff">Mitarbeiter</label>
          <select id="f-staff" className={inputCls} value={staff} onChange={(e) => setStaff(e.target.value)}>
            <option value="alle">Alle Mitarbeiter</option>
            <option value="none">Nicht zugewiesen</option>
            {staffList.map((e) => <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>)}
          </select>
        </div>
      </div>

      {conflicts.size > 0 && (
        <div role="status" className="mb-4 flex items-center gap-3 rounded-lg border border-dash-strong bg-dash-surface px-4 py-3 text-sm">
          <span aria-hidden="true" className="flex h-6 w-6 items-center justify-center rounded-full bg-dash-strong text-xs font-bold text-dash-invert">!</span>
          <span><strong>{conflicts.size} Termine überschneiden sich</strong> bei derselben Person. Markiert mit „Konflikt“.</span>
        </div>
      )}

      {/* Views */}
      {view === "liste" && (
        <Card padded>
          {inRange.length === 0 ? <EmptyState title="Keine Termine gefunden" text="Passen Sie Filter oder Suche an." /> : (
            <Table label="Terminliste">
              <thead><tr><Th>Datum</Th><Th>Kunde</Th><Th>Leistung</Th><Th>Mitarbeiter</Th><Th>Status</Th><Th className="text-right">Preis</Th></tr></thead>
              <tbody>
                {inRange.slice(0, 80).map((a) => (
                  <tr key={a.id} className="cursor-pointer hover:bg-dash-raised" onClick={() => setOpenId(a.id)}>
                    <Td className="whitespace-nowrap tabular-nums">
                      <button type="button" className="text-left font-medium underline-offset-4 hover:underline" onClick={(e) => { e.stopPropagation(); setOpenId(a.id); }}>
                        {fmtDate(a.start)} · {fmtTime(a.start)}
                      </button>
                    </Td>
                    <Td>{a.customerName}</Td>
                    <Td>{a.serviceName}<span className="block text-xs text-dash-muted">{a.durationMin} Min. (Demo)</span></Td>
                    <Td className={cn(!a.employeeId && "text-dash-muted italic")}>{name(a.employeeId)}</Td>
                    <Td><span className="flex flex-wrap items-center gap-1.5"><StatusBadge status={a.status} />{conflicts.has(a.id) && <Badge tone="solid">Konflikt</Badge>}</span></Td>
                    <Td className="text-right tabular-nums">{a.priceCents !== null ? fmtEuro(a.priceCents) : "—"}</Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card>
      )}

      {view === "tag" && (
        <Card padded={false}>
          <div className="overflow-x-auto">
            <div className="grid min-w-[760px]" style={{ gridTemplateColumns: `56px repeat(${staffList.length}, minmax(150px, 1fr))` }}>
              <div className="border-b border-r border-dash-border" />
              {staffList.map((e) => (
                <div key={e.id} className="border-b border-r border-dash-border px-3 py-3 text-xs font-medium last:border-r-0">{e.firstName} {e.lastName}</div>
              ))}
              <div className="relative border-r border-dash-border" style={{ height: (DAY_END - DAY_START) * PX_PER_MIN }}>
                {Array.from({ length: 11 }, (_, i) => (
                  <span key={i} className="absolute right-2 -translate-y-1/2 text-[0.625rem] tabular-nums text-dash-muted" style={{ top: i * 60 * PX_PER_MIN }}>{9 + i}:00</span>
                ))}
              </div>
              {staffList.map((e) => (
                <div key={e.id} className="relative border-r border-dash-border last:border-r-0" style={{ height: (DAY_END - DAY_START) * PX_PER_MIN, backgroundImage: "repeating-linear-gradient(to bottom, var(--dash-border) 0 1px, transparent 1px 66px)" }}>
                  {inRange.filter((a) => a.employeeId === e.id).map((a) => {
                    const top = (toMin(a.start) - DAY_START) * PX_PER_MIN;
                    const conflict = conflicts.has(a.id);
                    return (
                      <button
                        key={a.id}
                        type="button"
                        onClick={() => setOpenId(a.id)}
                        style={{ top, height: Math.max(26, a.durationMin * PX_PER_MIN - 2) }}
                        className={cn(
                          "absolute inset-x-1 overflow-hidden rounded-md px-2 py-1 text-left text-[0.6875rem] leading-tight transition-transform hover:z-10 hover:scale-[1.02]",
                          a.status === "confirmed" && "bg-dash-strong text-dash-invert",
                          a.status === "pending" && "border border-dashed border-dash-strong bg-dash-surface",
                          a.status === "completed" && "border border-dash-border bg-dash-subtle",
                          ["cancelled", "rejected", "no_show"].includes(a.status) && "bg-dash-subtle text-dash-muted line-through",
                          conflict && "ring-2 ring-dash-strong ring-offset-1 ring-offset-dash-surface",
                        )}
                      >
                        <span className="font-semibold tabular-nums">{fmtTime(a.start)}</span> {a.serviceName}
                        <span className="block truncate opacity-75">{a.customerName}{conflict ? " · Konflikt" : ""}</span>
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
          {inRange.some((a) => !a.employeeId) && (
            <p className="border-t border-dash-border px-5 py-3 text-xs text-dash-muted">
              {inRange.filter((a) => !a.employeeId).length} Anfrage(n) ohne Mitarbeiter – in der Listenansicht zuweisen.
            </p>
          )}
        </Card>
      )}

      {view === "woche" && (
        <div className="grid gap-2 md:grid-cols-7">
          {Array.from({ length: 7 }, (_, i) => addDays(range.from, i)).map((d) => {
            const day = inRange.filter((a) => a.start.startsWith(d));
            return (
              <div key={d} className={cn("min-h-40 rounded-xl border bg-dash-surface p-3", d === today ? "border-dash-strong" : "border-dash-border")}>
                <p className="mb-2 flex items-baseline justify-between text-xs">
                  <span className="font-medium">{fmtDate(d, { weekday: "short", day: "numeric" })}</span>
                  <span className="text-dash-muted">{day.length || ""}</span>
                </p>
                <ul className="space-y-1.5">
                  {day.slice(0, 7).map((a) => (
                    <li key={a.id}>
                      <button type="button" onClick={() => setOpenId(a.id)} className={cn("w-full rounded-md px-2 py-1.5 text-left text-[0.6875rem] leading-tight", a.status === "confirmed" ? "bg-dash-strong text-dash-invert" : a.status === "pending" ? "border border-dashed border-dash-strong" : "bg-dash-subtle text-dash-muted", conflicts.has(a.id) && "ring-2 ring-dash-strong")}>
                        <span className="font-semibold tabular-nums">{fmtTime(a.start)}</span> {a.serviceName}
                      </button>
                    </li>
                  ))}
                  {day.length > 7 && <li className="text-[0.6875rem] text-dash-muted">+{day.length - 7} weitere</li>}
                  {day.length === 0 && <li className="text-[0.6875rem] text-dash-muted">—</li>}
                </ul>
              </div>
            );
          })}
        </div>
      )}

      {view === "monat" && (() => {
        const first = `${cursor.slice(0, 7)}-01`;
        const start = mondayOf(first);
        const cells = Array.from({ length: 42 }, (_, i) => addDays(start, i));
        return (
          <Card padded={false}>
            <div className="grid grid-cols-7 border-b border-dash-border text-center text-[0.6875rem] font-medium uppercase tracking-wider text-dash-muted">
              {["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"].map((d) => <div key={d} className="py-2">{d}</div>)}
            </div>
            <div className="grid grid-cols-7">
              {cells.map((d) => {
                const day = filtered.filter((a) => a.start.startsWith(d) && !["cancelled", "rejected"].includes(a.status));
                const inMonth = d.startsWith(cursor.slice(0, 7));
                return (
                  <button key={d} type="button" onClick={() => { setCursor(d); setView("tag"); }}
                    className={cn("min-h-20 border-b border-r border-dash-border p-2 text-left transition-colors hover:bg-dash-raised [&:nth-child(7n)]:border-r-0", !inMonth && "text-dash-muted opacity-50")}>
                    <span className={cn("inline-flex h-6 w-6 items-center justify-center rounded-full text-xs tabular-nums", d === today && "bg-dash-strong text-dash-invert")}>{Number(d.slice(8))}</span>
                    {day.length > 0 && (
                      <span className="mt-1 block text-[0.6875rem]">
                        <span className="font-semibold">{day.length}</span> Termine
                        {day.some((a) => a.status === "pending") && <span className="block text-dash-muted">{day.filter((a) => a.status === "pending").length} offen</span>}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </Card>
        );
      })()}

      {/* Detail */}
      <Dialog
        open={!!open}
        onClose={() => setOpenId(null)}
        wide
        title={open ? `${open.serviceName} · ${open.customerName}` : ""}
        description={open ? `${fmtDate(open.start, { weekday: "long", day: "numeric", month: "long" })}, ${fmtTime(open.start)} Uhr · ${open.durationMin} Min. (Demo)` : undefined}
        footer={open && (
          <div className="flex w-full flex-wrap justify-between gap-2">
            <button type="button" className={btn("ghost")} onClick={() => setOpenId(null)}>Schließen</button>
            <div className="flex flex-wrap gap-2">
              {open.status === "pending" && (
                <>
                  <button type="button" className={btn("secondary")} onClick={() => setConfirm("reject")}>Ablehnen</button>
                  <button type="button" className={btn("primary")} disabled={!open.employeeId} title={!open.employeeId ? "Erst Mitarbeiter zuweisen" : undefined}
                    onClick={() => update(open.id, { status: "confirmed" }, "Bestätigt")}>Bestätigen</button>
                </>
              )}
              {open.status === "confirmed" && (
                <>
                  <button type="button" className={btn("secondary")} onClick={() => setConfirm("cancel")}>Stornieren</button>
                  <button type="button" className={btn("secondary")} onClick={() => update(open.id, { status: "no_show" }, "Als nicht erschienen markiert")}>Nicht erschienen</button>
                  <button type="button" className={btn("primary")} onClick={() => update(open.id, { status: "completed" }, "Abgeschlossen")}>Abschließen</button>
                </>
              )}
            </div>
          </div>
        )}
      >
        {open && (
          <div className="grid gap-6 md:grid-cols-2">
            <dl className="space-y-3 text-sm">
              <div><dt className="text-xs text-dash-muted">Status</dt><dd className="mt-1 flex gap-2"><StatusBadge status={open.status} />{conflicts.has(open.id) && <Badge tone="solid">Konflikt</Badge>}</dd></div>
              <div><dt className="text-xs text-dash-muted">Kunde</dt><dd>{open.customerName} · {open.customerPhone}</dd></div>
              <div><dt className="text-xs text-dash-muted">Bereich</dt><dd className="capitalize">{open.audience}</dd></div>
              <div><dt className="text-xs text-dash-muted">Preis</dt><dd>{open.priceCents !== null ? fmtEuro(open.priceCents) : "—"}</dd></div>
              {open.note && <div><dt className="text-xs text-dash-muted">Hinweis</dt><dd>{open.note}</dd></div>}
              {open.cancelReason && <div><dt className="text-xs text-dash-muted">Begründung</dt><dd>{open.cancelReason}</dd></div>}
              <div>
                <label htmlFor="assign" className="text-xs text-dash-muted">Mitarbeiter (zuweisen / umbuchen)</label>
                <select
                  id="assign"
                  className={cn(inputCls, "mt-1")}
                  value={open.employeeId ?? ""}
                  disabled={!["pending", "confirmed"].includes(open.status)}
                  onChange={(e) => update(open.id, { employeeId: e.target.value || null }, `Zugewiesen an ${name(e.target.value || null)}`)}
                >
                  <option value="">Nicht zugewiesen</option>
                  {staffList.filter((e) => e.audiences.includes(open.audience)).map((e) => <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>)}
                </select>
                <p className="mt-1 text-[0.6875rem] text-dash-muted">Verfügbarkeit wird später serverseitig geprüft (Phase 5B).</p>
              </div>
            </dl>
            <div>
              <p className="text-xs font-medium text-dash-muted">Verlauf</p>
              <ol className="mt-3 space-y-3 border-l border-dash-border pl-4">
                {open.history.map((h, i) => (
                  <li key={i} className="relative text-sm">
                    <span aria-hidden="true" className="absolute -left-[21px] top-1.5 h-2 w-2 rounded-full bg-dash-strong" />
                    <p className="font-medium">{h.action}</p>
                    <p className="text-xs text-dash-muted">{fmtDate(h.at)} {fmtTime(h.at)} · {h.by}</p>
                    {h.note && <p className="mt-0.5 text-xs">„{h.note}“</p>}
                  </li>
                ))}
              </ol>
            </div>
          </div>
        )}
      </Dialog>

      <ConfirmDialog
        open={confirm !== null}
        onClose={() => setConfirm(null)}
        title={confirm === "reject" ? "Anfrage ablehnen?" : "Termin stornieren?"}
        description="Der Kunde würde später automatisch benachrichtigt (in dieser Vorschau wird nichts versendet)."
        confirmLabel={confirm === "reject" ? "Ablehnen" : "Stornieren"}
        requireReason
        onConfirm={(reason) => {
          if (!open) return;
          if (confirm === "reject") update(open.id, { status: "rejected", cancelReason: reason }, "Abgelehnt", reason);
          else update(open.id, { status: "cancelled", cancelReason: reason }, "Storniert", reason);
        }}
      />
      {toastNode}
    </>
  );
}
