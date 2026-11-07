"use client";

import { useEffect, useRef, useState } from "react";
import { detectTemplate, dribbbleQueries, generateSite, type GeneratedSite } from "@/lib/generator";
import { heroSpecSchema, type HeroSpec } from "@/lib/heroSpec";
import { analyzeDataUrl } from "@/lib/analyzeImage";
import Button from "@/components/ui/Button";
import PromptBox from "./PromptBox";
import InspirationStep, { type Inspiration } from "./InspirationStep";
import { PreviewEmpty, PreviewHtml, PreviewLoading, PreviewSite } from "./LivePreview";
import PreviewCta from "./PreviewCta";
import LeadModal from "./LeadModal";

type Stage = "prompt" | "inspire" | "generating" | "done";

const plainSteps = ["ה-AI מנתח את הבקשה שלכם…", "בוחר תבנית ופלטת צבעים…", "בונה את ה-Hero…"];
const aiSteps = ["ה-AI מנתח את בקשתכם…", "מנתח את ה-Hero שבחרתם: פריסה, צבעים וטיפוגרפיה…", "בונה Hero קרוב ככל האפשר לבחירה שלכם…"];
const STEP_MS = 1400;

async function post(body: unknown) {
  const res = await fetch("/api/analyze-inspiration", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return res.ok ? res.json() : null;
}

/**
 * Hero spec from the client's reference. With an API key on the server, Claude looks at it;
 * otherwise (or if that fails) the browser analyses the pixels itself.
 */
async function analyze(insp: Inspiration): Promise<HeroSpec | null> {
  try {
    const url = insp.url?.trim();
    const ai = await post(insp.image ? { image: insp.image } : { url }).catch(() => null);
    const parsed = heroSpecSchema.safeParse(ai?.spec);
    if (parsed.success) return parsed.data;

    let image = insp.image;
    if (!image && url) image = (await post({ url, fetchOnly: true }).catch(() => null))?.image;
    return image ? await analyzeDataUrl(image) : null;
  } catch {
    return null;
  }
}

/**
 * Local-testing only: asks the Claude CLI behind /api/generate for a full demo page.
 * If the route is disabled on this server (503/403, e.g. in production) it stays silent
 * and the regular demo is shown.
 */
async function askClaude(prompt: string, signal: AbortSignal): Promise<{ html?: string; failed?: boolean }> {
  try {
    const res = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
      signal,
    });
    if (res.status === 503 || res.status === 403) return {};
    if (!res.ok) return { failed: true };
    const { html } = (await res.json()) as { html?: unknown };
    return typeof html === "string" ? { html } : { failed: true };
  } catch {
    return { failed: true };
  }
}

export default function GeneratorDemo() {
  const [prompt, setPrompt] = useState("");
  const [stage, setStage] = useState<Stage>("prompt");
  const [insp, setInsp] = useState<Inspiration>({});
  const [step, setStep] = useState(0);
  const [site, setSite] = useState<GeneratedSite | null>(null);
  const [notice, setNotice] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const abort = useRef<AbortController | null>(null);
  const wantsAi = !!(insp.image || insp.url?.trim());
  const steps = wantsAi ? aiSteps : plainSteps;

  useEffect(
    () => () => {
      if (timer.current) clearInterval(timer.current);
      abort.current?.abort();
    },
    [],
  );

  async function generate() {
    const text = prompt.trim();
    setStage("generating");
    setStep(0);
    setNotice("");
    timer.current = setInterval(() => setStep((s) => Math.min(s + 1, steps.length - 1)), STEP_MS);

    abort.current?.abort();
    const controller = new AbortController();
    abort.current = controller;

    const minDelay = new Promise((r) => setTimeout(r, steps.length * 700));
    const [spec, claude] = await Promise.all([
      wantsAi ? analyze(insp) : Promise.resolve(null),
      askClaude(text, controller.signal),
      minDelay,
    ]);
    if (timer.current) clearInterval(timer.current);
    if (controller.signal.aborted) return;

    const notes: string[] = [];
    if (wantsAi && !spec) notes.push("לא הצלחנו לנתח את התמונה, אז יצרנו Hero בסגנון ברירת מחדל. אפשר לנסות שוב עם צילום מסך.");
    if (claude.failed) notes.push("החיבור ל-Claude לא זמין כרגע — מוצג דמו לדוגמה.");
    setNotice(notes.join(" "));
    setSite({
      ...generateSite(text, { heroSpec: spec ?? undefined, inspirationUrl: insp.url?.trim() || undefined }),
      html: claude.html,
    });
    setStage("done");
  }

  function restart() {
    abort.current?.abort();
    setStage("prompt");
    setSite(null);
    setInsp({});
    setNotice("");
  }

  return (
    <div id="generator" className="scroll-mt-24">
      {stage === "prompt" && (
        <PromptBox value={prompt} onChange={setPrompt} onSubmit={() => prompt.trim().length >= 3 && setStage("inspire")} busy={false} />
      )}
      {stage === "inspire" && (
        <InspirationStep
          searchQuery={dribbbleQueries[detectTemplate(prompt).id]}
          value={insp}
          onChange={setInsp}
          onGenerate={generate}
          onBack={() => setStage("prompt")}
        />
      )}

      <div className="mx-auto mt-10 max-w-4xl text-start">
        {stage === "done" && site && <PreviewCta onOpen={() => setModalOpen(true)} />}
        {(stage === "prompt" || stage === "inspire") && <PreviewEmpty />}
        {stage === "generating" && <PreviewLoading message={steps[step]} />}
        {stage === "done" && site && (
          <>
            {notice && <p role="status" className="mb-3 text-sm text-danger">{notice}</p>}
            {site.html ? <PreviewHtml html={site.html} /> : <PreviewSite site={site} onUnlock={() => setModalOpen(true)} />}
            <p className="mt-3 text-center text-sm text-ink-subtle">
              זו תצוגה מקדימה לדוגמה בלבד. האתר הסופי יעוצב, ייכתב ויותאם אישית לעסק שלכם.
            </p>
            <div className="mt-2 flex justify-center">
              <Button variant="ghost" arrow={false} onClick={restart}>התחילו מחדש</Button>
            </div>
          </>
        )}
      </div>

      <LeadModal open={modalOpen} site={site} onClose={() => setModalOpen(false)} />
    </div>
  );
}
