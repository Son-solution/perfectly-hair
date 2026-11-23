"use client";

import { AnimatePresence, motion } from "motion/react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Component, useCallback, useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { SalonImage } from "@/components/media/SalonImage";
import { usePrefersReducedMotion } from "@/components/motion/usePrefersReducedMotion";
import type { MediaAsset } from "@/content/schema";
import { cn } from "@/lib/utils";
import type { SceneCommand, View } from "./Scene";

/** The 3D engine (three + R3F + drei) is code-split and only loaded on the client. */
const Scene = dynamic(() => import("./Scene"), { ssr: false });

export type ExperienceHotspot = {
  id: string;
  label: string;
  text: string;
  position: [number, number, number];
  normal: [number, number, number];
  service: { name: string; price: string | null; href: string };
};

export type HairExperienceProps = {
  eyebrow: string;
  title: string;
  italic: string;
  intro: string;
  model: {
    src: string;
    title: string;
    isPlaceholder: boolean;
    focus: { center: [number, number, number]; radius: number };
    credit: { author: string; sourceUrl: string; license: string; licenseUrl: string };
  };
  hotspots: ExperienceHotspot[];
  defaultView: View;
  autoRotate: { enabled: boolean; degreesPerSecond: number; resumeAfterMs: number };
  ctaLabel: string;
  fallbackImage: MediaAsset;
  assetNotice: string;
};

/** Distributive Omit so each command variant keeps its own fields. */
type CommandInput = SceneCommand extends infer C ? (C extends SceneCommand ? Omit<C, "nonce"> : never) : never;

const VIEWS: { id: View; label: string }[] = [
  { id: "front", label: "Vorne" },
  { id: "left", label: "Links" },
  { id: "right", label: "Rechts" },
  { id: "back", label: "Hinten" },
];

type GlState = "checking" | "ok" | "unsupported" | "error";

function detectWebGL(): boolean {
  try {
    const c = document.createElement("canvas");
    const gl = c.getContext("webgl2") ?? c.getContext("webgl");
    const ok = !!gl;
    (gl as WebGLRenderingContext | null)?.getExtension("WEBGL_lose_context")?.loseContext();
    return ok;
  } catch {
    return false;
  }
}

