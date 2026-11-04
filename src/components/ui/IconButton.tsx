import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cx } from "./cx";

const cls = (size: "md" | "lg", className?: string) =>
  cx(
    "inline-flex items-center justify-center rounded-full border border-line-strong bg-card/60 text-ink transition hover:border-violet-300 hover:bg-surface-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-200",
    size === "lg" ? "size-16 sm:size-[4.5rem]" : "size-11",
    className,
  );

type Common = { label: string; children: ReactNode; size?: "md" | "lg"; className?: string };

/** Round icon-only control. Renders an anchor when `href` is given. */
export default function IconButton(
  props: (Common & { href: string }) | (Common & { href?: undefined } & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "aria-label" | keyof Common>),
) {
  const { label, children, size = "md", className } = props;
  if (props.href !== undefined) {
    return (
      <a href={props.href} aria-label={label} className={cls(size, className)}>
        {children}
      </a>
    );
  }
  const { href: _h, label: _l, children: _c, size: _s, className: _cn, ...rest } = props;
  void _h; void _l; void _c; void _s; void _cn;
  return (
    <button type="button" aria-label={label} className={cls(size, className)} {...rest}>
      {children}
    </button>
  );
}
