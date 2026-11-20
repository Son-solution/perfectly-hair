"use client";

import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  type AnimationPlaybackControls,
} from "motion/react";
import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Seamless, infinite horizontal drift. Content is rendered twice and the track
 * moves by exactly one copy's width. Pauses on hover and keyboard focus.
 */
export function Marquee({
  children,
  durationS = 60,
  className,
  label,
}: {
  children: ReactNode;
  durationS?: number;
  className?: string;
  /** Accessible description of the moving content. */
  label: string;
}) {
  const reduce = useReducedMotion();
  const x = useMotionValue("0%");
  const controls = useRef<AnimationPlaybackControls | null>(null);

  useEffect(() => {
    if (reduce) return;
    controls.current = animate(x, ["0%", "-50%"], {
      duration: durationS,
      ease: "linear",
      repeat: Infinity,
    });
    return () => controls.current?.stop();
  }, [reduce, durationS, x]);

  const pause = () => controls.current?.pause();
  const play = () => controls.current?.play();

  return (
    <div
      className={cn("overflow-hidden", className)}
      role="region"
      aria-label={label}
      onMouseEnter={pause}
      onMouseLeave={play}
      onFocus={pause}
      onBlur={play}
    >
      <motion.div className="flex w-max" style={{ x }}>
        <div className="flex shrink-0">{children}</div>
        <div className="flex shrink-0" aria-hidden="true">
          {children}
        </div>
      </motion.div>
    </div>
  );
}
