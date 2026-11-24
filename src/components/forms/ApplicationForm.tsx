"use client";

import { useRef, useState, type ReactNode } from "react";
import { applicationSchema, checkCv } from "@/features/forms/schemas";
import { cn } from "@/lib/utils";

type Props = {
  texts: { eyebrow: string; title: string; intro: string; privacyText: string; unavailableNotice: string };
  positions: string[];
  employmentOptions: string[];
  experienceOptions: string[];
  cvMaxMb: number;
  phone: { display: string; href: string };
};

type Values = { firstName: string; lastName: string; email: string; phone: string; position: string; employment: string; experience: string; message: string; consent: boolean };
type Key = keyof Values | "cv";
const EMPTY: Values = { firstName: "", lastName: "", email: "", phone: "", position: "", employment: "", experience: "", message: "", consent: false };

function Row({ children }: { children: ReactNode }) {
  return <div className="grid gap-8 md:grid-cols-2">{children}</div>;
}

/**
 * Job application — NON-OPERATIONAL until Phase 5B. The selected PDF stays in the browser:
 * it is never read, uploaded or stored. Validation only; then a clear "nothing sent" notice.
 */
export function ApplicationForm({ texts, positions, employmentOptions, experienceOptions, cvMaxMb, phone }: Props) {
  const [v, setV] = useState<Values>(EMPTY);
  const [cv, setCv] = useState<File | null>(null);
  const [errors, setErrors] = useState<Partial<Record<Key, string>>>({});
  const [result, setResult] = useState<null | "not-sent">(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const set = (patch: Partial<Values>) => {
    setV((s) => ({ ...s, ...patch }));
    setResult(null);
    // a changed field drops its old error (re-checked on the next submit)
    setErrors((e) => { const n = { ...e }; for (const k of Object.keys(patch)) delete n[k as Key]; return n; });
  };

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = applicationSchema({ positions, employment: employmentOptions, experience: experienceOptions }).safeParse(v);
    const next: Partial<Record<Key, string>> = {};
    if (!parsed.success) for (const i of parsed.error.issues) { const k = i.path[0] as Key; if (k && !next[k]) next[k] = i.message; }
    const cvError = checkCv(cv, cvMaxMb);
    if (cvError) next.cv = cvError;
    setErrors(next);
    if (Object.keys(next).length) {
      setResult(null);
      document.getElementById(`ap-${Object.keys(next)[0]}`)?.focus();
      return;
    }
    // Phase 5B: server action → private storage bucket, admin-only access, notification without attachment.
    setResult("not-sent");
  }

  const label = (key: Key, text: string, required: boolean) => (
    <label htmlFor={`ap-${key}`} className="text-eyebrow uppercase text-stone">{text}{required ? " *" : " (optional)"}</label>
  );
  const err = (key: Key) => errors[key] && <p id={`ap-${key}-err`} className="mt-2 text-sm text-ink">— {errors[key]}</p>;
  const ctl = (key: Key) => ({
    id: `ap-${key}`,
    "aria-invalid": !!errors[key],
    "aria-describedby": errors[key] ? `ap-${key}-err` : undefined,
    className: cn("mt-3 block w-full border-b bg-transparent py-3 text-lg outline-none transition-colors focus:border-ink", errors[key] ? "border-ink" : "border-mist"),
  });
  const select = (key: "position" | "employment" | "experience", text: string, options: string[]) => (
    <div>
      {label(key, text, true)}
      <select {...ctl(key)} value={v[key]} onChange={(e) => set({ [key]: e.target.value })}>
        <option value="">Bitte wählen</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
      {err(key)}
    </div>
  );

  return (
    <div className="border border-mist bg-white">
      <div className="border-b border-mist p-6 md:p-10">
        <p className="text-eyebrow font-medium uppercase text-stone">{texts.eyebrow}</p>
        <h2 className="mt-[var(--space-label)] font-display text-display-lg">{texts.title}</h2>
        <p className="mt-4 max-w-xl leading-relaxed text-graphite">{texts.intro}</p>
        <p role="note" className="mt-6 flex items-start gap-3 border border-dashed border-ash p-4 text-sm leading-relaxed text-graphite">
          <span aria-hidden="true" className="mt-1.5 h-2 w-2 shrink-0 animate-breathe rounded-full bg-ink" />
          <span>{texts.unavailableNotice}</span>
        </p>
      </div>
      <form noValidate onSubmit={submit} className="space-y-10 p-6 md:p-10">
        <Row>
          <div>{label("firstName", "Vorname", true)}<input {...ctl("firstName")} autoComplete="given-name" value={v.firstName} onChange={(e) => set({ firstName: e.target.value })} />{err("firstName")}</div>
          <div>{label("lastName", "Nachname", true)}<input {...ctl("lastName")} autoComplete="family-name" value={v.lastName} onChange={(e) => set({ lastName: e.target.value })} />{err("lastName")}</div>
        </Row>
        <Row>
          <div>{label("email", "E-Mail", true)}<input {...ctl("email")} type="email" autoComplete="email" value={v.email} onChange={(e) => set({ email: e.target.value })} />{err("email")}</div>
          <div>{label("phone", "Telefon", true)}<input {...ctl("phone")} type="tel" inputMode="tel" autoComplete="tel" value={v.phone} onChange={(e) => set({ phone: e.target.value })} />{err("phone")}</div>
        </Row>
        <Row>
          {select("position", "Gewünschte Position", positions)}
          {select("employment", "Beschäftigungsart", employmentOptions)}
        </Row>
        <Row>
          {select("experience", "Berufserfahrung", experienceOptions)}
          <div>
            {label("cv", `Lebenslauf (PDF, max. ${cvMaxMb} MB)`, false)}
            <input
              ref={fileRef}
              id="ap-cv"
              type="file"
              accept="application/pdf,.pdf"
              aria-invalid={!!errors.cv}
              aria-describedby={errors.cv ? "ap-cv-err" : "ap-cv-hint"}
              onChange={(e) => { setCv(e.target.files?.[0] ?? null); setErrors((s) => ({ ...s, cv: undefined })); setResult(null); }}
              className="mt-3 block w-full border-b border-mist py-3 text-sm file:mr-4 file:border file:border-ink file:bg-transparent file:px-4 file:py-2 file:text-[0.75rem] file:uppercase file:tracking-[0.16em]"
            />
            {cv && !errors.cv && (
              <p id="ap-cv-hint" className="mt-2 flex items-center gap-3 text-sm text-graphite">
                {cv.name}
                <button type="button" className="underline underline-offset-4" onClick={() => { setCv(null); if (fileRef.current) fileRef.current.value = ""; }}>Entfernen</button>
              </p>
            )}
            {err("cv")}
          </div>
        </Row>
        <div>
          {label("message", "Nachricht", false)}
          <textarea {...ctl("message")} rows={4} maxLength={1500} value={v.message} onChange={(e) => set({ message: e.target.value })} />
          {err("message")}
        </div>
        <div>
          <label className="flex items-start gap-3 text-sm leading-relaxed text-graphite">
            <input id="ap-consent" type="checkbox" checked={v.consent} onChange={(e) => set({ consent: e.target.checked })} aria-invalid={!!errors.consent} aria-describedby={errors.consent ? "ap-consent-err" : undefined} className="mt-1 h-4 w-4 shrink-0 accent-ink" />
            <span>{texts.privacyText} <a href="/datenschutz" className="underline underline-offset-4">Datenschutzerklärung</a> *</span>
          </label>
          {err("consent")}
        </div>
        <div className="flex justify-end border-t border-mist pt-8">
          <button type="submit" className="inline-flex min-h-12 items-center justify-center gap-3 bg-ink px-7 text-[0.8125rem] font-medium uppercase tracking-[0.2em] text-white transition-colors duration-500 hover:bg-graphite">
            Bewerbung prüfen
          </button>
        </div>
        <div aria-live="polite">
          {result === "not-sent" && (
            <div role="status" className="border border-ink p-6">
              <p className="text-eyebrow font-medium uppercase">Nicht gesendet</p>
              <p className="mt-3 leading-relaxed text-graphite">
                Ihre Angaben sind vollständig – das Formular ist jedoch noch nicht aktiv, daher wurde <strong className="text-ink">nichts übermittelt</strong>
                {cv ? " und keine Datei hochgeladen" : ""}. Bitte melden Sie sich persönlich im Salon oder telefonisch unter{" "}
                <a href={phone.href} className="underline underline-offset-4">{phone.display}</a>.
              </p>
            </div>
          )}
        </div>
      </form>
    </div>
  );
}
