"use client";

import { useMemo, useState } from "react";
import { useToast } from "@/components/dashboard/interactive";
import { Badge, Card, EmptyState, btn, inputCls } from "@/components/dashboard/ui";
import { formatPrice } from "@/lib/format";
import { AUDIENCES, AUDIENCE_LABEL, type AudienceKey } from "@/lib/pricing";
import { cn } from "@/lib/utils";

type Price = { available: boolean; priceCents: number | null; priceIsFrom: boolean; durationMin: number | null };
export type EditableService = { id: string; name: string; visible: boolean; order: number; source: "flyer" | "salon"; prices: Record<AudienceKey, Price> };

/** Text state of one audience block (inputs stay as typed until saved). */
type Draft = { available: boolean; price: string; from: boolean; duration: string };
type Row = { id: string; name: string; visible: boolean; isNew: boolean; source: "flyer" | "salon"; prices: Record<AudienceKey, Draft> };

const toDraft = (p: Price): Draft => ({
  available: p.available,
  price: p.priceCents === null ? "" : (p.priceCents / 100).toFixed(2).replace(".", ",").replace(",00", ""),
  from: p.priceIsFrom,
  duration: p.durationMin === null ? "" : String(p.durationMin),
});

/** "20" / "20,50" / "" → cents | null | error */
function parsePrice(v: string): { cents: number | null; error?: string } {
  const t = v.trim();
  if (!t) return { cents: null };
  if (!/^\d{1,4}([.,]\d{1,2})?$/.test(t)) return { cents: null, error: "Preis z. B. 20 oder 20,50" };
  const cents = Math.round(Number(t.replace(",", ".")) * 100);
  if (cents > 100000) return { cents: null, error: "Max. 1.000 €" };
  return { cents };
}
function parseDuration(v: string): { min: number | null; error?: string } {
  const t = v.trim();
  if (!t) return { min: null };
  if (!/^\d{1,3}$/.test(t) || +t < 5 || +t > 480) return { min: null, error: "5–480 Min." };
  return { min: +t };
}
const preview = (d: Draft) => {
  if (!d.available) return "nicht angeboten";
  const p = parsePrice(d.price);
  if (p.error) return "—";
  return p.cents === null ? "Preis auf Anfrage" : formatPrice(p.cents, d.from);
};
/** Monochrome arrow (unicode arrows render as coloured emoji on some systems). */
const Arrow = ({ up = false }: { up?: boolean }) => (
  <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={cn("h-4 w-4", up && "rotate-180")}>
    <path d="M12 5v14M6 13l6 6 6-6" />
  </svg>
);
const slug = (name: string) => name.toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "").replace(/ß/g, "ss").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "leistung";

/**
 * Admin → Leistungen & Preise. Separate price, "ab"-flag, duration and availability per
 * audience. Demo: edits live in this page only. Phase 5B: Server Action (`services.manage`),
 * Zod validation (`audiencePrice`), `audit_log` entry, revalidate content tags → the public
 * price lists, audience pages, booking flow and request form update immediately.
 */
