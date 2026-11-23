import type { Model3D } from "../schema";

/**
 * 3D model library (mock). Future: `model_assets` table + Storage bucket `models`.
 *
 * "head-scan": real photogrammetry head scan (geometry only, no textures, NO HAIR).
 * Licence verified from the official three.js repository file
 * examples/models/gltf/LeePerrySmith/LeePerrySmith_License.txt (2026-11-23):
 * Creative Commons Attribution 3.0 Unported — commercial use allowed with attribution.
 * It is a TEMPORARY placeholder: the final asset must be a licensed head with a modern fade haircut.
 */
export const models: Model3D[] = [
  {
    id: "head-scan",
    src: "/models/head-scan/head.glb",
    title: "Kopfscan (Platzhalter)",
    description: "Fotogrammetrischer Kopfscan ohne Haare – temporäres Modell für den Prototyp.",
    isPlaceholder: true,
    hasHair: false,
    // Measured from the mesh: head spans y -0.2…3.97, x ±1.8, z -2.0…2.6 (nose at +Z).
    focus: { center: [-0.1, 1.85, 0.25], radius: 2.25 },
    credit: {
      author: "Lee Perry-Smith (Infinite Realities), via Triplegangers",
      sourceUrl: "https://github.com/mrdoob/three.js/tree/dev/examples/models/gltf/LeePerrySmith",
      license: "CC BY 3.0",
      licenseUrl: "https://creativecommons.org/licenses/by/3.0/",
      notes: "\"Infinite, 3D Head Scan\" by Lee Perry-Smith, licensed under CC BY 3.0. Based on a work at www.triplegangers.com. Material changed to monochrome; scale and position normalised.",
    },
  },
];
