import type { ReactNode } from "react";
import Container from "./Container";
import { Heading, Text } from "./Typography";
import { cx } from "./cx";

export default function Section({
  title,
  subtitle,
  children,
  className,
}: {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cx("py-16 sm:py-24", className)}>
      <Container>
        {title && (
          <div className="mb-10 max-w-2xl">
            <Heading level="h2">{title}</Heading>
            {subtitle && <Text className="mt-3" size="lg">{subtitle}</Text>}
          </div>
        )}
        {children}
      </Container>
    </section>
  );
}
