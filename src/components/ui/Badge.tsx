import type { ReactNode } from "react";
import { cx } from "./cx";

/** Announcement pill: a white "tag" chip followed by a glass message. */
export default function Badge({ tag, children, className }: { tag?: string; children: ReactNode; className?: string }) {
  return (
    <p className={cx("inline-flex items-center gap-3 rounded-pill border border-line bg-glass p-1 pe-4 text-sm text-ink", className)}>
      {tag && <span className="rounded-pill bg-ink px-3.5 py-1.5 font-display text-xs font-medium text-bg">{tag}</span>}
      <span className={tag ? "" : "ps-3 py-1"}>{children}</span>
    </p>
  );
}
