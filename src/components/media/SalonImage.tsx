import Image from "next/image";
import type { ImageAsset } from "@/content/images";
import { cn } from "@/lib/utils";
import { ArtPlaceholder } from "./ArtPlaceholder";

/**
 * Single replaceable image slot. Fills its (relatively positioned) parent.
 * Real photos render through next/image in grayscale; missing ones render
 * the abstract placeholder.
 */
export function SalonImage({
  image,
  sizes = "100vw",
  eager = false,
  tone = "dark",
  className,
  showLabel,
}: {
  image: ImageAsset;
  sizes?: string;
  /** Above-the-fold image: load eagerly with high fetch priority. */
  eager?: boolean;
  tone?: "dark" | "light";
  className?: string;
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
    <Image
      src={image.src}
      alt={image.alt}
      fill
      sizes={sizes}
      loading={eager ? "eager" : "lazy"}
      fetchPriority={eager ? "high" : "auto"}
      className={cn("object-cover grayscale", className)}
    />
  );
}
