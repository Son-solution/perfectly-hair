# Project Progress — Perfectly Hair by Gabriel

Resume point after any interruption: read this file, then `git log --oneline`.

## Current status

**Phase 1 — Foundation: complete, awaiting owner approval for Phase 2.**
Last update: 2026-11-20

## Environment (verified 2026-11-20)

| Tool | Version |
| --- | --- |
| Node.js | 24.21.0 |
| npm | 11.19.0 |
| Git | 2.56.0 (local repo only, branch `main`, **no remote**) |
| Next.js | 16.4.6 (Turbopack, Cache Components + Partial Prefetching enabled) |
| React | 19.3.0 |
| Tailwind CSS | 4.3.3 |

## Phase 1 — completed

- [x] Workspace inspected (was empty)
- [x] Next.js App Router + TypeScript + Tailwind + ESLint scaffolded
- [x] Dependencies: motion, @supabase/ssr, @supabase/supabase-js, zod, clsx, server-only
- [x] Architecture → `docs/ARCHITECTURE.md`
- [x] Database schema, RLS permission matrix, double-booking strategy → `docs/DATABASE.md` (design only)
- [x] Booking workflow + notification architecture → `docs/ARCHITECTURE.md` §5–6
- [x] Design system (grayscale tokens, Bodoni Moda + Manrope, motion rules) → `docs/DESIGN_SYSTEM.md`, `src/app/globals.css`
- [x] Motion primitives: Reveal, KenBurns, Crossfade, Marquee, MotionProvider (reduced-motion aware)
- [x] Foundation homepage with DAMEN / HERREN / KINDER, flyer prices, address, hours
- [x] Impressum + Datenschutz drafts with missing information marked `[FEHLT: …]`
- [x] Env handling (`.env.example`, validated accessors, server-only secrets)
- [x] Supabase client factories (browser / server / admin) — **not connected**
- [x] Secure `.gitignore` (all `.env*` except `.env.example`)

### Checks (2026-11-20)

| Check | Result |
| --- | --- |
| `npm run typecheck` | ✅ passed |
| `npm run lint` | ✅ passed, 0 warnings |
| `npm run build` | ✅ passed — `/`, `/impressum`, `/datenschutz` prerendered static |
| Production smoke test (`next start`) | ✅ `/`, `/impressum`, `/datenschutz` return 200 with expected German content |

## Known gaps / not yet built (by design)

- Nav links `/damen`, `/herren`, `/kinder`, `/leistungen`, `/team`, `/galerie`, `/salon`, `/kontakt`, `/termin` → 404 until Phase 4/3
- No mobile navigation drawer yet (Phase 4)
- No real photography — placeholders labelled "Bild folgt"
- Supabase, Resend, push: **not configured, not tested**
- No booking, auth, dashboards, notifications yet
- `docs/DATABASE.md` SQL is untested design; real migrations come in Phase 2
- Legal pages are incomplete drafts and must be legally reviewed

## Information needed from the owner

1. Which flyer prices apply to Damen / Herren / Kinder, plus missing services and prices per category
2. Duration of each service
3. Team members (names, roles, photos, which services each performs) — only with their consent
4. Real photos of the salon and work
5. Impressum data: owner name, e-mail, USt-IdNr./Kleinunternehmer, Handwerkskammer, Betriebsnummer
6. Approval mode preference (auto / manual / hybrid) and cancellation policy
7. Supabase project (or approval to create one) and a sending domain for Resend

## Blockers

- None technical. Network is very slow (npm install took ~15 min); allow time for installs.
- Leftover folder `perfectly-hair/` (contains only a locked `node_modules` from the scaffold move). Ignored by Git; delete it manually after closing VS Code.

## Next step — Phase 2 (needs approval)

Supabase: migrations from `docs/DATABASE.md`, RLS policies + tests, Auth (sign-up, login, roles),
`src/proxy.ts` session refresh, generated types, seed from flyer data.
