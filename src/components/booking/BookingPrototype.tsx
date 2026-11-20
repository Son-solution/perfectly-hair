"use client";

import { AnimatePresence, motion } from "motion/react";
import { useRef, useState } from "react";
import { audiences, businessHours, flyerServices, site, type Audience } from "@/config/site";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";

/**
 * Booking UI PROTOTYPE (Phase 2).
 * Lets visitors explore the future flow, but never pretends to create a booking:
 * there is no submit, no fake availability, no stored data. The final step routes
 * to the telephone. The real engine (server-validated) arrives with the backend.
 */

const ease = [0.22, 1, 0.36, 1] as const;

const steps = ["Bereich", "Leistung", "Mitarbeiter", "Termin", "Übersicht"] as const;

export function BookingPrototype() {
  const [step, setStep] = useState(0);
  const [audience, setAudience] = useState<Audience | null>(null);
  const [service, setService] = useState<string | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const focusPending = useRef(false);

  const canNext = (step === 0 && audience) || (step === 1 && service) || step === 2 || step === 3;

  const go = (next: number) => {
    setStep(next);
    // Focus the new step heading once it has animated in (keyboard / screen readers).
    focusPending.current = true;
  };

  const selectedService = flyerServices.find((s) => s.name === service);
  const audienceLabel = audiences.find((a) => a.slug === audience)?.label;

  return (
    <div className="border border-mist bg-white">
      {/* Progress */}
      <ol className="grid grid-cols-5 border-b border-mist" aria-label="Fortschritt">
        {steps.map((label, i) => (
          <li
            key={label}
            aria-current={i === step ? "step" : undefined}
            className={cn(
              "relative px-2 py-4 text-center text-[0.625rem] uppercase tracking-[0.18em] transition-colors duration-500 sm:px-4 sm:text-[0.6875rem]",
              i === step ? "text-ink" : i < step ? "text-graphite" : "text-ash",
            )}
          >
            <span className="hidden sm:inline">{label}</span>
            <span className="sm:hidden">{i + 1}</span>
            {i === step && (
              <motion.span
                layoutId="booking-step"
                aria-hidden="true"
                className="absolute inset-x-0 -bottom-px h-px bg-ink"
                transition={{ duration: 0.6, ease }}
              />
            )}
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
            onAnimationComplete={(def) => {
              const entered = typeof def === "object" && def !== null && "x" in def && def.x === 0;
              if (entered && focusPending.current) {
                focusPending.current = false;
                headingRef.current?.focus();
              }
            }}
            transition={{ duration: 0.45, ease }}
          >
            <p className="text-eyebrow uppercase text-stone">
              Schritt {step + 1} von {steps.length}
            </p>

            {step === 0 && (
              <fieldset className="mt-4">
                <legend>
                  <h2 ref={headingRef} tabIndex={-1} className="font-display text-4xl outline-none md:text-5xl">
                    Für wen ist der Termin?
                  </h2>
                </legend>
                <div className="mt-10 grid gap-3 sm:grid-cols-3">
                  {audiences.map((a) => (
                    <label
                      key={a.slug}
                      className={cn(
                        "group flex cursor-pointer items-baseline justify-between border px-6 py-8 transition-colors duration-500 has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-4",
                        audience === a.slug ? "border-ink bg-ink text-white" : "border-mist hover:border-ink",
                      )}
                    >
                      <input
                        type="radio"
                        name="audience"
                        value={a.slug}
                        checked={audience === a.slug}
                        onChange={() => setAudience(a.slug)}
                        className="sr-only"
                      />
                      <span className="font-display text-3xl">{a.label}</span>
                      <span aria-hidden="true" className={cn("h-px transition-[width] duration-500", audience === a.slug ? "w-10 bg-white" : "w-5 bg-ink")} />
                    </label>
                  ))}
                </div>
              </fieldset>
            )}

            {step === 1 && (
              <fieldset className="mt-4">
                <legend>
                  <h2 ref={headingRef} tabIndex={-1} className="font-display text-4xl outline-none md:text-5xl">
                    Welche Leistung?
                  </h2>
                </legend>
                <div className="mt-10 divide-y divide-mist border-y border-mist">
                  {flyerServices.map((s) => (
                    <label
                      key={s.name}
                      className={cn(
                        "flex cursor-pointer items-center justify-between gap-6 px-2 py-5 transition-colors duration-300 has-[:focus-visible]:bg-bone",
                        service === s.name ? "bg-bone" : "hover:bg-paper",
                      )}
                    >
                      <span className="flex items-center gap-4">
                        <input
                          type="radio"
                          name="service"
                          value={s.name}
                          checked={service === s.name}
                          onChange={() => setService(s.name)}
                          className="h-4 w-4 accent-ink"
                        />
                        <span className="text-lg">{s.name}</span>
                      </span>
                      <span className="font-display text-2xl tabular-nums">
                        {formatPrice(s.priceCents, s.priceIsFrom)}
                      </span>
                    </label>
                  ))}
                </div>
                <p className="mt-5 text-sm text-stone">
                  Preise laut Flyer, nicht nach Damen, Herren und Kindern unterschieden.
                  Dauer und weitere Leistungen werden ergänzt.
                </p>
              </fieldset>
            )}

            {step === 2 && (
              <div className="mt-4">
                <h2 ref={headingRef} tabIndex={-1} className="font-display text-4xl outline-none md:text-5xl">
                  Bei wem?
                </h2>
                <div className="mt-10 flex items-baseline justify-between border border-ink px-6 py-8">
                  <span className="font-display text-3xl">Keine Präferenz</span>
                  <span className="text-eyebrow uppercase text-stone">Ausgewählt</span>
                </div>
                <p className="mt-5 text-sm text-stone">
                  Die Auswahl einzelner Mitarbeiter wird verfügbar, sobald sich unser Team
                  vorgestellt hat.
                </p>
              </div>
            )}

            {step === 3 && (
              <div className="mt-4">
                <h2 ref={headingRef} tabIndex={-1} className="font-display text-4xl outline-none md:text-5xl">
                  Wann passt es Ihnen?
                </h2>
                <div className="mt-10 border border-dashed border-ash p-6 md:p-8">
                  <p className="text-eyebrow uppercase">Noch nicht verfügbar</p>
                  <p className="mt-4 max-w-lg leading-relaxed text-graphite">
                    Freie Termine werden hier angezeigt, sobald die Online-Buchung an unseren
                    Kalender angebunden ist. Es werden keine Beispielzeiten angezeigt, damit
                    keine falschen Erwartungen entstehen.
                  </p>
                  <dl className="mt-8 grid grid-cols-2 gap-x-8 gap-y-2 text-sm sm:grid-cols-4">
                    {businessHours.filter((d) => d.opens).map((d) => (
                      <div key={d.weekday}>
                        <dt className="text-stone">{d.label.slice(0, 2)}</dt>
                        <dd className="tabular-nums">{d.opens}–{d.closes}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="mt-4">
                <h2 ref={headingRef} tabIndex={-1} className="font-display text-4xl outline-none md:text-5xl">
                  Ihre Auswahl
                </h2>
                <dl className="mt-10 divide-y divide-mist border-y border-mist">
                  {[
                    ["Bereich", audienceLabel ?? "–"],
                    ["Leistung", selectedService?.name ?? "–"],
                    ["Preis", selectedService ? formatPrice(selectedService.priceCents, selectedService.priceIsFrom) : "–"],
                    ["Mitarbeiter", "Keine Präferenz"],
                    ["Termin", "telefonisch"],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between gap-6 py-4">
                      <dt className="text-stone">{k}</dt>
                      <dd className="text-right">{v}</dd>
                    </div>
                  ))}
                </dl>
                <div className="mt-10 bg-ink p-6 text-white md:p-10">
                  <p className="text-eyebrow uppercase text-ash">So buchen Sie aktuell</p>
                  <p className="mt-4 max-w-lg font-display text-3xl leading-tight md:text-4xl">
                    Rufen Sie uns an – wir finden gemeinsam einen Termin.
                  </p>
                  <a
                    href={site.phone.href}
                    className="mt-8 inline-flex min-h-12 items-center gap-3 bg-white px-7 text-[0.8125rem] font-medium uppercase tracking-[0.2em] text-ink transition-colors duration-500 hover:bg-mist"
                  >
                    {site.phone.display}
                  </a>
                  <p className="mt-6 text-xs text-ash">
                    Ihre Auswahl wird nicht gespeichert oder übermittelt.
                  </p>
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
          {step < steps.length - 1 ? (
            <button
              type="button"
              onClick={() => go(step + 1)}
              disabled={!canNext}
              className="inline-flex min-h-12 items-center gap-3 bg-ink px-7 text-[0.8125rem] font-medium uppercase tracking-[0.2em] text-white transition-colors duration-500 hover:bg-graphite disabled:cursor-not-allowed disabled:bg-mist disabled:text-stone"
            >
              Weiter
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                setAudience(null);
                setService(null);
                go(0);
              }}
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
