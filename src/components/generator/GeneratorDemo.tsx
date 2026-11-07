"use client";

import { useEffect, useRef, useState } from "react";
import { generateSite, type GeneratedSite } from "@/lib/generator";
import PromptBox from "./PromptBox";
import { PreviewEmpty, PreviewHtml, PreviewLoading, PreviewSite } from "./LivePreview";
import PreviewCta from "./PreviewCta";
import LeadModal from "./LeadModal";

const steps = ["שולח את הבקשה ל-Claude…", "Claude מתכנן את מבנה האתר…", "כותב את העיצוב והתוכן…", "עוד רגע, מסיים את הפרטים…"];
const STEP_MS = 6000;

export default function GeneratorDemo() {
  const [prompt, setPrompt] = useState("");
  const [status, setStatus] = useState<"idle" | "generating" | "done">("idle");
  const [step, setStep] = useState(0);
  const [site, setSite] = useState<GeneratedSite | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const abort = useRef<AbortController | null>(null);

  function clearTimers() {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }
  useEffect(
    () => () => {
      clearTimers();
      abort.current?.abort();
    },
    [],
  );

  async function generate() {
    const text = prompt.trim();
    if (text.length < 3 || status === "generating") return;

    clearTimers();
    abort.current?.abort();
    const controller = new AbortController();
    abort.current = controller;

    setStatus("generating");
    setStep(0);
    setNotice(null);
    steps.forEach((_, i) => {
      if (i > 0) timers.current.push(setTimeout(() => setStep(i), i * STEP_MS));
    });

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: text }),
        signal: controller.signal,
      });
      if (!res.ok) throw new Error(String(res.status));
      const { html } = (await res.json()) as { html: string };
      setSite({ ...generateSite(text), html });
    } catch (e) {
      if (controller.signal.aborted) return;
      console.warn("Claude generation failed, using the local simulation:", e);
      setNotice("החיבור ל-Claude לא זמין כרגע — מוצג דמו לדוגמה.");
      setSite(generateSite(text));
    } finally {
      if (!controller.signal.aborted) {
        clearTimers();
        setStatus("done");
      }
    }
  }

  return (
    <div id="generator" className="scroll-mt-24">
      <PromptBox value={prompt} onChange={setPrompt} onSubmit={generate} busy={status === "generating"} />

      <div className="mx-auto mt-10 max-w-4xl text-start">
        {status === "done" && site && <PreviewCta onOpen={() => setModalOpen(true)} />}
        {notice && status === "done" && (
          <p role="status" className="mb-3 text-sm text-amber-700">
            {notice}
          </p>
        )}
        {status === "idle" && <PreviewEmpty />}
        {status === "generating" && <PreviewLoading message={steps[step]} />}
        {status === "done" && site && (site.html ? <PreviewHtml html={site.html} /> : <PreviewSite site={site} />)}
      </div>

      <LeadModal open={modalOpen} site={site} onClose={() => setModalOpen(false)} />
    </div>
  );
}
