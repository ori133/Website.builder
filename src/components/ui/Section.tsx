import type { ReactNode } from "react";
import Container from "./Container";
import { Heading, Text } from "./Typography";
import { cx } from "./cx";

export default function Section({
  title,
  subtitle,
  children,
  className,
  id,
}: {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section id={id} className={cx("reveal scroll-mt-20 py-12 sm:py-24", className)}>
      <Container>
        {title && (
          <div className="mb-8 max-w-2xl sm:mb-10">
            <Heading level="h2">{title}</Heading>
            {subtitle && <Text className="mt-3" size="lg">{subtitle}</Text>}
          </div>
        )}
        {children}
      </Container>
    </section>
  );
}
