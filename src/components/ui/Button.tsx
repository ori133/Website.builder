import Link from "next/link";
import type { ReactNode } from "react";

const styles = {
  primary: "bg-primary text-white hover:bg-primary-dark",
  light: "bg-white text-primary hover:bg-indigo-50",
  secondary: "border border-slate-300 text-foreground hover:bg-surface",
};

export default function Button({
  href,
  children,
  variant = "primary",
}: {
  href: string;
  children: ReactNode;
  variant?: keyof typeof styles;
}) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center justify-center rounded-lg px-5 py-3 font-medium transition-colors ${styles[variant]}`}
    >
      {children}
    </Link>
  );
}
