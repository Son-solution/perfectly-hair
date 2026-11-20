import { cn } from "@/lib/utils";

/**
 * Abstract monochrome artwork used where a real photograph is still missing.
 * Flowing hairlines evoke hair without depicting anything real. Deterministic
 * per `seed` (no randomness → identical on server and client).
 */

function strands(seed: number, count: number) {
  const paths: string[] = [];
  const phase = seed * 1.7;
  for (let i = 0; i < count; i++) {
    const t = i / count;
    const y0 = 8 + t * 84;
    const amp = 10 + 14 * Math.sin(phase + t * 3);
    const c1 = y0 + amp * Math.sin(phase + i * 0.35);
    const c2 = y0 - amp * Math.cos(phase * 0.6 + i * 0.25);
    const y1 = y0 + 18 * Math.sin(phase * 0.4 + t * 2);
    paths.push(
      `M -10 ${y0.toFixed(2)} C 30 ${c1.toFixed(2)}, 70 ${c2.toFixed(2)}, 110 ${y1.toFixed(2)}`,
    );
  }
  return paths;
}

export function ArtPlaceholder({
  seed = 1,
  label = "Bild folgt",
  tone = "dark",
  className,
  showLabel = true,
}: {
  seed?: number;
  label?: string;
  tone?: "dark" | "light";
  className?: string;
  showLabel?: boolean;
}) {
  const lines = strands(seed, 26);
  const light = tone === "light";
  const focusX = 20 + ((seed * 37) % 60);
  const focusY = 15 + ((seed * 23) % 50);

  return (
    <div
      role="img"
      aria-label={`${label} (Platzhalter)`}
      className={cn(
        "grain relative h-full w-full overflow-hidden",
        light ? "bg-bone text-stone" : "bg-ink text-ash",
        className,
      )}
      style={{
        backgroundImage: light
          ? `radial-gradient(ellipse at ${focusX}% ${focusY}%, #ffffff 0%, #f2f2f2 45%, #d9d9d9 100%)`
          : `radial-gradient(ellipse at ${focusX}% ${focusY}%, #3a3a3a 0%, #1c1c1c 40%, #0a0a0a 100%)`,
      }}
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 h-full w-full animate-drift"
        style={{ animationDelay: `-${(seed * 7) % 38}s` }}
      >
        <g
          fill="none"
          stroke={light ? "#0a0a0a" : "#ffffff"}
          strokeWidth="1"
          strokeOpacity={light ? 0.14 : 0.1}
          vectorEffect="non-scaling-stroke"
        >
          {lines.map((d, i) => (
            <path key={i} d={d} vectorEffect="non-scaling-stroke" />
          ))}
        </g>
      </svg>
      {showLabel && (
        <span className="absolute bottom-4 left-4 text-[0.625rem] uppercase tracking-[0.3em] md:bottom-5 md:left-5">
          {label}
        </span>
      )}
    </div>
  );
}
