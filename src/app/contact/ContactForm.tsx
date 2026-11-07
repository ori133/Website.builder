"use client";

import { useState, type FormEvent } from "react";
import Button from "@/components/ui/Button";
import { Field, Input, Textarea } from "@/components/ui/Field";

type Errors = Partial<Record<"name" | "email" | "phone" | "message", string[]>>;

export default function ContactForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [errors, setErrors] = useState<Errors>({});

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    setStatus("sending");
    setErrors({});
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(new FormData(form))),
      });
      if (res.ok) {
        setStatus("success");
        form.reset();
      } else if (res.status === 400) {
        const data = await res.json();
        setErrors(data.errors ?? {});
        setStatus("idle");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate className="max-w-xl space-y-5">
      <Field id="name" label="שם מלא" errors={errors.name}>
        <Input id="name" name="name" required autoComplete="name" aria-invalid={!!errors.name} />
      </Field>
      <Field id="email" label="אימייל" errors={errors.email}>
        <Input id="email" name="email" type="email" inputMode="email" required autoComplete="email" dir="ltr" aria-invalid={!!errors.email} />
      </Field>
      <Field id="phone" label="טלפון (לא חובה)" errors={errors.phone}>
        <Input id="phone" name="phone" type="tel" inputMode="tel" autoComplete="tel" dir="ltr" aria-invalid={!!errors.phone} />
      </Field>
      <Field id="message" label="הודעה" errors={errors.message}>
        <Textarea id="message" name="message" rows={5} required aria-invalid={!!errors.message} />
      </Field>
      <Button type="submit" size="lg" disabled={status === "sending"} className="max-sm:w-full max-sm:justify-between">
        {status === "sending" ? "שולח..." : "שלחו הודעה"}
      </Button>
      {status === "success" && (
        <p role="status" className="text-success">
          תודה! ההודעה נשלחה, נחזור אליכם בקרוב.
        </p>
      )}
      {status === "error" && (
        <p role="alert" className="text-danger">
          אירעה שגיאה בשליחה. נסו שוב מאוחר יותר.
        </p>
      )}
    </form>
  );
}
