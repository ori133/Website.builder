import Container from "@/components/ui/Container";
import { siteConfig } from "@/data/site";

export default function Footer() {
  return (
    <footer className="border-t border-line bg-card py-10 text-sm text-ink-subtle">
      <Container className="flex flex-col gap-2 sm:flex-row sm:justify-between">
        <p>
          © {siteConfig.name}. כל הזכויות שמורות.
        </p>
        <p>
          <a href={`mailto:${siteConfig.email}`} className="transition hover:text-ink">
            {siteConfig.email}
          </a>
          {" · "}
          <a href={`tel:${siteConfig.phone}`} className="transition hover:text-ink">
            {siteConfig.phone}
          </a>
        </p>
      </Container>
    </footer>
  );
}
