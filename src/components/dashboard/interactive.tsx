"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { btn, textareaCls } from "./ui";

/* ------------------------------------------------------------------ Dialog (native <dialog>: focus trap + Esc) */

export function Dialog({
  open, onClose, title, description, children, footer, wide,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  wide?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);
  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={(e) => { if (e.target === ref.current) onClose(); }}
      className={cn(
        "m-auto w-[calc(100%-2rem)] rounded-xl border border-dash-border bg-dash-surface p-0 text-dash-text shadow-2xl backdrop:bg-black/50 backdrop:backdrop-blur-[2px]",
        wide ? "max-w-2xl" : "max-w-md",
      )}
    >
      {open && (
        <div className="flex max-h-[85vh] flex-col">
          <div className="border-b border-dash-border px-6 py-4">
            <h2 id={titleId} className="text-base font-semibold">{title}</h2>
            {description && <p className="mt-1 text-sm text-dash-muted">{description}</p>}
          </div>
          {children && <div className="overflow-y-auto px-6 py-5">{children}</div>}
          <div className="flex flex-wrap justify-end gap-2 border-t border-dash-border px-6 py-4">
            {footer ?? <button type="button" className={btn("secondary")} onClick={onClose}>Schließen</button>}
          </div>
        </div>
      )}
    </dialog>
  );
}

/** Confirmation for destructive/irreversible actions; optional mandatory reason. */
export function ConfirmDialog({
  open, onClose, onConfirm, title, description, confirmLabel, requireReason, reasonLabel = "Begründung (Pflichtfeld)",
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  title: string;
  description?: ReactNode;
  confirmLabel: string;
  requireReason?: boolean;
  reasonLabel?: string;
}) {
  const [reason, setReason] = useState("");
  const [touched, setTouched] = useState(false);
  const id = useId();
  const invalid = !!requireReason && reason.trim().length < 5;
  const close = () => { setReason(""); setTouched(false); onClose(); };
  return (
    <Dialog
      open={open}
      onClose={close}
      title={title}
      description={description}
      footer={
        <>
          <button type="button" className={btn("secondary")} onClick={close}>Abbrechen</button>
          <button
            type="button"
            className={btn("primary")}
            onClick={() => { setTouched(true); if (invalid) return; onConfirm(reason.trim()); close(); }}
          >
            {confirmLabel}
          </button>
        </>
      }
    >
      {requireReason && (
        <div>
          <label htmlFor={id} className="text-xs font-medium">{reasonLabel}</label>
          <textarea
            id={id}
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            aria-invalid={touched && invalid}
            className={cn(textareaCls, "mt-1.5")}
            placeholder="z. B. Kunde hat telefonisch abgesagt"
          />
          {touched && invalid && <p className="mt-1 text-xs font-medium">— Bitte mindestens 5 Zeichen angeben.</p>}
        </div>
      )}
    </Dialog>
  );
}

/* ------------------------------------------------------------------ Tabs (roving focus, arrow keys) */

export function Tabs({ tabs, value, onChange, label }: { tabs: { id: string; label: string; count?: number }[]; value: string; onChange: (id: string) => void; label: string }) {
  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const i = tabs.findIndex((t) => t.id === value);
    if (e.key === "ArrowRight") { e.preventDefault(); onChange(tabs[(i + 1) % tabs.length].id); }
    if (e.key === "ArrowLeft") { e.preventDefault(); onChange(tabs[(i - 1 + tabs.length) % tabs.length].id); }
  };
  return (
    <div role="tablist" aria-label={label} onKeyDown={onKey} className="flex gap-1 overflow-x-auto border-b border-dash-border">
      {tabs.map((t) => (
        <button
          key={t.id}
          role="tab"
          type="button"
          aria-selected={t.id === value}
          tabIndex={t.id === value ? 0 : -1}
          onClick={() => onChange(t.id)}
          className={cn(
            "-mb-px flex shrink-0 items-center gap-2 border-b-2 px-3 py-2.5 text-sm transition-colors",
            t.id === value ? "border-dash-strong font-medium text-dash-text" : "border-transparent text-dash-muted hover:text-dash-text",
          )}
        >
          {t.label}
          {t.count !== undefined && <span className="rounded-full bg-dash-subtle px-1.5 text-[0.6875rem] tabular-nums text-dash-muted">{t.count}</span>}
        </button>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ Segmented control */

export function Segmented<T extends string>({ options, value, onChange, label }: { options: { id: T; label: string }[]; value: T; onChange: (v: T) => void; label: string }) {
  return (
    <div role="radiogroup" aria-label={label} className="inline-flex rounded-md border border-dash-border bg-dash-surface p-0.5">
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          role="radio"
          aria-checked={o.id === value}
          onClick={() => onChange(o.id)}
          className={cn("rounded px-3 py-1.5 text-xs font-medium transition-colors", o.id === value ? "bg-dash-strong text-dash-invert" : "text-dash-muted hover:text-dash-text")}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ Toast (transient feedback for demo actions) */

export function useToast() {
  const [msg, setMsg] = useState<string | null>(null);
  useEffect(() => {
    if (!msg) return;
    const t = window.setTimeout(() => setMsg(null), 3200);
    return () => window.clearTimeout(t);
  }, [msg]);
  const node = (
    <div aria-live="polite" className="pointer-events-none fixed bottom-4 right-4 z-50">
      {msg && (
        <div className="pointer-events-auto rounded-lg bg-dash-strong px-4 py-3 text-sm text-dash-invert shadow-xl">
          {msg} <span className="opacity-60">· Demo, nicht gespeichert</span>
        </div>
      )}
    </div>
  );
  return { toast: setMsg, toastNode: node };
}
