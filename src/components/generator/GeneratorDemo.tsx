"use client";

import { useEffect, useRef, useState } from "react";
import { generateSite, type GeneratedSite } from "@/lib/generator";
import PromptBox from "./PromptBox";
import { PreviewEmpty, PreviewLoading, PreviewSite } from "./LivePreview";
import PreviewCta from "./PreviewCta";
import LeadModal from "./LeadModal";

const steps = ["ה-AI מנתח את הבקשה שלכם…", "בוחר תבנית ופלטת צבעים…", "בונה את העמודים והתוכן…"];
const STEP_MS = 700;

export default function GeneratorDemo() {
  const [prompt, setPrompt] = useState("");
  const [status, setStatus] = useState<"idle" | "generating" | "done">("idle");
  const [step, setStep] = useState(0);
  const [site, setSite] = useState<GeneratedSite | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  function clearTimers() {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }
  useEffect(() => clearTimers, []);

  function generate() {
    const text = prompt.trim();
    if (text.length < 3 || status === "generating") return;
    clearTimers();
    setStatus("generating");
    setStep(0);
    steps.forEach((_, i) => {
      if (i > 0) timers.current.push(setTimeout(() => setStep(i), i * STEP_MS));
    });
    timers.current.push(
      setTimeout(() => {
        setSite(generateSite(text));
        setStatus("done");
      }, steps.length * STEP_MS),
    );
  }

  return (
    <div id="generator" className="scroll-mt-24">
      <PromptBox value={prompt} onChange={setPrompt} onSubmit={generate} busy={status === "generating"} />

      <div className="mx-auto mt-10 max-w-4xl text-start">
        {status === "done" && site && <PreviewCta onOpen={() => setModalOpen(true)} />}
        {status === "idle" && <PreviewEmpty />}
        {status === "generating" && <PreviewLoading message={steps[step]} />}
        {status === "done" && site && <PreviewSite site={site} />}
      </div>

      <LeadModal open={modalOpen} site={site} onClose={() => setModalOpen(false)} />
    </div>
  );
}
