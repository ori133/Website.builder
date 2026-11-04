import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cx } from "./cx";

const cls = (size: "md" | "lg", className?: string) =>
  cx(
    "btn-outline inline-flex items-center justify-center rounded-full bg-glass text-ink transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/10 hover:shadow-[0_10px_32px_-10px_rgb(154_103_238/0.8)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-200",
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
