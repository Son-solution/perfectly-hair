# Creative Direction v2 — "Noir Atelier"

Checkpoint before this redesign: git tag `pre-redesign-v1`.

## Idea

A black-and-white fashion film, not a salon template. Every screen is a composed frame:
full-bleed photography, oversized Bodoni type that is cut by masks, layered images that
drift at different depths, and a page that keeps moving when nobody scrolls.

Three protagonists — **Damen, Herren, Kinder** — run through the whole experience as a
recurring motif (hero chapters, panels, menu, footer band).

## Principles

1. **Always alive.** Every viewport has at least one clearly visible, time-based motion
   (zoom, crossfade, drift, marquee, progress). Scroll motion is a bonus, never required.
2. **Layered depth.** Background photo + inset frame + type + grain, each moving at its own speed.
3. **Type as image.** Display type up to ~15vw, revealed through masks, sometimes outlined.
4. **Contrast as drama.** Near-black sections with hard cuts to paper white.
5. **Honest.** Stock photos stay labelled "Symbolbild"; no fake staff, reviews or bookings.

## Motion system

| Layer | Technique | Visible when idle |
| --- | --- | --- |
| Hero chapters | 6.5 s auto-advance, clip-path wipe + 1.18→1.04 zoom per chapter, progress bars | yes |
| Hero depth | Inset frame + type drift on pointer (desktop) and slow idle float | yes |
| Word mask | "Für Damen / Herren / Kinder" slides through a mask on each chapter | yes |
| Category panels | Expanding full-height panels, auto-cycle every 5 s until the user interacts | yes |
| Story collage | 3 images float on different periods + scroll parallax | yes |
| Gallery | Two counter-moving infinite rows, speed reacts to scroll velocity | yes |
| Finale | Strong Ken Burns + rotating call badge | yes |
| Navigation | Hide on scroll down / show on scroll up; full-screen menu with image preview | on use |
| Pages | CSS page-enter transition (no JS dependency) | on navigation |

Performance rules: transform/opacity/clip-path only; decorative loops pause when their
section is off-screen or the tab is hidden; `prefers-reduced-motion` stops loops and zooms.
Above-the-fold content never waits for JavaScript to become visible.

GSAP was not added: Motion for React covers every effect, avoiding a second animation runtime.
