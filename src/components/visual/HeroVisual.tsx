"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import CubesFallback from "./CubesFallback";

const CubesScene = dynamic(() => import("./CubesScene"), { ssr: false, loading: () => <CubesFallback /> });

const subscribeMotion = (cb: () => void) => {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};
const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function hasWebGL() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}
const noopSubscribe = () => () => {};

/**
 * Looping 3D cube cluster. Loads three.js lazily, pauses offscreen,
 * and falls back to a static CSS composition without WebGL / with reduced motion.
 */
export default function HeroVisual({ className = "", period, spread }: { className?: string; period?: number; spread?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const reduce = useSyncExternalStore(subscribeMotion, reducedMotion, () => true);
  const webgl = useSyncExternalStore(noopSubscribe, hasWebGL, () => false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { rootMargin: "100px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const live = webgl && !reduce;
  return (
    <div ref={ref} className={className} aria-hidden="true">
      {live ? <CubesScene period={period} spread={spread} paused={!visible} /> : <CubesFallback />}
    </div>
  );
}
