import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { ANALYZE_PROMPT, heroJsonSchema, heroSpecSchema } from "@/lib/heroSpec";

export const maxDuration = 60;

const MODEL = process.env.ANTHROPIC_MODEL ?? "claude-opus-5-5";
const MAX_IMAGE_B64 = 6_000_000; // ~4.5MB of image data
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"] as const;

const bodySchema = z.object({
  image: z.string().max(MAX_IMAGE_B64 + 100).optional(), // data URL
  url: z.string().max(500).optional(), // dribbble shot url
  fetchOnly: z.boolean().optional(), // just load the shot image (no AI); the browser analyses it itself
});

// Very small in-memory rate limit (per server instance). Replace with a shared store in production.
const hits = new Map<string, number[]>();
function limited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < 10 * 60_000);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > 8;
}

function isDribbble(host: string) {
  return host === "dribbble.com" || host.endsWith(".dribbble.com");
}

/** Loads the preview image of one Dribbble shot URL (og:image). Only dribbble hosts are fetched. */
async function imageFromDribbble(raw: string): Promise<{ type: string; data: string } | null> {
  let page: URL;
  try {
    page = new URL(raw);
  } catch {
    return null;
  }
  if (page.protocol !== "https:" || !isDribbble(page.hostname)) return null;
  const signal = AbortSignal.timeout(8000);
  const html = await fetch(page, { signal, redirect: "manual", headers: { "User-Agent": "Mozilla/5.0" } }).then((r) => (r.ok ? r.text() : ""));
  const m = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i) ?? html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i);
  if (!m) return null;
  let img: URL;
  try {
    img = new URL(m[1].replace(/&amp;/g, "&"));
  } catch {
    return null;
  }
  if (img.protocol !== "https:" || !isDribbble(img.hostname)) return null;
  const res = await fetch(img, { signal, redirect: "manual" });
  const type = res.headers.get("content-type")?.split(";")[0] ?? "";
  if (!res.ok || !(ALLOWED_TYPES as readonly string[]).includes(type)) return null;
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length > 4_500_000) return null;
  return { type, data: buf.toString("base64") };
}

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (limited(ip)) return Response.json({ error: "rate_limited" }, { status: 429 });

  const parsedBody = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsedBody.success) return Response.json({ error: "bad_request" }, { status: 400 });
  const { image, url, fetchOnly } = parsedBody.data;

  if (fetchOnly) {
    const shot = url ? await imageFromDribbble(url).catch(() => null) : null;
    if (!shot) return Response.json({ error: "url_unreadable" }, { status: 422 });
    return Response.json({ image: `data:${shot.type};base64,${shot.data}` });
  }

  if (!process.env.ANTHROPIC_API_KEY) return Response.json({ error: "ai_unavailable" }, { status: 503 });

  let media: { type: string; data: string } | null = null;
  if (image) {
    const m = image.match(/^data:(image\/[a-z]+);base64,([A-Za-z0-9+/=]+)$/);
    if (m && (ALLOWED_TYPES as readonly string[]).includes(m[1])) media = { type: m[1], data: m[2] };
  } else if (url) {
    media = await imageFromDribbble(url).catch(() => null);
    if (!media) return Response.json({ error: "url_unreadable" }, { status: 422 });
  }
  if (!media) return Response.json({ error: "bad_image" }, { status: 400 });

  try {
    const client = new Anthropic();
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 4000,
      output_config: { effort: "low", format: { type: "json_schema", schema: heroJsonSchema as unknown as Record<string, unknown> } },
      messages: [
        {
          role: "user",
          content: [
            { type: "image", source: { type: "base64", media_type: media.type as (typeof ALLOWED_TYPES)[number], data: media.data } },
            { type: "text", text: ANALYZE_PROMPT },
          ],
        },
      ],
    });
    const text = response.content.find((b) => b.type === "text");
    if (!text || text.type !== "text") return Response.json({ error: "no_result" }, { status: 502 });
    const spec = heroSpecSchema.safeParse(JSON.parse(text.text));
    if (!spec.success) return Response.json({ error: "invalid_spec" }, { status: 502 });
    return Response.json({ spec: spec.data });
  } catch (err) {
    console.error("analyze-inspiration failed:", err instanceof Anthropic.APIError ? err.status : err);
    return Response.json({ error: "ai_failed" }, { status: 502 });
  }
}
