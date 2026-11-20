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

## External imagery currently used

None. All visuals are code-generated placeholders.
