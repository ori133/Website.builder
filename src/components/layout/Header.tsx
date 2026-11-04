import Link from "next/link";
import Button from "@/components/ui/Button";
import { navLinks, siteConfig } from "@/data/site";

export default function Header() {
  return (
    <header className="sticky top-3 z-20 px-3 pt-3 sm:top-4 sm:px-6 sm:pt-4">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-x-4 gap-y-2 rounded-3xl border border-border bg-background/80 px-5 py-2.5 shadow-float backdrop-blur-xl sm:flex-nowrap sm:rounded-full sm:ps-6 sm:pe-2.5">
        <Link href="/" className="text-lg font-semibold tracking-tight text-foreground">
          {siteConfig.name}
        </Link>
        <nav aria-label="ראשי" className="order-3 flex w-full justify-between overflow-x-auto text-sm sm:order-none sm:w-auto sm:justify-start sm:gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="whitespace-nowrap rounded-full px-2 py-1.5 text-muted sm:px-3.5 transition-colors hover:bg-surface hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="hidden sm:block">
          <Button href="/contact" size="sm">קבלו הצעה</Button>
        </div>
      </div>
    </header>
  );
}
