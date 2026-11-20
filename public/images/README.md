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

None. All visuals are code-generated placeholders.
