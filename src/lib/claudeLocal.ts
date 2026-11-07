import { spawn } from "node:child_process";
import { GENERATOR_MODEL, GENERATOR_SYSTEM_PROMPT } from "./generatorPrompt";

const TIMEOUT_MS = 90_000;
const MAX_OUTPUT = 300_000;

export class ClaudeError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

/**
 * Sends the prompt to the locally installed Claude Code CLI (`claude -p`).
 * No shell is involved and the prompt travels over stdin. All tools are disabled,
 * so the model can only return text.
 */
export function runClaude(prompt: string): Promise<string> {
  const bin = process.env.CLAUDE_BIN ?? "claude";
  const args = [
    "-p",
    "--model",
    GENERATOR_MODEL,
    "--tools",
    "",
    "--no-session-persistence",
    "--disable-slash-commands",
    "--strict-mcp-config",
    "--output-format",
    "text",
    "--system-prompt",
    GENERATOR_SYSTEM_PROMPT,
  ];

  return new Promise((resolve, reject) => {
    const child = spawn(bin, args, { shell: false, stdio: ["pipe", "pipe", "pipe"] });
    let out = "";
    let err = "";
    let settled = false;

    const finish = (fn: () => void) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      fn();
    };

    const timer = setTimeout(() => {
      child.kill("SIGKILL");
      finish(() => reject(new ClaudeError("Claude לא הגיב בזמן", 504)));
    }, TIMEOUT_MS);

    child.stdout.on("data", (d: Buffer) => {
      out += d.toString("utf8");
      if (out.length > MAX_OUTPUT * 2) {
        child.kill("SIGKILL");
        finish(() => reject(new ClaudeError("התשובה ארוכה מדי", 502)));
      }
    });
    child.stderr.on("data", (d: Buffer) => {
      err = (err + d.toString("utf8")).slice(-2000);
    });
    child.on("error", (e) => finish(() => reject(new ClaudeError(`לא ניתן להפעיל את Claude CLI: ${e.message}`, 502))));
    child.on("close", (code) =>
      finish(() => {
        if (code !== 0) {
          console.error("claude CLI failed:", code, err);
          reject(new ClaudeError("Claude CLI נכשל", 502));
        } else resolve(out);
      }),
    );

    child.stdin.on("error", () => {});
    child.stdin.end(prompt);
  });
}

const CSP =
  `<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; img-src data:; font-src data:">`;

/** Extracts the HTML document from the model output and strips anything active. */
export function extractAndSanitizeHtml(raw: string): string | null {
  const start = raw.search(/<!doctype html|<html[\s>]/i);
  const endMatch = raw.toLowerCase().lastIndexOf("</html>");
  if (start === -1 || endMatch === -1 || endMatch < start) return null;

  let html = raw.slice(start, endMatch + "</html>".length).slice(0, MAX_OUTPUT);

  html = html
    .replace(/<script[\s\S]*?<\/script\s*>/gi, "")
    .replace(/<(iframe|object|embed|form)\b[\s\S]*?<\/\1\s*>/gi, "")
    .replace(/<\/?(iframe|object|embed|form|link|base)\b[^>]*>/gi, "")
    .replace(/<meta[^>]+http-equiv\s*=\s*["']?refresh[^>]*>/gi, "")
    .replace(/\son[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/javascript:/gi, "blocked:");

  if (/<head[^>]*>/i.test(html)) html = html.replace(/<head[^>]*>/i, (m) => `${m}${CSP}`);
  else html = html.replace(/<html[^>]*>/i, (m) => `${m}<head>${CSP}</head>`);

  return html;
}
