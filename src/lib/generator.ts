import type { HeroSpec } from "@/lib/heroSpec";
import { defaultSpec } from "@/lib/heroSpec";
import { templates, type TemplateDef, type TemplateId } from "@/data/templates";

export type GeneratedSite = {
  template: TemplateDef;
  brand: string;
  prompt: string;
  /** Full HTML page returned by Claude. When absent, the local template simulation is shown. */
  html?: string;
  heroSpec: HeroSpec;
  /** True when the hero was derived from a reference image. */
  inspired: boolean;
  inspirationUrl?: string;
};

/** Search phrase for Dribbble (English works best there). */
export const dribbbleQueries: Record<TemplateId, string> = {
  portfolio: "photography portfolio website hero",
  restaurant: "restaurant website hero",
  store: "ecommerce store website hero",
  landing: "landing page hero",
  business: "business website hero",
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

// Deterministic on purpose: no randomness or dates. The AI part (hero from a reference image) is added by the caller.
export function generateSite(prompt: string, extra?: { heroSpec?: HeroSpec; inspirationUrl?: string }): GeneratedSite {
  const clean = prompt.trim();
  const template = detectTemplate(clean);
  return {
    template,
    brand: extractName(clean) ?? template.defaultBrand,
    prompt: clean,
    heroSpec: extra?.heroSpec ?? defaultSpec(template),
    inspired: !!extra?.heroSpec,
    inspirationUrl: extra?.inspirationUrl,
  };
}
