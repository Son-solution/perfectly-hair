"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { useToast } from "@/components/dashboard/interactive";
import { Avatar, Badge, Card, EmptyState, StatusBadge, btn, inputCls, textareaCls } from "@/components/dashboard/ui";
import { fmtDate, fmtEuro, fmtTime } from "@/features/dashboard/calc";
import { SOURCE_LABEL, type Appointment, type Customer } from "@/features/dashboard/domain";
import { cn } from "@/lib/utils";

const AUD: Record<Customer["audience"], string> = { herren: "Herren", damen: "Damen", kinder: "Kinder" };

export function CustomersFromUrl(props: Omit<Parameters<typeof CustomersBoard>[0], "initialId">) {
  const id = useSearchParams().get("id");
  return <CustomersBoard key={id ?? "none"} {...props} initialId={id} />;
}

export function CustomersBoard({ customers, appointments, staffNames, today, actor, canNotes, initialId }: {
  customers: Customer[];
  appointments: Appointment[];
  staffNames: Record<string, string>;
  today: string;
  actor: string;
  canNotes: boolean;
  initialId?: string | null;
}) {
  const [items, setItems] = useState(customers);
  const [q, setQ] = useState("");
  const [aud, setAud] = useState<"alle" | Customer["audience"]>("alle");
  const [selected, setSelected] = useState<string | null>(initialId && customers.some((c) => c.id === initialId) ? initialId : customers[0]?.id ?? null);
  const [note, setNote] = useState("");
  const { toast, toastNode } = useToast();

  const stats = (id: string) => {
    const list = appointments.filter((a) => a.customerId === id);
    const visits = list.filter((a) => a.status === "completed");
    return {
      list: [...list].sort((a, b) => b.start.localeCompare(a.start)),
      visits: visits.length,
      noShows: list.filter((a) => a.status === "no_show").length,
      last: visits.map((a) => a.start).sort().at(-1) ?? null,
      next: list.filter((a) => a.start.slice(0, 10) >= today && (a.status === "confirmed" || a.status === "pending")).map((a) => a.start).sort()[0] ?? null,
      value: visits.reduce((s, a) => s + (a.priceCents ?? 0), 0),
    };
  };

  const filtered = items.filter((c) =>
    (aud === "alle" || c.audience === aud) &&
    (!q || `${c.name} ${c.phone} ${c.email ?? ""}`.toLowerCase().includes(q.toLowerCase())));
  const c = items.find((x) => x.id === selected) ?? null;
  const s = c ? stats(c.id) : null;

  function addNote() {
    if (!c || note.trim().length < 3) return;
    setItems((list) => list.map((x) => x.id === c.id ? { ...x, notes: [...x.notes, { id: `n${Date.now()}`, at: `${today}T${new Date().toTimeString().slice(0, 5)}`, by: actor, text: note.trim() }] } : x));
    setNote("");
    toast("Notiz hinzugefügt – Demo, nicht gespeichert.");
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[380px_1fr]">
      <Card padded={false}>
        <div className="space-y-2 border-b border-dash-border p-4">
          <label htmlFor="k-q" className="sr-only">Kunden suchen</label>
          <input id="k-q" className={inputCls} placeholder="Name, Telefon oder E-Mail" value={q} onChange={(e) => setQ(e.target.value)} />
          <label htmlFor="k-aud" className="sr-only">Bereich</label>
          <select id="k-aud" className={inputCls} value={aud} onChange={(e) => setAud(e.target.value as typeof aud)}>
            <option value="alle">Alle Bereiche</option>
            {Object.entries(AUD).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>
        {filtered.length === 0 ? <div className="p-4"><EmptyState title="Keine Kunden gefunden" /></div> : (
          <ul className="max-h-[70vh] divide-y divide-dash-border overflow-y-auto">
            {filtered.map((x) => {
              const st = stats(x.id);
              return (
                <li key={x.id}>
                  <button type="button" onClick={() => setSelected(x.id)} aria-current={x.id === selected ? "true" : undefined}
                    className={cn("flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-dash-subtle", x.id === selected && "bg-dash-raised")}>
                    <Avatar name={x.name} size={32} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">{x.name}</span>
                      <span className="block text-xs text-dash-muted">{AUD[x.audience]} · {st.visits} Besuche</span>
                    </span>
                    {st.next && <Badge tone="outline">{fmtDate(st.next, { day: "2-digit", month: "2-digit" })}</Badge>}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      {c && s ? (
        <div className="space-y-4">
          <Card>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-4">
                <Avatar name={c.name} size={52} />
                <div>
                  <h2 className="font-display text-2xl">{c.name}</h2>
                  <p className="text-sm text-dash-muted">{AUD[c.audience]} · Kunde seit {fmtDate(c.createdAt, { month: "long", year: "numeric" })}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <a href={`tel:${c.phone.replace(/[^+0-9]/g, "")}`} className={btn("primary", "sm")}>Anrufen: {c.phone}</a>
                {c.email && <a href={`mailto:${c.email}`} className={btn("secondary", "sm")}>E-Mail</a>}
              </div>
            </div>
            <dl className="mt-6 grid grid-cols-2 gap-4 border-t border-dash-border pt-5 text-sm md:grid-cols-5">
              <div><dt className="text-xs text-dash-muted">Besuche</dt><dd className="font-display text-2xl tabular-nums">{s.visits}</dd></div>
              <div><dt className="text-xs text-dash-muted">Nicht erschienen</dt><dd className="font-display text-2xl tabular-nums">{s.noShows}</dd></div>
              <div><dt className="text-xs text-dash-muted">Letzter Besuch</dt><dd>{s.last ? fmtDate(s.last) : "–"}</dd></div>
              <div><dt className="text-xs text-dash-muted">Nächster Termin</dt><dd>{s.next ? `${fmtDate(s.next)} ${fmtTime(s.next)}` : "–"}</dd></div>
              <div><dt className="text-xs text-dash-muted">Geschätzter Wert</dt><dd className="tabular-nums">{fmtEuro(s.value)}</dd></div>
            </dl>
            <p className="mt-4 text-xs text-dash-muted">E-Mail: {c.email ?? "nicht hinterlegt"} · Einwilligung Datenspeicherung: {c.consent ? "liegt vor (Demo)" : "fehlt"}</p>
          </Card>

          <Card title="Termin- und Besuchshistorie" description={`${s.list.length} Einträge`} padded={false}>
            {s.list.length === 0 ? <div className="p-5"><EmptyState title="Noch keine Termine" /></div> : (
              <ul className="max-h-96 divide-y divide-dash-border overflow-y-auto">
                {s.list.map((a) => (
                  <li key={a.id} className="flex flex-wrap items-center gap-3 px-5 py-3 text-sm">
                    <span className="w-28 tabular-nums">{fmtDate(a.start)} {fmtTime(a.start)}</span>
                    <span className="min-w-0 flex-1">{a.serviceName}<span className="block text-xs text-dash-muted">{a.employeeId ? staffNames[a.employeeId] : "Nicht zugewiesen"} · {SOURCE_LABEL[a.source]}</span></span>
                    <StatusBadge status={a.status} />
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card title="Interne Notizen" description={canNotes ? "Nur für berechtigte Personen sichtbar (Berechtigung „Kundennotizen“)." : undefined}>
            {!canNotes ? <p className="text-sm text-dash-muted">Keine Berechtigung für Kundennotizen.</p> : (
              <>
                {c.notes.length === 0 ? <p className="text-sm text-dash-muted">Noch keine Notizen.</p> : (
                  <ul className="space-y-3">
                    {c.notes.map((n) => (
                      <li key={n.id} className="rounded-md border border-dash-border bg-dash-raised p-3 text-sm">
                        <p>{n.text}</p>
                        <p className="mt-1 text-xs text-dash-muted">{n.by} · {fmtDate(n.at)} {fmtTime(n.at)}</p>
                      </li>
                    ))}
                  </ul>
                )}
                <div className="mt-4 space-y-2">
                  <label htmlFor="k-note" className="text-xs font-medium">Neue Notiz</label>
                  <textarea id="k-note" rows={2} className={textareaCls} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Sachlich, keine Gesundheitsdaten ohne ausdrückliche Einwilligung." />
                  <button type="button" className={btn("secondary", "sm")} disabled={note.trim().length < 3} onClick={addNote}>Notiz speichern (Demo)</button>
                </div>
              </>
            )}
          </Card>
        </div>
      ) : <EmptyState title="Kein Kunde ausgewählt" />}
      {toastNode}
    </div>
  );
}
