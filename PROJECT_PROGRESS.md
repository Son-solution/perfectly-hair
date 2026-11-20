# Project Progress — Perfectly Hair by Gabriel

Resume point after any interruption: read this file, then `git log --oneline`.

## Current status

**Phase 2 — Ultra-luxury public frontend: complete, awaiting owner review / approval for Phase 3.**
Last update: 2026-11-20

Priority change (owner, Phase 2): finish and visually review the public website BEFORE
connecting Supabase, Resend, GitHub or Vercel. None of these are connected.

## Environment (verified 2026-11-20)

| Tool | Version |
| --- | --- |
| Node.js | 24.21.0 |
| npm | 11.19.0 |
| Git | 2.56.0 (local repo only, branch `main`, **no remote**) |
| Next.js | 16.4.6 (Turbopack, Cache Components + Partial Prefetching enabled) |
| React | 19.3.0 |
| Tailwind CSS | 4.3.3 |
| Motion | 14.3.0 |

## Phase 1 — Foundation ✅ (commit `2e92736`)

Architecture, database/RLS design, design system, Next.js setup, env handling,
Supabase client factories (not connected). Details: `docs/`.

## Phase 2 — Public frontend ✅

### Routes (all statically prerendered)
`/` · `/damen` · `/herren` · `/kinder` · `/leistungen` · `/preise` · `/team` · `/galerie` ·
`/salon` · `/kontakt` · `/termin` · `/impressum` · `/datenschutz` · `/sitemap.xml` · `/robots.txt` · custom 404

### Built
- [x] Homepage: cinematic crossfading hero, DAMEN/HERREN/KINDER visible on first screen (also mobile),
      statement, asymmetric audience triptych, moving gallery strip, flyer prices, visit + hours, CTA
- [x] Header: transparent → solid on scroll, active link state; audiences always visible on desktop
- [x] Mobile menu: full-screen dialog, Escape/route-change close, focus trap, scroll lock
- [x] Shared editorial `PageHero`, `SectionIntro`, `CtaBand`, `HoursList`, `FlyerPriceList`, `Notice`
- [x] Damen / Herren / Kinder pages from one `AudiencePage` component + `src/content/audiences.ts`
- [x] Prices: only the 6 verified flyer prices, with explicit note that the flyer does not distinguish audiences
- [x] Team: no invented staff — elegant "in Vorbereitung" state
- [x] Gallery: filterable grid (Alle/Damen/Herren/Kinder/Salon) + marquee; notice that images are placeholders
- [x] Kontakt: address, phone, hours; map is a link (no embed → no third-party cookies)
- [x] Termin: interactive 5-step booking **prototype**, clearly labelled unavailable; no submit,
      no fake time slots, nothing stored; final step routes to the phone
- [x] Image system: `src/content/images.ts` registry + `SalonImage` (next/image, grayscale) +
      code-generated `ArtPlaceholder` ("Bild folgt"); `public/images/README.md` with rules. No external imagery used.
- [x] Motion: `Rise` (CSS, above the fold), `Reveal` (in-view), `KenBurns`, `Crossfade`, `Marquee`,
      drifting hairline art, rotating badge, grain; all reduced-motion aware
- [x] SEO: per-page metadata + canonical, sitemap, robots, schema.org `HairSalon` JSON-LD (verified data only)
- [x] Legal pages still marked as drafts (`[FEHLT: …]`, `noindex`)

### Checks (2026-11-20)

| Check | Result |
| --- | --- |
| `npm run typecheck` | ✅ passed |
| `npm run lint` | ✅ passed, 0 warnings |
| `npm run build` | ✅ passed — 18 static pages |
| All routes via `next start` | ✅ 200 (unknown route → 404) |
| Internal link crawl | ✅ no dead links |
| Built CSS colour scan | ✅ grayscale only (one Tailwind internal feature-test value, never rendered) |
| Visual check (headless Edge) | ✅ desktop 1440 (home, Damen), tablet 1024, mobile 480–492 (home, Termin) |

### Known limitations of testing
- Headless Edge cannot render viewports narrower than 492 px; 390 px phones were checked by
  calculation (hero title and audience row sized to fit 350 px content width), not by screenshot.
- Interactive behaviour (mobile menu open/close, gallery filter, booking steps) is implemented
  and type-checked but was not click-tested automatically — please check manually in `npm run dev`.
- Canonical URLs use `NEXT_PUBLIC_SITE_URL` (default `http://localhost:3000`) — set the real domain at deployment.

## Information needed from the owner

1. Which prices apply to Damen / Herren / Kinder, plus missing services and prices
2. Duration of each service
3. Team members (names, roles, portraits) — only with consent
4. Real photos of salon and work (→ `public/images/`, register in `src/content/images.ts`)
5. Impressum data: owner name, e-mail, USt-IdNr./Kleinunternehmer, Handwerkskammer, Betriebsnummer
6. Approval of the draft German texts (`src/content/audiences.ts`, homepage, Salon page)
7. Approval mode preference (auto / manual / hybrid) and cancellation policy (for Phase 3+)

## Blockers

- None technical. Network is slow; allow time for installs.
- Leftover folder `perfectly-hair/` (only a locked `node_modules` from the Phase 1 move). Ignored by Git;
  delete manually after closing VS Code.

## Next step — Phase 3 (needs approval)

Backend foundation: Supabase project, migrations from `docs/DATABASE.md`, RLS + tests, Auth,
`src/proxy.ts`, generated types, seed — then the real booking engine replaces the prototype.
