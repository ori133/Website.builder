import type { ReactNode } from "react";

export default function GradientText({ children }: { children: ReactNode }) {
  return <span className="text-gradient">{children}</span>;
}
