import type { ReactNode } from "react";
import Container from "./Container";

export default function Section({
  title,
  subtitle,
  children,
  className = "",
}: {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`py-20 sm:py-28 ${className}`}>
      <Container>
        {title && (
          <div className="mb-12 max-w-2xl">
            <h2 className="text-4xl font-medium tracking-tight sm:text-5xl">{title}</h2>
            {subtitle && <p className="mt-4 text-lg text-muted">{subtitle}</p>}
          </div>
        )}
        {children}
      </Container>
    </section>
  );
}
