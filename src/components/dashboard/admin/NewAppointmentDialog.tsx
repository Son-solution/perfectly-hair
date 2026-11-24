"use client";

import { useMemo, useState } from "react";
import { Dialog } from "@/components/dashboard/interactive";
import { Field, btn, inputCls, textareaCls } from "@/components/dashboard/ui";
import { toMin } from "@/features/dashboard/calc";
import type { Appointment, Customer, Employee } from "@/features/dashboard/domain";
import { hoursOn, isoWeekdayOf, isWalkInOnly, type HourRow, type WalkInPolicy } from "@/lib/booking-rules";

export type CatalogueEntry = { name: string; durationMin: number; priceCents: number };

type Props = {
  open: boolean;
  onClose: () => void;
  onCreate: (a: Appointment) => void;
  employees: Employee[];
  customers: Pick<Customer, "id" | "name" | "phone">[];
  catalogue: Record<string, CatalogueEntry>;
  appointments: Appointment[];
  hours: HourRow[];
  walkIn: WalkInPolicy | null;
  today: string;
  nowTime: string;
  actor: string;
  /** Prefill when converting a callback request. */
  prefill?: Partial<{ name: string; phone: string; audience: Appointment["audience"]; serviceId: string; date: string; time: string; source: Appointment["source"] }>;
};

