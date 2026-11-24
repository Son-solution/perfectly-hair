"use client";

import { useEffect, useState } from "react";
import { ConfirmDialog, Dialog, useToast } from "@/components/dashboard/interactive";
import { Badge, Card, Stat, btn, textareaCls } from "@/components/dashboard/ui";
import { effective, fmtDate, fmtDuration, fmtTime, toMin, workedMinutes } from "@/features/dashboard/calc";
import type { AttendanceRecord } from "@/features/dashboard/domain";
import { cn } from "@/lib/utils";

type State = "aus" | "arbeitet" | "pause" | "feierabend";

/** Demo clock: starts at the fixed demo time and advances in real time while the page is open. */
function useDemoClock(base: string) {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    const start = Date.now();
    const id = window.setInterval(() => setElapsed(Math.floor((Date.now() - start) / 1000)), 1000);
    return () => window.clearInterval(id);
  }, []);
  const total = toMin(base) * 60 + elapsed;
  const hh = String(Math.floor(total / 3600) % 24).padStart(2, "0");
  const mm = String(Math.floor(total / 60) % 60).padStart(2, "0");
  const ss = String(total % 60).padStart(2, "0");
  return { hhmm: `${hh}:${mm}`, display: `${hh}:${mm}:${ss}`, minutes: Math.floor(total / 60) };
}

