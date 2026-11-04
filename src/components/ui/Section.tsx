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
    <section className={`py-16 sm:py-20 ${className}`}>
      <Container>
        {title && (
          <div className="mb-10 max-w-2xl">
            <h2 className="text-3xl font-bold">{title}</h2>
            {subtitle && <p className="mt-3 text-muted">{subtitle}</p>}
          </div>
        )}
        {children}
      </Container>
    </section>
  );
}
