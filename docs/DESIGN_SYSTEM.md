# Design System — Perfectly Hair by Gabriel

Art direction: calm, cinematic, editorial luxury. Black, white and grays only.
Implemented as Tailwind v4 theme tokens in `src/app/globals.css`.

## Color (grayscale only)

| Token | Value | Use |
| --- | --- | --- |
| `ink` | `#0a0a0a` | Primary text on light, dark section backgrounds |
| `ink-soft` | `#1c1c1c` | Elevated dark surfaces |
| `graphite` | `#3a3a3a` | Secondary text on light |
| `stone` | `#6b6b6b` | Muted text, meta (passes AA on white at ≥ 14px bold / 18px) |
| `ash` | `#a3a3a3` | Muted text on dark |
| `mist` | `#d9d9d9` | Hairlines on light |
| `bone` | `#f2f2f2` | Light alternate section background |
| `paper` | `#fafafa` | Page background |
| `white` | `#ffffff` | Cards, text on dark |

No other hues anywhere, including focus rings, links and photo treatments
(photography is displayed in black & white via `grayscale` filter where needed).

## Typography

| Role | Font | Notes |
| --- | --- | --- |
| Display | **Bodoni Moda** (variable, `next/font/google`) | High-contrast didone, editorial. Large sizes, tight tracking, light weights. |
| Text / UI | **Manrope** (variable) | Clean geometric grotesque, excellent legibility in German. |

Scale (fluid with `clamp`): `display-2xl` 4.5–10rem · `display-xl` 3–6.5rem ·
`display-lg` 2.25–4rem · `h3` 1.5–2rem · body 1rem/1.7 · `eyebrow` 0.75rem uppercase,
tracking 0.3em.

## Layout

- Mobile first. Container max 1440px, gutters 20px → 40px → 64px.
- 12-column editorial grid on desktop; asymmetric image/text compositions.
- Generous vertical rhythm: sections 96px (mobile) → 176px (desktop).
- Hairline dividers (1px `mist` / white at 15%) instead of boxes and shadows.

## Motion system (`src/components/motion`)

All primitives use Motion for React and fall back to static rendering when
`prefers-reduced-motion: reduce` is set.

| Primitive | Behaviour | Default timing |
| --- | --- | --- |
| `Rise` | CSS-only entrance for above-the-fold content (heroes). Plays on first paint, no JS needed | 1.2s, staggered delays |
| `Reveal` | Fade + 24px rise when entering viewport, once (below-the-fold only) | 1.1s, ease `[0.22, 1, 0.36, 1]` |
| `KenBurns` | Slow continuous zoom/pan on images, independent of scroll | 24s alternate loop, scale 1 → 1.08 |
| `Crossfade` | Cycles children with long dissolves | 7s hold, 1.8s fade |
| `Marquee` | Seamless infinite horizontal drift (gallery strip, words) | 60s per loop, pauses on hover/focus |
| `grain` utility | Very subtle animated film grain overlay (CSS only) | 8 steps, opacity 0.06 |
| `ArtPlaceholder` | Code-generated flowing hairlines drifting slowly; stands in for missing photos | 38s alternate |
| `RotatingBadge` | Circular "Damen · Herren · Kinder" text, slow rotation | 48s per turn |

Rules: one ambient motion per viewport; no parallax on text; dashboards use only
short state transitions (≤ 200ms), no continuous motion.

## Components (Phase 1 foundation)

`Container`, `Eyebrow`, `ButtonLink` (solid / outline / ghost, light & dark), hairline `Divider`.
Focus style: 2px solid ink (or white on dark) outline with 4px offset on all interactive elements.

## Imagery

No stock photography is presented as the salon's own. Until the owner provides real
photos, image slots render an abstract artwork labelled "Bild folgt".
All images are registered in `src/content/images.ts` — see `public/images/README.md`.
