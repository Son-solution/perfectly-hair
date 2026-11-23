# Database Design — Supabase PostgreSQL

Status: **design only (Phase 1).** No migration has been run. The SQL below is the
target design; it becomes real, tested migrations in `supabase/migrations/` in Phase 2.

Conventions: `uuid` primary keys (`gen_random_uuid()`), `timestamptz` for all instants
(stored UTC, displayed in `Europe/Berlin`), money in integer cents (EUR),
`created_at` / `updated_at` on every mutable table, RLS enabled everywhere.

## 1. Enums

```sql
create type app_role        as enum ('super_admin', 'admin', 'staff', 'customer');
create type audience        as enum ('damen', 'herren', 'kinder');
create type booking_status  as enum ('pending', 'accepted', 'rejected', 'cancelled', 'completed', 'no_show');
create type approval_mode   as enum ('auto', 'manual', 'hybrid');
create type waitlist_status as enum ('waiting', 'offered', 'booked', 'expired', 'cancelled');
create type notify_channel  as enum ('in_app', 'email', 'push');
create type outbox_status   as enum ('queued', 'sending', 'sent', 'failed');
```

## 2. Tables

### Identity
| Table | Key columns | Notes |
| --- | --- | --- |
| `profiles` | `id` (= `auth.users.id`), `role app_role default 'customer'`, `full_name`, `phone`, `email`, `marketing_consent` | Created by trigger on sign-up. Role change only by SUPER_ADMIN. |
| `staff_members` | `id`, `profile_id` (nullable, unique), `display_name`, `slug`, `bio`, `photo_path`, `is_active`, `is_bookable`, `sort_order` | A staff profile can exist before the person has a login. |

### Catalogue
| Table | Key columns | Notes |
| --- | --- | --- |
| `service_categories` | `id`, `audience`, `slug`, `name`, `description`, `sort_order`, `is_active` | e.g. Damen → Schnitt, Farbe… |
| `services` | `id`, `category_id`, `slug`, `name`, `description`, `duration_min`, `buffer_before_min`, `buffer_after_min`, `price_cents`, `price_is_from bool`, `requires_approval bool`, `is_active` | Same service name may exist per audience with different price. |
| `staff_services` | `staff_id`, `service_id`, `duration_override_min`, `price_override_cents` | Which staff may perform which service. |

### Scheduling
| Table | Key columns | Notes |
| --- | --- | --- |
| `business_hours` | `weekday 1–7 (ISO)`, `opens time`, `closes time`, `is_closed` | Salon-wide. Seed: Di–Fr 09–19, Sa 09–18, So/Mo closed. |
| `staff_working_hours` | `staff_id`, `weekday`, `starts time`, `ends time` | Multiple rows per day allowed (split shifts). |
| `staff_breaks` | `staff_id`, `weekday`, `starts`, `ends` | Recurring breaks. |
| `time_off` | `id`, `staff_id` (null = whole salon), `period tstzrange`, `reason` | Holidays, vacation, blocked times. |
| `booking_settings` | singleton row: `approval_mode`, `slot_interval_min`, `min_lead_min`, `max_advance_days`, `cancel_cutoff_hours`, `reschedule_cutoff_hours`, `hybrid_auto_accept_known_customers`, `waitlist_hold_minutes` | Edited in admin. |

### Bookings
| Table | Key columns | Notes |
| --- | --- | --- |
| `bookings` | `id`, `customer_id` (nullable), `guest_name/email/phone`, `staff_id`, `service_id`, `starts_at`, `ends_at`, `blocked tstzrange` (incl. buffers), `status`, `price_cents` + `duration_min` (snapshots), `customer_note`, `internal_note`, `cancel_reason`, `rescheduled_from` | No direct INSERT from clients — only via `book_appointment()`. |
| `booking_events` | `id`, `booking_id`, `from_status`, `to_status`, `actor_id`, `note`, `created_at` | Audit trail, written by trigger. Append-only. |
| `waitlist_entries` | `id`, `customer_id`/guest fields, `service_id`, `staff_id` (nullable), `earliest date`, `latest date`, `status`, `offered_booking_slot`, `offer_expires_at` | |

