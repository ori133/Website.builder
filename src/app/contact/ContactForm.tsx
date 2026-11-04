"use client";

import { useState, type FormEvent } from "react";

type Errors = Partial<Record<"name" | "email" | "phone" | "message", string[]>>;

const inputClass =
  "mt-1 w-full rounded-2xl border border-border bg-background px-4 py-3 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30";

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

  const field = (name: keyof Errors, label: string, props: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <div>
      <label htmlFor={name} className="text-sm font-medium">
        {label}
      </label>
      <input id={name} name={name} className={inputClass} aria-invalid={!!errors[name]} {...props} />
      {errors[name]?.map((m) => (
        <p key={m} className="mt-1 text-sm text-red-600">
          {m}
        </p>
      ))}
    </div>
  );

  return (
    <form onSubmit={onSubmit} noValidate className="max-w-xl space-y-5">
      {field("name", "שם מלא", { required: true, autoComplete: "name" })}
      {field("email", "אימייל", { type: "email", required: true, autoComplete: "email", dir: "ltr" })}
      {field("phone", "טלפון (לא חובה)", { type: "tel", autoComplete: "tel", dir: "ltr" })}
      <div>
        <label htmlFor="message" className="text-sm font-medium">
          הודעה
        </label>
        <textarea id="message" name="message" rows={5} required className={inputClass} aria-invalid={!!errors.message} />
        {errors.message?.map((m) => (
          <p key={m} className="mt-1 text-sm text-red-600">
            {m}
          </p>
        ))}
      </div>
      <button
        type="submit"
        disabled={status === "sending"}
        className="rounded-full bg-primary px-7 py-3.5 font-medium text-primary-fg transition-colors hover:bg-primary-dark disabled:opacity-60"
      >
        {status === "sending" ? "שולח..." : "שלחו הודעה"}
      </button>
      {status === "success" && <p role="status" className="text-green-700">תודה! ההודעה נשלחה, נחזור אליכם בקרוב.</p>}
      {status === "error" && <p role="alert" className="text-red-600">אירעה שגיאה בשליחה. נסו שוב מאוחר יותר.</p>}
    </form>
  );
}
