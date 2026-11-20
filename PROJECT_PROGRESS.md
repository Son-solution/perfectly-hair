# Project Progress — Perfectly Hair by Gabriel

Resume point after any interruption: read this file, then `git log --oneline`.

## Current status

**Phase 2 — Public frontend + logo (2.1) + photography (2.2) + "Noir Atelier" redesign (2.3): complete, awaiting owner review / approval for Phase 3.**
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

### Phase 2.1 — Official logo ✅ (2026-11-20)
- Source: `public/images/logo.pdf` (Adobe Illustrator 28.2, single page 1920×1080, white artwork on black).
- Converted 1:1 to SVG: all 7 shapes (X, scissors ×3, moustache, P, H) with exact coordinates;
  "P" and "H" outlined from the font embedded in the PDF (Alice Regular, SIL OFL); black page
  background omitted; tight crop (viewBox 571 144 789 786). Verified by overlaying on a 1920×1080
  black page — matches the PDF.
- `src/components/brand/LogoMark.tsx` (generated, inline SVG, `currentColor` → white on dark, black on light)
- `public/images/brand/logo-white.svg`, `logo-black.svg` for print / e-mail / social
- Integrated: header (mark + wordmark), mobile menu, footer, rotating hero badge (replaces the
  hand-set "PH"), favicon `src/app/icon.svg` (default Next.js favicon removed)
- Header nav spacing tightened at 1280–1535 px so the logo + full navigation fit
- Checks: typecheck ✅ · lint ✅ · build ✅ · routes incl. `/icon.svg` 200 ✅ · screenshots 492 / 1280 / 1440 ✅

### Phase 2.2 — Monochrome editorial photography ✅ (2026-11-20)
- 9 Unsplash photos (licence "Free to use under the Unsplash License" verified on EACH photo page);
  full list with photographers in `public/images/README.md` and on the new page `/bildnachweise`
- Distinct imagery: Damen (4), Herren (3), Kinder (2)
- Processing with sharp: grayscale → mild contrast → true single-channel JPEG, metadata stripped;
  served by next/image as responsive WebP (e.g. 42 KB at 640 px), lazy below the fold, eager hero
- Registry `src/content/images.ts`: `credit`, intrinsic size, focal point (`position`) per photo;
  object-cover only (no stretching)
- Homepage hero: 3-image cinematic crossfade + Ken Burns (all slides preloaded, no pop-in), "Symbolbilder" caption
- Category pages and cards use the photos; moving gallery strip on home + gallery
- Gallery split into **Inspiration** (stock, "Symbolbild" label on every photo + notice) and
  **Aus unserem Salon** (empty slots for genuine work)
- Every stock photo shows a "Symbolbild" label (or nearby caption); footer link "Bildnachweise"
- Deliberately NOT used: salon interiors (could be mistaken for this salon), images with visible
  trademarks, one image whose description advertises another salon. Salon/Team slots stay "Bild folgt".
- Checks: typecheck ✅ · lint ✅ · build ✅ · 14 routes 200 ✅ · no dead links ✅ · screenshots 492 / 1440 ✅

### Phase 2.3 — Major creative redesign "Noir Atelier" ✅ (2026-11-20)
Checkpoint before redesign: git tag `pre-redesign-v1` (restore with `git checkout pre-redesign-v1`).
Creative direction: `docs/CREATIVE_DIRECTION.md`.
- **Hero** (`experience/HeroCinematic`): 3 chapters Damen/Herren/Kinder, auto-advance 6.5 s,
  clip-path wipe + strong 1.2→1.04 zoom, layered inset frame (pointer depth + idle float),
  masked rotating word "Für …", progress bars, CSS mask-up title (visible without JS)
- **Category panels** (`experience/CategoryPanels`): full-height expanding panels, Ken Burns,
  auto-cycle 5.2 s until interaction; touch: first tap expands, second opens
- **Editorial story**: masked oversized statement, 3-layer floating collage + scroll parallax,
  drifting outlined background words
- **Cinematic gallery**: two counter-moving infinite rows, scroll-velocity boost + skew, hover captions
- **Booking finale**: full-screen Ken Burns, giant masked type, rotating magnetic call badge;
  honest note that online booking follows (used compact via `CtaBand` on all inner pages)
- **Navigation**: hide-on-scroll-down header, rolling hover labels, full-screen menu (all breakpoints)
  with curtain reveal, masked links and live image preview
- **Footer**: moving Damen/Herren/Kinder band with logo, giant wordmark, back-to-top
- **Inner pages**: new PageHero (giant masked title, outlined echo, zooming framed photo);
  CSS page-enter transition via `(site)/template.tsx`
- Performance: decorative loops pause off-screen / hidden tab (`useLiveSection` + `[data-paused]`),
  transform/opacity/clip-path only, reduced motion respected. No GSAP added (Motion covers all effects).
- Checks: typecheck ✅ · lint ✅ · build ✅ · 14 routes 200 ✅ · 0 dead links ✅ ·
  visual checks via DevTools protocol at 1440×900 and real 390×844 mobile emulation, incl. menu open ✅

### Known limitations of testing
- Reliable visual testing method: drive Edge via DevTools protocol (scratch script `cdp-shot.mjs`):
  real mobile emulation, natural scrolling, clicks. The plain `--screenshot` CLI is unreliable
  (min width 492 px, no anchors, lazy images in frames).
- Headless Edge screenshots are timing-sensitive on this laptop (image generation on first request,
  slow decode): partially loaded or blank captures were traced to the tool, verified by fetching
  every image URL (all 200, ~1 s each) and by successful captures of the same pages.
- Headless Edge cannot render viewports narrower than 492 px; 390 px phones were checked by
  calculation (hero title and audience row sized to fit 350 px content width), not by screenshot.
- Screenshot method: use `--timeout=9000` (real time). With `--virtual-time-budget`, headless Edge
  does not fire scroll-reveal (IntersectionObserver) animations and lower sections look blank —
  a tooling artifact, verified not to be a site bug.
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