const mm = (t: string) => { const [h, m] = t.split(":").map(Number); return h * 60 + m; };
const hm = (m: number) => `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;

/**
 * Admin: create an appointment for a phone call or walk-in customer.
 * Runs an availability check (opening hours, walk-in policy, shift, overlaps) before it can be
 * saved. Demo: the appointment lives only in this page's state. Phase 5B: Server Action +
 * DB function `book_appointment()` with the exclusion constraint (DATABASE.md §4–5).
 */
export function NewAppointmentDialog(p: Props) {
  const [source, setSource] = useState<Appointment["source"]>(p.prefill?.source ?? "telefon");
  const [customerId, setCustomerId] = useState<string>("neu");
  const [name, setName] = useState(p.prefill?.name ?? "");
  const [phone, setPhone] = useState(p.prefill?.phone ?? "");
  const [audience, setAudience] = useState<Appointment["audience"]>(p.prefill?.audience ?? "herren");
  const [serviceId, setServiceId] = useState(p.prefill?.serviceId ?? Object.keys(p.catalogue)[0]);
  const [date, setDate] = useState(p.prefill?.date ?? p.today);
  const [time, setTime] = useState(p.prefill?.time ?? "");
  const [employeeId, setEmployeeId] = useState("");
  const [note, setNote] = useState("");
  const [touched, setTouched] = useState(false);

  const svc = p.catalogue[serviceId];
  const staff = p.employees.filter((e) => e.active && e.serviceIds.length > 0 && e.audiences.includes(audience) && e.serviceIds.includes(serviceId));
  const effName = customerId === "neu" ? name.trim() : p.customers.find((c) => c.id === customerId)?.name ?? "";
  const effPhone = customerId === "neu" ? phone.trim() : p.customers.find((c) => c.id === customerId)?.phone ?? "";

  const check = useMemo(() => {
    const problems: string[] = [];
    const open = hoursOn(p.hours, date);
    const wd = isoWeekdayOf(date);
    if (date < p.today) problems.push("Das Datum liegt in der Vergangenheit.");
    if (!open) problems.push("An diesem Tag ist der Salon geschlossen.");
    if (source === "walk_in" && date !== p.today) problems.push("Laufkundschaft kann nur für heute erfasst werden.");
    if (source !== "walk_in" && isWalkInOnly(p.walkIn, audience, wd)) problems.push(p.walkIn?.bookingNotice ?? "An diesem Tag keine Termine für diesen Bereich.");
    if (!time) return { ok: false, problems: [...problems, "Bitte eine Uhrzeit wählen."] };
    const start = mm(time);
    const end = start + (svc?.durationMin ?? 30);
    if (open && (start < mm(open.opens) || end > mm(open.closes))) problems.push("Die Zeit liegt außerhalb der Öffnungszeiten.");
    if (date === p.today && time < p.nowTime && source !== "walk_in") problems.push("Die Uhrzeit liegt in der Vergangenheit.");
    if (employeeId) {
      const e = p.employees.find((x) => x.id === employeeId);
      const shift = e?.schedule[String(wd)];
      if (!shift) problems.push(`${e?.firstName} arbeitet an diesem Tag nicht.`);
      else if (start < mm(shift.start) || end > mm(shift.end)) problems.push(`Außerhalb der Schicht von ${e?.firstName} (${shift.start}–${shift.end}).`);
      const clash = p.appointments.find((a) => a.employeeId === employeeId && a.start.startsWith(date) && a.status !== "cancelled" && a.status !== "rejected"
        && toMin(a.start) < end && toMin(a.start) + a.durationMin > start);
      if (clash) problems.push(`Überschneidung mit ${clash.customerName} um ${clash.start.slice(11, 16)} Uhr.`);
    }
    return { ok: problems.length === 0, problems };
  }, [p, date, time, source, audience, employeeId, svc]);

  const open = hoursOn(p.hours, date);
  const slots: string[] = [];
  if (open) for (let m = mm(open.opens); m + (svc?.durationMin ?? 30) <= mm(open.closes); m += 15) slots.push(hm(m));

  const formErrors = {
    name: !effName || effName.length < 2 ? "Bitte einen Namen angeben." : null,
    phone: source !== "walk_in" && !/^[+0-9 ()/-]{6,}$/.test(effPhone) ? "Bitte eine gültige Telefonnummer angeben." : null,
    employee: !employeeId ? "Bitte einen Mitarbeiter wählen (Pflicht für bestätigte Termine)." : null,
  };
  const canSave = check.ok && !formErrors.name && !formErrors.phone && !formErrors.employee;

  function save() {
    setTouched(true);
    if (!canSave || !svc) return;
    const at = `${p.today}T${p.nowTime}`;
    p.onCreate({
      id: `neu-${Date.now()}`,
      customerId: customerId === "neu" ? null : customerId,
      source,
      customerName: effName,
      customerPhone: effPhone || "–",
      audience,
      serviceId,
      serviceName: svc.name,
      employeeId,
      start: `${date}T${time}`,
      durationMin: svc.durationMin,
      status: source === "walk_in" && time <= p.nowTime ? "completed" : "confirmed",
      priceCents: svc.priceCents,
      note: note.trim() || null,
      cancelReason: null,
      history: [{ at, by: p.actor, action: source === "walk_in" ? "Laufkundschaft erfasst" : source === "rueckruf" ? "Aus Terminanfrage angelegt" : "Telefonisch angelegt", note: "Verfügbarkeit geprüft." }],
    });
    p.onClose();
  }

  return (
    <Dialog
      open={p.open}
      onClose={p.onClose}
      wide
      title="Neuer Termin"
      description="Für telefonische Buchungen und Laufkundschaft. Wird nach der Verfügbarkeitsprüfung als bestätigt angelegt."
      footer={<>
        <button type="button" className={btn("secondary")} onClick={p.onClose}>Abbrechen</button>
        <button type="button" className={btn("primary")} onClick={save} disabled={touched && !canSave}>Termin anlegen</button>
      </>}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Art" htmlFor="na-source">
          <select id="na-source" className={inputCls} value={source} onChange={(e) => setSource(e.target.value as Appointment["source"])}>
            <option value="telefon">Telefonisch</option>
            <option value="walk_in">Laufkundschaft (heute)</option>
            {p.prefill?.source === "rueckruf" && <option value="rueckruf">Aus Terminanfrage</option>}
          </select>
        </Field>
        <Field label="Kunde" htmlFor="na-customer" hint="Bestehenden Kunden wählen oder neu erfassen.">
          <select id="na-customer" className={inputCls} value={customerId} onChange={(e) => setCustomerId(e.target.value)}>
            <option value="neu">Neuer Kunde</option>
            {p.customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </Field>
        {customerId === "neu" && <>
          <Field label="Name" htmlFor="na-name" error={touched ? formErrors.name ?? undefined : undefined}>
            <input id="na-name" className={inputCls} value={name} onChange={(e) => setName(e.target.value)} placeholder="Vor- und Nachname" />
          </Field>
          <Field label={source === "walk_in" ? "Telefon (optional)" : "Telefon"} htmlFor="na-phone" error={touched ? formErrors.phone ?? undefined : undefined}>
            <input id="na-phone" type="tel" className={inputCls} value={phone} onChange={(e) => setPhone(e.target.value)} />
          </Field>
        </>}
        <Field label="Bereich" htmlFor="na-aud">
          <select id="na-aud" className={inputCls} value={audience} onChange={(e) => { setAudience(e.target.value as Appointment["audience"]); setEmployeeId(""); }}>
            <option value="herren">Herren</option><option value="damen">Damen</option><option value="kinder">Kinder</option>
          </select>
        </Field>
        <Field label="Leistung" htmlFor="na-svc" hint={svc ? `${svc.durationMin} Min. (Demo-Dauer)` : undefined}>
          <select id="na-svc" className={inputCls} value={serviceId} onChange={(e) => { setServiceId(e.target.value); setEmployeeId(""); }}>
            {Object.entries(p.catalogue).map(([id, s]) => <option key={id} value={id}>{s.name}</option>)}
          </select>
        </Field>
        <Field label="Datum" htmlFor="na-date">
          <input id="na-date" type="date" className={inputCls} min={p.today} value={date} onChange={(e) => { setDate(e.target.value); setTime(""); }} />
        </Field>
        <Field label="Uhrzeit" htmlFor="na-time">
          <select id="na-time" className={inputCls} value={time} onChange={(e) => setTime(e.target.value)} disabled={!slots.length}>
            <option value="">{slots.length ? "Bitte wählen" : "Geschlossen"}</option>
            {slots.map((t) => <option key={t} value={t}>{t} Uhr</option>)}
          </select>
        </Field>
        <Field label="Mitarbeiter" htmlFor="na-emp" error={touched ? formErrors.employee ?? undefined : undefined}>
          <select id="na-emp" className={inputCls} value={employeeId} onChange={(e) => setEmployeeId(e.target.value)}>
            <option value="">Bitte wählen</option>
            {staff.map((e) => <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>)}
          </select>
        </Field>
        <div className="sm:col-span-2">
          <Field label="Notiz (optional)" htmlFor="na-note">
            <textarea id="na-note" rows={2} className={textareaCls} value={note} onChange={(e) => setNote(e.target.value)} />
          </Field>
        </div>
      </div>

      <div role="status" className={`mt-5 rounded-lg border p-4 text-sm ${check.ok ? "border-dash-strong" : "border-dashed border-dash-muted"}`}>
        <p className="font-semibold">{check.ok ? "✓ Verfügbar" : "Verfügbarkeitsprüfung"}</p>
        {check.ok
          ? <p className="mt-1 text-dash-muted">Keine Überschneidung, innerhalb der Öffnungszeiten und der Schicht.</p>
          : <ul className="mt-1 list-disc space-y-0.5 pl-5 text-dash-muted">{check.problems.map((x) => <li key={x}>{x}</li>)}</ul>}
      </div>
      <p className="mt-3 text-xs text-dash-muted">Demo: Der Termin erscheint nur in dieser Ansicht und wird nicht gespeichert.</p>
    </Dialog>
  );
}
