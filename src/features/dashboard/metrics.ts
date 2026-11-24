/**
 * Central metric definitions (Phase 5A.1). Every count shown in the dashboard — overview
 * tiles, navigation badges, reports — comes from these functions so numbers never disagree.
 * Client-safe (pure). Definitions are documented in docs/DASHBOARDS.md §6.
 */
import { addDays, effective, isoWeekday, scheduledMinutes, workedMinutes } from "./calc";
import type { Appointment, AttendanceRecord, CallbackRequest, CommissionRule, Employee, JobApplication, LeaveRequest } from "./domain";

export type Period = { from: string; to: string }; // inclusive YYYY-MM-DD
export type PeriodKind = "tag" | "woche" | "monat" | "individuell";

export function periodFor(kind: Exclude<PeriodKind, "individuell">, today: string): Period {
  if (kind === "tag") return { from: today, to: today };
  if (kind === "woche") {
    const from = addDays(today, 1 - isoWeekday(today));
    return { from, to: addDays(from, 6) };
  }
  const from = `${today.slice(0, 7)}-01`;
  const [y, m] = today.split("-").map(Number);
  const last = new Date(Date.UTC(y, m, 0)).getUTCDate();
  return { from, to: `${today.slice(0, 7)}-${String(last).padStart(2, "0")}` };
}

const day = (iso: string) => iso.slice(0, 10);
export const inPeriod = (iso: string, p: Period) => day(iso) >= p.from && day(iso) <= p.to;

/** Appointments that still occupy the calendar (not cancelled / rejected). */
export const isActiveBooking = (a: Appointment) => a.status !== "cancelled" && a.status !== "rejected";

/** M1 "Termine heute": active bookings today (pending + confirmed + completed + no-show). */
export const appointmentsToday = (all: Appointment[], today: string) =>
  all.filter((a) => day(a.start) === today && isActiveBooking(a));

/** M2 "Offene Anfragen": status pending with a start date today or later. Same number as the nav badge. */
export const openAppointmentRequests = (all: Appointment[], today: string) =>
  all.filter((a) => a.status === "pending" && day(a.start) >= today);

/** M3 "Bestätigt (kommend)": confirmed, start date today or later. */
export const confirmedUpcoming = (all: Appointment[], today: string) =>
  all.filter((a) => a.status === "confirmed" && day(a.start) >= today);

/** M4 Callback requests that still need action. */
export const openCallbacks = (all: CallbackRequest[]) =>
  all.filter((r) => r.status === "neu" || r.status === "in_bearbeitung" || r.status === "nicht_erreicht");

/** M5 New job applications (not yet reviewed). */
export const newApplications = (all: JobApplication[]) => all.filter((a) => a.status === "neu");

/** M6 Attendance records with an open staff correction request. */
export const openCorrectionRequests = (all: AttendanceRecord[]) =>
  all.filter((r) => r.requests.some((q) => q.status === "open"));

/** M7 Leave requests awaiting a decision. */
export const openLeaveRequests = (all: LeaveRequest[]) => all.filter((l) => l.status === "beantragt");

/** Navigation badges — one source of truth. */
export function navBadges(x: { appointments: Appointment[]; attendance: AttendanceRecord[]; leave: LeaveRequest[]; callbacks: CallbackRequest[]; applications: JobApplication[]; today: string }) {
  return {
    "/admin/appointments": openAppointmentRequests(x.appointments, x.today).length,
    "/admin/callbacks": openCallbacks(x.callbacks).length,
    "/admin/attendance": openCorrectionRequests(x.attendance).length,
    "/admin/leave": openLeaveRequests(x.leave).length,
    "/admin/applications": newApplications(x.applications).length,
  };
}

/* ------------------------------------------------------------------ employee report */

export type EmployeeReport = {
  employeeId: string;
  completed: number;
  noShow: number;
  cancelled: number; // cancelled + rejected
  workedMin: number;
  scheduledMin: number;
  /** Sum of catalogue prices of COMPLETED appointments. An estimate, not collected money. */
  estimatedRevenueCents: number;
  commissionCents: number | null;
};

export function employeeReport(e: Employee, appts: Appointment[], attendance: AttendanceRecord[], p: Period, today: string, rule?: CommissionRule): EmployeeReport {
  const mine = appts.filter((a) => a.employeeId === e.id && inPeriod(a.start, p));
  const completed = mine.filter((a) => a.status === "completed");
  // Hours: only finished days (before today) so a running shift doesn't distort the report.
  const recs = attendance.filter((r) => r.employeeId === e.id && r.date >= p.from && r.date <= p.to && r.date < today);
  const est = completed.reduce((s, a) => s + (a.priceCents ?? 0), 0);
  return {
    employeeId: e.id,
    completed: completed.length,
    noShow: mine.filter((a) => a.status === "no_show").length,
    cancelled: mine.filter((a) => a.status === "cancelled" || a.status === "rejected").length,
    workedMin: recs.reduce((s, r) => s + (workedMinutes(effective(r)) ?? 0), 0),
    scheduledMin: recs.reduce((s, r) => s + scheduledMinutes(e, r.date), 0),
    estimatedRevenueCents: est,
    commissionCents: rule?.enabled ? Math.round((est * rule.percent) / 100) : null,
  };
}

/** Planned value of upcoming active bookings in the period (forecast, not revenue). */
export const plannedValueCents = (appts: Appointment[], p: Period, today: string) =>
  appts.filter((a) => inPeriod(a.start, p) && day(a.start) >= today && (a.status === "confirmed" || a.status === "pending"))
    .reduce((s, a) => s + (a.priceCents ?? 0), 0);

/** Actual collected revenue requires a POS / cash register integration — never invented. */
export const ACTUAL_REVENUE_AVAILABLE = false as const;
