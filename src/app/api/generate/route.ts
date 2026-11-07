import { generateSchema } from "@/lib/validation";
import { ClaudeError, extractAndSanitizeHtml, runClaude } from "@/lib/claudeLocal";

let busy = false;

function isLocalHost(request: Request) {
  const host = (request.headers.get("host") ?? "").replace(/:\d+$/, "").toLowerCase();
  return host === "localhost" || host === "127.0.0.1" || host === "[::1]";
}

export async function POST(request: Request) {
  // This route spawns a local process, so it is for local testing only.
  const enabled = process.env.NODE_ENV !== "production" || process.env.ENABLE_LOCAL_CLAUDE === "1";
  if (!enabled) {
    return Response.json({ error: "חיבור Claude מקומי כבוי" }, { status: 503 });
  }
  if (!isLocalHost(request)) {
    return Response.json({ error: "זמין מכתובת מקומית בלבד" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "בקשה לא תקינה" }, { status: 400 });
  }
  const parsed = generateSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "הפרומפט חייב להיות בין 3 ל-500 תווים" }, { status: 400 });
  }

  if (busy) return Response.json({ error: "בקשה אחרת כבר בתהליך" }, { status: 429 });
  busy = true;
  try {
    const raw = await runClaude(parsed.data.prompt);
    const html = extractAndSanitizeHtml(raw);
    if (!html) return Response.json({ error: "Claude לא החזיר מסמך HTML תקין" }, { status: 502 });
    return Response.json({ html });
  } catch (e) {
    if (e instanceof ClaudeError) return Response.json({ error: e.message }, { status: e.status });
    console.error(e);
    return Response.json({ error: "שגיאה לא צפויה" }, { status: 500 });
  } finally {
    busy = false;
  }
}
