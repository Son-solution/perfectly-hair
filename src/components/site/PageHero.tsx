import type { ReactNode } from "react";
import { Rise } from "@/components/motion";
import { SalonImage } from "@/components/media/SalonImage";
import { ButtonLink } from "@/components/ui/primitives";
import type { Cta, MediaAsset } from "@/content/schema";

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
  ctas = [],
  stockLabel = "Symbolbild",
  placeholderLabel = "Bild folgt",
  children,
}: {
  eyebrow: string;
  title: string;
  italic?: string;
  intro?: ReactNode;
  image?: MediaAsset;
  ctas?: Cta[];
  stockLabel?: string;
  placeholderLabel?: string;
  children?: ReactNode;
}) {
  return (
    <section className="grain relative overflow-hidden bg-ink text-white">
      <div
        className={
          image
            ? "container-luxe relative grid gap-12 pb-4 pt-[calc(var(--safe-top)+1.5rem)] md:grid-cols-12 md:items-end md:pb-8"
            : "container-luxe relative pb-4 pt-[calc(var(--safe-top)+3rem)] md:pb-8 md:pt-[calc(var(--safe-top)+6rem)]"
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
            <span className="-mb-[0.18em] -mt-[0.2em] block overflow-hidden pb-[0.26em] pt-[0.2em]">
              <span className="animate-mask-up block text-[clamp(3.2rem,9vw,9rem)]">{title}</span>
            </span>
            {italic && (
              <span className="-mb-[0.2em] -mt-[0.2em] block overflow-hidden pb-[0.32em] pt-[0.2em]">
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
          {(ctas.length > 0 || children) && (
            <Rise delay={0.35} className="mt-10 flex flex-wrap gap-4">
              {ctas.map((c) => (
                <ButtonLink key={c.href + c.label} href={c.href} tone="light" variant={c.variant}>
                  {c.label}
                </ButtonLink>
              ))}
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
                {image.credit ? stockLabel : placeholderLabel}
              </span>
            </div>
          </Rise>
        )}
      </div>

      {/* Outlined echo of the title: in-flow band below the content, cropped by the section edge
          (intended decorative clipping) — it never sits behind text or buttons. */}
      <p
        aria-hidden="true"
        className="pointer-events-none -mb-[0.24em] select-none whitespace-nowrap pl-[clamp(1rem,4vw,4rem)] font-display text-[clamp(5rem,19vw,19rem)] italic leading-[0.9] text-outline-light opacity-70"
      >
        {title}
      </p>
    </section>
  );
}
