"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Tracks whether a section is on screen AND the tab is visible.
 * - Returns `live` for pausing JS loops (intervals, rAF).
 * - Sets `data-paused` on the element so CSS loops inside it pause too
 *   (see the [data-paused] rule in globals.css).
 * Defaults to live=true before hydration so nothing is hidden waiting for JS.
 */
export function useLiveSection<T extends HTMLElement>(rootMargin = "0px") {
  const ref = useRef<T>(null);
  const [onScreen, setOnScreen] = useState(true);
  const [tabVisible, setTabVisible] = useState(true);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([entry]) => setOnScreen(entry.isIntersecting), {
      rootMargin,
    });
    io.observe(el);
    return () => io.disconnect();
  }, [rootMargin]);

  useEffect(() => {
    const onVis = () => setTabVisible(document.visibilityState === "visible");
    onVis();
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  const live = onScreen && tabVisible;

  useEffect(() => {
    ref.current?.setAttribute("data-paused", live ? "false" : "true");
  }, [live]);

  return { ref, live };
}
