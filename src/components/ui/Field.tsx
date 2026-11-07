import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from "react";
import { cx } from "./cx";

export const controlClass =
  "mt-1.5 w-full rounded-control border border-line-strong bg-glass px-4 py-3 text-ink placeholder:text-ink-subtle transition focus:border-violet-300 focus:outline-none focus:ring-2 focus:ring-violet-400/40 aria-[invalid=true]:border-danger";

/** Label + control + error messages, wired with ids for a11y. */
export function Field({
  id,
  label,
  errors,
  children,
}: {
  id: string;
  label: string;
  errors?: string[];
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="text-sm font-medium text-ink">
        {label}
      </label>
      {children}
      {errors?.map((m) => (
        <p key={m} id={`${id}-error`} className="mt-1 text-sm text-danger">
          {m}
        </p>
      ))}
    </div>
  );
}

export function Input({ className, ...rest }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cx(controlClass, className)} {...rest} />;
}

export function Textarea({ className, ...rest }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cx(controlClass, className)} {...rest} />;
}
