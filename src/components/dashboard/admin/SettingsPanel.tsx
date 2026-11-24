"use client";

import { useState } from "react";
import { Tabs, useToast } from "@/components/dashboard/interactive";
import { Avatar, Badge, Card, Field, Table, Td, Th, btn, inputCls } from "@/components/dashboard/ui";
import { ROLE_LABEL, type Employee, type Role } from "@/features/dashboard/domain";
import { PERMISSIONS, PERMISSION_LABEL, ROLE_PERMISSIONS } from "@/features/dashboard/permissions";
import { cn } from "@/lib/utils";

type Hour = { weekday: number; label: string; opens: string | null; closes: string | null };

function Toggle({ id, label, hint, defaultOn }: { id: string; label: string; hint?: string; defaultOn?: boolean }) {
  const [on, setOn] = useState(!!defaultOn);
  return (
    <div className="flex items-start justify-between gap-6 py-3">
      <div>
        <label htmlFor={id} className="text-sm font-medium">{label}</label>
        {hint && <p className="mt-0.5 text-xs text-dash-muted">{hint}</p>}
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={on}
        onClick={() => setOn(!on)}
        className={cn("relative h-6 w-11 shrink-0 rounded-full transition-colors", on ? "bg-dash-strong" : "bg-dash-subtle")}
      >
        <span className={cn("absolute top-0.5 h-5 w-5 rounded-full bg-dash-surface shadow transition-transform", on ? "translate-x-5" : "translate-x-0.5")} />
      </button>
    </div>
  );
}

