/**
 * Dashboard domain models (Phase 5A). These schemas are the contract for the future
 * Supabase tables (see docs/DASHBOARDS.md §4). Times are ISO strings in Europe/Berlin
 * local time ("2026-11-24T09:02"); money in integer cents.
 */
import { z } from "zod";

export const role = z.enum(["super_admin", "admin", "staff"]);
export type Role = z.infer<typeof role>;

/* ------------------------------------------------------------------ employees */

export const employee = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.email(),
  phone: z.string(),
  role,
  position: z.string(),
  employmentStart: z.string(), // YYYY-MM-DD
  active: z.boolean(),
  audiences: z.array(z.enum(["herren", "damen", "kinder"])),
  serviceIds: z.array(z.string()),
  /** Weekly schedule: ISO weekday 1–7 → shift or null (day off). */
  schedule: z.record(z.string(), z.object({ start: z.string(), end: z.string(), breakMin: z.number() }).nullable()),
  contractHoursWeek: z.number(),
  vacationDaysYear: z.number(),
  notes: z.string(),
});
export type Employee = z.infer<typeof employee>;

/* ------------------------------------------------------------------ appointments */

export const appointmentStatus = z.enum(["pending", "confirmed", "rejected", "cancelled", "completed", "no_show"]);
export type AppointmentStatus = z.infer<typeof appointmentStatus>;

export const appointmentEvent = z.object({
  at: z.string(),
  by: z.string(), // display name
  action: z.string(),
  note: z.string().nullable(),
});

export const appointment = z.object({
  id: z.string(),
  customerName: z.string(),
  customerPhone: z.string(),
  audience: z.enum(["herren", "damen", "kinder"]),
  serviceId: z.string(),
  serviceName: z.string(),
  employeeId: z.string().nullable(),
  start: z.string(),
  durationMin: z.number(),
  status: appointmentStatus,
  priceCents: z.number().nullable(),
  note: z.string().nullable(),
  cancelReason: z.string().nullable(),
  history: z.array(appointmentEvent),
});
export type Appointment = z.infer<typeof appointment>;

/* ------------------------------------------------------------------ attendance */

export const attendanceValues = z.object({
  clockIn: z.string().nullable(),
  clockOut: z.string().nullable(),
  breakMin: z.number(),
});
export type AttendanceValues = z.infer<typeof attendanceValues>;

/** Corrections never overwrite: the original stays, each change is appended. */
export const attendanceCorrection = z.object({
  id: z.string(),
  at: z.string(),
  by: z.string(),
  reason: z.string().min(5, "Bitte eine Begründung (mind. 5 Zeichen) angeben."),
  before: attendanceValues,
  after: attendanceValues,
});
export type AttendanceCorrection = z.infer<typeof attendanceCorrection>;

export const attendanceRecord = z.object({
  id: z.string(),
  employeeId: z.string(),
  date: z.string(), // YYYY-MM-DD
  original: attendanceValues, // as recorded by the employee — immutable
  corrections: z.array(attendanceCorrection),
  /** Employee-submitted correction requests awaiting admin review. */
  requests: z.array(z.object({ id: z.string(), at: z.string(), message: z.string(), status: z.enum(["open", "accepted", "declined"]) })),
});
export type AttendanceRecord = z.infer<typeof attendanceRecord>;

/* ------------------------------------------------------------------ leave */

export const leaveType = z.enum(["urlaub", "krank", "sonstiges"]);
export const leaveRequest = z.object({
  id: z.string(),
  employeeId: z.string(),
  type: leaveType,
  from: z.string(),
  to: z.string(),
  days: z.number(),
  status: z.enum(["beantragt", "genehmigt", "abgelehnt"]),
  note: z.string().nullable(),
  decidedBy: z.string().nullable(),
});
export type LeaveRequest = z.infer<typeof leaveRequest>;

/* ------------------------------------------------------------------ payroll */

export const payrollProfile = z.object({
  employeeId: z.string(),
  type: z.enum(["stundenlohn", "festgehalt"]),
  hourlyRateCents: z.number().nullable(),
  monthlySalaryCents: z.number().nullable(),
  overtimeRateFactor: z.number(), // e.g. 1.0 = no surcharge
});
export type PayrollProfile = z.infer<typeof payrollProfile>;

export const payrollAdjustment = z.object({
  id: z.string(),
  employeeId: z.string(),
  month: z.string(), // YYYY-MM
  kind: z.enum(["bonus", "abzug", "korrektur"]),
  amountCents: z.number(), // positive = added, negative = deducted
  reason: z.string().min(5, "Bitte eine Begründung (mind. 5 Zeichen) angeben."),
  status: z.enum(["vorgeschlagen", "freigegeben", "abgelehnt"]),
  proposedBy: z.string(),
  reviewedBy: z.string().nullable(),
});
export type PayrollAdjustment = z.infer<typeof payrollAdjustment>;

/* ------------------------------------------------------------------ labels */

export const STATUS_LABEL: Record<AppointmentStatus, string> = {
  pending: "Ausstehend",
  confirmed: "Bestätigt",
  rejected: "Abgelehnt",
  cancelled: "Storniert",
  completed: "Abgeschlossen",
  no_show: "Nicht erschienen",
};

export const LEAVE_LABEL: Record<z.infer<typeof leaveType>, string> = {
  urlaub: "Urlaub",
  krank: "Krankheit",
  sonstiges: "Sonstige Abwesenheit",
};

export const ROLE_LABEL: Record<Role, string> = {
  super_admin: "Super-Admin",
  admin: "Admin",
  staff: "Mitarbeiter",
};
