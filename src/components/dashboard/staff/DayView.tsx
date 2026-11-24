"use client";

import { useState } from "react";
import { Badge, StatusBadge, btn } from "@/components/dashboard/ui";
import { addDays, fmtDate, fmtTime, isoWeekday, toMin } from "@/features/dashboard/calc";
import type { Appointment, Employee } from "@/features/dashboard/domain";
import { cn } from "@/lib/utils";

const DAY_START = 9 * 60;
const DAY_END = 19 * 60;
const PX = 1.2; // pixels per minute
const hm = (t: string) => { const [h, m] = t.split(":").map(Number); return h * 60 + m; };

/**
 * Staff day view: week strip with appointment counts, ‹ › navigation, and a timeline for the
 * selected day showing shift, planned break and own appointments. Days off / leave are labelled.
 */
export function DayView({ appointments, today, nowTime, schedule, leave, onOpen }: {
  appointments: Appointment[];
  today: string;
  nowTime: string;
  schedule: Employee["schedule"];
  leave: { from: string; to: string; label: string }[];
  onOpen: (id: string) => void;
}) {
  const [day, setDay] = useState(today);
  const monday = addDays(day, 1 - isoWeekday(day));
  const week = Array.from({ length: 7 }, (_, i) => addDays(monday, i));
  const active = (a: Appointment) => a.status !== "cancelled" && a.status !== "rejected";
  const onDay = (d: string) => appointments.filter((a) => a.start.startsWith(d)).sort((a, b) => a.start.localeCompare(b.start));
  const leaveOn = (d: string) => leave.find((l) => d >= l.from && d <= l.to) ?? null;
  const shift = schedule[String(isoWeekday(day))];
  const absent = leaveOn(day);
  const list = onDay(day);
  const visible = list.filter(active);
  const cancelled = list.filter((a) => !active(a));
  // Lanes: overlapping appointments are shown side by side instead of on top of each other.
  const laneEnds: number[] = [];
  const lanes = new Map<string, number>();
  for (const a of visible) {
    const st = toMin(a.start);
    let lane = laneEnds.findIndex((end) => end <= st);
    if (lane === -1) { lane = laneEnds.length; laneEnds.push(0); }
    laneEnds[lane] = st + a.durationMin;
    lanes.set(a.id, lane);
  }
  const laneCount = Math.max(1, laneEnds.length);
  const overlaps = (a: Appointment) => visible.some((b) => b.id !== a.id && toMin(b.start) < toMin(a.start) + a.durationMin && toMin(a.start) < toMin(b.start) + b.durationMin);

  // Planned break: middle of the shift (display hint only).
  const breakStart = shift ? hm(shift.start) + Math.round((hm(shift.end) - hm(shift.start) - shift.breakMin) / 2) : null;

  return (
    <div>
      {/* Week strip */}
      <div className="flex items-center gap-2">
        <button type="button" className={btn("secondary", "sm")} onClick={() => setDay((d) => addDays(d, -1))} aria-label="Vorheriger Tag">‹</button>
        <button type="button" className={btn("secondary", "sm")} onClick={() => setDay(today)} disabled={day === today}>Heute</button>
        <button type="button" className={btn("secondary", "sm")} onClick={() => setDay((d) => addDays(d, 1))} aria-label="Nächster Tag">›</button>
        <p className="ml-2 text-sm font-medium">{fmtDate(day, { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</p>
      </div>
      <div role="group" aria-label="Woche" className="mt-3 grid grid-cols-7 gap-1.5">
        {week.map((d) => {
          const n = onDay(d).filter(active).length;
          const off = !schedule[String(isoWeekday(d))] || !!leaveOn(d);
          return (
            <button
              key={d}
              type="button"
              aria-pressed={d === day}
              aria-label={`${fmtDate(d, { weekday: "long", day: "numeric", month: "long" })}: ${off ? "frei" : `${n} ${n === 1 ? "Termin" : "Termine"}`}`}
              onClick={() => setDay(d)}
              className={cn(
                "flex flex-col items-center rounded-lg border py-2 transition-colors",
                d === day ? "border-dash-strong bg-dash-strong text-dash-invert" : "border-dash-border bg-dash-surface hover:bg-dash-subtle",
                d === today && d !== day && "border-dash-strong",
              )}
            >
              <span className="text-[0.625rem] uppercase tracking-wider opacity-70">{fmtDate(d, { weekday: "short" }).replace(".", "")}</span>
              <span className="font-display text-xl tabular-nums leading-tight">{Number(d.slice(8))}</span>
              <span className="text-[0.625rem] tabular-nums opacity-80">{off ? "frei" : n}</span>
            </button>
          );
        })}
      </div>

      {/* Day summary */}
      <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
        {absent ? <Badge tone="muted">{absent.label}</Badge>
          : shift ? <><Badge tone="outline">Schicht {shift.start} – {shift.end}</Badge><Badge tone="muted">Pause {shift.breakMin} Min.</Badge></>
          : <Badge tone="muted">Frei – kein Dienst</Badge>}
        <span className="text-dash-muted">{visible.length} {visible.length === 1 ? "Termin" : "Termine"}{cancelled.length ? ` · ${cancelled.length} storniert/abgelehnt` : ""}</span>
      </div>

      {/* Timeline */}
      <div className="mt-4 overflow-hidden rounded-xl border border-dash-border bg-dash-surface">
        <div className="relative" style={{ height: (DAY_END - DAY_START) * PX }}>
          {Array.from({ length: (DAY_END - DAY_START) / 60 + 1 }, (_, i) => (
            <div key={i} className="absolute inset-x-0 border-t border-dash-border/70" style={{ top: i * 60 * PX }}>
              <span className="absolute left-2 top-0.5 text-[0.625rem] tabular-nums text-dash-muted">{String(9 + i).padStart(2, "0")}:00</span>
            </div>
          ))}
          {/* Off-shift shading */}
          {(!shift || absent) ? (
            <div className="absolute inset-y-0 left-14 right-0 bg-dash-subtle/60" />
          ) : (
            <>
              <div className="absolute left-14 right-0 top-0 bg-dash-subtle/60" style={{ height: Math.max(0, hm(shift.start) - DAY_START) * PX }} />
              <div className="absolute bottom-0 left-14 right-0 bg-dash-subtle/60" style={{ top: Math.min(DAY_END - DAY_START, hm(shift.end) - DAY_START) * PX }} />
              {breakStart !== null && shift.breakMin > 0 && (
                <div className="absolute left-14 right-2 flex items-center justify-center rounded-md border border-dashed border-dash-muted text-[0.6875rem] text-dash-muted"
                  style={{ top: (breakStart - DAY_START) * PX, height: shift.breakMin * PX }}>
                  Pause (geplant)
                </div>
              )}
            </>
          )}
          {/* "Now" line */}
          {day === today && (
            <div aria-hidden="true" className="absolute left-12 right-0 z-10 border-t-2 border-dash-strong" style={{ top: (hm(nowTime) - DAY_START) * PX }} />
          )}
          {visible.map((a) => {
            const top = (toMin(a.start) - DAY_START) * PX;
            const h = Math.max(26, a.durationMin * PX - 3);
            const n = overlaps(a) ? laneCount : 1;
            const lane = n === 1 ? 0 : lanes.get(a.id)!;
            return (
              <button
                key={a.id}
                type="button"
                onClick={() => onOpen(a.id)}
                style={{ top, height: h, left: `calc(4rem + (100% - 4.5rem) * ${lane / n})`, width: `calc((100% - 4.5rem) / ${n} - 4px)` }}
                className={cn(
                  "absolute z-20 flex items-start justify-between gap-2 overflow-hidden rounded-md px-3 py-1 text-left text-xs shadow-sm transition-opacity hover:opacity-90",
                  a.status === "pending" ? "border border-dashed border-dash-strong bg-dash-field text-dash-text" : a.status === "confirmed" ? "bg-dash-strong text-dash-invert" : "border border-dash-border bg-dash-raised text-dash-text",
                )}
              >
                <span className="min-w-0">
                  <span className="font-semibold tabular-nums">{fmtTime(a.start)}</span> · {a.serviceName}
                  {h > 34 && <span className="block truncate opacity-80">{a.customerName} · {a.durationMin} Min.</span>}
                </span>
                {h > 34 && <span className="shrink-0"><StatusBadge status={a.status} /></span>}
              </button>
            );
          })}
        </div>
      </div>
      {visible.length === 0 && !absent && shift && <p className="mt-3 text-sm text-dash-muted">Noch keine Termine an diesem Tag.</p>}
    </div>
  );
}
