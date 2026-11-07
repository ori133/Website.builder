"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import type { GeneratedSite } from "@/lib/generator";

type Errors = Partial<Record<"name" | "email" | "phone" | "message", string[]>>;

const inputClass =
  "mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30";

export default function LeadModal({
  open,
  site,
  onClose,
}: {
  open: boolean;
  site: GeneratedSite | null;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [errors, setErrors] = useState<Errors>({});

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      setStatus("idle");
      setErrors({});
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!site) return;
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form));
    setStatus("sending");
    setErrors({});
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          message: `בקשה מהמחולל: "${site.prompt.slice(0, 1500)}" ${site.html ? "(נוצר ע״י Claude)" : `(תבנית: ${site.template.label})`}`,
        }),
      });
      if (res.ok) {
        setStatus("success");
        form.reset();
      } else if (res.status === 400) {
        setErrors((await res.json()).errors ?? {});
        setStatus("idle");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  const err = (k: keyof Errors) =>
    errors[k]?.map((m) => (
      <p key={m} className="mt-1 text-sm text-red-600">
        {m}
      </p>
    ));

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
      aria-labelledby="lead-title"
      className="m-auto w-[min(92vw,28rem)] rounded-2xl p-0 shadow-2xl backdrop:bg-slate-900/60 backdrop:backdrop-blur-sm"
    >
      <div className="p-6 text-start">
        <div className="flex items-start justify-between gap-4">
          <h2 id="lead-title" className="text-xl font-bold">
            בואו נבנה את זה באמת
          </h2>
          <button type="button" onClick={onClose} aria-label="סגירה" className="text-2xl leading-none text-muted hover:text-foreground">
            ×
          </button>
        </div>

        {status === "success" ? (
          <div className="mt-6 space-y-4">
            <p role="status" className="text-green-700">
              תודה! קיבלנו את הפרטים ונחזור אליכם בקרוב.
            </p>
            <button type="button" onClick={onClose} className="rounded-lg bg-primary px-5 py-2.5 font-medium text-white hover:bg-primary-dark">
              סגירה
            </button>
          </div>
        ) : (
          <form onSubmit={onSubmit} noValidate className="mt-4 space-y-4">
            <div>
              <label htmlFor="lead-name" className="text-sm font-medium">
                שם מלא
              </label>
              <input id="lead-name" name="name" required autoComplete="name" className={inputClass} />
              {err("name")}
            </div>
            <div>
              <label htmlFor="lead-email" className="text-sm font-medium">
                אימייל
              </label>
              <input id="lead-email" name="email" type="email" required dir="ltr" autoComplete="email" className={inputClass} />
              {err("email")}
            </div>
            <div>
              <label htmlFor="lead-phone" className="text-sm font-medium">
                טלפון (לא חובה)
              </label>
              <input id="lead-phone" name="phone" type="tel" dir="ltr" autoComplete="tel" className={inputClass} />
              {err("phone")}
            </div>
            {err("message")}
            <button
              type="submit"
              disabled={status === "sending"}
              className="w-full rounded-lg bg-primary px-6 py-3 font-semibold text-white transition hover:bg-primary-dark disabled:opacity-60"
            >
              {status === "sending" ? "שולח..." : "שלחו לי הצעה"}
            </button>
            {status === "error" && (
              <p role="alert" className="text-red-600">
                אירעה שגיאה בשליחה. נסו שוב מאוחר יותר.
              </p>
            )}
          </form>
        )}
      </div>
    </dialog>
  );
}
