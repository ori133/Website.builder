import type { ElementType, ReactNode } from "react";
import { cx } from "./cx";

type HeadingLevel = "display" | "h1" | "h2" | "h3";

const levelClass: Record<HeadingLevel, string> = {
  display: "font-display text-display font-medium tracking-tight",
  h1: "font-display text-h1 font-medium tracking-tight",
  h2: "font-display text-h2 font-medium tracking-tight",
  h3: "text-h3 font-semibold",
};

export function Heading({
  level = "h2",
  as,
  children,
  className,
  ...rest
}: { level?: HeadingLevel; as?: ElementType; children: ReactNode; className?: string } & React.HTMLAttributes<HTMLHeadingElement>) {
  const Tag = (as ?? (level === "display" ? "h1" : level)) as ElementType;
  return (
    <Tag className={cx(levelClass[level], className)} {...rest}>
      {children}
    </Tag>
  );
}

export function Text({
  size = "md",
  tone = "muted",
  as: Tag = "p",
  children,
  className,
}: {
  size?: "sm" | "md" | "lg";
  tone?: "default" | "muted" | "subtle";
  as?: ElementType;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Tag
      className={cx(
        size === "lg" ? "text-body-lg" : size === "sm" ? "text-sm" : "text-base",
        tone === "default" ? "text-ink" : tone === "muted" ? "text-ink-muted" : "text-ink-subtle",
        className,
      )}
    >
      {children}
    </Tag>
  );
}
