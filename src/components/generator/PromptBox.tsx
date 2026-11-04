"use client";

import type { KeyboardEvent } from "react";
import Button from "@/components/ui/Button";

const examples = ["אתר תיק עבודות לצלם", "אתר למסעדה איטלקית", "חנות אונליין לתכשיטים", "דף נחיתה לקורס"];

export default function PromptBox({
  value,
  onChange,
  onSubmit,
  busy,
}: {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  busy: boolean;
}) {
  function onKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      if (!busy) onSubmit();
    }
  }

  return (
    <div className="mx-auto w-full max-w-3xl">
      <div className="animate-glow rounded-panel bg-gradient-to-l from-violet-500 via-neon-pink/70 to-violet-300 p-[1.5px]">
        <div className="rounded-[calc(var(--radius-panel)-1.5px)] bg-card p-4 sm:p-5">
          <label htmlFor="prompt" className="sr-only">
            תארו את האתר שאתם רוצים
          </label>
          <textarea
            id="prompt"
            dir="auto"
            rows={3}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={onKeyDown}
            maxLength={500}
            placeholder="תארו את האתר שאתם רוצים… למשל: אתר תיק עבודות לצלם"
            className="w-full resize-none bg-transparent text-lg leading-relaxed text-ink placeholder:text-ink-subtle focus:outline-none sm:text-xl"
          />
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <p className="hidden text-xs text-ink-subtle sm:block">Enter לשליחה · Shift+Enter לשורה חדשה</p>
            <Button onClick={onSubmit} disabled={busy || value.trim().length < 3} className="max-sm:w-full max-sm:justify-between">
              {busy ? "יוצר..." : "צור דמו ב-AI"}
            </Button>
          </div>
        </div>
      </div>

      <div className="-mx-4 mt-5 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:justify-center sm:overflow-visible sm:px-0" aria-label="דוגמאות">
        {examples.map((ex) => (
          <button
            key={ex}
            type="button"
            disabled={busy}
            onClick={() => onChange(ex)}
            className="min-h-11 shrink-0 whitespace-nowrap rounded-pill border border-line-strong bg-glass px-4 py-1.5 text-sm text-ink-muted transition hover:border-violet-300 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-200 disabled:opacity-50"
          >
            {ex}
          </button>
        ))}
      </div>
    </div>
  );
}
