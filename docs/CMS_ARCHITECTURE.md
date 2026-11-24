# CMS Architecture — Perfectly Hair by Gabriel

Status: **Phase 3 — CMS-ready frontend.** All public business content comes from one
validated content layer. The source is local mock data today; Supabase replaces it later
without changing pages or presentation components. Nothing is connected yet.

## 1. Layers

```
src/content/data/*.ts      mock content (later: Supabase tables)
        │  validated by
src/content/schema.ts      Zod schemas = single contract for content
        │  read only through
src/content/repository.ts  async access functions (server-only)
        │  props
src/components/sections/   SectionRenderer: section type → presentation component
src/components/experience  presentation + animation (no data imports, props only)
src/app/(site)/*/page.tsx  thin routes: <PageView slug="…" />
```

Rules
- Presentation components never import data or the repository; they receive props.
  Client components only import **types** (`@/content/schema`, `@/content/view`).
- Design, layout and animation stay in code. Business content (texts, prices, images,
  hours, navigation, SEO) lives in the content layer.
- `null` = "not provided by the salon yet". It renders as hidden or as an explicit
  `[FEHLT: …]`. Nothing is invented.
- Content is validated on load. Invalid content or a broken reference (unknown `imageId`
  or `employeeId`) **fails the build**, so it never ships as a broken page.

## 2. Content model

| Entity | Schema | Mock file | Future table(s) |
| --- | --- | --- | --- |
| Business info, hours, holidays, social, booking policy, legal data | `business` | `data/business.ts` | `business_settings`, `opening_hours`, `opening_exceptions` |
| Navigation (primary, secondary, CTA, menu with images, legal) | `navigation` | `data/business.ts` | `navigation_items` |
| Site settings (footer tagline, band words, labels, appearance preset) | `siteSettings` | `data/business.ts` | `site_settings` |
| Categories Damen/Herren/Kinder (texts, images, principles, order, visibility) | `category` | `data/catalogue.ts` | `service_categories` |
| Services (name, description, audiences, price, from-price, duration, employees, order, visibility) | `service` | `data/catalogue.ts` | `services`, `staff_services` |
| Employees (name, role, bio, image, specializations, bookable) | `employee` | `data/catalogue.ts` | `staff_members` (+ `profiles`) |
| Gallery (image, group, ratio, caption, collection, order) | `galleryItem` | `data/catalogue.ts` | `gallery_images` |
| Media library (src, alt, focal point, credit) | `mediaAsset` | `data/media.ts` | `media_assets` + Storage bucket `media` |
| Pages (slug, status, visibility, SEO, ordered sections) | `page` / `section` | `data/pages.ts` | `site_pages`, `page_sections`, `page_revisions` |

### Sections (typed blocks)

A page is an ordered list of typed sections (Zod discriminated union). Array order is the
display order, and `visible: false` hides a section. Available types:

`hero-cinematic` · `audience-panels` · `editorial-story` · `cinematic-gallery` · `price-list` ·
`booking-finale` · `page-hero` · `principles` · `service-list` · `audience-index` ·
`other-audiences` · `marquee` · `notice` · `editorial-split` · `values` · `team` ·
`gallery-grid` · `contact-details` · `location` · `booking-flow` · `legal-text` · `credits` ·
`hair-3d` · `walk-in-announcement` · `callback-form` · `application-form` (Phase 5A.1)

Content conventions an editor can use:
- `*text*` inside headlines renders as an italic accent (no HTML is ever interpreted).
- CTA `href: "tel:"` means the salon's stored phone number.
- Legal text tokens `{{business.*}}` / `{{legal.*}}` are filled from business settings.
  Missing values render as `[FEHLT: …]`.
- Hero slide order = `slides` array. **Herren first** is an owner requirement, so the admin
  UI should warn before reordering.

### Single sources of truth
- Phone, address, hours: `business` (header, menu, footer, finale, contact, booking,
  JSON-LD and legal pages all derive from it). `summarizeHours()` builds text such as
  "Di – Fr 09:00 – 19:00 Uhr".
- Category texts and images: `category`. They are used by the hero, the panels, the
  category pages, the menu and the booking flow.
- Prices: `service`. They feed the home price list, `/preise`, the category pages,
  `/leistungen` and booking step 2.

## 3. Editable content vs protected system configuration

| Editable by Admin (CMS) | Protected (code / Super Admin only) |
| --- | --- |
| Texts, headlines, SEO title/description, noindex | Section types and their components |
| Images (upload/replace/delete), alt texts, focal points | Animation system, timings, design tokens |
| Section order and visibility, page visibility | Route structure, URL slugs of core pages |
| Services, prices, durations, categories, assignments | Booking engine rules (DB functions, constraints) |
| Team members, bios, portraits, specializations | Roles and permissions, RLS policies |
| Gallery items, captions, ordering | Monochrome palette (only predefined `appearance` presets) |
| Business info, hours, holidays, social links, booking policy text | Legal page structure (tokens), logo file (Super Admin) |
| Navigation labels/order (existing routes only) | Environment variables, integrations |

## 4. Moving to Supabase

1. Create the tables from `docs/DATABASE.md` §6. Store section payloads as `jsonb`, validated
   by the same Zod `section` schema on write (Server Action) and on read (repository).
2. Re-implement `repository.ts` functions with Supabase queries. They keep the same return
   types, so no page or component changes.
