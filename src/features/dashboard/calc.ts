/**
 * Pure calculations (client-safe). Payroll figures are a PREPARATION PREVIEW only —
 * not a certified German payroll/tax calculation (no taxes, social security, etc.).
 */
import type { AttendanceRecord, AttendanceValues, Employee, PayrollAdjustment, PayrollProfile } from "./domain";

export const toMin = (iso: string) => {
  const t = iso.slice(11, 16);
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};

/** Effective values = last correction (if any) else the original record. */
export const effective = (r: AttendanceRecord): AttendanceValues => r.corrections.at(-1)?.after ?? r.original;

export function workedMinutes(v: AttendanceValues): number | null {
  if (!v.clockIn || !v.clockOut) return null;
  return Math.max(0, toMin(v.clockOut) - toMin(v.clockIn) - v.breakMin);
}

export const isoWeekday = (date: string) => ((new Date(`${date}T12:00:00Z`).getUTCDay() + 6) % 7) + 1;

export const addDays = (date: string, n: number) => {
  const d = new Date(`${date}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
};

const hhmm = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};

export function scheduledMinutes(e: Employee, date: string): number {
  const s = e.schedule[String(isoWeekday(date))];
  if (!s) return 0;
  return hhmm(s.end) - hhmm(s.start) - s.breakMin;
}

export function scheduledStart(e: Employee, date: string): string | null {
  return e.schedule[String(isoWeekday(date))]?.start ?? null;
}

export type AttendanceFlag = "fehlendes-ausstempeln" | "verspaetet" | "korrigiert" | "anfrage-offen" | "laeuft";

export function flags(r: AttendanceRecord, e: Employee, today: string): AttendanceFlag[] {
  const v = effective(r);
  const out: AttendanceFlag[] = [];
  if (!v.clockOut) out.push(r.date === today ? "laeuft" : "fehlendes-ausstempeln");
  const start = scheduledStart(e, r.date);
  if (start && v.clockIn && toMin(v.clockIn) - hhmm(start) > 5) out.push("verspaetet");
  if (r.corrections.length) out.push("korrigiert");
  if (r.requests.some((q) => q.status === "open")) out.push("anfrage-offen");
  return out;
}

export const FLAG_LABEL: Record<AttendanceFlag, string> = {
  "fehlendes-ausstempeln": "Ausstempeln fehlt",
  verspaetet: "Verspätet",
  korrigiert: "Korrigiert",
  "anfrage-offen": "Korrekturanfrage",
  laeuft: "Läuft",
};

export function monthTotals(e: Employee, records: AttendanceRecord[], month: string, today: string) {
  const rs = records.filter((r) => r.employeeId === e.id && r.date.startsWith(month) && r.date < today);
  const worked = rs.reduce((sum, r) => sum + (workedMinutes(effective(r)) ?? 0), 0);
  const scheduled = rs.reduce((sum, r) => sum + scheduledMinutes(e, r.date), 0);
  const incomplete = rs.filter((r) => !effective(r).clockOut).length;
  return { worked, scheduled, overtime: worked - scheduled, incomplete, days: rs.length };
}

export const fmtDuration = (min: number) => {
  const sign = min < 0 ? "−" : "";
  const a = Math.abs(min);
  return `${sign}${Math.floor(a / 60)}:${String(a % 60).padStart(2, "0")} h`;
};

export const fmtEuro = (cents: number) =>
  new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(cents / 100);

export const fmtTime = (iso: string | null) => (iso ? iso.slice(11, 16) : "—");

export const fmtDate = (date: string, opts: Intl.DateTimeFormatOptions = { weekday: "short", day: "2-digit", month: "2-digit" }) =>
  new Date(`${date.slice(0, 10)}T12:00:00Z`).toLocaleDateString("de-DE", { ...opts, timeZone: "UTC" });

/** Gross preview: base + overtime (positive only) + APPROVED adjustments. Nothing automatic. */
export function payrollPreview(
  p: PayrollProfile, e: Employee, totals: { worked: number; overtime: number }, adjustments: PayrollAdjustment[],
) {
  const hours = totals.worked / 60;
  const overtimeHours = Math.max(0, totals.overtime) / 60;
  let base = 0;
  let overtimePay = 0;
  if (p.type === "stundenlohn" && p.hourlyRateCents) {
    base = Math.round((hours - overtimeHours) * p.hourlyRateCents);
    overtimePay = Math.round(overtimeHours * p.hourlyRateCents * p.overtimeRateFactor);
  } else if (p.monthlySalaryCents) {
    base = p.monthlySalaryCents;
    const hourly = p.monthlySalaryCents / ((e.contractHoursWeek * 52) / 12);
    overtimePay = Math.round(overtimeHours * hourly * p.overtimeRateFactor);
  }
  const approved = adjustments.filter((a) => a.status === "freigegeben").reduce((s, a) => s + a.amountCents, 0);
  const pending = adjustments.filter((a) => a.status === "vorgeschlagen").reduce((s, a) => s + a.amountCents, 0);
  return { base, overtimePay, approved, pending, gross: base + overtimePay + approved };
}

/** Appointments overlapping for the same employee (ignores cancelled/rejected). */
export function conflictIds<T extends { id: string; employeeId: string | null; start: string; durationMin: number; status: string }>(list: T[]) {
  const active = list.filter((a) => a.employeeId && !["cancelled", "rejected"].includes(a.status));
  const ids = new Set<string>();
  for (let i = 0; i < active.length; i++) {
    for (let j = i + 1; j < active.length; j++) {
      const a = active[i], b = active[j];
      if (a.employeeId !== b.employeeId || a.start.slice(0, 10) !== b.start.slice(0, 10)) continue;
      const a0 = toMin(a.start), a1 = a0 + a.durationMin, b0 = toMin(b.start), b1 = b0 + b.durationMin;
      if (a0 < b1 && b0 < a1) { ids.add(a.id); ids.add(b.id); }
    }
  }
  return ids;
}
