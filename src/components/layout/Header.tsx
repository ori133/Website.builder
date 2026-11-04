import Link from "next/link";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { Logo } from "@/components/ui/Icons";
import { navLinks, siteConfig } from "@/data/site";

export default function Header() {
  return (
    <header className="sticky top-0 z-20 border-b border-line bg-bg/70 backdrop-blur-xl">
      <Container className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 py-3">
        <Link href="/" className="flex items-center gap-2.5 font-display text-base text-ink">
          <Logo className="size-7" />
          {siteConfig.name}
        </Link>
        <nav
          aria-label="ראשי"
          className="order-3 flex w-full gap-6 overflow-x-auto pb-1 text-sm sm:order-none sm:w-auto sm:pb-0"
        >
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="whitespace-nowrap text-ink-muted transition hover:text-ink">
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <div className="hidden sm:block">
            <Button href="/#generator" variant="secondary">
              נסו את המחולל
            </Button>
          </div>
        </div>
      </Container>
    </header>
  );
}
