"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { CALLBACK_MAX_DAYS_AHEAD, CALLBACK_MIN_DURATION, callbackDateIssues, callbackRequestSchema } from "@/features/forms/schemas";
import { hoursOn, isoWeekdayOf, isWalkInOnly, type HourRow, type WalkInPolicy } from "@/lib/booking-rules";
import { cn } from "@/lib/utils";

type Props = {
  texts: { eyebrow: string; title: string; description: string; disclaimer: string; privacyText: string; unavailableNotice: string };
  categories: { slug: string; label: string }[];
  services: { id: string; name: string; audiences: string[] }[];
  hours: HourRow[];
  walkIn: WalkInPolicy | null;
  phone: { display: string; href: string };
};

type Values = { name: string; phone: string; email: string; category: string; serviceId: string; date: string; time: string; altTime: string; message: string; consent: boolean };
const EMPTY: Values = { name: "", phone: "", email: "", category: "", serviceId: "", date: "", time: "", altTime: "", message: "", consent: false };

function Row({ children }: { children: ReactNode }) {
  return <div className="grid gap-8 md:grid-cols-2">{children}</div>;
}

const berlinToday = () => new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Berlin" }).format(new Date());
const plusDays = (d: string, n: number) => { const x = new Date(`${d}T12:00:00Z`); x.setUTCDate(x.getUTCDate() + n); return x.toISOString().slice(0, 10); };
const toMin = (t: string) => { const [h, m] = t.split(":").map(Number); return h * 60 + m; };
const fromMin = (m: number) => `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;

/**
 * "Termin anfragen & Rückruf erhalten" — NON-OPERATIONAL until Phase 5B.
 * Validates locally and then says clearly that nothing was sent. No network request,
 * no storage, no fake success message.
 */
export function CallbackForm({ texts, categories, services, hours, walkIn, phone }: Props) {
  const [v, setV] = useState<Values>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof Values, string>>>({});
  const [result, setResult] = useState<null | "not-sent">(null);
  const [today, setToday] = useState<string | null>(null);
  useEffect(() => { setToday(berlinToday()); }, []);
  const maxDate = today ? plusDays(today, CALLBACK_MAX_DAYS_AHEAD) : undefined;

  const set = (patch: Partial<Values>) => {
    setV((s) => ({ ...s, ...patch }));
    setResult(null);
    // a changed field drops its old error (re-checked on the next submit)
    setErrors((e) => { const n = { ...e }; for (const k of Object.keys(patch)) delete n[k as keyof Values]; return n; });
  };
  const serviceOptions = services.filter((s) => !v.category || s.audiences.length === 0 || s.audiences.includes(v.category));
  const open = v.date ? hoursOn(hours, v.date) : null;
  const walkInDay = !!v.date && !!v.category && isWalkInOnly(walkIn, v.category, isoWeekdayOf(v.date));
  const slots = useMemo(() => {
    if (!open || walkInDay) return [];
    const out: string[] = [];
    for (let m = toMin(open.opens); m + CALLBACK_MIN_DURATION <= toMin(open.closes); m += 30) out.push(fromMin(m));
    return out;
  }, [open, walkInDay]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!today || !maxDate) return;
    const ctx = { hours, walkIn, today, maxDate };
    const parsed = callbackRequestSchema(ctx).safeParse(v);
    if (!parsed.success) {
      const next: typeof errors = {};
      // Date rules first so they show even while other fields are still invalid.
      for (const issue of callbackDateIssues(v, ctx)) if (!next[issue.path]) next[issue.path] = issue.message;
      for (const issue of parsed.error.issues) {
        const k = issue.path[0] as keyof Values;
        if (k && !next[k]) next[k] = issue.message;
      }
      setErrors(next);
      setResult(null);
      const first = Object.keys(next)[0];
      if (first) document.getElementById(`cb-${first}`)?.focus();
      return;
    }
    setErrors({});
    // Phase 5B: server action → validate again, rate limit, store, notify. Today: nothing is sent.
    setResult("not-sent");
  }

  const label = (key: keyof Values, text: string, required: boolean) => (
    <label htmlFor={`cb-${key}`} className="text-eyebrow uppercase text-stone">{text}{required ? " *" : " (optional)"}</label>
  );
  const err = (key: keyof Values) => errors[key] && <p id={`cb-${key}-err`} className="mt-2 text-sm text-ink">— {errors[key]}</p>;
  const ctl = (key: keyof Values) => ({
    id: `cb-${key}`,
    "aria-invalid": !!errors[key],
    "aria-describedby": errors[key] ? `cb-${key}-err` : undefined,
    className: cn("mt-3 block w-full border-b bg-transparent py-3 text-lg outline-none transition-colors focus:border-ink", errors[key] ? "border-ink" : "border-mist"),
  });

  return (
    <div className="border border-mist bg-white">
      <div className="border-b border-mist p-6 md:p-10">
        <p className="text-eyebrow font-medium uppercase text-stone">{texts.eyebrow}</p>
        <h2 className="mt-[var(--space-label)] font-display text-display-lg">{texts.title}</h2>
        <p className="mt-4 max-w-xl leading-relaxed text-graphite">{texts.description}</p>
        <p role="note" className="mt-6 flex items-start gap-3 border border-dashed border-ash p-4 text-sm leading-relaxed text-graphite">
          <span aria-hidden="true" className="mt-1.5 h-2 w-2 shrink-0 animate-breathe rounded-full bg-ink" />
          <span>{texts.unavailableNotice}</span>
        </p>
      </div>

      <form noValidate onSubmit={submit} className="space-y-10 p-6 md:p-10" aria-describedby="cb-disclaimer">
        <Row>
          <div>{label("name", "Name", true)}<input {...ctl("name")} type="text" autoComplete="name" value={v.name} onChange={(e) => set({ name: e.target.value })} />{err("name")}</div>
          <div>{label("phone", "Telefon", true)}<input {...ctl("phone")} type="tel" autoComplete="tel" inputMode="tel" value={v.phone} onChange={(e) => set({ phone: e.target.value })} />{err("phone")}</div>
        </Row>
        <Row>
          <div>{label("email", "E-Mail", false)}<input {...ctl("email")} type="email" autoComplete="email" value={v.email} onChange={(e) => set({ email: e.target.value })} />{err("email")}</div>
          <div>
            {label("category", "Bereich", true)}
            <select {...ctl("category")} value={v.category} onChange={(e) => set({ category: e.target.value, serviceId: "", time: "", altTime: "" })}>
              <option value="">Bitte wählen</option>
              {categories.map((c) => <option key={c.slug} value={c.slug}>{c.label}</option>)}
            </select>
            {err("category")}
          </div>
        </Row>
        <Row>
          <div>
            {label("serviceId", "Leistung", true)}
            <select {...ctl("serviceId")} value={v.serviceId} onChange={(e) => set({ serviceId: e.target.value })}>
              <option value="">Bitte wählen</option>
              {serviceOptions.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            {err("serviceId")}
          </div>
          <div>
            {label("date", "Wunschdatum", true)}
            <input {...ctl("date")} type="date" min={today ?? undefined} max={maxDate} value={v.date} onChange={(e) => set({ date: e.target.value, time: "", altTime: "" })} />
            {err("date")}
          </div>
        </Row>

        {walkInDay && walkIn && !errors.date && (
          <div role="note" className="border-l-2 border-ink bg-bone px-5 py-4">
            <p className="font-display text-lg italic">{walkIn.title}</p>
            <p className="mt-1 text-sm leading-relaxed text-graphite">{walkIn.bookingNotice}</p>
          </div>
        )}
        {v.date && !open && !errors.date && <p role="note" className="text-sm text-graphite">— An diesem Tag ist der Salon geschlossen.</p>}

        <Row>
          <div>
            {label("time", "Wunschuhrzeit", true)}
            <select {...ctl("time")} value={v.time} disabled={!slots.length} onChange={(e) => set({ time: e.target.value })}>
              <option value="">{slots.length ? "Bitte wählen" : "Zuerst Bereich und Datum wählen"}</option>
              {slots.map((t) => <option key={t} value={t}>{t} Uhr</option>)}
            </select>
            {err("time")}
          </div>
          <div>
            {label("altTime", "Alternative Uhrzeit", false)}
            <select {...ctl("altTime")} value={v.altTime} disabled={!slots.length} onChange={(e) => set({ altTime: e.target.value })}>
              <option value="">Keine</option>
              {slots.filter((t) => t !== v.time).map((t) => <option key={t} value={t}>{t} Uhr</option>)}
            </select>
            {err("altTime")}
          </div>
        </Row>
        <div>
          {label("message", "Wünsche oder Hinweise", false)}
          <textarea {...ctl("message")} rows={3} maxLength={500} value={v.message} onChange={(e) => set({ message: e.target.value })} />
          {err("message")}
        </div>
        <div>
          <label className="flex items-start gap-3 text-sm leading-relaxed text-graphite">
            <input id="cb-consent" type="checkbox" checked={v.consent} onChange={(e) => set({ consent: e.target.checked })} aria-invalid={!!errors.consent} aria-describedby={errors.consent ? "cb-consent-err" : undefined} className="mt-1 h-4 w-4 shrink-0 accent-ink" />
            <span>{texts.privacyText} <a href="/datenschutz" className="underline underline-offset-4">Datenschutzerklärung</a> *</span>
          </label>
          {err("consent")}
        </div>

        <div className="flex flex-col gap-6 border-t border-mist pt-8 md:flex-row md:items-center md:justify-between">
          <p id="cb-disclaimer" className="max-w-md text-sm font-medium">{texts.disclaimer}</p>
          <button type="submit" className="inline-flex min-h-12 items-center justify-center gap-3 bg-ink px-7 text-[0.8125rem] font-medium uppercase tracking-[0.2em] text-white transition-colors duration-500 hover:bg-graphite">
            Anfrage prüfen
          </button>
        </div>

        <div aria-live="polite">
          {result === "not-sent" && (
            <div role="status" className="border border-ink p-6">
              <p className="text-eyebrow font-medium uppercase">Nicht gesendet</p>
              <p className="mt-3 leading-relaxed text-graphite">
                Ihre Angaben sind vollständig – das Formular ist jedoch noch nicht aktiv, daher wurde <strong className="text-ink">nichts übermittelt</strong>.
                Bitte rufen Sie uns an: <a href={phone.href} className="underline underline-offset-4">{phone.display}</a>.
              </p>
            </div>
          )}
        </div>
      </form>
    </div>
  );
}