export function SettingsPanel({ hours, employees, salonName, phone, address }: {
  hours: Hour[]; employees: Employee[]; salonName: string; phone: string; address: string;
}) {
  const [tab, setTab] = useState("salon");
  const { toast, toastNode } = useToast();
  const save = <button type="button" className={btn("primary")} onClick={() => toast("Einstellungen übernommen")}>Speichern</button>;

  return (
    <>
      <Tabs label="Einstellungsbereiche" value={tab} onChange={setTab} tabs={[
        { id: "salon", label: "Salon" }, { id: "buchung", label: "Buchungsregeln" }, { id: "zeiten", label: "Arbeitszeiten & Pausen" },
        { id: "rechte", label: "Berechtigungen" }, { id: "benutzer", label: "Benutzer & Rollen" }, { id: "benachrichtigungen", label: "Benachrichtigungen" },
      ]} />
      <div className="mt-6" role="tabpanel">
        {tab === "salon" && (
          <Card title="Salon" description="Stammdaten werden auf der Website verwendet (Quelle: Content-Schicht)" action={save}>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Name" htmlFor="s-name"><input id="s-name" className={inputCls} defaultValue={salonName} /></Field>
              <Field label="Telefon" htmlFor="s-phone"><input id="s-phone" className={inputCls} defaultValue={phone} /></Field>
              <Field label="Adresse" htmlFor="s-addr"><input id="s-addr" className={inputCls} defaultValue={address} /></Field>
              <Field label="E-Mail" htmlFor="s-mail" hint="Noch nicht hinterlegt"><input id="s-mail" className={inputCls} placeholder="info@…" /></Field>
            </div>
          </Card>
        )}

        {tab === "buchung" && (
          <Card title="Buchungsregeln" description="Wirksam ab Anbindung der Buchungs-Engine (serverseitig geprüft)" action={save}>
            <Field label="Freigabemodus" htmlFor="b-mode" hint="Hybrid: automatisch bestätigen, wenn alle Regeln erfüllt sind – sonst manuell.">
              <select id="b-mode" className={inputCls} defaultValue="hybrid">
                <option value="manual">Manuell – jede Anfrage bestätigen</option>
                <option value="auto">Automatisch – sofort bestätigen</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </Field>
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <Field label="Mindestvorlauf (Stunden)" htmlFor="b-lead"><input id="b-lead" type="number" className={inputCls} defaultValue={2} /></Field>
              <Field label="Buchbar bis (Tage im Voraus)" htmlFor="b-max"><input id="b-max" type="number" className={inputCls} defaultValue={60} /></Field>
              <Field label="Stornierung bis (Stunden vorher)" htmlFor="b-cancel"><input id="b-cancel" type="number" className={inputCls} defaultValue={24} /></Field>
            </div>
            <div className="mt-4 divide-y divide-dash-border">
              <Toggle id="t-staff-decide" label="Mitarbeiter dürfen eigene Anfragen annehmen/ablehnen" defaultOn />
              <Toggle id="t-staff-cancel" label="Mitarbeiter dürfen eigene Termine stornieren (mit Begründung)" />
              <Toggle id="t-waitlist" label="Warteliste aktivieren" hint="Freiwerdende Termine werden Wartenden angeboten" />
            </div>
          </Card>
        )}

        {tab === "zeiten" && (
          <Card title="Öffnungszeiten & Pausenregeln" action={save}>
            <ul className="divide-y divide-dash-border">
              {hours.map((h) => (
                <li key={h.weekday} className="grid grid-cols-[7rem_1fr_1fr] items-center gap-3 py-2.5 text-sm">
                  <span className="font-medium">{h.label}</span>
                  <input aria-label={`${h.label} öffnet`} type="time" className={inputCls} defaultValue={h.opens ?? ""} disabled={!h.opens} />
                  <input aria-label={`${h.label} schließt`} type="time" className={inputCls} defaultValue={h.closes ?? ""} disabled={!h.opens} />
                </li>
              ))}
            </ul>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <Field label="Pflichtpause ab 6 Std. (Minuten)" htmlFor="z-p6" hint="Gesetzlich mind. 30 Min. (§ 4 ArbZG)"><input id="z-p6" type="number" className={inputCls} defaultValue={30} /></Field>
              <Field label="Pflichtpause ab 9 Std. (Minuten)" htmlFor="z-p9" hint="Gesetzlich mind. 45 Min."><input id="z-p9" type="number" className={inputCls} defaultValue={45} /></Field>
            </div>
          </Card>
        )}

        {tab === "rechte" && (
          <Card title="Berechtigungsmatrix" description="Zentrale Definition (src/features/dashboard/permissions.ts). In dieser Vorschau nur Darstellung – Durchsetzung später per Auth + RLS.">
            <Table label="Berechtigungen">
              <thead><tr><Th>Berechtigung</Th>{(["super_admin", "admin", "staff"] as Role[]).map((r) => <Th key={r} className="text-center">{ROLE_LABEL[r]}</Th>)}</tr></thead>
              <tbody>
                {PERMISSIONS.map((p) => (
                  <tr key={p}>
                    <Td>{PERMISSION_LABEL[p]}</Td>
                    {(["super_admin", "admin", "staff"] as Role[]).map((r) => (
                      <Td key={r} className="text-center">{ROLE_PERMISSIONS[r].has(p) ? <span aria-label="erlaubt">●</span> : <span aria-label="nicht erlaubt" className="text-dash-muted">—</span>}</Td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card>
        )}

        {tab === "benutzer" && (
          <Card title="Benutzer & Rollen" description="Rollenänderungen nur durch Super-Admin (später per Datenbank-Trigger erzwungen)" action={<button type="button" className={btn("primary", "sm")} disabled title="Einladungen ab Phase 5B">Benutzer einladen</button>}>
            <ul className="divide-y divide-dash-border">
              {employees.map((e) => (
                <li key={e.id} className="flex items-center gap-3 py-3">
                  <Avatar name={`${e.firstName} ${e.lastName}`} size={32} />
                  <div className="flex-1 text-sm"><p className="font-medium">{e.firstName} {e.lastName}</p><p className="text-xs text-dash-muted">{e.email}</p></div>
                  <Badge tone={e.role === "staff" ? "muted" : "outline"}>{ROLE_LABEL[e.role]}</Badge>
                </li>
              ))}
            </ul>
          </Card>
        )}

        {tab === "benachrichtigungen" && (
          <Card title="Benachrichtigungen" description="In dieser Phase werden keine E-Mails oder Push-Nachrichten versendet." action={save}>
            <div className="divide-y divide-dash-border">
              <Toggle id="n-new" label="Neue Terminanfrage" hint="In-App für Admin und zugewiesene Mitarbeiter" defaultOn />
              <Toggle id="n-cancel" label="Stornierung durch Kunden" defaultOn />
              <Toggle id="n-leave" label="Neuer Urlaubsantrag" defaultOn />
              <Toggle id="n-att" label="Fehlendes Ausstempeln (täglich 20:00)" defaultOn />
              <Toggle id="n-mail" label="Zusätzlich per E-Mail" hint="Erst nach Einrichtung von Resend" />
            </div>
          </Card>
        )}
      </div>
      {toastNode}
    </>
  );
}
