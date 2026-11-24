"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export type NotificationItem = {
  id: string;
  kind: "termin" | "anfrage" | "bewerbung" | "zeit" | "urlaub";
  title: string;
  text: string;
  at: string; // ISO local date-time
  href: string;
  read: boolean;
};

const KIND_LABEL: Record<NotificationItem["kind"], string> = {
  termin: "Termin",
  anfrage: "Terminanfrage",
  bewerbung: "Bewerbung",
  zeit: "Zeiterfassung",
  urlaub: "Abwesenheit",
};

/**
 * Internal notification centre (demo). Read state is local to this page view and is
 * not persisted. Phase 5B: `notifications` table + Supabase Realtime, per-user read state.
 */
export function NotificationCenter({ items }: { items: NotificationItem[] }) {
  const [open, setOpen] = useState(false);
  const [readIds, setReadIds] = useState<Set<string>>(() => new Set(items.filter((i) => i.read).map((i) => i.id)));
  const ref = useRef<HTMLDivElement>(null);
  const unread = items.filter((i) => !readIds.has(i.id)).length;

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", onDown); document.removeEventListener("keydown", onKey); };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="true"
        aria-label={`Benachrichtigungen${unread ? ` – ${unread} ungelesen` : ""}`}
        className="relative rounded-md p-2 text-dash-text hover:bg-dash-subtle"
      >
        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className="h-[18px] w-[18px]">
          <path d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10.3 21a1.9 1.9 0 0 0 3.4 0" />
        </svg>
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-dash-strong px-1 text-[0.5625rem] font-semibold tabular-nums text-dash-invert">
            {unread}
          </span>
        )}
      </button>
      {open && (
        <div className="fixed inset-x-3 top-16 z-50 overflow-hidden rounded-xl border border-dash-border bg-dash-surface shadow-2xl sm:absolute sm:inset-x-auto sm:right-0 sm:top-11 sm:w-96">
          <div className="flex items-center justify-between border-b border-dash-border px-4 py-3">
            <p className="text-sm font-semibold">Benachrichtigungen</p>
            <button
              type="button"
              disabled={unread === 0}
              onClick={() => setReadIds(new Set(items.map((i) => i.id)))}
              className="text-xs text-dash-muted underline-offset-2 hover:text-dash-text hover:underline disabled:opacity-40"
            >
              Alle als gelesen markieren
            </button>
          </div>
          <ul className="max-h-[60vh] overflow-y-auto">
            {items.map((n) => {
              const isRead = readIds.has(n.id);
              return (
                <li key={n.id} className="border-b border-dash-border last:border-0">
                  <Link
                    href={n.href}
                    onClick={() => { setReadIds((s) => new Set(s).add(n.id)); setOpen(false); }}
                    className={cn("flex gap-3 px-4 py-3 hover:bg-dash-subtle", !isRead && "bg-dash-raised")}
                  >
                    <span aria-hidden="true" className={cn("mt-1.5 h-2 w-2 shrink-0 rounded-full", isRead ? "border border-dash-border" : "bg-dash-strong")} />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-baseline justify-between gap-2">
                        <span className={cn("truncate text-sm", !isRead && "font-semibold")}>{n.title}</span>
                        <span className="shrink-0 text-[0.6875rem] tabular-nums text-dash-muted">{n.at.slice(8, 10)}.{n.at.slice(5, 7)}. {n.at.slice(11, 16)}</span>
                      </span>
                      <span className="mt-0.5 block text-xs text-dash-muted">{KIND_LABEL[n.kind]} · {n.text}</span>
                      {!isRead && <span className="sr-only">ungelesen</span>}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
          <p className="border-t border-dash-border px-4 py-2.5 text-[0.6875rem] text-dash-muted">Demo – Lesestatus wird nicht gespeichert. Echtzeit-Benachrichtigungen folgen mit Phase 5B.</p>
        </div>
      )}
    </div>
  );
}
