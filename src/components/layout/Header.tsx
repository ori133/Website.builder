import Link from "next/link";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import { navLinks, siteConfig } from "@/data/site";

export default function Header() {
  return (
    <header className="sticky top-0 z-10 border-b border-slate-200 bg-background/90 backdrop-blur">
      <Container className="flex flex-wrap items-center justify-between gap-3 py-3">
        <Link href="/" className="text-xl font-bold text-primary">
          {siteConfig.name}
        </Link>
        <nav aria-label="ראשי" className="order-3 flex w-full gap-5 overflow-x-auto text-sm sm:order-none sm:w-auto sm:text-base">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="whitespace-nowrap text-muted hover:text-foreground">
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="hidden sm:block">
          <Button href="/contact">קבלו הצעה</Button>
        </div>
      </Container>
    </header>
  );
}
