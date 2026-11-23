import Link from "next/link";
import { KenBurns, Reveal } from "@/components/motion";
import { LiveBand } from "@/components/motion/LiveBand";
import { MaskLines } from "@/components/motion/MaskLines";
import { SalonImage } from "@/components/media/SalonImage";
import type { Category, MediaAsset, SectionOf } from "@/content/schema";
import { emphasis } from "@/lib/emphasis";
import { cn } from "@/lib/utils";

type CategoryWithImage = Category & { hero: MediaAsset };

function Eyebrow({ children, dark }: { children: string; dark?: boolean }) {
  return (
    <p className={cn("flex items-center gap-4 text-eyebrow uppercase", dark ? "text-white/60" : "text-stone")}>
      <span aria-hidden="true" className="h-px w-10 bg-current" />
      {children}
    </p>
  );
}

/* ------------------------------------------------------------------ principles */

export function PrinciplesSection({
  section, principles, image,
}: {
  section: SectionOf<"principles">;
  principles: { title: string; text: string }[];
  image: MediaAsset;
}) {
  return (
    <section aria-labelledby={section.id} className="py-24 md:py-40">
      <div className="container-luxe grid gap-16 md:grid-cols-12">
        <div className="md:col-span-5">
          <Eyebrow>{section.eyebrow}</Eyebrow>
          <MaskLines
            id={section.id}
            className="mt-6 font-display text-[clamp(2.8rem,6vw,6rem)] font-normal leading-[0.92]"
            lines={[section.title, <span key="i" className="italic text-graphite">{section.italic}</span>]}
          />
          <Reveal delay={0.15} className="mt-14">
            <div className="relative aspect-[4/5] w-full overflow-hidden md:w-4/5">
              <KenBurns className="absolute inset-0" delay={10}>
                <SalonImage image={image} tone="light" sizes="(min-width: 768px) 30vw, 100vw" />
              </KenBurns>
            </div>
          </Reveal>
        </div>
        <ol className="md:col-span-6 md:col-start-7 md:pt-28">
          {principles.map((p, i) => (
            <Reveal as="li" key={p.title} delay={i * 0.1} className="border-t border-mist py-10 first:border-t-0 first:pt-0 md:py-14">
              <p className="text-eyebrow uppercase text-stone">{String(i + 1).padStart(2, "0")}</p>
              <h3 className="mt-4 font-display text-4xl md:text-6xl">{p.title}</h3>
              <p className="mt-5 max-w-md leading-relaxed text-graphite">{p.text}</p>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ values */

export function ValuesSection({ section }: { section: SectionOf<"values"> }) {
  return (
    <section aria-labelledby={section.id} className="py-24 md:py-40">
      <div className="container-luxe">
        <Eyebrow>{section.eyebrow}</Eyebrow>
        <MaskLines
          id={section.id}
          className="mt-6 font-display text-[clamp(2.8rem,7vw,7rem)] font-normal leading-[0.92]"
          lines={section.titleLines.map((l) => emphasis(l, "italic text-graphite"))}
        />
        <ol className="mt-16 grid border-t border-mist md:mt-24 md:grid-cols-3">
          {section.items.map((v, i) => (
            <Reveal
              as="li"
              key={v.title}
              delay={i * 0.1}
              className="group border-b border-mist py-10 md:border-b-0 md:px-10 md:py-14 md:first:pl-0 md:[&:not(:first-child)]:border-l"
            >
              <p className="text-eyebrow uppercase text-stone">{String(i + 1).padStart(2, "0")}</p>
              <h3 className="mt-6 font-display text-5xl italic transition-transform duration-700 ease-luxe group-hover:translate-x-2 md:text-6xl">{v.title}</h3>
              <p className="mt-5 max-w-xs leading-relaxed text-graphite">{v.text}</p>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ editorial-split */

export function EditorialSplitSection({
  section, images, placeholderLabel,
}: {
  section: SectionOf<"editorial-split">;
  images: MediaAsset[];
  placeholderLabel: string;
}) {
  const dark = section.tone === "dark";
  void placeholderLabel;
  return (
    <section aria-labelledby={section.id} className={cn("py-24 md:py-40", dark ? "bg-ink text-white" : "bg-bone text-ink")}>
      <div className="container-luxe grid grid-cols-12 items-end gap-x-4 gap-y-14 md:gap-x-6">
        <div className="col-span-12 md:col-span-5">
          <Eyebrow dark={dark}>{section.eyebrow}</Eyebrow>
          <MaskLines
            id={section.id}
            className="mt-6 font-display text-[clamp(2.8rem,6vw,6rem)] font-normal leading-[0.92]"
            lines={section.titleLines.map((l) => emphasis(l, dark ? "italic text-white/65" : "italic text-graphite"))}
          />
          {section.paragraphs.map((p) => (
            <Reveal key={p} delay={0.15}>
              <p className={cn("mt-8 max-w-md leading-relaxed", dark ? "text-white/70" : "text-graphite")}>{p}</p>
            </Reveal>
          ))}
        </div>
        <Reveal className="col-span-7 md:col-span-4 md:col-start-7">
          <div className="relative aspect-[4/5] overflow-hidden">
            <KenBurns className="absolute inset-0" delay={3}>
              <SalonImage image={images[0]} tone={dark ? "dark" : "light"} sizes="(min-width: 768px) 33vw, 60vw" />
            </KenBurns>
          </div>
        </Reveal>
        {images[1] && (
          <Reveal delay={0.15} className="col-span-5 -mb-10 md:col-span-2 md:mb-24">
            <div className="relative aspect-[3/4] overflow-hidden">
              <KenBurns className="absolute inset-0" delay={11}>
                <SalonImage image={images[1]} sizes="20vw" />
              </KenBurns>
            </div>
          </Reveal>
        )}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ marquee */

export function MarqueeSection({ section }: { section: SectionOf<"marquee"> }) {
  const dark = section.tone === "dark";
  const run = (copy: number) => (
    <span aria-hidden={copy === 1 ? true : undefined} className="flex shrink-0 items-center">
      {section.words.map((w, i) => (
        <span key={`${w}-${i}`} className="flex items-center">
          <span className={i % 2 === 1 ? (dark ? "italic text-outline-light" : "italic text-outline-dark") : ""}>{w}</span>
          <span aria-hidden="true" className="mx-[0.4em] text-[0.35em] opacity-50">◆</span>
        </span>
      ))}
    </span>
  );
  return (
    <LiveBand className={cn("overflow-x-clip border-y py-[clamp(1rem,2.5vw,2.25rem)]", dark ? "border-white/10 bg-ink text-white" : "border-mist bg-paper text-ink")}>
      <div className="animate-marquee flex w-max items-center whitespace-nowrap font-display text-[clamp(3rem,8vw,7.5rem)] leading-[1.2] [animation-duration:52s]">
        {run(0)}
        {run(1)}
      </div>
    </LiveBand>
  );
}

/* ------------------------------------------------------------------ notice */

export function NoticeSection({ section }: { section: SectionOf<"notice"> }) {
  return (
    <section className="bg-bone py-16">
      <div className="container-luxe">
        <div role="note" className="max-w-3xl border border-ink bg-white p-6 md:p-8">
          <p className="flex items-center gap-3 text-eyebrow font-medium uppercase">
            <span aria-hidden="true" className="h-2 w-2 animate-breathe rounded-full bg-ink" />
            {section.title}
          </p>
          <p className="mt-4 leading-relaxed text-graphite">{section.text}</p>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ audience-index */

export function AudienceIndexSection({ section, categories }: { section: SectionOf<"audience-index">; categories: CategoryWithImage[] }) {
  return (
    <section aria-label={section.eyebrow} className="py-24 md:py-40">
      <div className="container-luxe">
        <Eyebrow>{section.eyebrow}</Eyebrow>
        <ul className="mt-12 divide-y divide-mist border-y border-mist">
          {categories.map((c, i) => (
            <Reveal as="li" key={c.slug} delay={i * 0.08}>
              <Link href={`/${c.slug}`} className="group grid items-center gap-6 py-10 md:grid-cols-12 md:py-14">
                <span className="text-eyebrow uppercase text-stone md:col-span-1">{c.numeral}</span>
                <span className="font-display text-[clamp(2.8rem,6vw,6rem)] leading-none transition-transform duration-700 ease-luxe group-hover:translate-x-3 group-hover:italic md:col-span-4">
                  {c.label}
                </span>
                <span className="max-w-sm leading-relaxed text-graphite md:col-span-4">
                  {c.teaser}
                  <span className="mt-3 block text-[0.6875rem] uppercase tracking-[0.24em] text-ink">Entdecken →</span>
                </span>
                <div className="relative hidden aspect-[4/3] overflow-hidden md:col-span-3 md:block">
                  <KenBurns className="absolute inset-0" delay={i * 6}>
                    <div className="absolute inset-0 grayscale transition-transform duration-[1600ms] ease-luxe group-hover:scale-110">
                      <SalonImage image={c.hero} sizes="25vw" showLabel={false} />
                    </div>
                  </KenBurns>
                </div>
              </Link>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ other-audiences */

export function OtherAudiencesSection({ section, categories }: { section: SectionOf<"other-audiences">; categories: CategoryWithImage[] }) {
  return (
    <section aria-label={section.eyebrow} className="py-24 md:py-36">
      <div className="container-luxe">
        <Eyebrow>{section.eyebrow}</Eyebrow>
        <ul className="mt-10 grid gap-6 sm:grid-cols-2">
          {categories.map((a, i) => (
            <Reveal as="li" key={a.slug} delay={i * 0.1}>
              <Link href={`/${a.slug}`} className="group relative flex aspect-[16/10] items-end overflow-hidden bg-ink p-6 text-white md:p-10">
                <div className="absolute inset-0 animate-ken-strong opacity-70 transition-opacity duration-[1400ms] group-hover:opacity-95">
                  <SalonImage image={a.hero} sizes="(min-width: 640px) 50vw, 100vw" showLabel={false} />
                </div>
                <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(0deg,rgba(10,10,10,0.85),transparent_65%)]" />
                <div className="relative flex w-full items-baseline justify-between">
                  <span className="font-display text-5xl group-hover:italic md:text-7xl">{a.label}</span>
                  <span aria-hidden="true" className="h-px w-8 bg-white transition-[width] duration-700 ease-luxe group-hover:w-16" />
                </div>
              </Link>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
