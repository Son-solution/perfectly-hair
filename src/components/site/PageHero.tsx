import type { ReactNode } from "react";
import { KenBurns, Rise } from "@/components/motion";
import { SalonImage } from "@/components/media/SalonImage";
import { Container, Eyebrow } from "@/components/ui/primitives";
import type { ImageAsset } from "@/content/images";

/**
 * Dark editorial hero shared by all inner pages. With an image it becomes a
 * split composition (text left, slowly moving image right).
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
    <section className="relative overflow-hidden bg-ink text-white">
      <Container
        className={
          image
            ? "grid gap-12 pb-16 pt-32 md:grid-cols-12 md:items-end md:pb-24 md:pt-44"
            : "pb-16 pt-36 md:pb-28 md:pt-52"
        }
      >
        <div className={image ? "md:col-span-7" : "max-w-5xl"}>
          <Rise>
            <Eyebrow className="flex items-center gap-4 text-ash">
              <span aria-hidden="true" className="h-px w-10 bg-ash/60" />
              {eyebrow}
            </Eyebrow>
          </Rise>
          <Rise delay={0.12}>
            <h1 className="mt-8 font-display text-display-xl font-normal">
              {title}
              {italic && <span className="mt-2 block italic text-white/70">{italic}</span>}
            </h1>
          </Rise>
          {intro && (
            <Rise delay={0.24}>
              <div className="mt-10 max-w-xl text-lg leading-relaxed text-ash">{intro}</div>
            </Rise>
          )}
          {children && (
            <Rise delay={0.36} className="mt-10">
              {children}
            </Rise>
          )}
        </div>

        {image && (
          <Rise delay={0.2} className="md:col-span-5">
            <KenBurns className="aspect-[4/5] w-full">
              <SalonImage image={image} sizes="(min-width: 768px) 40vw, 100vw" eager />
            </KenBurns>
          </Rise>
        )}
      </Container>
    </section>
  );
}
