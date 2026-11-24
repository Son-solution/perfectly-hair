# Dashboards — Phase 5A (frontend + demo data)

Status: **design preview only.** There is no authentication, no database and no persistence.
All data is fictional demonstration data and is clearly labelled as such in the UI.

## 1. Local-only preview (security)

- The routes live in `src/app/(dashboard)/`. Its layout calls `notFound()` unless
  `src/features/dashboard/preview-gate.ts` allows the preview.
- **Development** (`npm run dev`): visible.
- **Local production test:** `DASHBOARD_PREVIEW=local npm run build && npm run start`.
- **Vercel / any production build without that variable:** every dashboard route returns
  **404**. Verified on 2026-11-24 for all 15 routes.
- **Never set `DASHBOARD_PREVIEW` on Vercel.**
- Pages are `noindex, nofollow`.
- The "Ansicht: Admin/Mitarbeiter" switch only changes the preview. It is **not**
  authorization.

## 2. Routes

| Route | Content |
| --- | --- |
| `/admin` | Overview: today, pending requests, confirmed, active and clocked-in staff, team hours, upcoming absences, revenue placeholder (marked demo) |
| `/admin/appointments` | List / Day (per employee) / Week / Month views. Filters (status, employee, search, `?status=`), detail dialog with history, assign or reassign, confirm (requires an employee), reject or cancel (reason required), complete, no-show, conflict markers |
| `/admin/employees` | Directory with role, contract, month hours, current status |
| `/admin/employees/[id]` | Profile tabs: overview (details, role and permissions, services), schedule, attendance, absences, performance, compensation, admin notes |
| `/admin/attendance` | All records, filters (employee, date range, flags), stats, staff correction requests, correction dialog (reason required, original kept), add a missing entry (logged as a correction), audit history dialog |
| `/admin/payroll` | Monthly preparation: type, contract hours, rate or salary, actual vs target hours, overtime, base, overtime pay, adjustments, gross preview, CSV export and print. Adjustments need a reason and an approval; nothing is automatic |
| `/admin/leave` | Requests (open / approved / rejected) with approve or reject (reason), vacation balance, month calendar |
| `/admin/website` | Read-only overview of the **real** content layer (pages, sections, SEO, services, contact, hours, media, gallery). Editing arrives in Phase 5B |
| `/admin/settings` | Salon, booking rules, opening hours and break rules, permission matrix, users and roles, notifications |
| `/staff` | My day: status, today's appointments, requests, next appointment, hours today, this week and this month, next shifts |
| `/staff/appointments` | Own appointments only. Tabs: today / requests / upcoming / history. Accept, reject or cancel only when the salon policy allows it, with a reason; mark as done |
| `/staff/attendance` | Clock: Arbeitsbeginn / Pause beginnen / Pause beenden / Feierabend (with confirmation). Today's start, break, worked time; week and month totals; incomplete entries; correction requests (no self-editing) |
| `/staff/schedule` | Two-week shift plan, days off, approved leave |
| `/staff/leave` | Submit a request (counts working days and excludes Sunday and Monday), statuses, balance |
| `/staff/compensation` | Own figures only (permission `payroll.view_own`). Never shows another employee's pay |

## 3. Architecture

```
src/features/dashboard/
  domain.ts        Zod schemas + types (employee, appointment, attendance + corrections, leave, payroll)
  permissions.ts   central role → permission map, can(role, permission)
  calc.ts          pure calculations (hours, flags, overtime, payroll preview, conflicts)
  repository.ts    server-only data access (validated demo data); staff functions return own data only
  mock/data.ts     deterministic DEMO data around the fixed demo date 2026-11-24
  preview-gate.ts  local-only gate
src/components/dashboard/
  ui.tsx           primitives (Card, Stat, Badge, StatusBadge, Table, Field, EmptyState, Skeleton, Avatar, btn)
  interactive.tsx  Dialog (native <dialog>: focus trap + Esc), ConfirmDialog (optional mandatory reason), Tabs, Segmented, toast
  Shell.tsx        collapsible sidebar, mobile drawer, top bar, light/dark theme, staff bottom tab bar
  admin/*          AppointmentsBoard, EmployeeProfile, AttendanceManager, PayrollBoard, LeaveBoard, SettingsPanel
  staff/*          TimeClock, MyAppointments, MyLeave
```

- **Design:** monochrome tokens `--dash-*` scoped to `.dash` (light and dark) in `globals.css`.
  The public site is unaffected (the homepage HTML was verified identical before and after).
- **Status without colour:** statuses use fill, outline, dashed and strike-through, so they stay
  distinguishable in black and white.

## 4. Planned tables (Phase 5B, extends docs/DATABASE.md)

| Table | Notes |
| --- | --- |
| `attendance_records` | `employee_id`, `date`, `clock_in`, `clock_out`, `break_min`. Insert by the employee only (own row, server time). **No UPDATE/DELETE** for anyone |
| `attendance_corrections` | Append-only: `record_id`, `before jsonb`, `after jsonb`, `reason` (NOT NULL, ≥ 5 chars), `corrected_by`, `corrected_at`. The effective value is the latest correction |
| `attendance_correction_requests` | Staff requests (`message`, `status`) |
| `leave_requests` | `type`, `from`, `to`, `days`, `status`, `decided_by`, `note` |
| `payroll_profiles` | `type`, `hourly_rate_cents`, `monthly_salary_cents`, `overtime_factor`. Readable only by payroll roles and the employee themself |
| `payroll_adjustments` | `kind`, `amount_cents`, `reason` NOT NULL, `status` (proposed / approved / rejected), `proposed_by`, `reviewed_by`. Proposer ≠ reviewer recommended |
| `staff_members.schedule` / `staff_working_hours` | As in DATABASE.md §2 |

## 5. Required before production (Phase 5B)

1. **Supabase Auth.** Sign-in for admins and staff; invitation flow; Super Admin controls roles
   (trigger in DATABASE.md §3).
2. **Proxy.** `src/proxy.ts` refreshes the session and redirects unauthenticated users away from
   `/admin` and `/staff`. This is convenience, not security.
3. **Server-side checks.** Every Server Action runs `requireRole` / `can()`. Repository functions
   take the user from the session, not from the client.
4. **Row Level Security** on every table:
   - Staff can select only their own attendance, leave, payroll and appointments.
   - Payroll tables are hidden from staff except their own profile summary.
   - Corrections are INSERT-only.
5. **Server time.** Clock events use the server clock, not the device clock (prevents
   manipulation).
6. **Booking actions.** Approve and reassign validate availability with the DB function and the
   exclusion constraint (DATABASE.md §4).
7. **Audit log.** Every admin write is recorded in `audit_log`.
8. **Remove the preview gate** once auth protects the routes. Keep `noindex`.
9. **Legal review.** Working-time recording obligations (ArbZG, BAG/EuGH ruling), data protection
   for employee data (DSGVO / BDSG § 26), payroll handled by tax advisor or payroll software.
