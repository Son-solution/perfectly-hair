"use client";

import { useEffect, useState, type ReactNode } from "react";
import {
  BOOKING_MODE_LABEL, BOOKING_MODE_PREVIEW_KEY, isBookingMode, showsOnlineBooking, showsRequestForm, type BookingMode,
} from "@/lib/booking-rules";

/** Reads the browser-local preview mode (set from Admin → Buchungseinstellungen in the demo). */
function usePreviewMode(serverMode: BookingMode) {
  const [mode, setMode] = useState<BookingMode>(serverMode);
  const [isPreview, setIsPreview] = useState(false);
  useEffect(() => {
    const read = () => {
      let v: string | null = null;
      try { v = window.localStorage.getItem(BOOKING_MODE_PREVIEW_KEY); } catch { /* storage blocked */ }
      setMode(isBookingMode(v) ? v : serverMode);
      setIsPreview(isBookingMode(v) && v !== serverMode);
    };
    read();
    window.addEventListener("storage", read);
    window.addEventListener("ph-booking-mode", read);
    return () => { window.removeEventListener("storage", read); window.removeEventListener("ph-booking-mode", read); };
  }, [serverMode]);
  return { mode, isPreview };
}

/**
 * Demo/development only: shows or hides a booking section according to the booking mode,
 * including a browser-local preview override. In production the server decides directly and
 * this component is not used (hidden sections are not even sent to the browser).
 */
export function BookingModeSlot({ kind, serverMode, disabledNotice, children }: {
  kind: "request" | "online";
  serverMode: BookingMode;
  disabledNotice?: ReactNode;
  children: ReactNode;
}) {
  const { mode, isPreview } = usePreviewMode(serverMode);
  const visible = kind === "request" ? showsRequestForm(mode) : showsOnlineBooking(mode);
  return (
    <>
      {kind === "request" && isPreview && (
        <div role="status" className="sticky top-[var(--header-h)] z-30 border-b border-ink bg-white">
          <div className="container-luxe flex flex-wrap items-center justify-between gap-3 py-3 text-sm">
            <span><strong>Vorschau:</strong> Buchungsmodus „{BOOKING_MODE_LABEL[mode]}“ – nur in diesem Browser, nicht gespeichert.</span>
            <button
              type="button"
              className="underline underline-offset-4"
              onClick={() => { try { window.localStorage.removeItem(BOOKING_MODE_PREVIEW_KEY); } catch { /* ignore */ } window.dispatchEvent(new Event("ph-booking-mode")); }}
            >
              Vorschau beenden
            </button>
          </div>
        </div>
      )}
      {visible ? children : kind === "request" && mode === "DISABLED" ? disabledNotice : null}
    </>
  );
}
