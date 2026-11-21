"use client";

import { motion, useInView } from "motion/react";
import { useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

const ease = [0.22, 1, 0.36, 1] as const;

/**
 * Text revealed line by line through a mask when it enters the viewport.
 *
 * The in-view check observes the (always visible) heading element itself — NOT the
 * masked inner spans. Observing the inner spans was a bug: they start translated below
 * their overflow-hidden mask, so the browser reports 0 px visible and long, wrapping
 * lines never revealed.
 *
 * Each mask gets extra bottom padding (offset by a negative margin) so descenders
 * (g, y, p) are not clipped at tight display line-heights.
 * For above-the-fold headings use the CSS `animate-mask-up` class instead.
 */
export function MaskLines({
  lines,
  as: Tag = "h2",
  className,
  lineClassName,
  delay = 0,
  id,
}: {
  lines: ReadonlyArray<ReactNode>;
  as?: "h1" | "h2" | "h3" | "p";
  className?: string;
  lineClassName?: string;
  delay?: number;
  id?: string;
}) {
  const ref = useRef<HTMLHeadingElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -8% 0px" });

  return (
    <Tag ref={ref} id={id} className={className}>
      {lines.map((line, i) => (
        <span key={i} className="-mb-[0.16em] block overflow-hidden pb-[0.28em]">
          <motion.span
            className={cn("block", lineClassName)}
            initial={{ y: "108%" }}
            animate={{ y: inView ? "0%" : "108%" }}
            transition={{ duration: 1.15, ease, delay: delay + i * 0.11 }}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </Tag>
  );
}
