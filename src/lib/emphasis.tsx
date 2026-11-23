import { Fragment, type ReactNode } from "react";

/**
 * Minimal, safe inline markup for editable headlines: `*text*` → italic accent.
 * No HTML is ever interpreted, so CMS content cannot inject markup.
 */
export function emphasis(text: string, italicClass = "italic"): ReactNode {
  const parts = text.split(/(\*[^*]+\*)/g).filter(Boolean);
  return parts.map((part, i) =>
    part.startsWith("*") && part.endsWith("*") ? (
      <span key={i} className={italicClass}>
        {part.slice(1, -1)}
      </span>
    ) : (
      <Fragment key={i}>{part}</Fragment>
    ),
  );
}

/** Removes the markup (for SEO titles, aria labels). */
export const plain = (text: string) => text.replace(/\*/g, "");
