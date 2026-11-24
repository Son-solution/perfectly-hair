import type { Role } from "./domain";

/**
 * Central role → permission definitions.
 *
 * IMPORTANT (Phase 5A): these are used ONLY to shape the UI preview. They are not
 * authorization. Real enforcement comes in Phase 5B: Supabase Auth + server-side checks
 * in every Server Action + Postgres Row Level Security (see docs/DASHBOARDS.md §5).
 */
export const PERMISSIONS = [
  "appointments.view_all",
  "appointments.manage",
  "appointments.view_own",
  "appointments.decide_own", // accept / reject own requests (if salon policy allows)
  "appointments.cancel_own",
  "employees.view",
  "employees.manage",
  "attendance.view_all",
  "attendance.correct",
  "attendance.track_own",
  "payroll.view",
  "payroll.manage",
  "payroll.view_own",
  "leave.manage",
  "leave.request_own",
  "website.manage",
  "settings.manage",
  "roles.manage",
] as const;
export type Permission = (typeof PERMISSIONS)[number];

const STAFF: Permission[] = [
  "appointments.view_own",
  "appointments.decide_own",
  "appointments.cancel_own",
  "attendance.track_own",
  "leave.request_own",
  "payroll.view_own",
];

const ADMIN: Permission[] = [
  "appointments.view_all",
  "appointments.manage",
  "employees.view",
  "employees.manage",
  "attendance.view_all",
  "attendance.correct",
  "payroll.view",
  "payroll.manage",
  "leave.manage",
  "website.manage",
  "settings.manage",
];

export const ROLE_PERMISSIONS: Record<Role, ReadonlySet<Permission>> = {
  super_admin: new Set<Permission>([...ADMIN, "roles.manage"]),
  admin: new Set<Permission>(ADMIN),
  staff: new Set<Permission>(STAFF),
};

export function can(role: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role].has(permission);
}

/** Human-readable descriptions for the permissions screen. */
export const PERMISSION_LABEL: Record<Permission, string> = {
  "appointments.view_all": "Alle Termine sehen",
  "appointments.manage": "Termine verwalten (bestätigen, ablehnen, zuweisen, stornieren)",
  "appointments.view_own": "Eigene Termine sehen",
  "appointments.decide_own": "Eigene Anfragen annehmen/ablehnen (laut Salonregel)",
  "appointments.cancel_own": "Eigene Termine stornieren (mit Begründung)",
  "employees.view": "Mitarbeiterverzeichnis sehen",
  "employees.manage": "Mitarbeiter anlegen und bearbeiten",
  "attendance.view_all": "Alle Zeiterfassungen sehen",
  "attendance.correct": "Zeiterfassung korrigieren (mit Pflichtbegründung)",
  "attendance.track_own": "Eigene Arbeitszeit erfassen",
  "payroll.view": "Lohnvorbereitung sehen",
  "payroll.manage": "Anpassungen vorschlagen und freigeben",
  "payroll.view_own": "Eigene Vergütungsübersicht sehen",
  "leave.manage": "Abwesenheiten genehmigen",
  "leave.request_own": "Eigenen Urlaub beantragen",
  "website.manage": "Website-Inhalte verwalten",
  "settings.manage": "Salon-Einstellungen verwalten",
  "roles.manage": "Benutzer und Rollen verwalten",
};
