# Project Progress — Perfectly Hair by Gabriel

Resume point after any interruption: read this file, then `git log --oneline`.

## Current status

**Phase 4 — Isolated 3D prototype (/3d-preview): complete, awaiting owner approval. NOT integrated into the homepage.**
Last update: 2026-11-23
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

### Phase 2.4 — Precision layout & typography refinement ✅ (2026-11-21)
Measured with DevTools-protocol audits (header/title positions, horizontal overflow, screenshots)
at 1920×1080, 1440×900, 1366×657, 1280×720, 1280×600, 1024×768, 768×1024, 390×844, 375×667.

| Problem (observed) | Root cause | Fix |
| --- | --- | --- |
| Hero title under the header on laptop screens (1366×657: title top 50 px, header bottom 89 px) | Hero had a fixed `h-[100svh]` with content pushed down by `justify-end`, no reserved header area; title size depended only on width (13.5vw) | `min-h-[100svh]` flex column, `--safe-top` padding (header + breathing room), height-aware type `min(13.5vw,19svh)`, chapter bar in normal flow, inset frame sized by `svh` |
| Finale second line ("beginnt mit einem Anruf.") never appeared | `MaskLines` observed the masked inner span, which starts translated below its `overflow:hidden` mask → 0 px visible → long lines never revealed (short lines worked only by a 1 px accident) | Observe the visible heading element with `useInView`, animate lines from that state |
| Circular call badge text overlapped itself ("VEREINBARJETZT") | Text longer than the circle circumference | `textLength` = 2πr with `lengthAdjust="spacing"` (finale + hero badge) |
| Footer "Hair" collided with "Perfectly"; "Nach oben" shown twice on mobile | Wordmark shared a flex row with the button → wrapped to 2 lines at leading 0.8; `hidden` vs component `inline-flex` class conflict | Own row, `whitespace-nowrap`, fit-to-width size, descender padding; single back-to-top in bottom row |
| Panel labels "II / 03SYMBOLBILD" in narrow panels | Two absolutely positioned labels | One wrapping flex row with `--space-label` gap |
| Decorative giant words behind real text (story "Atelier…", "Preise" behind "Klar.", inner-page title echo behind buttons) | Absolute decorative layers over content areas | Converted to in-flow bands above/below content; only cropped at section edges |
| Grey block while value items fade in | `gap-px` on `bg-mist` background trick | Real border dividers with text padding |
| Clipped italic descenders (f, g, y) | Mask padding too small at tight display line-heights | Larger mask padding with compensating negative margin |

- New spacing tokens in `globals.css`: `--header-h`, `--safe-top`, `--space-label`
- Results: no horizontal overflow on any page/viewport; hero eyebrow ≥ 47 px below the header at all
  sizes; all 14 routes checked; typecheck ✅ · lint ✅ · build ✅

### Phase 2.5 — Final luxury refinement + Herren-first hero ✅ (2026-11-23)
Checkpoint before: git tag `pre-refine-v2`.
- **Hero order** Herren (01) → Damen (02) → Kinder (03) → loop. Herren is index 0, so it is the
  server-rendered first frame (verified in production HTML) — no flash of another chapter.
  Image, "Für …" word, chapter tab, "Kapitel 0X" caption all driven by one index (verified in sync).
  Next slides preload (`SalonImage preload`) so wipes never reveal a half-loaded image.
- Hero readability: stronger top shade under the header, `label-shadow` utility for small labels
  over photos, higher label contrast. Removed small header numbers that conflicted with the new order.
- Atelier: taller collage, photos no longer cover each other's faces, caption "Damen / Herren / Kinder"
  moved into free space (no longer across a photo).
- Appointment: solid (not outlined) italic second line, stronger photo overlay, more space between
  labels and divider, consistent CTA spacing; still states booking is by phone.
- Footer marquee: line-height 1.2 + vertical padding (no ascender/descender clipping), horizontal clip only.
- "N" circle identified as Next.js Dev Tools (`<nextjs-portal>`, button "Open Next.js Dev Tools") —
  dev only; production HTML contains none.
- Tests (production build, DevTools protocol): Herren first + timed cycle at 1440 and 390;
  reduced motion → stays on Herren (no auto-advance); keyboard focus on chapter links switches chapter;
  menu Escape closes; 7 widths 1920–375 no horizontal overflow, eyebrow ≥ 82 px below header;
  14 routes 200, 0 dead links, tel link correct. typecheck ✅ lint ✅ build ✅
