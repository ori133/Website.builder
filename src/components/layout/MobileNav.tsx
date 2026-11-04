"use client";

import Link from "next/link";
import { useEffect, useId, useState } from "react";
import { usePathname } from "next/navigation";
import Button from "@/components/ui/Button";
import IconButton from "@/components/ui/IconButton";

type NavLink = { href: string; label: string };

function Menu({ links }: { links: NavLink[] }) {
  const [open, setOpen] = useState(false);
  const id = useId();

  // Lock background scroll and close on Escape while the panel is open.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      <IconButton label={open ? "סגירת התפריט" : "פתיחת התפריט"} aria-expanded={open} aria-controls={id} onClick={() => setOpen((o) => !o)}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
          {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
        </svg>
      </IconButton>
      {open && (
        <div id={id} className="absolute inset-x-0 top-full z-30 h-[calc(100dvh-100%)] animate-fade-up border-t border-line bg-bg/95 backdrop-blur-xl">
          <nav aria-label="תפריט נייד" className="mx-auto flex h-full max-w-6xl flex-col gap-1 overflow-y-auto px-4 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-4">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="flex min-h-14 items-center rounded-control border-b border-line px-2 font-display text-xl text-ink transition active:bg-ink/5"
              >
                {l.label}
              </Link>
            ))}
            <div className="mt-auto pt-6">
              <Button href="/#generator" size="lg" className="w-full justify-between!" onClick={() => setOpen(false)}>
                נסו את המחולל
              </Button>
            </div>
          </nav>
        </div>
      )}
    </>
  );
}

/** Hamburger menu for small screens. Keyed by pathname so it closes on navigation. */
export default function MobileNav({ links }: { links: NavLink[] }) {
  const pathname = usePathname();
  return (
    <div className="md:hidden">
      <Menu key={pathname} links={links} />
    </div>
  );
}