export function TimeClock({
  today, now, todayRecord, history, weekWorked, monthWorked,
}: {
  today: string;
  now: string;
  todayRecord: AttendanceRecord | null;
  history: AttendanceRecord[];
  weekWorked: number;
  monthWorked: number;
}) {
  const clock = useDemoClock(now);
  const initialIn = todayRecord ? effective(todayRecord).clockIn : null;
  const [state, setState] = useState<State>(initialIn ? "arbeitet" : "aus");
  const [clockIn, setClockIn] = useState<string | null>(initialIn ? fmtTime(initialIn) : null);
  const [breakStart, setBreakStart] = useState<number | null>(null);
  const [breakMin, setBreakMin] = useState(0);
  const [clockOut, setClockOut] = useState<string | null>(null);
  const [confirmOut, setConfirmOut] = useState(false);
  const [requestFor, setRequestFor] = useState<AttendanceRecord | null>(null);
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState<string[]>([]);
  const { toast, toastNode } = useToast();

  const toM = (hhmm: string) => { const [h, m] = hhmm.split(":").map(Number); return h * 60 + m; };
  const currentBreak = state === "pause" && breakStart !== null ? clock.minutes - breakStart : 0;
  const end = clockOut ? toM(clockOut) : clock.minutes;
  const worked = clockIn ? Math.max(0, end - toM(clockIn) - breakMin - currentBreak) : 0;

  const STATE_LABEL: Record<State, string> = { aus: "Nicht eingestempelt", arbeitet: "Bei der Arbeit", pause: "In Pause", feierabend: "Feierabend" };
  const incomplete = history.filter((r) => r.date < today && !effective(r).clockOut);

  return (
    <>
      <Card className="mb-4" padded={false}>
        <div className="flex flex-col items-center px-5 py-8 text-center md:py-10">
          <Badge tone={state === "arbeitet" ? "solid" : state === "pause" ? "dashed" : "muted"}>
            <span className={cn("h-1.5 w-1.5 rounded-full", state === "arbeitet" ? "animate-pulse bg-dash-invert" : "bg-current")} />
            {STATE_LABEL[state]}
          </Badge>
          <p className="mt-5 font-display text-6xl tabular-nums md:text-7xl" aria-live="off">{clock.display}</p>
          <p className="mt-1 text-xs text-dash-muted">{fmtDate(today, { weekday: "long", day: "numeric", month: "long" })} · Demo-Uhrzeit</p>

          <div className="mt-8 grid w-full max-w-md grid-cols-2 gap-3">
            <button type="button" className={cn(btn("primary"), "h-14 text-base")} disabled={state !== "aus"}
              onClick={() => { setClockIn(clock.hhmm); setState("arbeitet"); toast(`Arbeitsbeginn ${clock.hhmm} erfasst`); }}>
              Arbeitsbeginn
            </button>
            <button type="button" className={cn(btn("secondary"), "h-14 text-base")} disabled={state !== "arbeitet" && state !== "pause"}
              onClick={() => {
                if (state === "arbeitet") { setBreakStart(clock.minutes); setState("pause"); toast("Pause begonnen"); }
                else { setBreakMin((b) => b + currentBreak); setBreakStart(null); setState("arbeitet"); toast("Pause beendet"); }
              }}>
              {state === "pause" ? "Pause beenden" : "Pause beginnen"}
            </button>
            <button type="button" className={cn(btn("danger"), "col-span-2 h-14 text-base")} disabled={state !== "arbeitet"}
              onClick={() => setConfirmOut(true)}>
              Feierabend
            </button>
          </div>
          {state === "pause" && <p className="mt-3 text-xs text-dash-muted">Bitte zuerst die Pause beenden, dann Feierabend stempeln.</p>}
        </div>
        <dl className="grid grid-cols-3 border-t border-dash-border text-center">
          <div className="border-r border-dash-border px-3 py-4"><dt className="text-[0.6875rem] text-dash-muted">Beginn</dt><dd className="mt-1 font-display text-xl tabular-nums">{clockIn ?? "—"}</dd></div>
          <div className="border-r border-dash-border px-3 py-4"><dt className="text-[0.6875rem] text-dash-muted">Pause</dt><dd className="mt-1 font-display text-xl tabular-nums">{breakMin + currentBreak} Min.</dd></div>
          <div className="px-3 py-4"><dt className="text-[0.6875rem] text-dash-muted">Arbeitszeit heute</dt><dd className="mt-1 font-display text-xl tabular-nums">{fmtDuration(worked)}</dd></div>
        </dl>
      </Card>

      <div className="mb-4 grid grid-cols-2 gap-3">
        <Stat label="Diese Woche" value={fmtDuration(weekWorked + worked)} hint="inkl. heute" />
        <Stat label="Dieser Monat" value={fmtDuration(monthWorked + worked)} hint="inkl. heute" />
      </div>

      {incomplete.length > 0 && (
        <Card className="mb-4" title="Unvollständige Einträge" description="Bitte eine Korrektur beantragen – Einträge können nicht selbst geändert werden.">
          <ul className="divide-y divide-dash-border">
            {incomplete.map((r) => (
              <li key={r.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                <span>{fmtDate(r.date, { weekday: "long", day: "numeric", month: "short" })} · Kommen {fmtTime(effective(r).clockIn)} · <strong>Gehen fehlt</strong></span>
                {r.requests.some((q) => q.status === "open") || sent.includes(r.id)
                  ? <Badge tone="dashed">Anfrage offen</Badge>
                  : <button type="button" className={btn("secondary", "sm")} onClick={() => setRequestFor(r)}>Korrektur beantragen</button>}
              </li>
            ))}
          </ul>
        </Card>
      )}

      <Card title="Verlauf" description="Abgeschlossene Tage sind schreibgeschützt" padded={false}>
        <ul className="divide-y divide-dash-border">
          {history.filter((r) => r.date < today).slice(0, 14).map((r) => {
            const v = effective(r);
            const w = workedMinutes(v);
            return (
              <li key={r.id} className="flex items-center gap-3 px-5 py-3 text-sm">
                <span className="w-24 shrink-0">{fmtDate(r.date)}</span>
                <span className="flex-1 tabular-nums text-dash-muted">{fmtTime(v.clockIn)} – {fmtTime(v.clockOut)} · Pause {v.breakMin} Min.</span>
                <span className="tabular-nums">{w !== null ? fmtDuration(w) : "—"}</span>
                {r.corrections.length > 0 && <Badge tone="dashed">Korrigiert</Badge>}
                {!sent.includes(r.id) && v.clockOut && (
                  <button type="button" className={btn("ghost", "sm")} onClick={() => setRequestFor(r)} aria-label={`Korrektur für ${fmtDate(r.date)} beantragen`}>Korrektur</button>
                )}
              </li>
            );
          })}
        </ul>
      </Card>

      <ConfirmDialog
        open={confirmOut}
        onClose={() => setConfirmOut(false)}
        title="Feierabend stempeln?"
        description={`Arbeitszeit heute: ${fmtDuration(worked)} · Pause ${breakMin} Min. Nach dem Ausstempeln ist der Eintrag abgeschlossen.`}
        confirmLabel="Feierabend"
        onConfirm={() => { setClockOut(clock.hhmm); setState("feierabend"); toast(`Feierabend ${clock.hhmm} erfasst`); }}
      />

      <Dialog
        open={!!requestFor}
        onClose={() => { setRequestFor(null); setMessage(""); }}
        title="Korrektur beantragen"
        description={requestFor ? `${fmtDate(requestFor.date, { weekday: "long", day: "numeric", month: "long" })} · Die Salonleitung prüft und korrigiert den Eintrag.` : undefined}
        footer={
          <>
            <button type="button" className={btn("secondary")} onClick={() => { setRequestFor(null); setMessage(""); }}>Abbrechen</button>
            <button type="button" className={btn("primary")} disabled={message.trim().length < 5}
              onClick={() => { if (requestFor) setSent((s) => [...s, requestFor.id]); setRequestFor(null); setMessage(""); toast("Korrekturanfrage gesendet"); }}>
              Anfrage senden
            </button>
          </>
        }
      >
        <label htmlFor="req-msg" className="text-xs font-medium">Was soll korrigiert werden?</label>
        <textarea id="req-msg" rows={3} className={cn(textareaCls, "mt-1.5")} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="z. B. Ausstempeln vergessen, Feierabend war 18:10 Uhr" />
      </Dialog>
      {toastNode}
    </>
  );
}
