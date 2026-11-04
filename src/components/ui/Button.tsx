import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { ArrowUpEnd } from "./Icons";
import { cx } from "./cx";

type Variant = "primary" | "secondary" | "ghost";
type Size = "md" | "lg";

const focus =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-200";

const base =
  "group inline-flex items-center justify-center gap-3 rounded-pill font-display font-medium transition duration-200 disabled:pointer-events-none disabled:opacity-50 " +
  focus;

const variants: Record<Variant, string> = {
  // The white pill with a violet arrow circle — the hero CTA in the reference.
  primary: "bg-ink text-on-light hover:bg-white hover:shadow-glow-sm active:scale-[0.98]",
  secondary: "border border-line-strong bg-surface-2 text-ink hover:border-violet-300 hover:bg-surface-2/80",
  ghost: "text-ink hover:text-violet-200",
};

const sizes: Record<Variant, Record<Size, string>> = {
  primary: { md: "h-11 ps-6 pe-1 text-sm", lg: "h-12 ps-7 pe-1.5 text-sm" },
  secondary: { md: "h-11 px-6 text-sm", lg: "h-12 px-8 text-sm" },
  ghost: { md: "h-11 px-3 text-sm", lg: "h-12 px-4 text-sm" },
};

type Common = {
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  /** Show the circular arrow (primary only). Defaults to true. */
  arrow?: boolean;
  className?: string;
};

type Props =
  | (Common & { href: string } & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof Common | "href">)
  | (Common & { href?: undefined } & Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof Common>);

export default function Button(props: Props) {
  const { children, variant = "primary", size = "md", arrow = true, className, ...rest } = props;
  const cls = cx(base, variants[variant], sizes[variant][size], className);
  const circle = variant === "primary" && arrow && (
    <span
      aria-hidden="true"
      className={cx(
        "flex aspect-square h-full items-center justify-center rounded-full bg-violet-400 text-white transition-transform duration-200 group-hover:rotate-12",
      )}
    >
      <ArrowUpEnd />
    </span>
  );
  const content = (
    <>
      <span>{children}</span>
      {circle}
    </>
  );
  // Without the circle the primary pill needs symmetric padding.
  const symmetric = variant === "primary" && !arrow ? "pe-6" : "";

  if ("href" in props && props.href !== undefined) {
    const { href, ...anchor } = rest as React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string };
    return (
      <Link href={href} className={cx(cls, symmetric)} {...anchor}>
        {content}
      </Link>
    );
  }
  const { type = "button", ...button } = rest as ButtonHTMLAttributes<HTMLButtonElement>;
  return (
    <button type={type} className={cx(cls, symmetric)} {...button}>
      {content}
    </button>
  );
}
