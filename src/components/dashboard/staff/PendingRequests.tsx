"use client";

import Link from "next/link";
import { useState } from "react";
import { ConfirmDialog, useToast } from "@/components/dashboard/interactive";
import { Card, StatusBadge, btn } from "@/components/dashboard/ui";
import { fmtDate, fmtTime } from "@/features/dashboard/calc";
import type { Appointment } from "@/features/dashboard/domain";

/**
 * Own pending appointment requests on the staff overview. Accept/reject only if the salon
 * policy grants `appointments.decide_own`; rejecting requires a reason (min. 5 chars).
 * Phase 5B: Server Action re-checks permission + availability; history entry is server-side.
 */
export function PendingRequests({ initial, today, me, canDecide }: { initial: Appointment[]; today: string; me: string; canDecide: boolean }) {
  const [items, setItems] = useState(initial);
  const [rejectId, setRejectId] = useState<string | null>(null);
  const { toast, toastNode } = useToast();
  const pending = items.filter((a) => a.status === "pending");

  const decide = (id: string, status: "confirmed" | "rejected", note: string | null) => {
    setItems((l) => l.map((a) => (a.id === id ? {
      ...a, status, cancelReason: status === "rejected" ? note : a.cancelReason,
      history: [...a.history, { at: `${today}T${new Date().toTimeString().slice(0, 5)}`, by: me, action: status === "confirmed" ? "Angenommen" : "Abgelehnt", note }],
    } : a)));
    toast(`${status === "confirmed" ? "Angenommen" : "Abgelehnt"} – Demo, nicht gespeichert.`);
  };

  return (
    <Card
      title="Offene Anfragen"
      description={canDecide ? "Annehmen oder ablehnen (mit Begründung)." : "Die Entscheidung trifft die Salonleitung."}
      action={<Link href="/staff/appointments" className={btn("ghost", "sm")}>Alle Termine</Link>}
      padded={false}
    >
      <ul className="divide-y divide-dash-border">
        {items.map((a) => (
          <li key={a.id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center">
            <div className="min-w-0 flex-1 text-sm">
              <p className="font-medium">{a.serviceName} · {a.customerName}</p>
              <p className="text-xs text-dash-muted">{fmtDate(a.start, { weekday: "short", day: "2-digit", month: "2-digit" })} · {fmtTime(a.start)} Uhr · {a.durationMin} Min.</p>
            </div>
            {a.status === "pending" && canDecide ? (
              <div className="flex gap-2">
                <button type="button" className={btn("secondary", "sm")} onClick={() => setRejectId(a.id)}>Ablehnen</button>
                <button type="button" className={btn("primary", "sm")} onClick={() => decide(a.id, "confirmed", null)}>Annehmen</button>
              </div>
            ) : <StatusBadge status={a.status} />}
          </li>
        ))}
        {items.length === 0 && <li className="px-5 py-4 text-sm text-dash-muted">Keine offenen Anfragen.</li>}
      </ul>
      {pending.length === 0 && items.length > 0 && <p className="border-t border-dash-border px-5 py-3 text-xs text-dash-muted">Alle Anfragen bearbeitet.</p>}
      <ConfirmDialog
        open={!!rejectId}
        onClose={() => setRejectId(null)}
        onConfirm={(reason) => { if (rejectId) decide(rejectId, "rejected", reason); setRejectId(null); }}
        title="Anfrage ablehnen"
        description="Bitte kurz begründen – die Salonleitung sieht die Begründung im Verlauf."
        confirmLabel="Ablehnen"
        requireReason
      />
      {toastNode}
    </Card>
  );
}
