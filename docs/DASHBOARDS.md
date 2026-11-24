# Dashboards — Phase 5A + 5A.1 (frontend + demo data)

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
| `/admin/employees/[id]` | **Zugang & Status** card: login e-mail, password set by the employee, reset link (backend), deactivate (reason required, warns about future appointments, data kept) / reactivate. Profile tabs: overview (details, role and permissions, services), schedule, attendance, absences, performance, compensation, admin notes |
| `/admin/attendance` | All records, filters (employee, date range, flags), stats, staff correction requests, correction dialog (reason required, original kept), add a missing entry (logged as a correction), audit history dialog, **CSV export of the current filter and PDF via print (5A.1)** |
| `/admin/payroll` | Monthly preparation: type, contract hours, rate or salary, actual vs target hours, overtime, base, overtime pay, adjustments, gross preview, CSV export and print. Adjustments need a reason and an approval; nothing is automatic |
| `/admin/leave` | Requests (open / approved / rejected) with approve or reject (reason), vacation balance, month calendar |
| `/admin/website` | Read-only overview of the **real** content layer (pages, sections, SEO, services, contact, hours, media, gallery). Editing arrives in Phase 5B |
| `/admin/settings` | Salon, booking rules, opening hours and break rules, permission matrix, users and roles, notifications (recipient e-mail), **Website & Formulare** (walk-in rule, page and form visibility, application form options) |
| `/admin/callbacks` | **5A.1** Terminanfragen: tabs (open / new / scheduled / all), search, detail with click-to-call, assignee, status change, notes, status history. Reject needs a reason. "In Termin umwandeln" opens the appointment dialog with its availability check (no automatic slot) |
| `/admin/customers` | **5A.1** Customer list (search, area filter), profile with contact, visit statistics, appointment and visit history, internal notes (permission `customers.notes`), link from appointment detail |
| `/admin/reports` | **5A.1** Berichte & Statistiken: Tag / Woche / Monat / Individuell, employee filter. Completed appointments, cancellations, no-shows, actual vs target hours, estimated appointment value vs "Tatsächlich kassiert: Backend erforderlich", metric definitions, optional commission (off by default, preview only), CSV and PDF (print) |
| `/admin/applications` | **5A.1** Bewerbungen: list, status tabs, search, position filter, detail (contact, CV placeholder "Backend erforderlich"), status (Neu / In Prüfung / Vorstellungsgespräch / Angenommen / Abgelehnt), retention date, confidential notes |
| `/staff` | **5A.1:** time clock directly on the overview (Arbeitsbeginn / Pause beginnen / Pause beenden / Feierabend; buttons follow the state; live clock, time since clock-in, total break, actual vs target today). Pending requests with accept / reject (reason required, only with `appointments.decide_own`), today, next appointment, next shifts |
| `/staff/appointments` | Own appointments only. **Tagesansicht (default):** week strip with counts, ‹ › / Heute, timeline 09–19 with shift, planned break, leave/days off, now-line, overlapping appointments side by side. Further tabs: today / requests / upcoming / history. Accept, reject or cancel only when the salon policy allows it, with a reason; mark as done |
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

## 6. Phase 5A.1 changes

### Grey theme (light)
Tokens are scoped to `.dash` in `globals.css`. The public palette is unchanged.

| Token | Value | Use |
| --- | --- | --- |
| `--dash-sidebar` | #252525 | Sidebar (text #E6E6E6 ≈ 13:1) |
| `--dash-header` | #BEBEBE | Top bar and staff bottom bar |
| `--dash-bg` | #D4D4D4 | Page background |
| `--dash-surface` | #E5E5E5 | Cards, dialogs |
| `--dash-field` | #EFEFEF | Inputs, secondary buttons (the lightest surface, no pure white) |
| `--dash-strong` | #353535 | Primary buttons, solid badges (text #F0F0F0 ≈ 10.9:1) |
| `--dash-text` / `--dash-muted` | #202020 / #4D4D4D | Text (muted on cards ≈ 6.9:1) |

The dark mode keeps its own token set. The sweep checks for remaining `rgb(255,255,255)` surfaces.

### Header actions
- **Neuer Termin:** links to `/admin/appointments?neu=1` and is also in the appointments toolbar. Covers
  phone bookings and walk-ins. The availability check covers past dates, opening hours, the walk-in
  rule (phone bookings blocked, walk-ins only today), the employee's shift and overlaps. A
  mandatory employee is required.
- **Mitarbeiter hinzufügen:** opens on the employees page, also via `?neu=1` from the overview.
  Validated; invitation not sent (Phase 5B).
- **Notification centre:** the bell shows an unread count. Items are derived from new callback
  requests, new applications, pending appointments, correction requests and leave requests. Read
  state is local only.

### Consistent metrics
Overview tiles, nav badges, the staff overview and reports all use
`src/features/dashboard/metrics.ts` (definitions in docs/DATABASE.md §8). The 5A inconsistency is
fixed: "Heute im Salon" counted cancelled appointments while the tile excluded them.

### Labelled "Backend erforderlich"
- actual collected revenue;
- opening a CV;
- sending invitations;
- saving settings;
- e-mail notifications;
- real-time notifications;
- server-generated PDFs.

PDFs today use the browser print dialog ("Als PDF speichern"). The sidebar, header and buttons are
hidden in print.

### PWA preparation (staff, future)
- **Service worker:** cache only static assets (JS, CSS, fonts, icons). Never cache HTML or API
  responses with personal data (appointments, customers, pay, attendance). Use `Cache-Control:
  no-store` for authenticated pages and data.
- **No offline attendance:**
  - Clock events require a live request and use server time.
  - The time clock disables its buttons while `navigator.onLine` is false and shows a notice.
  - There is no queue or background sync for attendance.
- **Manifest:** `start_url: /staff`, `display: standalone`, monochrome icons; no push until the
  notification consent flow exists.
- **Logout:** clear caches on sign-out (`caches.delete`) and `localStorage` keys except theme.
