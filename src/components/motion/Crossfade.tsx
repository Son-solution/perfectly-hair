"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Children, useEffect, useState, type ReactNode } from "react";

/** Cycles through its children with long, elegant dissolves. */
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
      <AnimatePresence initial={false}>
        <motion.div
          key={index}
          className="relative h-full min-h-0 w-full"
          style={{ gridArea: "1 / 1" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduce ? 0 : fadeS, ease: "easeInOut" }}
        >
          {items[index]}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
