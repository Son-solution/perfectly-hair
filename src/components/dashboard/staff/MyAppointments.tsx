"use client";

import { useState } from "react";
import { ConfirmDialog, Dialog, Tabs, useToast } from "@/components/dashboard/interactive";
import { Card, EmptyState, StatusBadge, btn } from "@/components/dashboard/ui";
import { fmtDate, fmtTime } from "@/features/dashboard/calc";
import type { Appointment } from "@/features/dashboard/domain";

/** Own appointments only. Accept/reject/cancel visible only when the salon policy allows it. */
export function MyAppointments({ initial, today, me, canDecide, canCancel }: {
  initial: Appointment[]; today: string; me: string; canDecide: boolean; canCancel: boolean;
}) {
  const [items, setItems] = useState(initial);
  const [tab, setTab] = useState("heute");
  const [openId, setOpenId] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<null | "reject" | "cancel">(null);
  const { toast, toastNode } = useToast();

  const lists: Record<string, Appointment[]> = {
    heute: items.filter((a) => a.start.startsWith(today)),
    anfragen: items.filter((a) => a.status === "pending" && a.start >= today),
    anstehend: items.filter((a) => a.start.slice(0, 10) > today && ["confirmed", "pending"].includes(a.status)),
    verlauf: items.filter((a) => a.start.slice(0, 10) < today).reverse(),
  };
  const open = items.find((a) => a.id === openId) ?? null;
  const update = (id: string, patch: Partial<Appointment>, action: string, note: string | null = null) => {
    setItems((l) => l.map((a) => (a.id === id ? { ...a, ...patch, history: [...a.history, { at: `${today}T12:00`, by: me, action, note }] } : a)));
    toast(`${action}.`);
  };

  const shown = lists[tab];
  const byDay = shown.reduce<Record<string, Appointment[]>>((acc, a) => { (acc[a.start.slice(0, 10)] ??= []).push(a); return acc; }, {});

  return (
    <>
      <Tabs label="Terminlisten" value={tab} onChange={setTab} tabs={[
        { id: "heute", label: "Heute", count: lists.heute.length }, { id: "anfragen", label: "Anfragen", count: lists.anfragen.length },
        { id: "anstehend", label: "Anstehend" }, { id: "verlauf", label: "Verlauf" },
      ]} />
      <div className="mt-4 space-y-4">
        {shown.length === 0 && <EmptyState title="Keine Termine in dieser Ansicht" />}
        {Object.entries(byDay).slice(0, 14).map(([day, list]) => (
          <Card key={day} title={fmtDate(day, { weekday: "long", day: "numeric", month: "long" })} padded={false}>
            <ul className="divide-y divide-dash-border">
              {list.map((a) => (
                <li key={a.id}>
                  <button type="button" onClick={() => setOpenId(a.id)} className="flex w-full items-center gap-4 px-5 py-4 text-left hover:bg-dash-raised">
                    <span className="w-14 font-display text-xl tabular-nums">{fmtTime(a.start)}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">{a.serviceName}</span>
                      <span className="block truncate text-xs text-dash-muted">{a.customerName} · {a.durationMin} Min.</span>
                    </span>
                    <StatusBadge status={a.status} />
                  </button>
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </div>

      <Dialog
        open={!!open}
        onClose={() => setOpenId(null)}
        title={open ? `${open.serviceName} · ${fmtTime(open.start)} Uhr` : ""}
        description={open ? fmtDate(open.start, { weekday: "long", day: "numeric", month: "long" }) : undefined}
        footer={open && (
          <div className="flex w-full flex-wrap justify-end gap-2">
            {open.status === "pending" && canDecide && (
              <>
                <button type="button" className={btn("secondary")} onClick={() => setConfirm("reject")}>Ablehnen</button>
                <button type="button" className={btn("primary")} onClick={() => update(open.id, { status: "confirmed" }, "Angenommen")}>Annehmen</button>
              </>
            )}
            {open.status === "confirmed" && (
              <>
                {canCancel && <button type="button" className={btn("secondary")} onClick={() => setConfirm("cancel")}>Stornieren</button>}
                {open.start.slice(0, 10) <= today && <button type="button" className={btn("primary")} onClick={() => update(open.id, { status: "completed" }, "Als erledigt markiert")}>Erledigt</button>}
              </>
            )}
            <button type="button" className={btn("ghost")} onClick={() => setOpenId(null)}>Schließen</button>
          </div>
        )}
      >
        {open && (
          <dl className="space-y-3 text-sm">
            <div><dt className="text-xs text-dash-muted">Status</dt><dd className="mt-1"><StatusBadge status={open.status} /></dd></div>
            <div><dt className="text-xs text-dash-muted">Kunde</dt><dd>{open.customerName} · {open.customerPhone}</dd></div>
            <div><dt className="text-xs text-dash-muted">Dauer</dt><dd>{open.durationMin} Minuten (Demo)</dd></div>
            {open.note && <div><dt className="text-xs text-dash-muted">Hinweis</dt><dd>{open.note}</dd></div>}
            {open.status === "pending" && !canDecide && <p className="rounded-md bg-dash-raised p-3 text-xs text-dash-muted">Anfragen werden von der Salonleitung bestätigt.</p>}
          </dl>
        )}
      </Dialog>

      <ConfirmDialog
        open={confirm !== null}
        onClose={() => setConfirm(null)}
        title={confirm === "reject" ? "Anfrage ablehnen?" : "Termin stornieren?"}
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
