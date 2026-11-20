import type { ReactNode } from "react";
import { Rise } from "@/components/motion";
import { SalonImage } from "@/components/media/SalonImage";
import type { ImageAsset } from "@/content/images";

/**
 * Dark editorial hero shared by all inner pages ("Noir Atelier").
 * Oversized masked title (pure CSS, visible without JS); with an image it becomes a
 * layered composition: framed photo with a strong continuous zoom and an outlined
 * echo of the title behind it.
 */
export function PageHero({
  eyebrow,
  title,
  italic,
  intro,
  image,
  children,
}: {
  eyebrow: string;
  title: string;
  italic?: string;
  intro?: ReactNode;
  image?: ImageAsset;
  children?: ReactNode;
}) {
  return (
    <section className="grain relative overflow-hidden bg-ink text-white">
      {/* Outlined echo of the title */}
      <p
        aria-hidden="true"
        className="pointer-events-none absolute -right-[0.05em] bottom-[-0.18em] select-none font-display text-[28vw] italic leading-none text-outline-light opacity-60"
      >
        {title}
      </p>

      <div
        className={
          image
            ? "container-luxe relative grid gap-12 pb-16 pt-32 md:grid-cols-12 md:items-end md:pb-24 md:pt-40"
            : "container-luxe relative pb-20 pt-36 md:pb-32 md:pt-52"
        }
      >
        <div className={image ? "md:col-span-7" : "max-w-6xl"}>
          <Rise>
            <p className="flex items-center gap-4 text-eyebrow uppercase text-white/60">
              <span aria-hidden="true" className="h-px w-10 bg-white/50" />
              {eyebrow}
            </p>
          </Rise>
          <h1 className="mt-8 font-display font-normal leading-[0.9]">
            <span className="block overflow-hidden pb-[0.06em]">
              <span className="animate-mask-up block text-[clamp(3.2rem,9vw,9rem)]">{title}</span>
            </span>
            {italic && (
              <span className="block overflow-hidden pb-[0.1em]">
                <span
                  className="animate-mask-up block text-[clamp(2rem,5vw,5rem)] italic text-white/70"
                  style={{ animationDelay: "0.12s" }}
                >
                  {italic}
                </span>
              </span>
            )}
          </h1>
          {intro && (
            <Rise delay={0.25}>
              <div className="mt-10 max-w-xl text-lg leading-relaxed text-white/65">{intro}</div>
            </Rise>
          )}
          {children && (
            <Rise delay={0.35} className="mt-10">
              {children}
            </Rise>
          )}
        </div>

        {image && (
          <Rise delay={0.2} className="md:col-span-5">
            <div className="relative aspect-[4/5] w-full overflow-hidden shadow-[0_60px_100px_-40px_rgba(0,0,0,0.9)]">
              <div className="absolute inset-0 animate-ken-strong">
                <SalonImage image={image} sizes="(min-width: 768px) 40vw, 100vw" eager showLabel={false} />
              </div>
              {/* Label outside the zooming layer so it always stays in frame */}
              <span className="absolute bottom-4 left-4 bg-black/40 px-2 py-1 text-[0.5625rem] uppercase tracking-[0.28em] text-white/85 backdrop-blur-sm">
                {image.credit ? "Symbolbild" : "Bild folgt"}
              </span>
            </div>
          </Rise>
        )}
      </div>
    </section>
  );
}
