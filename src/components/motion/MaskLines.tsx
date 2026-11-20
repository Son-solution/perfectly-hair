"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const ease = [0.22, 1, 0.36, 1] as const;

/**
 * Text revealed line by line through a mask when it enters the viewport.
 * For below-the-fold headings; above the fold use the CSS `animate-mask-up` class.
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
  return (
    <Tag id={id} className={className}>
      {lines.map((line, i) => (
        <span key={i} className="block overflow-hidden pb-[0.08em]">
          <motion.span
            className={cn("block", lineClassName)}
            initial={{ y: "108%" }}
            whileInView={{ y: "0%" }}
            viewport={{ once: true, margin: "0px 0px -8% 0px" }}
            transition={{ duration: 1.15, ease, delay: delay + i * 0.11 }}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </Tag>
  );
}