3. Media: Supabase Storage bucket `media` (public read, admin write). `mediaAsset.src`
   becomes the public URL. Allow its hostname in `next.config.ts` `images.remotePatterns`.
   Run uploads through a Server Action that converts images to grayscale and creates the
   `media_assets` row.
4. Caching: repository reads use `'use cache'` + `cacheTag('content:<entity>')` (Cache
   Components is enabled). The admin "Publish" action calls `revalidateTag` /
   `updateTag` for the affected tags, so pages update within seconds without a deploy.
5. Draft, preview and published:
   - Every page and section row has `status` and `published_at`.
   - Publishing copies the draft into a `page_revisions` row (history and rollback).
   - Preview mode (Next.js Draft Mode, admin only) calls `getPage(slug, { preview: true })`,
     which returns drafts.
6. Validation stays: an invalid payload is rejected by the Server Action before it is saved.

## 5. Booking architecture (frontend ready)

- UI: `components/booking/BookingFlow.tsx`, a six-step flow (Bereich → Leistung →
  Mitarbeiter → Termin → Ihre Daten → Übersicht).
- Deep links: `/termin?kategorie=<slug>&leistung=<serviceId>&mitarbeiter=<employeeId>`.
  Only valid IDs are accepted; the flow starts at the first open step.
- Contract: `features/booking/types.ts` → `BookingGateway { getAvailability, submit }`.
  Today `unavailableGateway` returns `"unavailable"`: no slots are shown and nothing is
  submitted. The backend phase swaps in a Server-Action gateway backed by
  `get_available_slots()` / `book_appointment()`.
- Customer details are validated client-side with Zod (`customerDetails`). The same schema
  will validate on the server.

## 6. Roles and permissions (planned, not implemented)

| Capability | Super Admin | Admin | Staff | Customer | Public |
| --- | --- | --- | --- | --- | --- |
| Manage roles and users, protected settings, logo | ✅ | – | – | – | – |
| Edit pages, sections, SEO, media, gallery, navigation | ✅ | ✅ | – | – | – |
| Manage services, prices, durations, categories | ✅ | ✅ | – | – | – |
| Manage employees, schedules, breaks, time off | ✅ | ✅ | own availability (if permitted) | – | – |
| Business info, hours, holidays, booking policy | ✅ | ✅ | – | – | – |
| View all bookings, accept/reject/cancel | ✅ | ✅ | assigned only (per salon policy) | – | – |
| Create a booking | ✅ | ✅ | ✅ (for customers) | own | as guest (if enabled) |
| View, cancel or reschedule own bookings | – | – | – | ✅ within policy | – |
| Notifications (in-app + optional e-mail) | all events | all events | assigned bookings, schedule changes | own booking status, reminders | – |
| Audit log read | ✅ | ✅ | – | – | – |

Enforcement plan:
- Server-side role checks in every Server Action.
- Postgres RLS on every table (default deny).
- A role change is possible only by a Super Admin (trigger).

Details: `docs/DATABASE.md`.

## 7. Phase 5A.1 — settings that are admin-editable later (no second architecture)

All of these live in the existing content layer (`src/content/data/*`, validated by
`src/content/schema.ts`) and appear read-only under Admin → Einstellungen → "Website & Formulare".

| Setting | Source today | Effect |
| --- | --- | --- |
| Walk-in days and texts | `business.walkIn` | Booking flow, callback form and the admin "Neuer Termin" block those days. The `walk-in-announcement` section (home, Herren, Termin), footer, menu and contact hours show the texts |
| Team page visible | `siteSettings.features.teamPageVisible` (currently **false**) | Hidden: /team returns 404 (noindex), drops out of the sitemap, and navigation, menu and footer are filtered automatically (`getSiteChrome`). Team components and models are kept |
| Careers page visible | `siteSettings.features.careersPageVisible` | Same mechanism for /karriere |
| **Booking mode** (5A.2) | `business.booking.mode`: `REQUEST_ONLY` (default) / `ONLINE_ONLY` / `BOTH` / `DISABLED` | `callback-form` is shown in REQUEST_ONLY and BOTH. The `booking-flow` wizard is kept but shown only in ONLINE_ONLY and BOTH; in production hidden sections are not rendered at all. DISABLED shows a phone and walk-in notice. Real booking additionally needs `business.booking.onlineBookingActive` (engine ready, Phase 5B). In the demo the owner can preview modes browser-locally (Admin → Einstellungen → Buchungseinstellungen) |
| Application form visible | `siteSettings.features.applicationFormVisible` | Renders `application-form` sections or skips them |
| Notification recipient | `siteSettings.notificationEmail` (null) | E-mail hints for new requests and applications (Phase 5B, no attachments) |
| Application form options | `application-form` section: positions, employment, experience, `cvMaxMb`, texts | Karriere form. No salaries or benefits invented |
| Callback form texts | `callback-form` section | Termin page |

Page gating: `FEATURE_GATED` in `src/content/repository.ts` maps `slug → feature flag`.
Shared rules: `src/lib/booking-rules.ts` (`isWalkInOnly`, `bookableWeekdays`, `hoursOn`). Form contracts:
`src/features/forms/schemas.ts`, which the Phase 5B Server Actions reuse on the server.

**Public forms are non-operational:**
- They validate locally, then state "Nicht gesendet".
- They make no network request and use no storage.
- The selected PDF is never read or uploaded.
- There is no success message.
