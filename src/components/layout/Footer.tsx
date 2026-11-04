import Container from "@/components/ui/Container";
import { siteConfig } from "@/data/site";

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-surface py-10 text-sm text-muted">
      <Container className="flex flex-col gap-2 sm:flex-row sm:justify-between">
        <p>
          © {siteConfig.name}. כל הזכויות שמורות.
        </p>
        <p>
          <a href={`mailto:${siteConfig.email}`} className="hover:text-foreground">
            {siteConfig.email}
          </a>
          {" · "}
          <a href={`tel:${siteConfig.phone}`} className="hover:text-foreground">
            {siteConfig.phone}
          </a>
        </p>
      </Container>
    </footer>
  );
}
