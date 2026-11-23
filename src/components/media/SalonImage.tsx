import Image from "next/image";
import type { ImageAsset } from "@/content/images";
import { cn } from "@/lib/utils";
import { ArtPlaceholder } from "./ArtPlaceholder";

/**
 * Single replaceable image slot. Fills its (relatively positioned) parent.
 * - Photos render through next/image (responsive srcset, modern formats, lazy by default),
 *   cropped with object-cover — never stretched — around the asset's focal point.
 * - Stock photos (asset has `credit`) carry a small "Symbolbild" label so they are never
 *   mistaken for the salon's own work.
 * - Missing photos render the abstract placeholder ("Bild folgt").
 */
export function SalonImage({
  image,
  sizes = "100vw",
  eager = false,
  preload = false,
  tone = "dark",
  className,
  showLabel = true,
}: {
  image: ImageAsset;
  sizes?: string;
  /** Above-the-fold image: load eagerly with high fetch priority. */
  eager?: boolean;
  /** Load now at normal priority (e.g. upcoming slider slides), so it is ready before it shows. */
  preload?: boolean;
  tone?: "dark" | "light";
  className?: string;
  /** Show "Bild folgt" / "Symbolbild" label. Disable only where a caption is shown nearby. */
  showLabel?: boolean;
}) {
  if (!image.src) {
    return (
      <ArtPlaceholder
        seed={image.seed}
        tone={tone}
        label="Bild folgt"
        showLabel={showLabel}
        className={cn("absolute inset-0", className)}
      />
    );
  }

  return (
    <>
      <Image
        src={image.src}
        alt={image.alt}
        fill
        sizes={sizes}
        loading={eager || preload ? "eager" : "lazy"}
        fetchPriority={eager ? "high" : "auto"}
        className={cn("object-cover grayscale", className)}
        style={image.position ? { objectPosition: image.position } : undefined}
      />
      {showLabel && image.credit && (
        <span className="pointer-events-none absolute bottom-3 left-3 bg-black/40 px-2 py-1 text-[0.5625rem] uppercase tracking-[0.28em] text-white/85 backdrop-blur-sm md:bottom-4 md:left-4">
          Symbolbild
        </span>
      )}
    </>
  );
}
