import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { ArrowUpEnd } from "./Icons";
import { cx } from "./cx";

type Variant = "primary" | "secondary" | "ghost";
type Size = "md" | "lg";

const focus =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-200";

const base =
  "group inline-flex items-center justify-center gap-3 rounded-pill font-display font-medium transition-all duration-300 ease-[var(--ease-out-soft)] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50 " +
  focus;

const variants: Record<Variant, string> = {
  // White pill + gradient arrow orb — the hero CTA. Glows and sweeps light on hover.
  primary:
    "btn-shine bg-gradient-to-b from-cta-from to-cta-to text-cta-ink shadow-[0_6px_24px_-6px_rgb(154_103_238/0.65),inset_0_-2px_0_rgb(154_103_238/0.18)] hover:shadow-[0_14px_40px_-8px_rgb(185_130_255/0.9),inset_0_-2px_0_rgb(154_103_238/0.18)]",
  // Frosted glass with a gradient hairline border.
  secondary:
    "btn-outline bg-glass text-ink hover:bg-ink/5 hover:shadow-[0_10px_32px_-10px_rgb(154_103_238/0.8)]",
  ghost: "text-ink-muted hover:text-ink hover:translate-y-0",
};

const sizes: Record<Variant, Record<Size, string>> = {
  primary: { md: "h-12 ps-6 pe-1.5 text-[0.95rem]", lg: "h-14 ps-8 pe-2 text-base" },
  secondary: { md: "h-11 px-6 text-sm", lg: "h-14 px-9 text-base" },
  ghost: { md: "h-11 px-3 text-sm", lg: "h-12 px-4 text-base" },
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
        "flex aspect-square h-full items-center justify-center rounded-full bg-gradient-to-br from-violet-300 via-violet-500 to-neon-pink text-white shadow-[0_4px_14px_-2px_rgb(114_57_225/0.8)] transition-transform duration-300 ease-[var(--ease-out-soft)] group-hover:scale-105 group-hover:-rotate-12 [&>svg]:size-[1.1rem]",
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