- Incident: a power cut corrupted generated `.next/types` (null bytes) → deleted `.next`
  (git-ignored build output) and regenerated with `next typegen` + build.

## Phase 3 — Complete website + CMS-ready architecture ✅ (2026-11-23)
Checkpoint before: git tag `pre-phase3`. Architecture: `docs/CMS_ARCHITECTURE.md`; DB plan: `docs/DATABASE.md` §6.

- **Content layer:** `src/content/schema.ts` (Zod), `src/content/data/*` (mock: business, navigation, settings,
  categories, services, employees, gallery, media, pages), `src/content/repository.ts` (async, server-only,
  validates + checks references at build). Old `config/site.ts`, `content/images.ts`, `content/audiences.ts` removed.
- **Pages = ordered typed sections** rendered by `components/sections/SectionRenderer.tsx` (22 section types).
  All 14 routes are thin `<PageView slug>` wrappers; SEO from CMS; hidden/draft pages → 404.
- **Components props-only:** hero, panels, story, gallery, finale, header, menu, footer, JSON-LD, sitemap,
  root metadata all read CMS data (no business content hardcoded in components).
- **Single sources:** phone/address/hours (`summarizeHours`), category texts/images, service prices.
- **Booking (frontend only):** 6 steps (Bereich, Leistung, Mitarbeiter, Termin, Ihre Daten, Übersicht);
  deep links `/termin?kategorie=&leistung=&mitarbeiter=` from every service row and category page;
  closed weekdays disabled; no invented slots; Zod validation (German messages); booking button disabled;
  `BookingGateway` contract with `unavailableGateway` (`features/booking/types.ts`).
- Editor conventions: `*text*` = italic accent; CTA `tel:` = salon phone; legal tokens → [FEHLT] when null.
- Fixes found while testing: German umlauts (Ü) clipped by text masks → top padding in all masks;
  descender clipping in page hero; JSON-LD `<` escape corrected.
- **Tests (production build, DevTools protocol):** 14 routes 200, 404 for unknown; 44 internal links, 0 dead;
  27 booking deep links valid; tel link correct; maps link present; hero Herren first; booking walk-through
  (deep link → step 3, date selection, validation blocks empty form, summary, submit disabled);
  14 pages × 375/390/768/1024/1440 → no horizontal overflow, page titles ≥ 98 px below header.
  typecheck ✅ lint ✅ build ✅ (18 static routes).
- Known content limitation: flyer services are not assigned to Damen/Herren/Kinder, so every category
  lists all six (e.g. Bartrasur under Kinder) until the salon assigns them (`service.audiences`).

## Phase 4 — Isolated interactive 3D prototype ✅ (2026-11-23)
Checkpoint before: git tag `pre-phase4`. Details: `docs/3D_EXPERIENCE.md`.

- Route `/3d-preview` (CMS page, `noindex`, not in navigation or sitemap). The homepage is unchanged.
- Three.js 0.187 + @react-three/fiber 9 + @react-three/drei 10. The 3D engine is lazy-loaded
  (client-only chunk, only on this route).
- **Model (placeholder):** real photogrammetry head scan "Infinite, 3D Head Scan" by Lee Perry-Smith,
  CC BY 3.0, from the official three.js repo. **No hair.** It is labelled on the page as
  "Prototyp · Platzhalter".
- CMS: `model3d` schema + `data/models.ts` (src, credit, `isPlaceholder`, `hasHair`, focus framing);
  section `hair-3d` (texts, default view, auto-rotate, hotspots → service references, CTA,
  fallback image). References are validated in the repository.
- Interactions: auto-rotation (pauses on interaction, resumes), mouse/touch drag, views
  Vorne/Links/Rechts/Hinten, six hotspots snapped to the surface by raycasting, accessible list
  + panel + CTA to `/termin?kategorie=herren&leistung=…`, keyboard (← → Escape), reduced motion,
  WebGL fallback.
- Fixed during testing: endless stage growth (layout loop), wrong hotspot framing (bust vs head),
  mobile stage below the fold.
- Missing for final quality: a licensed head model WITH a modern fade haircut (see
  `docs/3D_EXPERIENCE.md` §C), plus testing on real GPU devices (headless runs at ~3 fps).

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

## Next step (needs approval)

Backend: Supabase project, migrations (docs/DATABASE.md), RLS, Auth + roles, repository → Supabase,
Storage uploads, publish/revalidate, real booking engine behind `BookingGateway`; then Admin, Staff and
Customer dashboards and notifications.