### Notifications
| Table | Key columns | Notes |
| --- | --- | --- |
| `notifications` | `id`, `recipient_id`, `type`, `title`, `body`, `booking_id`, `read_at` | Realtime-published. |
| `notification_preferences` | `profile_id`, `event_type`, `channel`, `enabled` | |
| `email_outbox` | `id`, `to_email`, `template`, `payload jsonb`, `status`, `attempts`, `last_error`, `send_after`, `sent_at` | Processed by cron worker using service role. |
| `push_subscriptions` | `id`, `profile_id`, `endpoint`, `p256dh`, `auth` | Optional (Phase 6). |

### CMS
| Table | Key columns | Notes |
| --- | --- | --- |
| `site_content` | `key text pk`, `value jsonb`, `updated_by`, `updated_at` | Texts per section (hero, about, footer…). |
| `homepage_sections` | `id`, `kind`, `sort_order`, `is_visible`, `config jsonb` | Reorderable homepage. |
| `gallery_images` | `id`, `storage_path`, `alt`, `audience` (nullable), `sort_order`, `is_published` | Alt text required. |
| `promotions` | `id`, `title`, `body`, `starts_at`, `ends_at`, `is_active` | |
| `audit_log` | `id`, `actor_id`, `action`, `entity`, `entity_id`, `diff jsonb` | Admin changes. |

## 3. Permission matrix (enforced by RLS + server guards)

| Resource | Public (anon) | CUSTOMER | STAFF | ADMIN | SUPER_ADMIN |
| --- | --- | --- | --- | --- | --- |
| Published catalogue, team, gallery, CMS texts | read | read | read | read/write | read/write |
| Own profile | – | read/update (not role) | read/update (not role) | read all, update all (not role) | all, incl. role |
| Bookings | create via function only | own: read; cancel/reschedule via function | assigned: read; accept/reject/complete/no-show via function | all | all |
| Booking events | – | own bookings: read | assigned: read | read | read |
| Schedules, time off | read (needed for availability) | read | own: read/write breaks & time off requests | all | all |
| Booking settings | read public fields | read | read | write | write |
| Notifications | – | own | own | own | own |
| Email outbox | – | – | – | read | read |
| Audit log | – | – | – | read | read |

Helper functions (`security definer`, `stable`, fixed `search_path`):

```sql
create function public.current_app_role() returns app_role ...;   -- from profiles
create function public.is_admin() returns boolean ...;            -- admin or super_admin
create function public.current_staff_id() returns uuid ...;       -- staff_members.id of auth.uid()
```

Example policies:

```sql
alter table bookings enable row level security;

create policy "customer reads own bookings" on bookings for select
  using (customer_id = auth.uid());

create policy "staff reads assigned bookings" on bookings for select
  using (staff_id = public.current_staff_id());

create policy "admin reads all bookings" on bookings for select
  using (public.is_admin());

-- no insert/update/delete policies for clients: writes go through security-definer
-- functions that perform their own authorization checks.
```

Role-escalation guard:

```sql
create function prevent_role_change() returns trigger ... as $$
begin
  if new.role is distinct from old.role and public.current_app_role() <> 'super_admin' then
    raise exception 'Only SUPER_ADMIN may change roles';
  end if;
  return new;
end $$;
```

## 4. Double-booking prevention

```sql
create extension if not exists btree_gist;

alter table bookings add constraint bookings_no_overlap
  exclude using gist (staff_id with =, blocked with &&)
  where (status in ('pending', 'accepted'));
```

This holds under concurrency: if two requests race for the same slot, Postgres
serializes the conflicting inserts and the second fails with `23P01`
(`exclusion_violation`), which the Server Action maps to a friendly German message.
`blocked` = `[starts_at - buffer_before, ends_at + buffer_after)`.

