import Container from "@/components/ui/Container";
import { siteConfig } from "@/data/site";

export default function Footer() {
  return (
    <footer className="border-t border-line bg-card py-8 pb-[calc(2rem+env(safe-area-inset-bottom))] text-sm sm:py-10 text-ink-subtle">
      <Container className="flex flex-col gap-2 sm:flex-row sm:justify-between">
        <p>
          © {siteConfig.name}. כל הזכויות שמורות.
        </p>
        <p className="flex flex-wrap items-center gap-x-2">
          <a href={`mailto:${siteConfig.email}`} className="inline-flex min-h-11 items-center transition hover:text-ink">
            {siteConfig.email}
          </a>
          {" · "}
          <a href={`tel:${siteConfig.phone}`} className="inline-flex min-h-11 items-center transition hover:text-ink">
            {siteConfig.phone}
          </a>
        </p>
      </Container>
    </footer>
  );
}
