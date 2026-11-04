"use client";

import { useState, type FormEvent } from "react";
import type { GeneratedSite } from "@/lib/generator";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { Field, Input } from "@/components/ui/Field";
import { Heading } from "@/components/ui/Typography";

type Errors = Partial<Record<"name" | "email" | "phone" | "message", string[]>>;

export default function LeadModal({
  open,
  site,
  onClose,
}: {
  open: boolean;
  site: GeneratedSite | null;
  onClose: () => void;
}) {
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [errors, setErrors] = useState<Errors>({});

  function close() {
    setStatus("idle");
    setErrors({});
    onClose();
  }

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
          message: `בקשה מהמחולל: "${site.prompt.slice(0, 1000)}" (תבנית: ${site.template.label})${site.inspirationUrl ? ` | השראה: ${site.inspirationUrl.slice(0, 300)}` : ""}${site.inspired ? " | נוצר Hero בהשראת תמונה שהלקוח בחר" : ""}`,
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

  return (
    <Modal open={open} onClose={close} titleId="lead-title">
      <div className="flex items-start justify-between gap-4">
        <Heading level="h3" id="lead-title">
          בואו נבנה את זה באמת
        </Heading>
        <button
          type="button"
          onClick={close}
          aria-label="סגירה"
          className="text-2xl leading-none text-ink-muted transition hover:text-ink focus-visible:outline-2 focus-visible:outline-violet-200"
        >
          ×
        </button>
      </div>

      {status === "success" ? (
        <div className="mt-6 space-y-4">
          <p role="status" className="text-success">
            תודה! קיבלנו את הפרטים ונחזור אליכם בקרוב.
          </p>
          <Button onClick={close} arrow={false}>
            סגירה
          </Button>
        </div>
      ) : (
        <form onSubmit={onSubmit} noValidate className="mt-4 space-y-4">
          <Field id="lead-name" label="שם מלא" errors={errors.name}>
            <Input id="lead-name" name="name" required autoComplete="name" aria-invalid={!!errors.name} />
          </Field>
          <Field id="lead-email" label="אימייל" errors={errors.email}>
            <Input id="lead-email" name="email" type="email" required dir="ltr" autoComplete="email" aria-invalid={!!errors.email} />
          </Field>
          <Field id="lead-phone" label="טלפון (לא חובה)" errors={errors.phone}>
            <Input id="lead-phone" name="phone" type="tel" dir="ltr" autoComplete="tel" aria-invalid={!!errors.phone} />
          </Field>
          {errors.message?.map((m) => (
            <p key={m} className="text-sm text-danger">
              {m}
            </p>
          ))}
          <Button type="submit" size="lg" disabled={status === "sending"} className="w-full">
            {status === "sending" ? "שולח..." : "שלחו לי הצעה"}
          </Button>
          {status === "error" && (
            <p role="alert" className="text-danger">
              אירעה שגיאה בשליחה. נסו שוב מאוחר יותר.
            </p>
          )}
        </form>
      )}
    </Modal>
  );
}
