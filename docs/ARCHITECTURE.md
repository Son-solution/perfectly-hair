# Architecture — Perfectly Hair by Gabriel

Status: Phase 1 design. Nothing in this document is connected to a live external
service yet. Each integration is marked with the phase in which it gets built and tested.

## 1. Overview

One Next.js (App Router) application serves three surfaces:

| Surface | Route group | Who | Rendering |
| --- | --- | --- | --- |
| Public website (German) | `src/app/(site)` | Everyone | Static / cached, revalidated when CMS content changes |
| Customer account | `src/app/(account)/konto` | CUSTOMER | Dynamic, authenticated |
| Staff dashboard | `src/app/(dashboard)/team` | STAFF | Dynamic, authenticated, realtime |
| Admin dashboard / CMS | `src/app/(dashboard)/admin` | ADMIN, SUPER_ADMIN | Dynamic, authenticated, realtime |

Backend services:

| Concern | Technology | Phase |
| --- | --- | --- |
| Database | Supabase PostgreSQL | 2 |
| Auth (email + password, magic link) | Supabase Auth via `@supabase/ssr` cookies | 2 |
| Authorization | Server-side role checks + Postgres Row Level Security | 2 |
| Booking rules | Postgres functions + exclusion constraints, called from Server Actions | 3 |
| Realtime notifications | Supabase Realtime (`postgres_changes` on `notifications`) | 5 |
| Transactional email | Resend, fed by a database outbox table | 5 |
| Browser push | Web Push (VAPID), optional | 6 |
| Images | Supabase Storage + `next/image` | 4 |
| Hosting | Vercel (not connected yet) | later |

## 2. Principles

1. **The database is the source of truth for rules.** Double-booking prevention, status
   transitions and permissions live in Postgres (constraints, functions, RLS). The UI
   only mirrors them for a good experience.
2. **Server-only secrets.** The Supabase service-role key and the Resend key are only
   read in modules that import `server-only`. Nothing secret uses the `NEXT_PUBLIC_` prefix.
3. **Least privilege.** Browser code uses the anon key + the user's session, so RLS
   applies. The service-role client is used only for background jobs (email outbox,
   reminders) and never for request handling on behalf of a user.
4. **Nothing invented.** No fake staff, reviews, photos or claims. Missing data is shown
   as clearly marked placeholders in development and hidden in production.
5. **Configurable, not hard-coded.** Prices, durations, hours, staff and texts come from
   the database (CMS). `src/config/site.ts` only holds bootstrap defaults used for seeding.

## 3. Folder structure

```
.
├── docs/                      Architecture, database, booking, design system
├── supabase/
│   ├── migrations/            SQL migrations (Phase 2+)
│   └── seed.sql               Bootstrap data from the flyer (Phase 2)
├── public/                    Static assets (logo, icons)
└── src/
    ├── app/
    │   ├── (site)/            Public German website
    │   │   ├── page.tsx                 Startseite
    │   │   ├── damen|herren|kinder/     Category pages
    │   │   ├── leistungen/[slug]/       Service details
    │   │   ├── team/ galerie/ salon/ kontakt/
    │   │   ├── termin/                  Booking flow
    │   │   └── impressum/ datenschutz/ agb/
    │   ├── (auth)/            anmelden, registrieren, passwort
    │   ├── (account)/konto/   Customer area
    │   ├── (dashboard)/team/  Staff dashboard
    │   ├── (dashboard)/admin/ Admin + CMS
    │   ├── api/               Route handlers (webhooks, cron)
    │   ├── layout.tsx  globals.css  sitemap.ts  robots.ts
    ├── components/
    │   ├── motion/            Reusable motion primitives (Reveal, KenBurns, Crossfade, Marquee)
    │   ├── ui/                Design-system primitives (Button, Container, Heading…)
    │   └── site/              Website sections (Header, Footer, Hero…)
    ├── config/                Bootstrap business data, navigation
    ├── features/              Domain modules: booking/, notifications/, cms/, staff/
    │   └── <feature>/{actions.ts, queries.ts, schema.ts, components/}
    ├── lib/
    │   ├── supabase/          Browser, server and admin client factories
    │   ├── auth/              Session + role guards
    │   ├── env.ts             Validated environment variables
    │   └── utils.ts
    └── types/                 Generated database types (Phase 2)
```

