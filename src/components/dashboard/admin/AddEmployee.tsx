"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { Dialog, useToast } from "@/components/dashboard/interactive";
import { Badge, Card, Field, btn, inputCls } from "@/components/dashboard/ui";
import { ROLE_LABEL, type Role } from "@/features/dashboard/domain";

type Draft = { firstName: string; lastName: string; email: string; phone: string; position: string; role: Role; hours: string; start: string; audiences: string[] };
const EMPTY: Draft = { firstName: "", lastName: "", email: "", phone: "", position: "", role: "staff", hours: "40", start: "", audiences: [] };

function validate(d: Draft) {
  const e: Partial<Record<keyof Draft, string>> = {};
  if (d.firstName.trim().length < 2) e.firstName = "Bitte Vornamen angeben.";
  if (d.lastName.trim().length < 2) e.lastName = "Bitte Nachnamen angeben.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email)) e.email = "Bitte gültige E-Mail angeben (für die spätere Einladung).";
  if (d.phone && !/^[+0-9 ()/-]{6,}$/.test(d.phone)) e.phone = "Ungültige Telefonnummer.";
  if (!d.position.trim()) e.position = "Bitte Position angeben.";
  const h = Number(d.hours);
  if (!Number.isFinite(h) || h <= 0 || h > 48) e.hours = "Wochenstunden zwischen 1 und 48 (ArbZG).";
  if (!d.start) e.start = "Bitte Eintrittsdatum angeben.";
  if (!d.audiences.length) e.audiences = "Mindestens einen Bereich wählen.";
  return e;
}

/** Reads ?neu=1 (from the overview quick action). Must sit inside <Suspense>. */
export function AddEmployeeFromUrl() {
  return <AddEmployee initialOpen={useSearchParams().get("neu") === "1"} />;
}

/**
 * "Mitarbeiter hinzufügen" (demo). Phase 5B: creates `staff_members` + sends a Supabase Auth
 * invitation; only Super-Admin may assign admin roles. Nothing is stored here.
 */
export function AddEmployee({ initialOpen = false }: { initialOpen?: boolean }) {
  const [open, setOpen] = useState(initialOpen);
  const [d, setD] = useState<Draft>(EMPTY);
  const [errors, setErrors] = useState<ReturnType<typeof validate>>({});
  const [added, setAdded] = useState<Draft[]>([]);
  const { toast, toastNode } = useToast();
  const set = (p: Partial<Draft>) => setD((s) => ({ ...s, ...p }));

  function save() {
    const e = validate(d);
    setErrors(e);
    if (Object.keys(e).length) return;
    setAdded((a) => [...a, d]);
    setD(EMPTY);
    setOpen(false);
    toast("Mitarbeiter erfasst – Demo, nicht gespeichert. Einladung erst mit Phase 5B.");
  }

  return (
    <>
      <button type="button" className={btn("primary")} onClick={() => setOpen(true)}>+ Mitarbeiter hinzufügen</button>
      {added.length > 0 && (
        <div className="w-full md:max-w-md">
          <Card title="Neu erfasst (nicht gespeichert)" className="mt-4">
            <ul className="space-y-2 text-sm">
              {added.map((a, i) => (
                <li key={i} className="flex flex-wrap items-center gap-2">
                  <strong>{a.firstName} {a.lastName}</strong> · {a.position} · {ROLE_LABEL[a.role]} <Badge tone="dashed">Einladung ausstehend (Backend)</Badge>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      )}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        wide
        title="Mitarbeiter hinzufügen"
        description="Stammdaten erfassen. Die Einladung per E-Mail und das Benutzerkonto folgen mit der Anmeldung (Phase 5B)."
        footer={<>
          <button type="button" className={btn("secondary")} onClick={() => setOpen(false)}>Abbrechen</button>
          <button type="button" className={btn("primary")} onClick={save}>Erfassen</button>
        </>}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Vorname" htmlFor="ae-fn" error={errors.firstName}><input id="ae-fn" className={inputCls} value={d.firstName} onChange={(e) => set({ firstName: e.target.value })} /></Field>
          <Field label="Nachname" htmlFor="ae-ln" error={errors.lastName}><input id="ae-ln" className={inputCls} value={d.lastName} onChange={(e) => set({ lastName: e.target.value })} /></Field>
          <Field label="E-Mail" htmlFor="ae-em" error={errors.email}><input id="ae-em" type="email" className={inputCls} value={d.email} onChange={(e) => set({ email: e.target.value })} /></Field>
          <Field label="Telefon (optional)" htmlFor="ae-ph" error={errors.phone}><input id="ae-ph" type="tel" className={inputCls} value={d.phone} onChange={(e) => set({ phone: e.target.value })} /></Field>
          <Field label="Position" htmlFor="ae-pos" error={errors.position}><input id="ae-pos" className={inputCls} placeholder="z. B. Friseur/in" value={d.position} onChange={(e) => set({ position: e.target.value })} /></Field>
          <Field label="Rolle" htmlFor="ae-role" hint="Admin-Rollen vergibt nur der Super-Admin.">
            <select id="ae-role" className={inputCls} value={d.role} onChange={(e) => set({ role: e.target.value as Role })}>
              <option value="staff">{ROLE_LABEL.staff}</option>
              <option value="admin">{ROLE_LABEL.admin}</option>
            </select>
          </Field>
          <Field label="Wochenstunden (Vertrag)" htmlFor="ae-h" error={errors.hours}><input id="ae-h" type="number" min={1} max={48} className={inputCls} value={d.hours} onChange={(e) => set({ hours: e.target.value })} /></Field>
          <Field label="Eintrittsdatum" htmlFor="ae-start" error={errors.start}><input id="ae-start" type="date" className={inputCls} value={d.start} onChange={(e) => set({ start: e.target.value })} /></Field>
          <fieldset className="sm:col-span-2">
            <legend className="text-xs font-medium">Bereiche</legend>
            <div className="mt-2 flex flex-wrap gap-4">
              {(["herren", "damen", "kinder"] as const).map((a) => (
                <label key={a} className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={d.audiences.includes(a)} onChange={(e) => set({ audiences: e.target.checked ? [...d.audiences, a] : d.audiences.filter((x) => x !== a) })} className="h-4 w-4 accent-current" />
                  {a[0].toUpperCase() + a.slice(1)}
                </label>
              ))}
            </div>
            {errors.audiences && <p className="mt-1 text-xs font-medium">— {errors.audiences}</p>}
          </fieldset>
        </div>
        <p className="mt-4 text-xs text-dash-muted">Dienstplan, Leistungen und Vergütung werden danach im Profil gepflegt. Demo: Es wird nichts gespeichert.</p>
      </Dialog>
      {toastNode}
    </>
  );
}
