import Link from "next/link";
import type { ReactNode } from "react";

const styles = {
  primary: "bg-primary text-primary-fg hover:bg-primary-dark",
  light: "bg-white text-slate-900 hover:bg-slate-100",
  secondary: "border border-border text-foreground hover:bg-surface",
};

const sizes = {
  md: "px-7 py-3.5 text-[15px]",
  sm: "px-5 py-2.5 text-sm",
};

export default function Button({
  href,
  children,
  variant = "primary",
  size = "md",
}: {
  href: string;
  children: ReactNode;
  variant?: keyof typeof styles;
  size?: keyof typeof sizes;
}) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center justify-center rounded-full font-medium transition-colors ${sizes[size]} ${styles[variant]}`}
    >
      {children}
    </Link>
  );
}
