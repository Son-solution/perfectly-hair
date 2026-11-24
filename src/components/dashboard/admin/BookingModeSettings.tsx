"use client";

import { useEffect, useState } from "react";
import { useToast } from "@/components/dashboard/interactive";
import { Badge, Card, btn } from "@/components/dashboard/ui";
import {
  BOOKING_MODES, BOOKING_MODE_HINT, BOOKING_MODE_LABEL, BOOKING_MODE_PREVIEW_KEY, isBookingMode, showsOnlineBooking, type BookingMode,
} from "@/lib/booking-rules";
import { cn } from "@/lib/utils";

/**
 * Central booking mode (Admin → Einstellungen → Buchungseinstellungen).
 * Saved value today = business.booking.mode in the content layer (REQUEST_ONLY).
 * Demo: "Auf der Website ansehen" stores the choice ONLY in this browser (localStorage) so the
 * owner can preview the Termin page; nothing is saved and other visitors are unaffected.
 */
export function BookingModeSettings({ savedMode, engineReady, notificationEmail }: { savedMode: BookingMode; engineReady: boolean; notificationEmail: string | null }) {
  const [mode, setMode] = useState<BookingMode>(savedMode);
  const [preview, setPreview] = useState<BookingMode | null>(null);
  const { toast, toastNode } = useToast();

  useEffect(() => {
    let v: string | null = null;
    try { v = window.localStorage.getItem(BOOKING_MODE_PREVIEW_KEY); } catch { /* blocked */ }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- read browser-local preview after mount
    if (isBookingMode(v)) { setPreview(v); setMode(v); }
  }, []);

  const startPreview = () => {
    try { window.localStorage.setItem(BOOKING_MODE_PREVIEW_KEY, mode); } catch { toast("Vorschau nicht möglich (Browser-Speicher blockiert)."); return; }
    setPreview(mode);
    window.dispatchEvent(new Event("ph-booking-mode"));
    window.open("/termin", "_blank", "noopener");
  };
  const endPreview = () => {
    try { window.localStorage.removeItem(BOOKING_MODE_PREVIEW_KEY); } catch { /* ignore */ }
    setPreview(null);
    setMode(savedMode);
    window.dispatchEvent(new Event("ph-booking-mode"));
    toast("Vorschau beendet – Website zeigt wieder den gespeicherten Modus.");
  };

  return (
    <Card
      className="mb-4"
      title="Buchungsmodus"
      description="Legt fest, welche Wege zur Terminvereinbarung die Website anbietet. Die Regel „Herren Fr & Sa ohne Termin“ gilt in jedem Modus."
      action={<button type="button" className={btn("primary")} onClick={() => toast("Demo – der Modus wird erst mit Phase 5B gespeichert. Nutzen Sie „Auf der Website ansehen“.")}>Speichern</button>}
    >
      <fieldset>
        <legend className="sr-only">Buchungsmodus wählen</legend>
        <div className="grid gap-3 md:grid-cols-2">
          {BOOKING_MODES.map((m) => {
            const blocked = showsOnlineBooking(m) && !engineReady;
            return (
              <label
                key={m}
                className={cn(
                  "flex cursor-pointer gap-3 rounded-lg border p-4 transition-colors",
                  mode === m ? "border-dash-strong bg-dash-raised" : "border-dash-border hover:bg-dash-subtle",
                )}
              >
                <input type="radio" name="booking-mode" value={m} checked={mode === m} onChange={() => setMode(m)} className="mt-1 h-4 w-4 shrink-0 accent-current" />
                <span className="min-w-0">
                  <span className="flex flex-wrap items-center gap-2 text-sm font-semibold">
                    {BOOKING_MODE_LABEL[m]}
                    {m === savedMode && <Badge tone="solid">Aktiv</Badge>}
                    {m === "REQUEST_ONLY" && m !== savedMode && <Badge tone="outline">Standard</Badge>}
                    {blocked && <Badge tone="dashed">Backend erforderlich</Badge>}
                  </span>
                  <span className="mt-1 block text-xs leading-relaxed text-dash-muted">{BOOKING_MODE_HINT[m]}</span>
                  <code className="mt-1 block text-[0.625rem] text-dash-muted">{m}</code>
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>

      {showsOnlineBooking(mode) && !engineReady && (
        <p role="note" className="mt-4 rounded-md border border-dashed border-dash-muted p-3 text-xs leading-relaxed">
          Echte Online-Buchung bleibt gesperrt, bis Backend, Verfügbarkeitsprüfung und Doppelbuchungsschutz umgesetzt und getestet sind. Bis dahin zeigt die Website nur eine Vorschau des Buchungsablaufs – es kann nichts gebucht werden.
        </p>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-dash-border pt-4">
        <button type="button" className={btn("secondary", "sm")} onClick={startPreview}>Auf der Website ansehen (Vorschau)</button>
        {preview && <button type="button" className={btn("ghost", "sm")} onClick={endPreview}>Vorschau beenden</button>}
        <span className="text-xs text-dash-muted">
          {preview ? `Vorschau aktiv in diesem Browser: „${BOOKING_MODE_LABEL[preview]}“` : "Nur in diesem Browser – andere Besucher sehen weiterhin den gespeicherten Modus."}
        </span>
      </div>

      <div className="mt-4 rounded-md bg-dash-raised p-3 text-xs leading-relaxed">
        <p className="font-medium">Wohin gehen Terminanfragen? (ab Phase 5B)</p>
        <ul className="mt-1 list-disc space-y-0.5 pl-5 text-dash-muted">
          <li>Admin-Dashboard → <strong className="text-dash-text">Terminanfragen</strong> (mit Benachrichtigung)</li>
          <li>E-Mail an den Salon: <strong className="text-dash-text">{notificationEmail ?? "noch nicht hinterlegt"}</strong> (Einstellungen → Benachrichtigungen)</li>
        </ul>
        <p className="mt-1 text-dash-muted">Aktuell werden keine Anfragen gesendet und keine E-Mails verschickt.</p>
      </div>
      {toastNode}
    </Card>
  );
}
