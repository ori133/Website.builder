"use client";

import { useLayoutEffect } from "react";

type Theme = "light" | "dark";

function readTheme(): Theme {
  try {
    const stored = localStorage.getItem("theme");
    if (stored === "light" || stored === "dark") return stored;
  } catch {}
  return matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function apply(theme: Theme) {
  document.documentElement.setAttribute("data-theme", theme);
  try {
    localStorage.setItem("theme", theme);
  } catch {}
}

const base =
  "grid size-9 place-items-center rounded-full text-muted transition-colors hover:text-foreground";

export default function ThemeToggle() {
  // React Strict Mode (dev) can clear the attribute set by the inline script;
  // re-apply it before paint. No-op in production.
  useLayoutEffect(() => {
    document.documentElement.setAttribute("data-theme", readTheme());
  }, []);

  return (
    <div className="fixed left-3 top-1/2 z-30 hidden -translate-y-1/2 flex-col gap-1 rounded-full border border-border bg-background/80 p-1 shadow-soft backdrop-blur sm:flex">
      <button
        type="button"
        aria-label="מצב כהה"
        onClick={() => apply("dark")}
        className={`${base} dark:bg-surface dark:text-foreground`}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
        </svg>
      </button>
      <button
        type="button"
        aria-label="מצב בהיר"
        onClick={() => apply("light")}
        className={`${base} light:bg-surface light:text-foreground`}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
        </svg>
      </button>
    </div>
  );
}
