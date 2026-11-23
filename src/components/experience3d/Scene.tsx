"use client";

import { CameraControls, Html, useGLTF } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

export type View = "front" | "left" | "right" | "back";

/** Azimuth per view. Model faces +Z; "links" shows the head's left profile (+X side). */
export const VIEW_AZIMUTH: Record<View, number> = {
  front: 0,
  left: Math.PI / 2,
  back: Math.PI,
  right: -Math.PI / 2,
};

export type SceneHotspot = {
  id: string;
  label: string;
  position: [number, number, number]; // model units, snapped to the surface at runtime
  normal: [number, number, number];
};

export type SceneCommand =
  | { kind: "view"; view: View; nonce: number }
  | { kind: "rotate"; radians: number; nonce: number }
  | { kind: "focus"; normal: [number, number, number]; nonce: number };

export type SceneProps = {
  src: string;
  /** Framing in model units: this sphere is centred and fitted to the view. */
  focus: { center: [number, number, number]; radius: number };
  hotspots: SceneHotspot[];
  activeId: string | null;
  onSelect: (id: string) => void;
  command: SceneCommand | null;
  autoRotate: { enabled: boolean; degreesPerSecond: number; resumeAfterMs: number };
  reducedMotion: boolean;
  /** false while off-screen → rendering paused (no GPU work). */
  active: boolean;
  defaultView: View;
  onReady?: () => void;
};

/* ------------------------------------------------------------------ model */

/** Radius (world units) the focus sphere is scaled to; camera at 5.2 with fov 30 shows ±1.39. */
const FRAME_RADIUS = 1.12;

function HeadModel({
  src, focus, hotspots, activeId, onSelect, onReady,
}: Pick<SceneProps, "src" | "focus" | "hotspots" | "activeId" | "onSelect" | "onReady">) {
  const gltf = useGLTF(src);

  // Clone, frame the focus sphere (the head), apply a monochrome sculpture material and snap
  // hotspots onto the actual surface with a ray along -normal (robust to approximate positions).
  const { object, points, material } = useMemo(() => {
    const obj = gltf.scene.clone(true);
    const c = new THREE.Vector3(...focus.center);
    const scale = FRAME_RADIUS / focus.radius;
    obj.scale.setScalar(scale);
    obj.position.copy(c).multiplyScalar(-scale);
    obj.updateMatrixWorld(true);
    const mat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color("#b9b9b9"),
      roughness: 0.52,
      metalness: 0,
      clearcoat: 0.18,
      clearcoatRoughness: 0.6,
      sheen: 0.25,
      sheenColor: new THREE.Color("#ffffff"),
    });
    obj.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.material = mat;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
      }
    });
    const ray = new THREE.Raycaster();
    const pts = hotspots.map((h) => {
      const p = new THREE.Vector3(...h.position).sub(c).multiplyScalar(scale);
      const n = new THREE.Vector3(...h.normal).normalize();
      ray.set(p.clone().addScaledVector(n, 2), n.clone().negate());
      const hit = ray.intersectObject(obj, true)[0];
      const q = hit ? hit.point.addScaledVector(n, 0.015) : p;
      return [q.x, q.y, q.z] as [number, number, number];
    });
    return { object: obj, points: pts, material: mat };
  }, [gltf.scene, focus.center, focus.radius, hotspots]);

  useEffect(() => {
    onReady?.();
    return () => material.dispose(); // our own material; geometry belongs to the GLTF cache
  }, [material, onReady]);

  return (
    <group>
      <primitive object={object} />
      {hotspots.map((h, i) => (
        <HotspotMarker
          key={h.id}
          hotspot={h}
          position={points[i]}
          active={activeId === h.id}
          onSelect={onSelect}
        />
      ))}
    </group>
  );
}

/* ------------------------------------------------------------------ hotspots */

const tmpPos = new THREE.Vector3();
const tmpNormal = new THREE.Vector3();
const tmpToCam = new THREE.Vector3();

