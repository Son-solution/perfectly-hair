"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type Group = "alle" | "damen" | "herren" | "kinder" | "salon";

const filters: ReadonlyArray<{ id: Group; label: string }> = [
  { id: "alle", label: "Alle" },
  { id: "damen", label: "Damen" },
  { id: "herren", label: "Herren" },
  { id: "kinder", label: "Kinder" },
  { id: "salon", label: "Salon" },
];

/**
 * Filterable gallery. Images are rendered on the server and passed in as
 * `items[].node`, so swapping placeholders for real photos needs no change here.
 */
export function GalleryGrid({
  items,
}: {
  items: ReadonlyArray<{
    id: string;
    group: Exclude<Group, "alle">;
    ratio: "portrait" | "landscape" | "square";
    node: ReactNode;
  }>;
}) {
  const [active, setActive] = useState<Group>("alle");
  const visible = items.filter((i) => active === "alle" || i.group === active);

  return (
    <div>
      <div role="group" aria-label="Galerie filtern" className="flex flex-wrap gap-x-8 gap-y-3 border-b border-mist pb-5">
        {filters.map((f) => (
          <button
            key={f.id}
            type="button"
            aria-pressed={active === f.id}
            onClick={() => setActive(f.id)}
            className={cn(
              "relative py-1 text-[0.75rem] uppercase tracking-[0.24em] transition-colors duration-500",
              active === f.id ? "text-ink" : "text-stone hover:text-ink",
            )}
          >
            {f.label}
            {active === f.id && (
              <motion.span
                layoutId="gallery-filter"
                aria-hidden="true"
                className="absolute inset-x-0 -bottom-[1.3rem] h-px bg-ink"
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              />
            )}
          </button>
        ))}
      </div>

      <p className="sr-only" aria-live="polite">
        {visible.length} Bilder angezeigt
      </p>

      <motion.ul layout className="mt-12 grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5">
        <AnimatePresence mode="popLayout">
          {visible.map((item) => (
            <motion.li
              key={item.id}
              layout
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className={cn(
                "group relative overflow-hidden",
                item.ratio === "portrait" && "row-span-2 aspect-[3/4] md:aspect-auto",
                item.ratio === "square" && "aspect-square",
                item.ratio === "landscape" && "col-span-2 aspect-[16/9] md:col-span-1 md:aspect-[4/3]",
              )}
            >
              <div className="absolute inset-0 transition-transform duration-[1600ms] ease-luxe group-hover:scale-[1.04]">
                {item.node}
              </div>
            </motion.li>
          ))}
        </AnimatePresence>
      </motion.ul>
    </div>
  );
}
