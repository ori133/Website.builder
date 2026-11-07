import { templates, type TemplateDef, type TemplateId } from "@/data/templates";

export type GeneratedSite = {
  template: TemplateDef;
  brand: string;
  prompt: string;
  /** Full HTML page returned by Claude. When absent, the local template simulation is shown. */
  html?: string;
};

const order: TemplateId[] = ["portfolio", "restaurant", "store", "landing"];

export function detectTemplate(prompt: string): TemplateDef {
  const text = prompt.toLowerCase();
  for (const id of order) {
    if (templates[id].keywords.some((k) => text.includes(k))) return templates[id];
  }
  return templates.business;
}

/** Pulls a business name out of the prompt ("בשם X" or text in quotes), if any. */
export function extractName(prompt: string): string | null {
  const quoted = prompt.match(/["“”'׳״]([^"“”'׳״]{2,30})["“”'׳״]/);
  if (quoted) return quoted[1].trim();
  const named = prompt.match(/בשם\s+([^\s,.!?]+(?:\s[^\s,.!?]+)?)/);
  if (named) return named[1].trim();
  return null;
}

// Deterministic on purpose: no randomness or dates, so it is safe to swap for a real AI call later.
export function generateSite(prompt: string): GeneratedSite {
  const clean = prompt.trim();
  const template = detectTemplate(clean);
  return { template, brand: extractName(clean) ?? template.defaultBrand, prompt: clean };
}