export function ServicesEditor({ initial }: { initial: EditableService[] }) {
  const start = useMemo<Row[]>(() => [...initial].sort((a, b) => a.order - b.order).map((s) => ({
    id: s.id, name: s.name, visible: s.visible, isNew: false, source: s.source,
    prices: { herren: toDraft(s.prices.herren), damen: toDraft(s.prices.damen), kinder: toDraft(s.prices.kinder) },
  })), [initial]);
  const [rows, setRows] = useState<Row[]>(start);
  const [newName, setNewName] = useState("");
  const [touched, setTouched] = useState(false);
  const [log, setLog] = useState<string[]>([]);
  const { toast, toastNode } = useToast();

  const dirty = JSON.stringify(rows) !== JSON.stringify(start);
  const errors = rows.flatMap((r) => [
    ...(r.name.trim().length < 2 ? [`${r.name || "Neue Leistung"}: Name fehlt`] : []),
    ...AUDIENCES.flatMap((a) => {
      const d = r.prices[a];
      if (!d.available) return [];
      const p = parsePrice(d.price), m = parseDuration(d.duration);
      return [p.error && `${r.name} · ${AUDIENCE_LABEL[a]}: ${p.error}`, m.error && `${r.name} · ${AUDIENCE_LABEL[a]}: Dauer ${m.error}`].filter(Boolean) as string[];
    }),
  ]);

  const patch = (id: string, f: (r: Row) => Row) => setRows((list) => list.map((r) => (r.id === id ? f(r) : r)));
  const patchPrice = (id: string, a: AudienceKey, change: Partial<Draft>) => patch(id, (r) => ({ ...r, prices: { ...r.prices, [a]: { ...r.prices[a], ...change } } }));
  const move = (i: number, dir: -1 | 1) => setRows((list) => {
    const j = i + dir;
    if (j < 0 || j >= list.length) return list;
    const next = [...list];
    [next[i], next[j]] = [next[j], next[i]];
    return next;
  });

  function addService() {
    const name = newName.trim();
    if (name.length < 2) return;
    let id = slug(name);
    while (rows.some((r) => r.id === id)) id += "-2";
    const empty: Draft = { available: false, price: "", from: false, duration: "" };
    setRows((list) => [...list, { id, name, visible: true, isNew: true, source: "salon", prices: { herren: { ...empty }, damen: { ...empty }, kinder: { ...empty } } }]);
    setNewName("");
    toast(`„${name}“ hinzugefügt – bitte Bereiche und Preise festlegen.`);
  }

  function save() {
    setTouched(true);
    if (errors.length) { toast("Bitte zuerst die markierten Felder korrigieren."); return; }
    const changes = rows.filter((r) => JSON.stringify(r) !== JSON.stringify(start.find((s) => s.id === r.id))).map((r) => r.name);
    setLog((l) => [`${new Date().toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })} · ${changes.length} Leistung(en) geändert: ${changes.join(", ") || "Reihenfolge"}`, ...l].slice(0, 5));
    toast("Demo – geprüft, aber nicht gespeichert. Speichern auf der Website folgt mit Phase 5B.");
  }

  return (
    <>
      <div className="sticky top-16 z-10 -mx-4 mb-4 flex flex-wrap items-center gap-2 border-b border-dash-border bg-dash-bg/95 px-4 py-3 backdrop-blur md:-mx-8 md:px-8">
        <span className="mr-auto text-sm">
          {dirty ? <Badge tone="dashed">Ungespeicherte Änderungen</Badge> : <span className="text-dash-muted">Keine Änderungen</span>}
          {touched && errors.length > 0 && <span className="ml-2 text-xs font-medium">{errors.length} Fehler</span>}
        </span>
        <button type="button" className={btn("ghost", "sm")} disabled={!dirty} onClick={() => { setRows(start); setTouched(false); toast("Änderungen verworfen."); }}>Verwerfen</button>
        <button type="button" className={btn("primary", "sm")} disabled={!dirty} onClick={save}>Speichern</button>
      </div>

      {touched && errors.length > 0 && (
        <div role="alert" className="mb-4 rounded-lg border border-dash-strong bg-dash-surface p-4 text-sm">
          <p className="font-semibold">Bitte korrigieren:</p>
          <ul className="mt-1 list-disc pl-5 text-dash-muted">{errors.map((e) => <li key={e}>{e}</li>)}</ul>
        </div>
      )}

      {rows.length === 0 && <EmptyState title="Noch keine Leistungen" />}
      <div className="space-y-4">
        {rows.map((r, i) => (
          <Card key={r.id} padded={false} className={cn(!r.visible && "opacity-70")}>
            <div className="flex flex-col gap-3 border-b border-dash-border p-4 md:flex-row md:items-center">
              <div className="flex items-center gap-1">
                <button type="button" className={btn("ghost", "sm")} onClick={() => move(i, -1)} disabled={i === 0} aria-label={`${r.name} nach oben`}><Arrow up /></button>
                <button type="button" className={btn("ghost", "sm")} onClick={() => move(i, 1)} disabled={i === rows.length - 1} aria-label={`${r.name} nach unten`}><Arrow /></button>
              </div>
              <label className="sr-only" htmlFor={`sv-name-${r.id}`}>Name der Leistung</label>
              <input id={`sv-name-${r.id}`} className={cn(inputCls, "font-medium md:max-w-sm")} value={r.name} onChange={(e) => patch(r.id, (x) => ({ ...x, name: e.target.value }))} />
              <div className="flex flex-wrap items-center gap-2 md:ml-auto">
                {r.isNew && <Badge tone="outline">Neu</Badge>}
                {r.source === "flyer" && !r.isNew && <Badge tone="muted">Startwert: Flyer</Badge>}
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" className="h-4 w-4 accent-current" checked={r.visible} onChange={(e) => patch(r.id, (x) => ({ ...x, visible: e.target.checked }))} />
                  Auf der Website sichtbar
                </label>
                {r.isNew && <button type="button" className={btn("ghost", "sm")} onClick={() => setRows((l) => l.filter((x) => x.id !== r.id))}>Entfernen</button>}
              </div>
            </div>
            <div className="grid gap-px bg-dash-border md:grid-cols-3">
              {AUDIENCES.map((a) => {
                const d = r.prices[a];
                const pErr = touched && d.available ? parsePrice(d.price).error : undefined;
                const mErr = touched && d.available ? parseDuration(d.duration).error : undefined;
                const pid = `sv-${r.id}-${a}`;
                return (
                  <fieldset key={a} className={cn("bg-dash-surface p-4", !d.available && "bg-dash-raised")}>
                    <legend className="sr-only">{AUDIENCE_LABEL[a]}</legend>
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold">{AUDIENCE_LABEL[a]}</p>
                      <label className="flex items-center gap-2 text-xs">
                        <input type="checkbox" className="h-4 w-4 accent-current" checked={d.available} onChange={(e) => patchPrice(r.id, a, { available: e.target.checked })} />
                        Angeboten
                      </label>
                    </div>
                    <div className={cn("mt-3 grid grid-cols-2 gap-2", !d.available && "pointer-events-none opacity-40")} aria-disabled={!d.available}>
                      <div>
                        <label htmlFor={`${pid}-p`} className="text-[0.6875rem] text-dash-muted">Preis (€)</label>
                        <input id={`${pid}-p`} inputMode="decimal" placeholder="auf Anfrage" disabled={!d.available} className={cn(inputCls, "mt-1 tabular-nums", pErr && "border-dash-strong")} aria-invalid={!!pErr} value={d.price} onChange={(e) => patchPrice(r.id, a, { price: e.target.value })} />
                      </div>
                      <div>
                        <label htmlFor={`${pid}-d`} className="text-[0.6875rem] text-dash-muted">Dauer (Min.)</label>
                        <input id={`${pid}-d`} inputMode="numeric" placeholder="offen" disabled={!d.available} className={cn(inputCls, "mt-1 tabular-nums", mErr && "border-dash-strong")} aria-invalid={!!mErr} value={d.duration} onChange={(e) => patchPrice(r.id, a, { duration: e.target.value })} />
                      </div>
                      <label className="col-span-2 flex items-center gap-2 text-xs">
                        <input type="checkbox" className="h-4 w-4 accent-current" disabled={!d.available} checked={d.from} onChange={(e) => patchPrice(r.id, a, { from: e.target.checked })} />
                        „ab“-Preis (Preis kann je nach Aufwand steigen)
                      </label>
                    </div>
                    {(pErr || mErr) && <p className="mt-2 text-xs font-medium">— {[pErr, mErr].filter(Boolean).join(" · ")}</p>}
                    <p className="mt-3 border-t border-dash-border pt-2 text-xs text-dash-muted">
                      Website: <span className="font-display text-base text-dash-text">{preview(d)}</span>
                    </p>
                  </fieldset>
                );
              })}
            </div>
          </Card>
        ))}
      </div>

      <Card className="mt-4" title="Neue Leistung hinzufügen">
        <form className="flex flex-col gap-2 sm:flex-row" onSubmit={(e) => { e.preventDefault(); addService(); }}>
          <label htmlFor="sv-new" className="sr-only">Name der neuen Leistung</label>
          <input id="sv-new" className={inputCls} placeholder="z. B. Strähnen" value={newName} onChange={(e) => setNewName(e.target.value)} />
          <button type="submit" className={btn("secondary")} disabled={newName.trim().length < 2}>Hinzufügen</button>
        </form>
        <p className="mt-2 text-xs text-dash-muted">Neue Leistungen sind zunächst für keinen Bereich angeboten – Bereiche und Preise danach festlegen.</p>
      </Card>

      {log.length > 0 && (
        <Card className="mt-4" title="Änderungsprotokoll (Demo)">
          <ul className="space-y-1 text-xs text-dash-muted">{log.map((l) => <li key={l}>{l}</li>)}</ul>
        </Card>
      )}
      {toastNode}
    </>
  );
}
