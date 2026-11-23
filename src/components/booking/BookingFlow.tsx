"use client";

import { AnimatePresence, motion } from "motion/react";
import { useSearchParams } from "next/navigation";
import React, { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { Service } from "@/content/schema";
import {
  customerDetails, unavailableGateway,
  type AvailabilityResult, type BookingDraft, type BookingGateway, type CustomerDetails,
} from "@/features/booking/types";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";

const ease = [0.22, 1, 0.36, 1] as const;
const STEPS = ["Bereich", "Leistung", "Mitarbeiter", "Termin", "Ihre Daten", "Übersicht"] as const;

export type BookingFlowProps = {
  categories: { slug: string; label: string }[];
  services: Service[];
  employees: { id: string; name: string; audiences: string[] }[];
  openWeekdays: number[];
  phone: { display: string; href: string };
  gateway?: BookingGateway;
};

type Initial = { category?: string | null; serviceId?: string | null; employeeId?: string | null };

/** Reads ?kategorie=…&leistung=…&mitarbeiter=… and preselects (only valid ids are accepted). */
export function BookingFlowFromUrl(props: BookingFlowProps) {
  const params = useSearchParams();
  const initial: Initial = {
    category: props.categories.some((c) => c.slug === params.get("kategorie")) ? params.get("kategorie") : null,
    serviceId: props.services.some((s) => s.id === params.get("leistung")) ? params.get("leistung") : null,
    employeeId: props.employees.some((e) => e.id === params.get("mitarbeiter")) ? params.get("mitarbeiter") : null,
  };
  return <BookingFlow key={params.toString()} {...props} initial={initial} />;
}

function startStep(i: Initial) {
  if (i.category && i.serviceId) return 2;
  if (i.category) return 1;
  return 0;
}

/** Dates for the next 28 days (client-only, Europe/Berlin calendar day of the visitor). */
function useUpcomingDays() {
  const [days, setDays] = useState<Date[]>([]);
  useEffect(() => {
    const now = new Date();
    const list = Array.from({ length: 28 }, (_, i) => new Date(now.getFullYear(), now.getMonth(), now.getDate() + i + 1));
    // eslint-disable-next-line react-hooks/set-state-in-effect -- dates must be computed on the client (no prerender clock)
    setDays(list);
  }, []);
  return days;
}

const isoDate = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const isoWeekday = (d: Date) => ((d.getDay() + 6) % 7) + 1;

function Heading({ children, headingRef }: { children: ReactNode; headingRef: React.Ref<HTMLHeadingElement> }) {
  return (
    <h2 ref={headingRef} tabIndex={-1} className="font-display text-[clamp(2.2rem,4.5vw,3.75rem)] leading-[1.02] outline-none">
      {children}
    </h2>
  );
}

function Choice({ selected, onSelect, name, value, children }: { selected: boolean; onSelect: () => void; name: string; value: string; children: ReactNode }) {
  return (
    <label
      className={cn(
        "group flex cursor-pointer items-center justify-between gap-6 border px-6 py-6 transition-colors duration-500 has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-4",
        selected ? "border-ink bg-ink text-white" : "border-mist bg-white hover:border-ink",
      )}
    >
      <input type="radio" name={name} value={value} checked={selected} onChange={onSelect} className="sr-only" />
      {children}
      <span aria-hidden="true" className={cn("h-px shrink-0 transition-[width] duration-500", selected ? "w-10 bg-white" : "w-5 bg-ink group-hover:w-8")} />
    </label>
  );
}

export function BookingFlow({
  categories, services, employees, openWeekdays, phone, gateway = unavailableGateway, initial = {},
}: BookingFlowProps & { initial?: Initial }) {
  const [step, setStep] = useState(() => startStep(initial));
  const [draft, setDraft] = useState<BookingDraft>({
    category: initial.category ?? null,
    serviceId: initial.serviceId ?? null,
    employeeId: initial.employeeId ?? null,
    date: null,
    slot: null,
    customer: {},
  });
  const [errors, setErrors] = useState<Partial<Record<keyof CustomerDetails, string>>>({});
  const [availability, setAvailability] = useState<AvailabilityResult | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const focusPending = useRef(false);
  const days = useUpcomingDays();
  const open = useMemo(() => new Set(openWeekdays), [openWeekdays]);

  const categoryServices = services.filter(
    (s) => !draft.category || s.audiences.length === 0 || s.audiences.includes(draft.category as never),
  );
  const categoryEmployees = employees.filter((e) => !draft.category || e.audiences.includes(draft.category));
  const service = services.find((s) => s.id === draft.serviceId);
  const employee = employees.find((e) => e.id === draft.employeeId);
  const category = categories.find((c) => c.slug === draft.category);

  // Ask the engine for availability when a date is chosen (today: always "unavailable").
  useEffect(() => {
    if (!draft.date || !draft.serviceId) return;
    let cancelled = false;
    gateway.getAvailability({ serviceId: draft.serviceId, employeeId: draft.employeeId, date: draft.date }).then((r) => {
      if (!cancelled) setAvailability(r);
    });
    return () => { cancelled = true; };
  }, [draft.date, draft.serviceId, draft.employeeId, gateway]);

  const set = (patch: Partial<BookingDraft>) => setDraft((d) => ({ ...d, ...patch }));
  const go = (next: number) => { focusPending.current = true; setStep(next); };

  const validateCustomer = () => {
    const r = customerDetails.safeParse({ name: "", phone: "", note: "", email: "", ...draft.customer });
    if (r.success) { setErrors({}); return true; }
    const e: typeof errors = {};
    for (const issue of r.error.issues) e[issue.path[0] as keyof CustomerDetails] ??= issue.message;
    setErrors(e);
    return false;
  };

  const canNext =
    (step === 0 && !!draft.category) ||
    (step === 1 && !!draft.serviceId) ||
    step === 2 ||
    (step === 3 && !!draft.date) ||
    step === 4;

  const next = () => {
    if (step === 4 && !validateCustomer()) return;
    go(step + 1);
  };

  const field = (key: "name" | "phone" | "email", label: string, type: string, autoComplete: string, required = true) => (
    <div>
      <label htmlFor={`b-${key}`} className="text-eyebrow uppercase text-stone">
        {label}{required ? " *" : " (optional)"}
      </label>
      <input
        id={`b-${key}`}
        type={type}
        autoComplete={autoComplete}
        value={(draft.customer[key] as string) ?? ""}
        onChange={(e) => set({ customer: { ...draft.customer, [key]: e.target.value } })}
        aria-invalid={!!errors[key]}
        aria-describedby={errors[key] ? `b-${key}-err` : undefined}
        className={cn("mt-3 block w-full border-b bg-transparent py-3 text-lg outline-none transition-colors focus:border-ink", errors[key] ? "border-ink" : "border-mist")}
      />
      {errors[key] && <p id={`b-${key}-err`} className="mt-2 text-sm text-ink">— {errors[key]}</p>}
    </div>
  );

  return (
    <div className="border border-mist bg-white">
      {/* Progress */}
      <ol className="grid grid-cols-6 border-b border-mist" aria-label="Fortschritt">
        {STEPS.map((label, i) => (
          <li key={label} aria-current={i === step ? "step" : undefined} className="relative">
            <button
              type="button"
              disabled={i > step}
              onClick={() => go(i)}
              className={cn(
                "w-full px-1 py-4 text-center text-[0.625rem] uppercase tracking-[0.16em] transition-colors duration-500 disabled:cursor-default sm:px-3 sm:text-[0.6875rem]",
                i === step ? "text-ink" : i < step ? "text-graphite hover:text-ink" : "text-ash",
              )}
            >
              <span className="hidden md:inline">{label}</span>
              <span className="md:hidden">{String(i + 1).padStart(2, "0")}</span>
            </button>
            {i === step && <motion.span layoutId="booking-step" aria-hidden="true" className="absolute inset-x-0 -bottom-px h-px bg-ink" transition={{ duration: 0.6, ease }} />}
          </li>
        ))}
      </ol>

      <div className="p-6 sm:p-10 md:p-14">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.45, ease }}
            onAnimationComplete={(def) => {
              if (typeof def === "object" && def !== null && "x" in def && def.x === 0 && focusPending.current) {
                focusPending.current = false;
                headingRef.current?.focus();
              }
            }}
          >
            <p className="mb-4 text-eyebrow uppercase text-stone">Schritt {step + 1} von {STEPS.length}</p>

            {step === 0 && (
              <fieldset>
                <legend><Heading headingRef={headingRef}>Für wen ist der Termin?</Heading></legend>
                <div className="mt-10 grid gap-3 sm:grid-cols-3">
                  {categories.map((c) => (
                    <Choice key={c.slug} name="kategorie" value={c.slug} selected={draft.category === c.slug} onSelect={() => set({ category: c.slug, serviceId: null, employeeId: null })}>
                      <span className="font-display text-3xl">{c.label}</span>
                    </Choice>
                  ))}
                </div>
              </fieldset>
            )}

            {step === 1 && (
              <fieldset>
                <legend><Heading headingRef={headingRef}>Welche Leistung{category ? ` für ${category.label}` : ""}?</Heading></legend>
                <div className="mt-10 grid gap-3">
                  {categoryServices.map((s) => (
                    <Choice key={s.id} name="leistung" value={s.id} selected={draft.serviceId === s.id} onSelect={() => set({ serviceId: s.id })}>
                      <span className="flex flex-1 flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                        <span className="text-lg">{s.name}</span>
                        <span className="font-display text-2xl tabular-nums">
                          {s.priceCents !== null ? formatPrice(s.priceCents, s.priceIsFrom) : "Preis auf Anfrage"}
                        </span>
                      </span>
                    </Choice>
                  ))}
                </div>
                <p className="mt-5 text-sm text-stone">Preise laut Flyer, nicht nach Damen, Herren und Kindern unterschieden. Dauer wird vom Salon ergänzt.</p>
              </fieldset>
            )}

            {step === 2 && (
              <fieldset>
                <legend><Heading headingRef={headingRef}>Bei wem?</Heading></legend>
                <div className="mt-10 grid gap-3 sm:grid-cols-2">
                  <Choice name="mitarbeiter" value="" selected={!draft.employeeId} onSelect={() => set({ employeeId: null })}>
                    <span className="font-display text-2xl">Keine Präferenz</span>
                  </Choice>
                  {categoryEmployees.map((e) => (
                    <Choice key={e.id} name="mitarbeiter" value={e.id} selected={draft.employeeId === e.id} onSelect={() => set({ employeeId: e.id })}>
                      <span className="font-display text-2xl">{e.name}</span>
                    </Choice>
                  ))}
                </div>
                {categoryEmployees.length === 0 && (
                  <p className="mt-5 text-sm text-stone">Die Auswahl einzelner Mitarbeiter wird verfügbar, sobald sich unser Team vorgestellt hat.</p>
                )}
              </fieldset>
            )}

            {step === 3 && (
              <div>
                <Heading headingRef={headingRef}>Wann passt es Ihnen?</Heading>
                <p className="mt-4 max-w-xl text-graphite">Wählen Sie einen Wunschtag. Geschlossene Tage sind deaktiviert.</p>
                <div className="mt-8 grid grid-cols-4 gap-2 sm:grid-cols-7">
                  {days.map((d) => {
                    const iso = isoDate(d);
                    const isOpen = open.has(isoWeekday(d));
                    const selected = draft.date === iso;
                    return (
                      <button
                        key={iso}
                        type="button"
                        disabled={!isOpen}
                        onClick={() => set({ date: iso, slot: null })}
                        aria-pressed={selected}
                        aria-label={d.toLocaleDateString("de-DE", { weekday: "long", day: "numeric", month: "long" }) + (isOpen ? "" : ", geschlossen")}
                        className={cn(
                          "flex flex-col items-center border py-3 transition-colors duration-300",
                          selected ? "border-ink bg-ink text-white" : isOpen ? "border-mist hover:border-ink" : "cursor-not-allowed border-transparent text-ash line-through",
                        )}
                      >
                        <span className="text-[0.625rem] uppercase tracking-[0.2em]">{d.toLocaleDateString("de-DE", { weekday: "short" })}</span>
                        <span className="mt-1 font-display text-2xl">{d.getDate()}</span>
                        <span className="text-[0.625rem] uppercase tracking-[0.12em] opacity-70">{d.toLocaleDateString("de-DE", { month: "short" })}</span>
                      </button>
                    );
                  })}
                </div>
                {draft.date && (
                  <div className="mt-8 border border-dashed border-ash p-6">
                    <p className="text-eyebrow uppercase">Freie Uhrzeiten</p>
                    <p className="mt-3 max-w-lg leading-relaxed text-graphite">
                      {availability?.status === "ok"
                        ? `${availability.slots.length} freie Zeiten`
                        : "Freie Uhrzeiten werden angezeigt, sobald die Online-Buchung an unseren Kalender angebunden ist. Es werden bewusst keine Beispielzeiten gezeigt."}
                    </p>
                  </div>
                )}
              </div>
            )}

            {step === 4 && (
              <div>
                <Heading headingRef={headingRef}>Ihre Kontaktdaten</Heading>
                <div className="mt-10 grid gap-8 md:grid-cols-2">
                  {field("name", "Name", "text", "name")}
                  {field("phone", "Telefon", "tel", "tel")}
                  {field("email", "E-Mail", "email", "email", false)}
                  <div className="md:col-span-2">
                    <label htmlFor="b-note" className="text-eyebrow uppercase text-stone">Nachricht (optional)</label>
                    <textarea
                      id="b-note"
                      rows={3}
                      value={draft.customer.note ?? ""}
                      onChange={(e) => set({ customer: { ...draft.customer, note: e.target.value } })}
                      className="mt-3 block w-full resize-none border-b border-mist bg-transparent py-3 outline-none focus:border-ink"
                    />
                  </div>
                  <label className="flex items-start gap-4 md:col-span-2">
                    <input
                      type="checkbox"
                      checked={draft.customer.consent === true}
                      onChange={(e) => set({ customer: { ...draft.customer, consent: e.target.checked ? true : undefined } })}
                      aria-invalid={!!errors.consent}
                      className="mt-1 h-4 w-4 accent-ink"
                    />
                    <span className="text-sm leading-relaxed text-graphite">
                      Ich bin einverstanden, dass meine Angaben zur Bearbeitung der Terminanfrage verwendet werden (siehe Datenschutzerklärung).
                      {errors.consent && <span className="mt-1 block text-ink">— {errors.consent}</span>}
                    </span>
                  </label>
                </div>
                <p className="mt-6 text-xs text-stone">Hinweis: In dieser Vorschau werden keine Daten gespeichert oder übermittelt.</p>
              </div>
            )}

            {step === 5 && (
              <div>
                <Heading headingRef={headingRef}>Ihre Auswahl</Heading>
                <dl className="mt-10 divide-y divide-mist border-y border-mist">
                  {[
                    ["Bereich", category?.label ?? "–"],
                    ["Leistung", service?.name ?? "–"],
                    ["Preis", service && service.priceCents !== null ? formatPrice(service.priceCents, service.priceIsFrom) : "–"],
                    ["Mitarbeiter", employee?.name ?? "Keine Präferenz"],
                    ["Wunschtag", draft.date ? new Date(`${draft.date}T12:00:00`).toLocaleDateString("de-DE", { weekday: "long", day: "numeric", month: "long" }) : "–"],
                    ["Uhrzeit", "wird telefonisch abgestimmt"],
                    ["Name", draft.customer.name || "–"],
                    ["Telefon", draft.customer.phone || "–"],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between gap-6 py-4">
                      <dt className="text-stone">{k}</dt>
                      <dd className="text-right">{v}</dd>
                    </div>
                  ))}
                </dl>
                <div className="mt-10 bg-ink p-6 text-white md:p-10">
                  <p className="flex items-center gap-3 text-eyebrow uppercase text-white/70">
                    <span aria-hidden="true" className="h-2 w-2 animate-breathe rounded-full bg-white" />
                    Online-Buchung noch nicht aktiv
                  </p>
                  <p className="mt-4 max-w-lg font-display text-3xl leading-tight md:text-4xl">
                    Bitte rufen Sie uns an – wir finden gemeinsam Ihren Termin.
                  </p>
                  <div className="mt-8 flex flex-wrap gap-4">
                    <a href={phone.href} className="inline-flex min-h-12 items-center gap-3 bg-white px-7 text-[0.8125rem] font-medium uppercase tracking-[0.2em] text-ink transition-colors duration-500 hover:bg-mist">
                      {phone.display}
                    </a>
                    <button type="button" disabled className="inline-flex min-h-12 cursor-not-allowed items-center border border-white/30 px-7 text-[0.8125rem] uppercase tracking-[0.2em] text-white/40">
                      Verbindlich buchen
                    </button>
                  </div>
                  <p className="mt-6 text-xs text-white/55">Es wurde kein Termin gebucht. Ihre Angaben werden nicht gespeichert oder übermittelt.</p>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="mt-12 flex items-center justify-between border-t border-mist pt-8">
          <button
            type="button"
            onClick={() => go(step - 1)}
            disabled={step === 0}
            className="text-[0.75rem] uppercase tracking-[0.24em] text-graphite transition-colors hover:text-ink disabled:invisible"
          >
            Zurück
          </button>
          {step < STEPS.length - 1 ? (
            <button
              type="button"
              onClick={next}
              disabled={!canNext}
              className="inline-flex min-h-12 items-center gap-3 bg-ink px-7 text-[0.8125rem] font-medium uppercase tracking-[0.2em] text-white transition-colors duration-500 hover:bg-graphite disabled:cursor-not-allowed disabled:bg-mist disabled:text-stone"
            >
              Weiter
            </button>
          ) : (
            <button
              type="button"
              onClick={() => { setDraft({ category: null, serviceId: null, employeeId: null, date: null, slot: null, customer: {} }); setErrors({}); go(0); }}
              className="text-[0.75rem] uppercase tracking-[0.24em] text-graphite transition-colors hover:text-ink"
            >
              Neu beginnen
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
