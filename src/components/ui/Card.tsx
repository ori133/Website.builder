import type { ReactNode } from "react";
import { cx } from "./cx";

/** Standard content card (glass on dark). */
export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cx("rounded-panel border border-line bg-surface/70 p-6 transition hover:border-line-strong", className)}>{children}</div>
  );
}

/** The big rounded aurora container from the reference hero. */
export function HeroCard({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cx(
        "relative isolate overflow-hidden rounded-[1.75rem] border border-line-strong bg-aurora shadow-card sm:rounded-card",
        className,
      )}
    >
      {children}
    </div>
  );
}

/** Frosted-glass panel for inputs and overlays. */
export function GlassPanel({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cx("rounded-panel border border-line-strong bg-glass", className)}>{children}</div>;
}