## 5. Booking functions (Phase 3)

| Function | Caller | Purpose |
| --- | --- | --- |
| `get_available_slots(service_id, staff_id?, date)` | anyone | Computes free slots in Europe/Berlin. |
| `book_appointment(service_id, staff_id?, starts_at, guest jsonb?, note?)` | anon/customer | Validates hours, lead time, staff eligibility; picks a staff member if "no preference"; applies approval mode; inserts. |
| `set_booking_status(booking_id, new_status, note?)` | staff (assigned) / admin | Enforces the state machine and role. |
| `cancel_booking(booking_id, reason?)` | customer (own, before cutoff) / staff / admin | |
| `reschedule_booking(booking_id, new_starts_at, new_staff_id?)` | customer (before cutoff) / admin | Atomic: cancel + new booking linked via `rescheduled_from`. |
| `join_waitlist(...)`, `offer_waitlist_slot(...)` | customer / system | |

Allowed transitions (enforced in `set_booking_status`):

| From | To | Who |
| --- | --- | --- |
| pending | accepted, rejected | assigned staff, admin |
| pending | cancelled | customer (own), admin |
| accepted | cancelled | customer before cutoff, staff, admin |
| accepted | completed, no_show | assigned staff, admin (only after `starts_at`) |

## 6. CMS and content tables (added in Phase 3)

Mirrors the Zod schemas in `src/content/schema.ts` (see `docs/CMS_ARCHITECTURE.md`).

| Table | Key columns | Notes |
| --- | --- | --- |
| `site_settings` | singleton: `footer_tagline`, `footer_band_words text[]`, `appearance` (enum preset), `stock_label`, `placeholder_label` | Appearance limited to monochrome presets |
| `business_settings` | singleton: name, short_name, tagline, description, address fields, `phone_e164`, `phone_display`, `email`, `social jsonb`, booking policy fields, legal fields (`owner_name`, `vat_id`, `chamber`, `registration_number`) | `null` = not provided yet |
| `opening_hours` | `weekday 1–7`, `opens`, `closes` | Same as `business_hours` in §2 |
| `opening_exceptions` | `date`, `label`, `opens`, `closes` (null = closed) | Holidays / special hours |
| `navigation_items` | `id`, `group` (primary/secondary/cta/menu/legal), `label`, `href`, `media_id`, `is_primary`, `sort_order` | `href` restricted to existing routes (check constraint / app validation) |
| `media_assets` | `id`, `storage_path`, `alt`, `width`, `height`, `focal_point`, `credit jsonb`, `uploaded_by`, `created_at` | Storage bucket `media`; images normalised to grayscale on upload |
| `site_pages` | `slug` pk, `status` (draft/published), `is_visible`, `seo_title`, `seo_description`, `noindex`, `published_at` | Core page slugs protected from deletion |
| `page_sections` | `id`, `page_slug`, `type`, `sort_order`, `is_visible`, `payload jsonb`, `status` | `payload` validated by Zod `section` schema |
| `page_revisions` | `id`, `page_slug`, `snapshot jsonb`, `published_by`, `published_at` | Publication history and rollback |
| `gallery_images` | `id`, `media_id`, `group`, `ratio`, `caption`, `collection` (inspiration/portfolio), `sort_order`, `is_visible` | Portfolio = genuine salon work only |
| `notifications` / `notification_preferences` / `email_outbox` | see §2 | In-app events + optional e-mail |
| `audit_log` | see §2 | Every admin write (content, prices, staff, settings) |

RLS
- **Read:** public read is limited to `status = 'published' AND is_visible`.
- **Write:** writes go only through admin Server Actions (`is_admin()`).
- **Protected settings:** `site_settings.appearance` and the logo media can be changed only
  by a Super Admin.
- **Cache:** publishing triggers `revalidateTag('content:<entity>')` from the Server Action.
