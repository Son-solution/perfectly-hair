import Link from "next/link";
import { Reveal } from "@/components/motion";
import { MaskLines } from "@/components/motion/MaskLines";
import { SalonImage } from "@/components/media/SalonImage";
import { GalleryGrid } from "@/components/site/GalleryGrid";
import type { GalleryItem, MediaAsset, SectionOf } from "@/content/schema";
import { cn } from "@/lib/utils";

type Item = { id: string; group: GalleryItem["group"]; ratio: GalleryItem["ratio"]; image: MediaAsset; caption: string | null };

export function GalleryGridSection({
  section, items, filterLabels,
}: {
  section: SectionOf<"gallery-grid">;
  items: Item[];
  filterLabels: Record<string, string>;
}) {
  const portfolio = section.collection === "portfolio";
  const hasRealWork = items.some((i) => i.image.src);
  return (
    <section aria-labelledby={section.id} className={cn("py-24 md:py-36", portfolio && "bg-bone")}>
      <div className="container-luxe">
        <div className="mb-14 grid gap-10 md:grid-cols-12 md:items-end">
          <div className="md:col-span-6">
            <p className="flex items-center gap-4 text-eyebrow uppercase text-stone">
              <span aria-hidden="true" className="h-px w-10 bg-current" />
              {section.eyebrow}
            </p>
            <MaskLines
              id={section.id}
              className="mt-6 font-display text-[clamp(2.8rem,6vw,6rem)] font-normal leading-[0.92]"
              lines={[section.title, <span key="i" className="italic text-graphite">{section.italic}</span>]}
            />
            {portfolio && !hasRealWork && section.emptyText && <p className="mt-8 max-w-md leading-relaxed text-graphite">{section.emptyText}</p>}
          </div>
          {section.notice && (
            <Reveal delay={0.1} className="md:col-span-5 md:col-start-8">
              <div role="note" className="border border-ink bg-white p-6 md:p-8">
                <p className="flex items-center gap-3 text-eyebrow font-medium uppercase">
                  <span aria-hidden="true" className="h-2 w-2 animate-breathe rounded-full bg-ink" />
                  Symbolbilder
                </p>
                <p className="mt-4 leading-relaxed text-graphite">
                  {section.notice}{" "}
                  <Link href="/bildnachweise" className="underline underline-offset-4">Bildnachweise</Link>
                </p>
              </div>
            </Reveal>
          )}
        </div>

        {portfolio ? (
          <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5">
            {items.map((item, i) => (
              <Reveal
                as="li"
                key={item.id}
                delay={i * 0.08}
                className={cn("relative overflow-hidden", i === 1 ? "col-span-2 aspect-[16/9] md:col-span-1 md:aspect-[4/5]" : "aspect-[4/5]")}
              >
                <SalonImage image={item.image} tone="light" sizes="(min-width: 768px) 33vw, 50vw" />
              </Reveal>
            ))}
          </ul>
        ) : (
          <GalleryGrid
            filterLabels={filterLabels}
            items={items.map((item) => ({
              id: item.id,
              group: item.group,
              ratio: item.ratio,
              node: <SalonImage image={item.image} sizes="(min-width: 768px) 33vw, 50vw" />,
            }))}
          />
        )}
      </div>
    </section>
  );
}
