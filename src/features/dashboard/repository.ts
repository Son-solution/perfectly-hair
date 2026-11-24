import "server-only";
import { z } from "zod";
import {
  appointment, attendanceRecord, employee, leaveRequest, payrollAdjustment, payrollProfile,
  type Appointment, type AttendanceRecord, type Employee, type LeaveRequest, type PayrollAdjustment, type PayrollProfile,
} from "./domain";
import * as mock from "./mock/data";

/**
 * Dashboard data access (Phase 5A: validated DEMO data).
 * Phase 5B replaces these bodies with Supabase queries scoped by the signed-in user's role
 * (RLS) — the signatures stay the same, so pages and components don't change.
 *
 * Staff-scoped functions (`…ForEmployee`) only ever return that employee's own data; the
 * preview mirrors the rule that staff must not see other employees' private information.
 */

let validated = false;
function data() {
  if (!validated) {
    z.array(employee).parse(mock.employees);
    z.array(appointment).parse(mock.appointments);
    z.array(attendanceRecord).parse(mock.attendance);
    z.array(leaveRequest).parse(mock.leaveRequests);
    z.array(payrollProfile).parse(mock.payrollProfiles);
    z.array(payrollAdjustment).parse(mock.payrollAdjustments);
    validated = true;
  }
  return mock;
}

export const DEMO = { today: mock.DEMO_TODAY, now: mock.DEMO_NOW, admin: mock.DEMO_ADMIN };
/** Demo identity for the staff preview (Phase 5B: the signed-in user's employee id). */
export const DEMO_STAFF_ID = "e1";

/* ------------------------------------------------------------------ admin scope */

export async function listEmployees(): Promise<Employee[]> {
  return data().employees;
}
export async function getEmployee(id: string): Promise<Employee | null> {
  return data().employees.find((e) => e.id === id) ?? null;
}
export async function listAppointments(): Promise<Appointment[]> {
  return [...data().appointments].sort((a, b) => a.start.localeCompare(b.start));
}
export async function listAttendance(): Promise<AttendanceRecord[]> {
  return [...data().attendance].sort((a, b) => b.date.localeCompare(a.date));
}
export async function listLeave(): Promise<LeaveRequest[]> {
  return [...data().leaveRequests].sort((a, b) => b.from.localeCompare(a.from));
}
export async function listPayrollProfiles(): Promise<PayrollProfile[]> {
  return data().payrollProfiles;
}
export async function listPayrollAdjustments(): Promise<PayrollAdjustment[]> {
  return data().payrollAdjustments;
}
export async function getServiceCatalogue() {
  return data().serviceCatalogue;
}

/* ------------------------------------------------------------------ staff scope (own data only) */

export async function getOwnProfile(employeeId: string) {
  const e = await getEmployee(employeeId);
  if (!e) return null;
  const { notes: _adminNotes, ...publicProfile } = e; // admin notes are not shown to staff
  void _adminNotes;
  return publicProfile;
}
export async function listAppointmentsForEmployee(employeeId: string) {
  return (await listAppointments()).filter((a) => a.employeeId === employeeId);
}
export async function listAttendanceForEmployee(employeeId: string) {
  return (await listAttendance()).filter((r) => r.employeeId === employeeId);
}
export async function listLeaveForEmployee(employeeId: string) {
  return (await listLeave()).filter((l) => l.employeeId === employeeId);
}
export async function getOwnPayroll(employeeId: string) {
  const profile = data().payrollProfiles.find((p) => p.employeeId === employeeId) ?? null;
  const adjustments = data().payrollAdjustments.filter((a) => a.employeeId === employeeId && a.status === "freigegeben");
  return { profile, adjustments };
}