function HotspotMarker({
  hotspot, position, active, onSelect,
}: {
  hotspot: SceneHotspot;
  position: [number, number, number];
  active: boolean;
  onSelect: (id: string) => void;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const { camera } = useThree();
  const normal = useMemo(() => new THREE.Vector3(...hotspot.normal).normalize(), [hotspot.normal]);

  // Fade markers that face away from the camera (behind the head) — DOM style only, no re-render.
  useFrame(() => {
    const el = ref.current;
    if (!el) return;
    tmpPos.set(...position);
    tmpNormal.copy(normal);
    tmpToCam.copy(camera.position).sub(tmpPos).normalize();
    const facing = tmpNormal.dot(tmpToCam);
    const visible = facing > 0.05;
    el.style.opacity = visible ? String(Math.min(1, 0.25 + facing)) : "0";
    el.style.pointerEvents = visible ? "auto" : "none";
    el.tabIndex = -1; // keyboard users use the accessible list beside the canvas
  });

  return (
    <Html position={position} center zIndexRange={[20, 0]}>
      <button
        ref={ref}
        type="button"
        aria-hidden="true"
        onClick={() => onSelect(hotspot.id)}
        className="group relative flex h-9 w-9 items-center justify-center transition-opacity duration-300"
      >
        <span className={`absolute inset-0 rounded-full border ${active ? "border-white" : "border-white/60"} ${active ? "" : "animate-ping-slow"}`} />
        <span className={`h-2.5 w-2.5 rounded-full ${active ? "bg-white" : "bg-white/85"}`} />
        <span className="pointer-events-none absolute left-11 top-1/2 -translate-y-1/2 whitespace-nowrap border border-white/20 bg-black/70 px-3 py-1.5 text-[0.625rem] uppercase tracking-[0.24em] text-white opacity-0 backdrop-blur-sm transition-opacity duration-300 group-hover:opacity-100">
          {hotspot.label}
        </span>
      </button>
    </Html>
  );
}

/* ------------------------------------------------------------------ camera + auto-rotation */

function Rig({
  command, autoRotate, reducedMotion, defaultView,
}: Pick<SceneProps, "command" | "autoRotate" | "reducedMotion" | "defaultView">) {
  const controls = useRef<CameraControls>(null);
  const lastInteraction = useRef(0);
  const dragging = useRef(false);

  // Initial view (no animation).
  useEffect(() => {
    controls.current?.rotateTo(VIEW_AZIMUTH[defaultView], Math.PI / 2, false);
  }, [defaultView]);

  useEffect(() => {
    const c = controls.current;
    if (!c) return;
    c.smoothTime = reducedMotion ? 0 : 0.55;
    c.draggingSmoothTime = reducedMotion ? 0 : 0.12;
    const start = () => { dragging.current = true; lastInteraction.current = performance.now(); };
    const end = () => { dragging.current = false; lastInteraction.current = performance.now(); };
    c.addEventListener("controlstart", start);
    c.addEventListener("controlend", end);
    return () => {
      c.removeEventListener("controlstart", start);
      c.removeEventListener("controlend", end);
    };
  }, [reducedMotion]);

  // Commands from the UI: viewpoints, keyboard rotation, focus on a hotspot.
  useEffect(() => {
    const c = controls.current;
    if (!c || !command) return;
    lastInteraction.current = performance.now();
    const smooth = !reducedMotion;
    if (command.kind === "view") c.rotateTo(VIEW_AZIMUTH[command.view], Math.PI / 2, smooth);
    if (command.kind === "rotate") c.rotate(command.radians, 0, smooth);
    if (command.kind === "focus") {
      const [x, y, z] = command.normal;
      const azimuth = Math.atan2(x, z);
      const polar = Math.PI / 2 - Math.max(-0.5, Math.min(0.5, Math.asin(Math.max(-1, Math.min(1, y))) * 0.6));
      c.rotateTo(azimuth, polar, smooth);
    }
  }, [command, reducedMotion]);

  useFrame((_, delta) => {
    const c = controls.current;
    if (!c || !autoRotate.enabled || reducedMotion || dragging.current) return;
    if (performance.now() - lastInteraction.current < autoRotate.resumeAfterMs) return;
    c.azimuthAngle += THREE.MathUtils.degToRad(autoRotate.degreesPerSecond) * Math.min(delta, 0.05);
  });

  return (
    <CameraControls
      ref={controls}
      makeDefault
      minDistance={5.2}
      maxDistance={5.2}
      minPolarAngle={Math.PI * 0.36}
      maxPolarAngle={Math.PI * 0.62}
      // drag = rotate only; wheel/pinch zoom and panning disabled (page scroll stays usable)
      mouseButtons={{ left: 1, middle: 0, right: 0, wheel: 0 }}
      touches={{ one: 32, two: 0, three: 0 }}
    />
  );
}

/* ------------------------------------------------------------------ canvas */

export default function Scene(props: SceneProps) {
  useEffect(() => () => useGLTF.clear(props.src), [props.src]);

  return (
    <Canvas
      frameloop={props.active ? "always" : "never"}
      dpr={[1, typeof window !== "undefined" && window.innerWidth < 768 ? 1.5 : 1.75]}
      camera={{ position: [0, 0, 5.2], fov: 30, near: 0.1, far: 50 }}
      gl={{ antialias: true, powerPreference: "high-performance", alpha: false }}
      shadows
      onCreated={({ gl, scene }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.05;
        scene.background = new THREE.Color("#050505");
      }}
      aria-hidden="true"
    >
      {/* Cinematic studio light: dim ambient, strong key, two hard rim lights, soft fill. */}
      <ambientLight intensity={0.12} />
      <spotLight position={[3.2, 4, 4.5]} angle={0.42} penumbra={0.85} intensity={95} castShadow shadow-mapSize={[1024, 1024]} />
      <directionalLight position={[-5, 2.5, -4]} intensity={2.6} />
      <directionalLight position={[5, 1.5, -4.5]} intensity={1.7} />
      <directionalLight position={[-3, -1, 3]} intensity={0.35} />
      <HeadModel src={props.src} focus={props.focus} hotspots={props.hotspots} activeId={props.activeId} onSelect={props.onSelect} onReady={props.onReady} />
      <Rig command={props.command} autoRotate={props.autoRotate} reducedMotion={props.reducedMotion} defaultView={props.defaultView} />
    </Canvas>
  );
}
