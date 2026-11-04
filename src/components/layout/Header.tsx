import Link from "next/link";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import ThemeToggle from "@/components/ui/ThemeToggle";
import MobileNav from "./MobileNav";
import { Logo } from "@/components/ui/Icons";
import { navLinks, siteConfig } from "@/data/site";

export default function Header() {
  return (
    <header className="sticky top-0 z-20 border-b border-line bg-bg/70 pt-[env(safe-area-inset-top)] backdrop-blur-xl">
      <Container className="flex items-center justify-between gap-4 py-2.5 md:py-3">
        <Link href="/" className="flex min-h-11 items-center gap-2.5 font-display text-base text-ink">
          <Logo className="size-7" />
          {siteConfig.name}
        </Link>
        <nav aria-label="ראשי" className="hidden gap-1 text-sm md:flex">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="flex min-h-11 items-center rounded-pill px-3 text-ink-muted transition hover:text-ink">
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2 md:gap-3">
          <ThemeToggle />
          <div className="hidden md:block">
            <Button href="/#generator" variant="secondary">
              נסו את המחולל
            </Button>
          </div>
          <MobileNav links={navLinks} />
        </div>
      </Container>
    </header>
  );
}
