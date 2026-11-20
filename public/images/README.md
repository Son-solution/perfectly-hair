# Images

All site imagery is registered in `src/content/images.ts`. To replace a placeholder:

1. Put the file in the matching folder (`hero/`, `audiences/`, `salon/`, `gallery/`, `team/`).
   Recommended: JPG/WebP, long edge ≥ 2400 px for hero, ≥ 1600 px elsewhere.
2. In `src/content/images.ts`, set `src: "/images/<folder>/<file>"` and a precise German `alt` text.
3. Photos are shown in black & white automatically (CSS `grayscale`), so colour originals are fine.

## Rules

- **Only real photos of this salon and its work**, taken by or for the salon.
- People (staff, customers, children) only with documented consent. For children: parental consent.
- **No stock photos presented as the salon.** If editorial/stock imagery is ever used, add a
  `credit` (author, source, license) in the registry and do not imply it shows the salon.
- Until a real photo exists, the site renders an abstract monochrome artwork labelled
  "Bild folgt". These artworks are generated in code and contain no third-party material.

## Brand / logo

- `logo.pdf` — **official source file** supplied by the salon (Adobe Illustrator 28.2). Keep it.
- `brand/logo-white.svg`, `brand/logo-black.svg` — 1:1 vector conversions for use outside the
  website (print, e-mail, social media).
- In the app the logo is the inline component `src/components/brand/LogoMark.tsx` (colour follows
  the surrounding text, so it is white on dark and black on light backgrounds). Favicon: `src/app/icon.svg`.
- Conversion: every path coordinate was copied exactly from the PDF; the letters "P" and "H" were
  converted to outlines from the font embedded in the PDF (Alice Regular, SIL Open Font License).
  The black page background was omitted. Nothing was redrawn or altered.

## External imagery currently used

Folder `editorial/` — 9 editorial **stock** photos from Unsplash, used as mood imagery
("Symbolbild"). Licence verified on each photo page on 2026-11-20:
"Free to use under the Unsplash License" (commercial use allowed, no attribution required;
images may not be sold unmodified or compiled into a competing image service).

| File | Photographer | Source |
| --- | --- | --- |
| damen-portrait-hair.jpg | Alexander Krivitskiy | https://unsplash.com/photos/GhPVQlqHLDE |
| damen-portrait.jpg | Adil (@beingaheart) | https://unsplash.com/photos/-rEXYZx7fVk |
| damen-curls.jpg | Atiyeh Fathi | https://unsplash.com/photos/EBqcZ3OyySs |
| damen-hair-wash.jpg | Lindsay Cash | https://unsplash.com/photos/Md_DhaFsnCQ |
| herren-profile.jpg | Megan Bagshaw | https://unsplash.com/photos/YmaaUNbHHtw |
| herren-shears.jpg | Gulom Nazarov | https://unsplash.com/photos/DrG4V5skbMY |
| herren-cut.jpg | Nate Johnston | https://unsplash.com/photos/tgPrIYnW3g4 |
| kinder-portrait.jpg | Ibrahim Guetar | https://unsplash.com/photos/4brY7Bwss1I |
| kinder-clipper.jpg | Jonathan Weiss | https://unsplash.com/photos/arxAZJT5k2A |

Processing (sharp): auto-rotate → grayscale → mild contrast (linear 1.06, −6) → single-channel
JPEG (mozjpeg q80), metadata stripped. Resized server-side and served as WebP by next/image.

Usage rules:
- Every stock photo has `credit` in `src/content/images.ts`, shows a "Symbolbild" label (or a
  nearby "Symbolbilder" caption) and is listed on `/bildnachweise`.
- Stock photos are NOT used in salon slots (interior, façade, portfolio, team) — those stay
  "Bild folgt" until real photos exist.
- Rejected during selection: images with visible trademarks/brand logos, an image whose
  description advertises a specific other salon, and salon interiors that could be mistaken
  for this salon.
- Unsplash does not provide model releases. Identifiable people are shown only in neutral
  editorial context, never as staff/customers or with endorsements.
