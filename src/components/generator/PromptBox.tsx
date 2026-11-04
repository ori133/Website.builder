"use client";

import type { KeyboardEvent } from "react";

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
      <div className="rounded-3xl bg-gradient-to-l from-primary via-accent to-primary p-[2px] shadow-2xl shadow-indigo-500/25 prompt-glow">
        <div className="rounded-[calc(1.5rem-2px)] bg-white p-4 sm:p-5">
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
            className="w-full resize-none bg-transparent text-lg leading-relaxed text-foreground placeholder:text-slate-400 focus:outline-none sm:text-xl"
          />
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-muted">Enter לשליחה · Shift+Enter לשורה חדשה</p>
            <button
              type="button"
              onClick={onSubmit}
              disabled={busy || value.trim().length < 3}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-semibold text-white shadow-lg shadow-indigo-500/30 transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span aria-hidden="true">✨</span>
              {busy ? "יוצר..." : "צור דמו ב-AI"}
            </button>
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap justify-center gap-2" aria-label="דוגמאות">
        {examples.map((ex) => (
          <button
            key={ex}
            type="button"
            disabled={busy}
            onClick={() => onChange(ex)}
            className="rounded-full border border-slate-300 bg-white/70 px-4 py-1.5 text-sm text-muted transition hover:border-primary hover:text-primary disabled:opacity-50"
          >
            {ex}
          </button>
        ))}
      </div>
    </div>
  );
}