/** Catches runtime failures inside the canvas (context loss, model load errors). */
class CanvasBoundary extends Component<{ onError: () => void; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onError();
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

export function HairExperience(props: HairExperienceProps) {
  const reduce = usePrefersReducedMotion();
  const [gl, setGl] = useState<GlState>("checking");
  const [ready, setReady] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [view, setView] = useState<View>(props.defaultView);
  const [command, setCommand] = useState<SceneCommand | null>(null);
  const [onScreen, setOnScreen] = useState(true);
  const stageRef = useRef<HTMLDivElement>(null);
  const nonce = useRef(0);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- WebGL can only be detected in the browser
    setGl(detectWebGL() ? "ok" : "unsupported");
  }, []);

  // Pause rendering while the stage is off-screen (no GPU work).
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setOnScreen(e.isIntersecting), { rootMargin: "100px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const send = useCallback((c: CommandInput) => {
    nonce.current += 1;
    setCommand({ ...c, nonce: nonce.current } as SceneCommand);
  }, []);

  const select = useCallback(
    (id: string) => {
      setActiveId(id);
      const h = props.hotspots.find((x) => x.id === id);
      if (h) send({ kind: "focus", normal: h.normal });
    },
    [props.hotspots, send],
  );

  const onStageKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowLeft") { e.preventDefault(); send({ kind: "rotate", radians: -Math.PI / 6 }); }
    if (e.key === "ArrowRight") { e.preventDefault(); send({ kind: "rotate", radians: Math.PI / 6 }); }
    if (e.key === "Escape") setActiveId(null);
  };

  const active = props.hotspots.find((h) => h.id === activeId) ?? null;
  const show3d = gl === "ok";
  const onReady = useCallback(() => setReady(true), []);

  return (
    <section aria-labelledby="exp3d-title" data-reduced-motion={reduce ? "true" : "false"} className="relative isolate overflow-hidden bg-[#050505] text-white">
      <div className="container-luxe grid min-h-[100svh] gap-10 pb-16 pt-[calc(var(--safe-top)+1rem)] lg:grid-cols-12 lg:gap-8 lg:pb-20">
        {/* ------------------------------------------------ text + controls */}
        {/* Mobile: the 3D stage comes first (order), desktop: text left, stage right */}
        <div className="order-2 flex flex-col justify-center lg:order-1 lg:col-span-4">
          <p className="flex items-center gap-4 text-eyebrow uppercase text-white/60">
            <span aria-hidden="true" className="h-px w-10 bg-white/50" />
            {props.eyebrow}
          </p>
          <h1 id="exp3d-title" className="mt-6 font-display text-[clamp(2.6rem,5vw,5rem)] font-normal leading-[0.95]">
            {props.title}
            <span className="block italic text-white/65">{props.italic}</span>
          </h1>
          <p className="mt-6 max-w-md leading-relaxed text-white/65">{props.intro}</p>

          <div className="mt-10">
            <p id="views-label" className="text-[0.625rem] uppercase tracking-[0.3em] text-white/50">Ansicht</p>
            <div role="group" aria-labelledby="views-label" className="mt-4 grid grid-cols-4 border border-white/15">
              {VIEWS.map((v, i) => (
                <button
                  key={v.id}
                  type="button"
                  aria-pressed={view === v.id}
                  disabled={!show3d}
                  onClick={() => { setView(v.id); send({ kind: "view", view: v.id }); }}
                  className={cn(
                    "py-3 text-[0.6875rem] uppercase tracking-[0.2em] transition-colors duration-300 disabled:opacity-40",
                    i > 0 && "border-l border-white/15",
                    view === v.id ? "bg-white text-black" : "text-white/75 hover:bg-white/10 hover:text-white",
                  )}
                >
                  {v.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-10">
            <p id="services-label" className="text-[0.625rem] uppercase tracking-[0.3em] text-white/50">Leistungen am Modell</p>
            <ul aria-labelledby="services-label" className="mt-4 border-t border-white/10">
              {props.hotspots.map((h, i) => (
                <li key={h.id}>
                  <button
                    type="button"
                    aria-pressed={activeId === h.id}
                    aria-controls="exp3d-panel"
                    onClick={() => select(h.id)}
                    className={cn(
                      "group flex w-full items-baseline gap-4 border-b border-white/10 py-3.5 text-left transition-colors duration-300",
                      activeId === h.id ? "text-white" : "text-white/65 hover:text-white",
                    )}
                  >
                    <span className="text-[0.625rem] tracking-[0.3em] text-white/40">{String(i + 1).padStart(2, "0")}</span>
                    <span className={cn("font-display text-xl transition-transform duration-500", activeId === h.id && "translate-x-1 italic")}>{h.label}</span>
                    {h.service.price && <span className="ml-auto text-sm tabular-nums text-white/50">{h.service.price}</span>}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ------------------------------------------------ stage */}
        <div className="relative order-1 lg:order-2 lg:col-span-8">
          <div
            ref={stageRef}
            tabIndex={show3d ? 0 : -1}
            onKeyDown={onStageKey}
            role="region"
            aria-label="3D-Modell. Mit der Maus oder dem Finger drehen, mit den Pfeiltasten links und rechts drehen."
            className="relative h-[58svh] min-h-[360px] w-full touch-pan-y overflow-hidden outline-none focus-visible:outline focus-visible:outline-1 focus-visible:outline-white/60 lg:h-[calc(100svh-var(--safe-top)-5rem)] lg:min-h-[560px] lg:max-h-[960px]"
          >
            {/* soft spotlight vignette behind the model */}
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_42%,rgba(255,255,255,0.07)_0%,transparent_60%)]" />

            {/* Canvas is absolutely positioned inside a fixed-height stage: it can never resize
                its container (prevents a ResizeObserver growth loop / layout shift). */}
            {show3d && (
              <div className="absolute inset-0">
              <CanvasBoundary onError={() => setGl("error")}>
                <Scene
                  src={props.model.src}
                  focus={props.model.focus}
                  hotspots={props.hotspots}
                  activeId={activeId}
                  onSelect={select}
                  command={command}
                  autoRotate={props.autoRotate}
                  reducedMotion={reduce}
                  active={onScreen}
                  defaultView={props.defaultView}
                  onReady={onReady}
                />
              </CanvasBoundary>
              </div>
            )}

            {/* Loading veil (same size as the canvas → no layout shift) */}
            {show3d && !ready && (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="flex items-center gap-3 text-[0.625rem] uppercase tracking-[0.3em] text-white/50">
                  <span aria-hidden="true" className="h-1.5 w-1.5 animate-breathe rounded-full bg-white" />
                  3D-Modell wird geladen
                </span>
              </div>
            )}

            {/* Static fallback: no WebGL, or the canvas failed */}
            {(gl === "unsupported" || gl === "error") && (
              <div className="absolute inset-0">
                <SalonImage image={props.fallbackImage} sizes="(min-width: 1024px) 60vw, 100vw" />
                <div className="absolute inset-0 bg-black/55" />
                <p role="status" className="absolute inset-x-6 bottom-6 max-w-md text-sm leading-relaxed text-white/85">
                  Die 3D-Ansicht ist auf diesem Gerät nicht verfügbar. Alle Leistungen finden Sie in der Liste.
                </p>
              </div>
            )}

            {gl === "checking" && <div className="absolute inset-0" aria-hidden="true" />}

            {/* Interaction hint */}
            {show3d && ready && (
              <p aria-hidden="true" className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 text-[0.5625rem] uppercase tracking-[0.3em] text-white/45">
                Ziehen zum Drehen
              </p>
            )}

            {/* Placeholder disclosure — always visible */}
            {props.model.isPlaceholder && (
              <p className="absolute right-3 top-3 max-w-[16rem] border border-white/20 bg-black/60 px-3 py-2 text-[0.625rem] leading-relaxed text-white/75 backdrop-blur-sm md:right-4 md:top-4">
                <span className="block uppercase tracking-[0.24em] text-white">Prototyp · Platzhalter</span>
                {props.assetNotice}
              </p>
            )}
          </div>

          {/* Info panel */}
          <div id="exp3d-panel" aria-live="polite" className="pointer-events-none absolute inset-x-0 bottom-0 z-10 p-3 md:p-6">
            <AnimatePresence>
              {active && (
                <motion.div
                  key={active.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: reduce ? 0 : 0.45, ease: [0.22, 1, 0.36, 1] }}
                  className="pointer-events-auto ml-auto max-w-md border border-white/15 bg-black/80 p-6 backdrop-blur-md"
                  role="dialog"
                  aria-label={active.label}
                >
                  <div className="flex items-start justify-between gap-6">
                    <div>
                      <p className="text-[0.625rem] uppercase tracking-[0.3em] text-white/50">{active.service.name}</p>
                      <h2 className="mt-2 font-display text-3xl">{active.label}</h2>
                    </div>
                    <button type="button" onClick={() => setActiveId(null)} aria-label="Schließen" className="-mr-2 -mt-1 p-2 text-white/60 hover:text-white">
                      <span aria-hidden="true" className="block text-xl leading-none">×</span>
                    </button>
                  </div>
                  <p className="mt-4 leading-relaxed text-white/75">{active.text}</p>
                  <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
                    {active.service.price && <span className="font-display text-2xl tabular-nums">{active.service.price}</span>}
                    <Link
                      href={active.service.href}
                      className="inline-flex min-h-11 items-center gap-3 bg-white px-5 text-[0.6875rem] font-medium uppercase tracking-[0.2em] text-black transition-colors hover:bg-mist"
                    >
                      {props.ctaLabel}
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <p className="mt-3 text-[0.5625rem] leading-relaxed text-white/40">
            Modell: {props.model.title} ·{" "}
            <a href={props.model.credit.sourceUrl} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-white/70">{props.model.credit.author}</a>{" "}
            ·{" "}
            <a href={props.model.credit.licenseUrl} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-white/70">{props.model.credit.license}</a>
          </p>
        </div>
      </div>
    </section>
  );
}
