"use client";

import { motion, useReducedMotion } from "motion/react";
import { Children, useEffect, useState, type ReactNode } from "react";

/**
 * Cycles through its children with long, elegant dissolves.
 * All slides stay mounted and stacked, so images are already loaded before
 * their turn (no pop-in); only opacity changes.
 */
export function Crossfade({
  children,
  holdMs = 7000,
  fadeS = 1.8,
  className,
}: {
  children: ReactNode;
  holdMs?: number;
  fadeS?: number;
  className?: string;
}) {
  const items = Children.toArray(children);
  const [index, setIndex] = useState(0);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce || items.length < 2) return;
    const id = window.setInterval(
      () => setIndex((i) => (i + 1) % items.length),
      holdMs,
    );
    return () => window.clearInterval(id);
  }, [reduce, items.length, holdMs]);

  return (
    <div
      className={className}
      style={{ display: "grid", gridTemplateColumns: "1fr", gridTemplateRows: "1fr" }}
    >
      {items.map((item, i) => (
        <motion.div
          key={i}
          aria-hidden={i === index ? undefined : true}
          className="relative h-full min-h-0 w-full"
          style={{ gridArea: "1 / 1" }}
          initial={false}
          animate={{ opacity: i === index ? 1 : 0 }}
          transition={{ duration: reduce ? 0 : fadeS, ease: "easeInOut" }}
        >
          {item}
        </motion.div>
      ))}
    </div>
  );
}
