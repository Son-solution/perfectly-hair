# 3D Experience — Prototype (`/3d-preview`)

Status: **isolated prototype.** It is not linked in the navigation, not in the sitemap and
`noindex`. It must not be integrated into the homepage before the owner approves it.

## A. Real implemented 3D functionality

| Feature | Implementation |
| --- | --- |
| Real-time 3D | Three.js + React Three Fiber + Drei. A genuine glTF mesh is rendered with WebGL; no image, video or CSS trick. |
| Lazy loading | `next/dynamic(..., { ssr: false })`. The 3D engine is a separate client chunk, loaded only on this route. |
| Monochrome look | Model material replaced by a grey `MeshPhysicalMaterial` ("sculpture bust"), with a black background, ACES tone mapping and studio lights (dim ambient, spot key, two rim lights, soft fill). |
| Auto-rotation | Configurable in degrees/second. Pauses while dragging and after a viewpoint or hotspot click, then resumes after `resumeAfterMs`. Off when the visitor prefers reduced motion. |
| Drag rotation | Drei `CameraControls` with mouse and one-finger touch. Polar angle is limited; zoom and pan are disabled so page scrolling still works. |
| Viewpoints | Vorne / Links / Rechts / Hinten with smooth camera transitions (instant under reduced motion). |
| Hotspots | 3D-anchored markers that fade out when they face away from the camera. Clicking one focuses the camera and opens the service panel. |
| Service panel | Name, price (from the services catalogue), text and a CTA to `/termin?kategorie=herren&leistung=<id>`. Escape or × closes it. |
| Accessibility | All functions are reachable without the canvas: view buttons, a hotspot list (buttons with `aria-pressed`) and an `aria-live` panel. The stage takes focus and ← → rotate by 30°. The 3D markers themselves are `aria-hidden` (duplicates of the list). |
| Performance | DPR capped at 1.75 (desktop) / 1.5 (mobile). The render loop stops when the stage is off-screen (`frameloop="never"`). A fixed-size stage avoids layout shift. |
| Failure handling | WebGL is detected before mounting. If WebGL is missing, or the canvas errors (error boundary), a static fallback shows a licensed photo plus the full service list. |
| Cleanup | Own material disposed on unmount; GLTF cache cleared (`useGLTF.clear`); R3F disposes the renderer and scene. |

## B. Temporary placeholder asset (in use)

- **File:** `public/models/head-scan/head.glb` (405 KB, glTF 2.0, 1 mesh, no textures).
- **Content:** "Infinite, 3D Head Scan" by **Lee Perry-Smith**, a real photogrammetry scan.
  **No hair.**
- **Licence:** Creative Commons Attribution 3.0 Unported (CC BY 3.0). Commercial use is
  allowed with attribution. Based on a work at www.triplegangers.com. Further permissions:
  ir-ltd.net.
- **Provenance:** downloaded on 2026-11-23 from the official three.js repository,
  `examples/models/gltf/LeePerrySmith/`. Licence file copied to
  `public/models/head-scan/LICENSE.txt`.
- **Changes:** material replaced (monochrome); scale and position normalised at runtime.
- **Disclosure:** the page shows "Prototyp · Platzhalter" and states that the final model with
  a fade haircut is missing.

## C. Missing for final photorealistic quality

1. **A licensed male head model with a modern fade haircut**, with these requirements:
   - glTF/GLB
   - roughly 50–150k triangles
   - baked textures with 2K maps: albedo, normal, roughness
   - hair as cards or mesh with an alpha texture
   - the haircut must be modelled as a fade, not as a generic hairstyle
   - licence allowing commercial web use, with written proof
2. **Sourcing options:**
   - Commission a 3D artist (best fit for a fade and the brand).
   - A marketplace purchase (CGTrader, TurboSquid). Check that hair is included and that the
     licence allows real-time web use.
   - Photogrammetry of a real client or model, with written consent.
3. **Optimisation of the final asset:**
   - Draco or Meshopt compression (`gltf-transform`).
   - KTX2 textures.
   - Target size under 6 MB.
4. **Hotspot calibration:** recheck positions in `src/content/data/pages.ts` against the final
   model (normalised coordinates, model facing +Z).

## CMS configuration (existing content architecture)

- **Model library:** `src/content/data/models.ts` (Zod schema `model3d`). Fields: src, title,
  description, `isPlaceholder`, `hasHair`, credit.
- **Page section:** `hair-3d` in page `3d-preview`. Fields: model reference, texts, category,
  default view, auto-rotate settings, hotspots (label, service reference, text, position,
  normal), CTA label, fallback image, asset notice.
- **Section visibility:** the `visible` flag, as for every section.
- **Validation:** the repository checks that `modelId`, every hotspot `serviceId` and
  `fallbackImageId` exist. A wrong reference fails the build.
- **Future:** a `model_assets` table plus a Storage bucket `models`. Uploads are validated by
  file type (.glb/.gltf) and size.

## Test results (2026-11-23, production build, Edge via DevTools protocol, software WebGL)

| Test | Result |
| --- | --- |
| Real mesh rendered (WebGL canvas present, 6 hotspot markers) | ✅ |
| Auto-rotation without interaction (pixel diff over 2.5 s) | ✅ 13.7 % pixels changed |
| Reduced motion (same test) | ✅ 0.00 % — no movement |
| Mouse drag (desktop 1440) / touch drag (mobile 390) changes view | ✅ / ✅ |
| Viewpoint buttons, hotspot list → panel with price + CTA `/termin?kategorie=herren&leistung=bartrasur` | ✅ |
| Keyboard: ← → rotate the focused stage, Escape closes the panel | ✅ |
| No WebGL (`--disable-webgl`) → static fallback + full service list | ✅ |
| Stage height stable (no layout growth) desktop/mobile | ✅ 696 px / 490 px constant |
| Not in sitemap, not linked, `noindex` | ✅ |
| 3D engine chunk loaded only on `/3d-preview` | ✅ ~1.05 MB raw / ~278 KB gzip |

Notes
- Headless software rendering reaches only ~3 fps, so smooth-motion timing (damping, resume delay)
  cannot be judged there; real-GPU devices are needed for frame-rate testing.
- Bugs found and fixed while testing:
  - Stage grew endlessly (canvas resizing its `h-full` parent); fixed with a fixed-height stage and
    an absolutely positioned canvas.
  - Hotspots were framed against the whole bust; fixed with focus framing and surface raycasting.
  - The stage sat below the fold on mobile, so rendering was paused; on mobile the stage now
    comes first.