`src/proxy.ts` (Next.js 16 replacement for `middleware.ts`) refreshes the Supabase
session cookie and redirects unauthenticated users away from `/konto`, `/team`, `/admin`.
It is **not** the security boundary: every Server Action and page re-checks the role,
and RLS protects the data.

## 4. Request and data flow

```
Browser ──► Server Component / Server Action
               │  createServerClient(cookies)  → user session
               │  requireRole('admin')         → server-side guard
               ▼
          Supabase Postgres  ── RLS policies (second, independent guard)
               │
               ├─ trigger → notifications row ──► Realtime ──► in-app bell
               └─ trigger → email_outbox row  ──► cron worker ──► Resend
```

## 5. Booking workflow

Detailed rules are in `docs/DATABASE.md` §5. Summary:

1. **Category** — Damen / Herren / Kinder.
2. **Service** — filtered by category; shows duration and price ("ab" prices supported).
3. **Employee** — only staff linked to the service in `staff_services`, or "Keine Präferenz".
4. **Date and time** — the server computes slots:
   salon hours ∩ staff working hours − breaks − time off − existing bookings (incl. buffers)
   − lead time, within the max-advance window.
5. **Customer details** — logged-in profile or guest (name, email, phone), consent checkbox.
6. **Confirmation** — Server Action calls `book_appointment()` (Postgres function). The
   function re-validates everything; an exclusion constraint makes concurrent double
   bookings impossible (the second transaction fails and the user sees "Termin gerade vergeben").
7. **Status** — `pending` or `accepted`, depending on the approval mode:
   - `auto`: always accepted
   - `manual`: always pending until staff/admin acts
   - `hybrid`: auto-accept when rules pass (e.g. known customer, service does not
     require approval, lead time above threshold), otherwise pending.

State machine:

```
pending ──► accepted ──► completed
   │            │──────► no_show
   │            └──────► cancelled
   ├──► rejected
   └──► cancelled
```

Every transition is written to `booking_events` by a trigger (audit trail).
Cancellation and rescheduling by customers are allowed only before the configured cutoff.
When a slot is freed, matching waiting-list entries are notified (first come, first served,
with a hold window).

## 6. Notification architecture

One event, many channels:

1. A booking change inserts a row into `booking_events`.
2. A trigger fans out to recipients (customer, assigned staff, admins) according to
   `notification_preferences`, inserting rows into:
   - `notifications` (in-app, delivered instantly via Supabase Realtime; RLS ensures a
     user only receives their own rows),
   - `email_outbox` (status `queued`).
3. A protected route handler (`/api/cron/outbox`, triggered by Vercel Cron) sends queued
   emails through Resend, with retries and `last_error`. Idempotency key = outbox row id.
4. Reminders: the same cron enqueues reminders 24 h before accepted appointments.
5. Push (optional): `push_subscriptions` + Web Push, sent by the same worker.

Email and push are **not** working until Resend/VAPID keys are configured and tested
(Phase 5/6). Until then the outbox simply accumulates rows.

## 7. Security checklist

- RLS enabled on every table; default deny.
- Role stored in `profiles.role`, changeable only by SUPER_ADMIN (trigger-enforced).
- Server Actions validate input with Zod and check role before any write.
- Rate limiting on booking and auth endpoints (Phase 3).
- Security headers (CSP, frame-ancestors, referrer policy) in `next.config.ts` (Phase 7).
- `.env*` never committed; `.env.example` documents variables without values.

## 8. Phases

| Phase | Scope |
| --- | --- |
| 1 | Foundation: architecture, schema design, design system, Next.js setup, checks ✅ |
| 2 | Supabase: migrations, RLS, auth, roles, generated types, seed from flyer |
| 3 | Booking engine: availability, `book_appointment`, approval modes, waiting list |
| 4 | Public website: all pages, CMS-driven content, gallery, SEO, structured data |
| 5 | Notifications: in-app realtime, Resend emails, reminders |
| 6 | Dashboards: staff + admin + CMS editors, analytics; optional push |
| 7 | Hardening: security headers, rate limiting, accessibility, performance, legal review |
| 8 | Deployment preparation (Vercel), only after approval |
