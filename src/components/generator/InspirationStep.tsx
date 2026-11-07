"use client";

import { useRef, useState, type ClipboardEvent, type DragEvent } from "react";
import Button from "@/components/ui/Button";

export type Inspiration = { image?: string; url?: string };

/** Downscale + re-encode so uploads stay small and fast for the AI. */
async function toDataUrl(file: File): Promise<string> {
  const bmp = await createImageBitmap(file);
  const scale = Math.min(1, 1400 / bmp.width);
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bmp.width * scale);
  canvas.height = Math.round(bmp.height * scale);
  canvas.getContext("2d")!.drawImage(bmp, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", 0.85);
}

export default function InspirationStep({
  searchQuery,
  value,
  onChange,
  onGenerate,
  onBack,
}: {
  searchQuery: string;
  value: Inspiration;
  onChange: (v: Inspiration) => void;
  onGenerate: () => void;
  onBack: () => void;
}) {
  const [error, setError] = useState("");
  const [drag, setDrag] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function take(file?: File | null) {
    if (!file || !file.type.startsWith("image/")) return setError("נא לבחור קובץ תמונה");
    try {
      setError("");
      onChange({ image: await toDataUrl(file), url: value.url });
    } catch {
      setError("לא הצלחנו לקרוא את התמונה. נסו קובץ אחר.");
    }
  }
  const onPaste = (e: ClipboardEvent) => take(Array.from(e.clipboardData.files)[0]);
  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDrag(false);
    take(e.dataTransfer.files[0]);
  };

  const dribbble = `https://dribbble.com/search/${encodeURIComponent(searchQuery)}`;

  return (
    <div className="mx-auto w-full max-w-3xl text-start" onPaste={onPaste}>
      <h3 className="font-display text-xl">שלב 2: בחרו Hero שאתם אוהבים</h3>
      <p className="mt-2 text-ink-muted">
        חפשו השראה ב-Dribbble, שמרו צילום מסך של ה-Hero שמצא חן בעיניכם, והעלו אותו כאן. המערכת תנתח את הפריסה, הצבעים והסגנון ותבנה לכם Hero קרוב ככל האפשר אליו.
      </p>
      <div className="mt-4">
        <Button href={dribbble} target="_blank" rel="noopener noreferrer" variant="secondary">
          פתחו חיפוש ב-Dribbble
        </Button>
      </div>

      <div
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={onDrop}
        className={`mt-5 flex min-h-48 flex-col items-center justify-center gap-3 rounded-panel border-2 border-dashed p-6 text-center transition ${drag ? "border-violet-300 bg-glass" : "border-line-strong"}`}
      >
        {value.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value.image} alt="ה-Hero שנבחר" className="max-h-56 rounded-lg border border-line" />
        ) : (
          <p className="text-ink-muted">גררו לכאן תמונה, הדביקו (Ctrl+V), או בחרו קובץ</p>
        )}
        <input ref={fileRef} type="file" accept="image/*" className="sr-only" aria-label="העלאת תמונה" onChange={(e) => take(e.target.files?.[0])} />
        <Button variant="ghost" arrow={false} onClick={() => fileRef.current?.click()}>
          {value.image ? "החלפת תמונה" : "בחירת קובץ"}
        </Button>
      </div>

      <label htmlFor="dribbble-url" className="mt-5 block text-sm text-ink-muted">
        או הדביקו קישור לעבודה ב-Dribbble (לא חובה)
      </label>
      <input
        id="dribbble-url"
        dir="ltr"
        value={value.url ?? ""}
        onChange={(e) => onChange({ ...value, url: e.target.value })}
        placeholder="https://dribbble.com/shots/..."
        className="mt-1 w-full rounded-control border border-line-strong bg-card px-4 py-2.5 text-ink focus:outline-2 focus:outline-violet-200"
      />
      {error && <p role="alert" className="mt-2 text-danger">{error}</p>}
      <p className="mt-3 text-xs text-ink-subtle">התמונה נשלחת לניתוח AI בלבד ואינה נשמרת אצלנו.</p>

      <div className="mt-6 flex flex-wrap gap-3">
        <Button onClick={onGenerate}>{value.image || value.url ? "צרו את האתר בהשראת התמונה" : "דלגו וצרו בלי השראה"}</Button>
        <Button variant="ghost" arrow={false} onClick={onBack}>חזרה</Button>
      </div>
    </div>
  );
}
