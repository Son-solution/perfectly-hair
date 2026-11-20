# Perfectly Hair by Gabriel

Website and salon management platform for **Perfectly Hair by Gabriel** —
Friseursalon für Damen, Herren und Kinder, Rheinstraße 33, 65185 Wiesbaden.

> Status: **Phase 1 (foundation)**. Supabase, booking, email and dashboards are
> designed but **not yet connected or built**. See `PROJECT_PROGRESS.md`.

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS 4 · Motion for React ·
Supabase (Postgres, Auth, Realtime) · Resend · Vercel (later).

## Getting started

Requirements: Node.js ≥ 20.9 (tested with 24), npm.

```bash
npm install
cp .env.example .env.local   # optional in Phase 1
npm run dev                  # http://localhost:3000
```

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript (`tsc --noEmit`) |
| `npm run check` | lint + typecheck + build |

## Documentation

- `docs/ARCHITECTURE.md` — system architecture, folder structure, booking & notification flow
- `docs/DATABASE.md` — schema, permissions, RLS, double-booking prevention
- `docs/DESIGN_SYSTEM.md` — grayscale palette, typography, motion system
- `PROJECT_PROGRESS.md` — what is done, what is next (resume point after interruptions)

## Rules

- Never commit `.env*` files (except `.env.example`).
- No invented staff, reviews, photos or claims — missing data is marked as missing.
- Booking rules are enforced in the database, not only in the browser.
