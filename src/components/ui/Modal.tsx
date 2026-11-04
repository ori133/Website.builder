"use client";

import { useEffect, useRef, type ReactNode } from "react";

/** Native <dialog> modal styled for the dark system. */
export default function Modal({
  open,
  onClose,
  titleId,
  children,
}: {
  open: boolean;
  onClose: () => void;
  titleId: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    else if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
      aria-labelledby={titleId}
      className="m-auto w-[min(92vw,28rem)] rounded-panel border border-line-strong bg-surface p-0 text-ink shadow-glow backdrop:bg-black/70 backdrop:backdrop-blur-sm"
    >
      <div className="p-6 text-start">{children}</div>
    </dialog>
  );
}
