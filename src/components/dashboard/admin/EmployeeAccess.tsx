"use client";

import { useState } from "react";
import { ConfirmDialog, useToast } from "@/components/dashboard/interactive";
import { Badge, Card, btn } from "@/components/dashboard/ui";
import { fmtDate } from "@/features/dashboard/calc";

/**
 * Login + employment status (demo). Phase 5B: Supabase Auth.
 * - The admin INVITES by e-mail; the employee sets their own password (admin never sees it).
 * - "Deaktivieren" blocks sign-in immediately (ban + session revoke) but keeps all records
 *   (attendance must be kept for years — ArbZG / tax law). No hard delete.
 */
export function EmployeeAccess({ name, email, initiallyActive, futureAppointments, today }: {
  name: string; email: string; initiallyActive: boolean; futureAppointments: number; today: string;
}) {
  const [active, setActive] = useState(initiallyActive);
  const [history, setHistory] = useState<{ at: string; text: string }[]>([]);
  const [confirm, setConfirm] = useState<null | "off" | "on">(null);
  const { toast, toastNode } = useToast();

  return (
    <Card
      className="mb-6"
      title="Zugang & Status"
      description="Jeder Mitarbeiter hat ein eigenes Konto und sieht nur seine eigenen Daten."
      action={active
        ? <button type="button" className={btn("danger", "sm")} onClick={() => setConfirm("off")}>Deaktivieren</button>
        : <button type="button" className={btn("primary", "sm")} onClick={() => setConfirm("on")}>Reaktivieren</button>}
    >
      <dl className="grid gap-4 text-sm sm:grid-cols-3">
        <div><dt className="text-xs text-dash-muted">Anmeldung (Benutzername)</dt><dd className="mt-1 font-medium">{email}</dd></div>
        <div>
          <dt className="text-xs text-dash-muted">Passwort</dt>
          <dd className="mt-1 flex flex-wrap items-center gap-2">
            <span>Vom Mitarbeiter selbst gesetzt</span>
            <button type="button" className={btn("secondary", "sm")} disabled title="Backend erforderlich (Phase 5B)">Reset-Link senden</button>
          </dd>
        </div>
        <div>
          <dt className="text-xs text-dash-muted">Status</dt>
          <dd className="mt-1">{active ? <Badge tone="solid">Aktiv – Anmeldung erlaubt</Badge> : <Badge tone="muted">Deaktiviert – keine Anmeldung</Badge>}</dd>
        </div>
      </dl>
      {history.length > 0 && (
        <ul className="mt-4 space-y-1 border-t border-dash-border pt-3 text-xs text-dash-muted">
          {history.map((h, i) => <li key={i}>{fmtDate(h.at)} · {h.text}</li>)}
        </ul>
      )}
      <p className="mt-4 text-xs text-dash-muted">Demo – Konten, Einladung und Sperre werden mit Phase 5B (Supabase Auth) aktiv. Daten werden beim Deaktivieren nicht gelöscht.</p>

      <ConfirmDialog
        open={confirm === "off"}
        onClose={() => setConfirm(null)}
        title={`${name} deaktivieren?`}
        description={`Die Anmeldung wird sofort gesperrt. Zeiterfassung, Termine und Lohndaten bleiben erhalten.${futureAppointments ? ` Achtung: ${futureAppointments} kommende Termine müssen anderen Mitarbeitern zugewiesen werden.` : ""}`}
        confirmLabel="Deaktivieren"
        requireReason
        reasonLabel="Grund (z. B. Austritt zum …)"
        onConfirm={(reason) => { setActive(false); setHistory((h) => [...h, { at: today, text: `Deaktiviert: ${reason}` }]); toast("Deaktiviert – Demo, nicht gespeichert."); }}
      />
      <ConfirmDialog
        open={confirm === "on"}
        onClose={() => setConfirm(null)}
        title={`${name} reaktivieren?`}
        description="Die Anmeldung wird wieder erlaubt."
        confirmLabel="Reaktivieren"
        onConfirm={() => { setActive(true); setHistory((h) => [...h, { at: today, text: "Reaktiviert" }]); toast("Reaktiviert – Demo, nicht gespeichert."); }}
      />
      {toastNode}
    </Card>
  );
}
