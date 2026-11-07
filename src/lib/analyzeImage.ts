/**
 * Browser-side "computer vision" for a hero screenshot. No AI, no network.
 * It models the background, finds what stands out from it (text, buttons, visuals)
 * and turns that into a HeroSpec. Pure functions over pixel data so it can be tested.
 */
import type { HeroSpec } from "./heroSpec";

type RGB = [number, number, number];
type Comp = { minx: number; maxx: number; miny: number; maxy: number; area: number; w: number; h: number };

const WORK_W = 640;
const PREVIEW_W = 900; // approximate rendered width of the preview hero, used to scale font sizes

const hex = (c: RGB) => "#" + c.map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0")).join("");
const dist = (a: RGB, b: RGB) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
const lum = (c: RGB) => 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
const mix = (a: RGB, b: RGB, t: number): RGB => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
const sat = (c: RGB) => (Math.max(...c) - Math.min(...c)) / (Math.max(...c) || 1);
const median = (a: number[]) => (a.length ? [...a].sort((x, y) => x - y)[a.length >> 1] : 0);
const pct = (a: number[], p: number) => (a.length ? [...a].sort((x, y) => x - y)[Math.min(a.length - 1, Math.floor(a.length * p))] : 0);

/* ---------- loading ---------- */

/** Filled by the last analysis; used by tests to calibrate thresholds. */
export const lastDebug: Record<string, unknown> = {};

export async function analyzeDataUrl(dataUrl: string): Promise<HeroSpec> {
  const blob = await (await fetch(dataUrl)).blob();
  const bmp = await createImageBitmap(blob);
  const scale = Math.min(1, WORK_W / bmp.width);
  const w = Math.max(64, Math.round(bmp.width * scale));
  const h = Math.max(48, Math.round(bmp.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
  ctx.drawImage(bmp, 0, 0, w, h);
  return analyzeImageData(ctx.getImageData(0, 0, w, h));
}

/* ---------- background model: robust quadratic fit per channel ---------- */

function solve(A: number[][], b: number[]): number[] {
  const n = b.length;
  const M = A.map((r, i) => [...r, b[i]]);
  for (let i = 0; i < n; i++) {
    let p = i;
    for (let r = i + 1; r < n; r++) if (Math.abs(M[r][i]) > Math.abs(M[p][i])) p = r;
    [M[i], M[p]] = [M[p], M[i]];
    if (Math.abs(M[i][i]) < 1e-9) continue;
    for (let r = 0; r < n; r++) {
      if (r === i) continue;
      const f = M[r][i] / M[i][i];
      for (let c = i; c <= n; c++) M[r][c] -= f * M[i][c];
    }
  }
  return M.map((r, i) => (Math.abs(r[i]) < 1e-9 ? 0 : r[n] / r[i]));
}

function feat(x: number, y: number, deg: number) {
  const f: number[] = [];
  for (let i = 0; i <= deg; i++) for (let j = 0; i + j <= deg; j++) f.push(x ** i * y ** j);
  return f;
}

function fitBackground(d: Uint8ClampedArray, w: number, h: number) {
  const sx = 56, sy = 36;
  const samples: { x: number; y: number; c: RGB; ring: boolean }[] = [];
  for (let j = 0; j < sy; j++)
    for (let i = 0; i < sx; i++) {
      const x = Math.min(w - 1, Math.round(((i + 0.5) / sx) * w));
      const y = Math.min(h - 1, Math.round(((j + 0.5) / sy) * h));
      const k = (y * w + x) * 4;
      samples.push({ x: (x / w) * 2 - 1, y: (y / h) * 2 - 1, c: [d[k], d[k + 1], d[k + 2]], ring: i < 3 || i >= sx - 3 || j < 3 || j >= sy - 3 });
    }
  const fit = (use: boolean[], deg: number) => {
    const n = feat(0, 0, deg).length;
    return [0, 1, 2].map((ch) => {
      const A = Array.from({ length: n }, () => new Array(n).fill(0));
      const b = new Array(n).fill(0);
      samples.forEach((s, si) => {
        if (!use[si]) return;
        const f = feat(s.x, s.y, deg);
        for (let r = 0; r < n; r++) {
          b[r] += f[r] * s.c[ch];
          for (let c = 0; c < n; c++) A[r][c] += f[r] * f[c];
        }
      });
      for (let r = 0; r < n; r++) A[r][r] += 1e-2;
      return solve(A, b);
    });
  };
  const evalAt = (coef: number[][], x: number, y: number, deg: number): RGB => {
    const f = feat(x, y, deg);
    return coef.map((cf) => Math.max(0, Math.min(255, cf.reduce((a, v, i) => a + v * f[i], 0)))) as RGB;
  };
  const residuals = (coef: number[][], deg: number) => samples.map((s) => dist(s.c, evalAt(coef, s.x, s.y, deg)));

  // stage 1: smooth model from the outer ring only (the hero's content is rarely there)
  let deg = 2;
  let coef = fit(samples.map((s) => s.ring), deg);
  let res = residuals(coef, deg);
  const ring = samples.map((s, i) => s.ring && res[i] < Math.max(16, 2.2 * median(res.filter((_, k) => samples[k].ring))));
  coef = fit(ring, deg);
  // stage 2: grow to all pixels that agree with it, then refine with a richer model
  res = residuals(coef, deg);
  let use = res.map((r) => r < 24);
  deg = 4;
  let outlierFrac = 0;
  for (let it = 0; it < 4; it++) {
    if (use.filter(Boolean).length < 40) break;
    coef = fit(use, deg);
    res = residuals(coef, deg);
    const inl = res.filter((_, i) => use[i]);
    const thr = Math.max(14, 2.5 * median(inl));
    use = res.map((r) => r < thr);
    outlierFrac = 1 - use.filter(Boolean).length / use.length;
  }
  return { at: (x: number, y: number) => evalAt(coef, x * 2 - 1, y * 2 - 1, deg), outlierFrac };
}

/* ---------- connected components ---------- */

function label(mask: Uint8Array, w: number, h: number, minArea: number): Comp[] {
  const seen = new Uint8Array(mask.length);
  const comps: Comp[] = [];
  const q = new Int32Array(mask.length);
  for (let s = 0; s < mask.length; s++) {
    if (!mask[s] || seen[s]) continue;
    let head = 0, tail = 0;
    q[tail++] = s;
    seen[s] = 1;
    let minx = w, maxx = 0, miny = h, maxy = 0, area = 0;
    while (head < tail) {
      const p = q[head++];
      const x = p % w, y = (p / w) | 0;
      area++;
      if (x < minx) minx = x;
      if (x > maxx) maxx = x;
      if (y < miny) miny = y;
      if (y > maxy) maxy = y;
      if (x > 0 && mask[p - 1] && !seen[p - 1]) { seen[p - 1] = 1; q[tail++] = p - 1; }
      if (x < w - 1 && mask[p + 1] && !seen[p + 1]) { seen[p + 1] = 1; q[tail++] = p + 1; }
      if (y > 0 && mask[p - w] && !seen[p - w]) { seen[p - w] = 1; q[tail++] = p - w; }
      if (y < h - 1 && mask[p + w] && !seen[p + w]) { seen[p + w] = 1; q[tail++] = p + w; }
    }
    if (area >= minArea) comps.push({ minx, maxx, miny, maxy, area, w: maxx - minx + 1, h: maxy - miny + 1 });
  }
  return comps;
}

/** Local fill ratio (box filter) via integral image. */
function boxFill(mask: Uint8Array, w: number, h: number, r: number): Float32Array {
  const I = new Int32Array((w + 1) * (h + 1));
  for (let y = 0; y < h; y++) {
    let row = 0;
    for (let x = 0; x < w; x++) {
      row += mask[y * w + x];
      I[(y + 1) * (w + 1) + x + 1] = I[y * (w + 1) + x + 1] + row;
    }
  }
  const out = new Float32Array(w * h);
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      const x0 = Math.max(0, x - r), x1 = Math.min(w, x + r + 1), y0 = Math.max(0, y - r), y1 = Math.min(h, y + r + 1);
      const s = I[y1 * (w + 1) + x1] - I[y0 * (w + 1) + x1] - I[y1 * (w + 1) + x0] + I[y0 * (w + 1) + x0];
      out[y * w + x] = s / ((x1 - x0) * (y1 - y0));
    }
  return out;
}

/* ---------- palette ---------- */

function dominant(colors: RGB[], n: number, minDist = 42): { c: RGB; share: number }[] {
  const bins = new Map<number, { s: RGB; n: number }>();
  for (const c of colors) {
    const k = ((c[0] >> 4) << 8) | ((c[1] >> 4) << 4) | (c[2] >> 4);
    const b = bins.get(k) ?? { s: [0, 0, 0] as RGB, n: 0 };
    b.s = [b.s[0] + c[0], b.s[1] + c[1], b.s[2] + c[2]];
    b.n++;
    bins.set(k, b);
  }
  const list = [...bins.values()].map((b) => ({ c: [b.s[0] / b.n, b.s[1] / b.n, b.s[2] / b.n] as RGB, n: b.n })).sort((a, b) => b.n - a.n);
  const out: { c: RGB; n: number }[] = [];
  for (const e of list) {
    const near = out.find((o) => dist(o.c, e.c) < minDist);
    if (near) {
      near.c = mix(near.c, e.c, e.n / (near.n + e.n));
      near.n += e.n;
    } else out.push({ ...e });
  }
  out.sort((a, b) => b.n - a.n);
  return out.slice(0, n).map((o) => ({ c: o.c, share: o.n / (colors.length || 1) }));
}

/* ---------- main ---------- */

export function analyzeImageData(img: ImageData): HeroSpec {
  const { data: d, width: w, height: h } = img;
  const N = w * h;
  const px = (x: number, y: number): RGB => {
    const k = (y * w + x) * 4;
    return [d[k], d[k + 1], d[k + 2]];
  };

  /* 1. background */
  const bgm = fitBackground(d, w, h);
  const bgAt = (x: number, y: number) => bgm.at((x + 0.5) / w, (y + 0.5) / h);
  const center = bgm.at(0.5, 0.5);
  const corners = [bgm.at(0.03, 0.03), bgm.at(0.97, 0.03), bgm.at(0.03, 0.97), bgm.at(0.97, 0.97)];
  const cornerMean = corners.reduce((a, c) => [a[0] + c[0] / 4, a[1] + c[1] / 4, a[2] + c[2] / 4] as RGB, [0, 0, 0] as RGB);
  const cornerSpread = Math.max(...corners.map((c) => dist(c, cornerMean)));

  // peak of the smooth model = radial centre candidate
  let peak = { x: 0.5, y: 0.5, v: 0 };
  for (let j = 0; j <= 10; j++)
    for (let i = 0; i <= 10; i++) {
      const v = dist(bgm.at(i / 10, j / 10), cornerMean);
      if (v > peak.v) peak = { x: i / 10, y: j / 10, v };
    }

  // best linear direction (CSS angle) and its end colours
  let best = { angle: 180, a: center, b: center, v: 0 };
  for (let ang = 0; ang < 360; ang += 15) {
    const t = (ang * Math.PI) / 180;
    const dx = Math.sin(t), dy = -Math.cos(t);
    const len = Math.abs(w * dx) + Math.abs(h * dy);
    const ex = (len / 2 / w) * dx, ey = (len / 2 / h) * dy;
    const a = bgm.at(Math.max(0.01, Math.min(0.99, 0.5 - ex)), Math.max(0.01, Math.min(0.99, 0.5 - ey)));
    const b = bgm.at(Math.max(0.01, Math.min(0.99, 0.5 + ex)), Math.max(0.01, Math.min(0.99, 0.5 + ey)));
    const v = dist(a, b);
    if (v > best.v) best = { angle: ang, a, b, v };
  }

  const range = Math.max(best.v, peak.v, cornerSpread);
  let bg: HeroSpec["bg"];
  if (bgm.outlierFrac > 0.6) {
    // busy background (photo): fall back to the two dominant colours
    const all: RGB[] = [];
    for (let i = 0; i < N; i += 7) all.push([d[i * 4], d[i * 4 + 1], d[i * 4 + 2]]);
    const dom = dominant(all, 2);
    bg = { kind: dom.length > 1 ? "linear" : "solid", colors: dom.map((x) => hex(x.c)), angle: 160 };
  } else if (range < 14) {
    bg = { kind: "solid", colors: [hex(mix(center, cornerMean, 0.5))], angle: 0 };
  } else if (peak.v > best.v * 0.9 && peak.v > cornerSpread * 1.6 && peak.v > 22) {
    const patch: RGB[] = [];
    const pxc = Math.round(peak.x * (w - 1)), pyc = Math.round(peak.y * (h - 1)), r = Math.round(Math.min(w, h) * 0.1);
    for (let y = Math.max(0, pyc - r); y <= Math.min(h - 1, pyc + r); y += 2)
      for (let x = Math.max(0, pxc - r); x <= Math.min(w - 1, pxc + r); x += 2) patch.push(px(x, y));
    // the real centre colour: the dominant colour of the patch that is brightest/most saturated among big shares
    const centerReal = dominant(patch, 3, 30).filter((x) => x.share > 0.1 && dist(x.c, bgm.at(peak.x, peak.y)) < 90).sort((a, b) => dist(b.c, cornerMean) - dist(a.c, cornerMean))[0]?.c ?? bgm.at(peak.x, peak.y);
    const centerC = dist(centerReal, cornerMean) > peak.v ? centerReal : bgm.at(peak.x, peak.y);
    // colours run from the centre outwards; add a middle stop when the falloff is not a straight blend
    const far = { x: peak.x < 0.5 ? 1 : 0, y: peak.y < 0.5 ? 1 : 0 };
    const midPt = bgm.at(peak.x + (far.x - peak.x) * 0.5, peak.y + (far.y - peak.y) * 0.5);
    const straight = mix(centerC, cornerMean, 0.5);
    const colors = dist(midPt, straight) > 18 ? [hex(centerC), hex(midPt), hex(cornerMean)] : [hex(centerC), hex(cornerMean)];
    bg = { kind: "radial", colors, angle: 0, cx: Math.round(peak.x * 100), cy: Math.round(peak.y * 100) };
  } else {
    const mid = bgm.at(0.5, 0.5);
    const mean = mix(best.a, best.b, 0.5);
    const colors = dist(mid, mean) > 18 ? [hex(best.a), hex(mid), hex(best.b)] : [hex(best.a), hex(best.b)];
    bg = { kind: "linear", colors, angle: best.angle };
  }
  const bgColor: RGB = bg.kind === "solid" ? center : cornerMean;

  /* 2. foreground mask */
  const fg = new Uint8Array(N);
  const fgDist = new Float32Array(N);
  const fgVals: number[] = [];
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      const b = bgAt(x, y);
      const k = (y * w + x) * 4;
      const dd = Math.hypot(d[k] - b[0], d[k + 1] - b[1], d[k + 2] - b[2]);
      fgDist[y * w + x] = dd;
      if (dd > 38) { fg[y * w + x] = 1; if ((x + y) % 3 === 0) fgVals.push(dd); }
    }
  // text is high-contrast; a stricter cut removes the faint halo where the smooth model under-fits (glows)
  const textThr = Math.max(38, Math.min(140, 0.35 * pct(fgVals, 0.85)));

  /* 3. navigation (top band) */
  const navH = Math.round(h * 0.14);
  const rowFrac = (y: number, x0 = 0, x1 = w) => {
    let c = 0;
    for (let x = x0; x < x1; x++) c += fg[y * w + x];
    return c / (x1 - x0);
  };
  let navFg = 0, navMinX = w, navMaxX = 0;
  for (let y = 0; y < navH; y++)
    for (let x = 0; x < w; x++)
      if (fg[y * w + x]) {
        navFg++;
        if (x < navMinX) navMinX = x;
        if (x > navMaxX) navMaxX = x;
      }
  let nav: HeroSpec["nav"] = "none";
  let navBottom = 0;
  if (navFg / (navH * w) > 0.004 && navMaxX - navMinX > w * 0.3 && navMinX < w * 0.2 && navMaxX > w * 0.7) {
    nav = "minimal";
    let lastRow = 0;
    for (let y = 0; y < navH; y++) if (rowFrac(y) > 0.002) lastRow = y;
    navBottom = lastRow;
    // full-width line or fill under the nav
    for (let y = Math.round(h * 0.04); y < Math.round(h * 0.22); y++) {
      if (rowFrac(y) > 0.88) {
        nav = "bar";
        navBottom = Math.max(navBottom, y + 1);
        break;
      }
    }
    if (nav === "minimal") {
      // pill: a contiguous rounded container inset from both edges
      for (let y = 0; y < Math.round(h * 0.2); y++) {
        let x0 = -1, x1 = -1;
        for (let x = 0; x < w; x++) if (fg[y * w + x]) { if (x0 < 0) x0 = x; x1 = x; }
        if (x0 > w * 0.03 && x1 < w * 0.97 && x1 - x0 > w * 0.4 && rowFrac(y, x0, x1 + 1) > 0.9) {
          nav = "pill";
          navBottom = Math.max(navBottom, y + 1);
          break;
        }
      }
    }
    if (nav === "pill") {
      for (let y = navBottom; y < Math.round(h * 0.22); y++) if (rowFrac(y) > 0.05) navBottom = y + 1;
    }
    navBottom += Math.round(h * 0.02);
  }
  const top = Math.min(navBottom, Math.round(h * 0.25));

  /* 4. big solid shapes (visuals) and button-like components */
  const content = new Uint8Array(N);
  for (let y = top; y < h; y++) for (let x = 0; x < w; x++) content[y * w + x] = fg[y * w + x];
  // visuals must stand out clearly from the background model (not just glow that the model under-fits)
  const strong = new Uint8Array(N);
  for (let y = top; y < h; y++)
    for (let x = 0; x < w; x++) {
      const i = y * w + x;
      if (!fg[i]) continue;
      const b = bgAt(x, y), k = i * 4;
      if (Math.hypot(d[k] - b[0], d[k + 1] - b[1], d[k + 2] - b[2]) > 70) strong[i] = 1;
    }
  const strongFill = boxFill(strong, w, h, 4);
  const solid = new Uint8Array(N);
  for (let i = 0; i < N; i++) if (strong[i] && strongFill[i] > 0.88) solid[i] = 1;
  const solidComps = label(solid, w, h, Math.round(N * 0.004));
  const fgComps = label(content, w, h, Math.round(N * 0.0004));

  const contentH = h - top;
  const isButtonShape = (c: Comp) =>
    c.w / c.h >= 1.7 && c.w / c.h <= 9 && c.h >= contentH * 0.04 && c.h <= contentH * 0.2 && c.w <= w * 0.4 && (c.area / (c.w * c.h) > 0.35 || ringFrac(content, w, c) > 0.8);
  const buttonCands = fgComps.filter(isButtonShape);
  Object.assign(lastDebug, { fgComps: fgComps.map((c) => [c.minx, c.miny, c.w, c.h, c.area]), contentH, top });

  const visualComps = solidComps.filter(
    (c) => c.area >= N * 0.008 && !(c.w > w * 0.92 && c.h > contentH * 0.85) && !buttonCands.some((b) => overlap(b, c) > 0.6),
  );
  const mainVisual = visualComps.slice().sort((a, b) => b.area - a.area)[0];

  /* 5. text: foreground that is neither visual nor button */
  const text = new Uint8Array(N);
  const inside = (c: Comp, x: number, y: number, pad = 2) => x >= c.minx - pad && x <= c.maxx + pad && y >= c.miny - pad && y <= c.maxy + pad;
  for (let y = top; y < h; y++)
    for (let x = 0; x < w; x++) {
      const i = y * w + x;
      if (!fg[i] || fgDist[i] < textThr) continue;
      if (visualComps.some((c) => inside(c, x, y, 3))) continue;
      if (buttonCands.some((c) => inside(c, x, y))) continue;
      text[i] = 1;
    }
  const bands = findBands(text, w, h, top);
  const bandsBig = bands.filter((b) => b.h >= 3 && b.cols > w * 0.03);
  Object.assign(lastDebug, { bands: bandsBig.map((b) => [b.top, b.h, b.minx, b.maxx]) });

  /* heading = the tallest band (+ following lines of similar height) */
  let heading: { top: number; bottom: number; minx: number; maxx: number; em: number; lines: number } | null = null;
  if (bandsBig.length) {
    const tallest = bandsBig.reduce((a, b) => (b.h > a.h ? b : a));
    const lines = bandsBig.filter((b) => Math.abs(b.h - tallest.h) <= tallest.h * 0.3 && Math.abs(b.top - tallest.top) < contentH * 0.45);
    lines.sort((a, b) => a.top - b.top);
    const pitch = lines.length > 1 ? (lines[lines.length - 1].top - lines[0].top) / (lines.length - 1) : 0;
    const hasDescender = tallest.h > 0.88 * (pitch ? pitch / 1.1 : tallest.h);
    const em = pitch > tallest.h * 0.8 ? pitch / 1.1 : tallest.h / (hasDescender ? 0.95 : 0.78);
    heading = {
      top: lines[0].top,
      bottom: lines[lines.length - 1].top + lines[lines.length - 1].h,
      minx: Math.min(...lines.map((l) => l.minx)),
      maxx: Math.max(...lines.map((l) => l.maxx)),
      em,
      lines: lines.length,
    };
  }

  /* 6. buttons vs badge relative to the heading */
  const hy = heading ? heading.bottom : top + contentH * 0.5;
  const below = buttonCands.filter((c) => c.miny >= hy - 4).sort((a, b) => a.miny - b.miny || a.minx - b.minx);
  const above = buttonCands.filter((c) => c.maxy <= (heading?.top ?? 0) + 2);
  const firstRow = below.filter((c) => Math.abs(c.miny - (below[0]?.miny ?? 0)) < (below[0]?.h ?? 0) * 0.6);
  const classifyButton = (c: Comp) => {
    const inner = (x0: number, x1: number) => {
      const cols: RGB[] = [];
      for (let y = c.miny + 3; y <= c.maxy - 3; y++) for (let x = x0; x <= x1; x++) cols.push(px(x, y));
      return dominant(cols, 2, 40)[0]?.c ?? px(x0, c.miny);
    };
    const mid = inner(c.minx + 3, c.maxx - 3);
    const kind: "solid" | "outline" = dist(mid, bgAt((c.minx + c.maxx) >> 1, (c.miny + c.maxy) >> 1)) > 60 ? "solid" : "outline";
    const edge = Math.max(2, Math.round(c.w * 0.12));
    const gradient = kind === "solid" && dist(inner(c.minx + 3, c.minx + 3 + edge), inner(c.maxx - 3 - edge, c.maxx - 3)) > 45;
    return { kind, gradient, color: kind === "solid" ? (gradient ? mix(inner(c.minx + 3, c.minx + 3 + edge), inner(c.maxx - 3 - edge, c.maxx - 3), 0.5) : mid) : borderColor(c), shape: cornerShape(content, w, c, kind === "outline") };
  };
  const borderColor = (c: Comp): RGB => px(c.minx + Math.round(c.w * 0.5), c.miny + 1);
  const rowSorted = firstRow.slice().sort((a, b) => a.minx - b.minx);
  const classified = rowSorted.map((c) => ({ c, info: classifyButton(c) }));
  const primary = (classified.find((x) => x.info.kind === "solid") ?? classified[0])?.info ?? null;
  const secondary = classified.length > 1;

  /* 7. colours */
  const headingPixels: RGB[] = [];
  if (heading) {
    for (let y = heading.top; y < heading.bottom; y++)
      for (let x = heading.minx; x <= heading.maxx; x++) if (text[y * w + x]) headingPixels.push(px(x, y));
  }
  const isDark = lum(bgColor) < 140;
  let textColor: RGB = isDark ? [255, 255, 255] : [20, 20, 25];
  if (headingPixels.length > 30) {
    const dom = dominant(headingPixels, 3, 50);
    // heading ink = the dominant colour farthest from the background
    textColor = dom.filter((x) => x.share > 0.15).sort((a, b) => dist(b.c, bgColor) - dist(a.c, bgColor))[0]?.c ?? dom[0].c;
  }
  const subPixels: RGB[] = [];
  for (const b of bandsBig) {
    if (heading && b.top >= heading.bottom - 2 && b.top < heading.bottom + contentH * 0.25 && b.h < (heading?.em ?? 40) * 0.6) {
      for (let y = b.top; y < b.top + b.h; y++) for (let x = b.minx; x <= b.maxx; x++) if (text[y * w + x]) subPixels.push(px(x, y));
    }
  }
  const textMuted: RGB = subPixels.length > 30 ? (dominant(subPixels, 2, 50).sort((a, b) => dist(b.c, bgColor) - dist(a.c, bgColor))[0]?.c ?? mix(textColor, bgColor, 0.3)) : mix(textColor, bgColor, 0.3);

  let accent: RGB;
  if (primary && primary.kind === "solid") accent = primary.color;
  else if (primary) accent = primary.color;
  else {
    const vis: RGB[] = [];
    if (mainVisual) for (let y = mainVisual.miny; y <= mainVisual.maxy; y += 2) for (let x = mainVisual.minx; x <= mainVisual.maxx; x += 2) vis.push(px(x, y));
    const cand = dominant(vis, 4).filter((x) => sat(x.c) > 0.25);
    accent = cand[0]?.c ?? (sat(textColor) > 0.25 ? textColor : mix(textColor, [124, 58, 237], 0.6));
  }

  /* 8. heading style */
  const headSize = (() => {
    if (!heading) return "xl" as const;
    const px_ = (heading.em / w) * PREVIEW_W;
    const opts: [number, "md" | "lg" | "xl" | "2xl"][] = [[28, "md"], [36, "lg"], [48, "xl"], [60, "2xl"]];
    return opts.reduce((a, b) => (Math.abs(b[0] - px_) < Math.abs(a[0] - px_) ? b : a))[1];
  })();
  let weight: HeroSpec["heading"]["weight"] = "700";
  let font: HeroSpec["heading"]["font"] = "sans";
  let uppercase = false;
  if (heading) {
    const hr: number[] = [], vr: number[] = [];
    for (let y = heading.top; y < heading.bottom; y++) {
      let run = 0;
      for (let x = heading.minx; x <= heading.maxx + 1; x++) {
        if (x <= heading.maxx && text[y * w + x]) run++;
        else if (run) { hr.push(run); run = 0; }
      }
    }
    for (let x = heading.minx; x <= heading.maxx; x++) {
      let run = 0;
      for (let y = heading.top; y <= heading.bottom; y++) {
        if (y < heading.bottom && text[y * w + x]) run++;
        else if (run) { vr.push(run); run = 0; }
      }
    }
    // Anti-aliasing inflates every stroke by about one pixel at working resolution.
    const BIAS = 0.8;
    const md = median(hr);
    const stemRuns = hr.filter((r) => r <= md * 1.6);
    const stemPx = Math.max(0.5, stemRuns.reduce((a, v) => a + v, 0) / (stemRuns.length || 1) - BIAS);
    const stem = stemPx / heading.em;
    // horizontal strokes (crossbars, hairlines): short vertical runs. Serifs make them much thinner than the stems.
    const shortV = vr.filter((r) => r <= stemPx * 2.2 + BIAS);
    const barRatio = Math.max(0.2, (shortV.reduce((a, v) => a + v, 0) / (shortV.length || 1) - BIAS)) / stemPx;
    Object.assign(lastDebug, { barRatio });
    Object.assign(lastDebug, { stemMed: stem, stemP25: pct(hr, 0.25) / heading.em, em: heading.em, hMed: median(hr), vP12: pct(vr, 0.12), vMed: median(vr), lines: heading.lines });
    weight = stem < 0.092 ? "400" : stem < 0.103 ? "500" : stem < 0.113 ? "600" : stem < 0.14 ? "700" : stem < 0.165 ? "800" : "900";
    const contrast = Math.max(0, median(hr) - BIAS) / Math.max(0.8, pct(vr, 0.12) - BIAS);
    Object.assign(lastDebug, { contrast });
    if (barRatio < SERIF_BAR_RATIO) font = "serif";
    // uppercase: flat tops along the first line
    const first = bandsBig.find((b) => b.top === heading!.top);
    if (first) {
      const tops: number[] = [];
      for (let x = first.minx; x <= first.maxx; x++) for (let y = first.top; y < first.top + first.h; y++) if (text[y * w + x]) { tops.push(y - first.top); break; }
      const flat = tops.filter((t) => t <= Math.max(2, first.h * 0.15)).length / (tops.length || 1);
      uppercase = flat > 0.68 && first.h < heading.em * 0.85;
      Object.assign(lastDebug, { flat, firstH: first.h, em: heading.em });
    }
  }

  /* 9. layout */
  const textBoxes = bandsBig.filter((b) => heading && b.top >= heading.top - heading.em * 2.5 && b.top <= heading.bottom + heading.em * 3);
  const tMinX = textBoxes.length ? Math.min(...textBoxes.map((b) => b.minx)) : w * 0.3;
  const tMaxX = textBoxes.length ? Math.max(...textBoxes.map((b) => b.maxx)) : w * 0.7;
  const tCx = (tMinX + tMaxX) / 2 / w;
  const lefts = textBoxes.map((b) => b.minx / w), centers = textBoxes.map((b) => (b.minx + b.maxx) / 2 / w);
  const std = (a: number[]) => { const m = a.reduce((s, v) => s + v, 0) / (a.length || 1); return Math.sqrt(a.reduce((s, v) => s + (v - m) ** 2, 0) / (a.length || 1)); };
  const textCentered = textBoxes.length < 2 ? tCx > 0.4 && tCx < 0.6 : std(centers) < std(lefts) * 0.8 && Math.abs(tCx - 0.5) < 0.1;

  let layout: HeroSpec["layout"];
  let align: HeroSpec["align"] = "start";
  if (mainVisual) {
    // a group of shapes (grid, orbs, cards) counts as one visual
    const grp = visualComps.filter((c) => gap(c, mainVisual) < w * 0.25);
    const vb = {
      minx: Math.min(...grp.map((c) => c.minx)), maxx: Math.max(...grp.map((c) => c.maxx)),
      miny: Math.min(...grp.map((c) => c.miny)), maxy: Math.max(...grp.map((c) => c.maxy)),
    };
    const vCx = (vb.minx + vb.maxx) / 2 / w;
    const vCy = (vb.miny + vb.maxy) / 2;
    const vW = vb.maxx - vb.minx + 1;
    const textTop = heading?.top ?? top, textBottom = Math.max(heading?.bottom ?? top, ...(firstRow.map((c) => c.maxy)));
    const vertSep = vb.miny >= (heading?.bottom ?? 0) - 4 || vb.maxy <= textTop + 4;
    if (Math.abs(vCx - 0.5) < 0.2 && vW > w * 0.3 && vertSep && (vCy > textBottom || vCy < textTop)) {
      layout = "stacked-visual";
      align = "center";
    } else {
      // keep the picture's physical arrangement: text on the left of the image = RTL "end" side
      layout = vCx > 0.5 ? "split-end" : "split-start";
    }
  } else if (textCentered) {
    layout = "centered";
    align = "center";
  } else {
    layout = tCx < 0.5 ? "end" : "start";
  }

  /* 10. visual element */
  let visual: HeroSpec["visual"] = { kind: "none", colors: [hex(accent)] };
  let visualRadius: number | null = null;
  if (mainVisual) {
    const cols: RGB[] = [];
    for (const vc of visualComps) for (let y = vc.miny; y <= vc.maxy; y += 2) for (let x = vc.minx; x <= vc.maxx; x += 2) if (solid[y * w + x]) cols.push(px(x, y));
    const dom = dominant(cols, 3, 36).map((x) => hex(x.c));
    const bboxFill = mainVisual.area / (mainVisual.w * mainVisual.h);
    const near = visualComps.filter((c) => overlap(c, mainVisual) > 0 || gap(c, mainVisual) < w * 0.04);
    const colorVar = dominant(cols, 6, 30).filter((x) => x.share > 0.08).length;
    const top3 = dominant(cols, 3, 36);
    const discrete = top3.length >= 3 && top3.every((x) => x.share > 0.12) && top3.reduce((a, x) => a + x.share, 0) > 0.7;
    const circleLike = (c: Comp) => c.area / (c.w * c.h) < 0.86 && c.w / c.h > 0.75 && c.w / c.h < 1.33;
    let kind: HeroSpec["visual"]["kind"];
    if (visualComps.length >= 4 && visualComps.every((c) => Math.abs(c.w - visualComps[0].w) < c.w * 0.3)) kind = "grid";
    else if (visualComps.length >= 2 && visualComps.every(circleLike)) kind = "orbs";
    else if (near.length >= 2 && near.some((c, i) => near.some((o, j) => i < j && overlap(c, o) > 0.15))) kind = "card-stack";
    else if (visualComps.length >= 2) kind = "shapes";
    else if (bboxFill < 0.86 && circleLike(mainVisual)) kind = "orbs";
    else if (discrete && bboxFill < 0.93) kind = "card-stack";
    else if (bboxFill < 0.86) kind = "shapes";
    else if (colorVar >= 4) kind = "photo-block";
    else kind = hasTopStrip(content, solid, w, mainVisual) ? "browser" : "photo-block";
    let visColors = dom;
    if (kind === "orbs" && top3.length >= 2) {
      // orbs: [main, its lighter/darker partner, the most different colour]
      const five = dominant(cols, 5, 36).map((x) => x.c);
      const main = five[0];
      const rest = five.slice(1).sort((p, q) => dist(p, main) - dist(q, main));
      visColors = [hex(main), hex(rest[0] ?? main), hex(rest[rest.length - 1] ?? main)];
    }
    visual = { kind, colors: visColors.length ? visColors : [hex(accent)] };
    visualRadius = kind === "orbs" ? null : cornerRadiusRatio(strong, w, rawBox(strong, w, h, mainVisual));
  }

  /* 11. radius, spacing, extras */
  let radius: HeroSpec["radius"] = "md";
  if (visualRadius !== null) radius = ratioToRadius(visualRadius);
  else if (primary) radius = primary.shape === "square" ? "none" : primary.shape === "pill" ? "xl" : "md";
  const textTop2 = heading?.top ?? top;
  const textBottom2 = Math.max(heading?.bottom ?? top, ...firstRow.map((c) => c.maxy), ...textBoxes.map((b) => b.top + b.h));
  const occupancy = (textBottom2 - textTop2) / contentH;
  const spacing: HeroSpec["spacing"] = occupancy > 0.7 ? "compact" : occupancy < 0.42 ? "airy" : "normal";

  const bottomBand = bands.filter((b) => b.top > h * 0.82 && b.cols > w * 0.05);
  const logos = bottomBand.length > 0 && countClusters(text, w, bottomBand[0].top, bottomBand[0].h) >= 4;

  return {
    bg,
    text: hex(textColor),
    textMuted: hex(textMuted),
    accent: hex(accent),
    layout,
    align,
    heading: { size: headSize, weight, font, tracking: Number(weight) >= 700 ? "tight" : "normal", uppercase },
    nav,
    button: {
      fill: primary ? (primary.kind === "outline" ? "outline" : primary.gradient ? "gradient" : "solid") : "solid",
      shape: primary?.shape ?? "rounded",
      secondary,
    },
    visual,
    radius,
    spacing,
    extras: { badge: above.length > 0, stats: false, logos },
  };
}

/** Calibrated on synthetic renders: horizontal-stroke thickness / stem thickness (sans 0.79-1.04, serif 0.49-0.59). */
const SERIF_BAR_RATIO = 0.69;

/* ---------- helpers ---------- */

/** Bounding box of the strong-mask region around a (eroded) solid component. */
function rawBox(mask: Uint8Array, w: number, h: number, c: Comp): Comp {
  let { minx, maxx, miny, maxy } = c;
  const grow = (dx: number, dy: number, test: () => boolean) => { void dx; void dy; void test; };
  void grow;
  const colHas = (x: number) => { for (let y = miny; y <= maxy; y++) if (mask[y * w + x]) return true; return false; };
  const rowHas = (y: number) => { for (let x = minx; x <= maxx; x++) if (mask[y * w + x]) return true; return false; };
  while (minx > 0 && colHas(minx - 1)) minx--;
  while (maxx < w - 1 && colHas(maxx + 1)) maxx++;
  while (miny > 0 && rowHas(miny - 1)) miny--;
  while (maxy < h - 1 && rowHas(maxy + 1)) maxy++;
  return { ...c, minx, maxx, miny, maxy, w: maxx - minx + 1, h: maxy - miny + 1 };
}
function overlap(a: Comp, b: Comp) {
  const ix = Math.max(0, Math.min(a.maxx, b.maxx) - Math.max(a.minx, b.minx) + 1);
  const iy = Math.max(0, Math.min(a.maxy, b.maxy) - Math.max(a.miny, b.miny) + 1);
  return (ix * iy) / Math.min(a.w * a.h, b.w * b.h);
}
/** How much of a box's outline is foreground: tells an outlined button from scattered text. */
function ringFrac(mask: Uint8Array, w: number, c: Comp) {
  let hit = 0, n = 0;
  const at = (x: number, y: number) => mask[y * w + x] || mask[y * w + x + 1] || mask[(y + 1) * w + x] || mask[(y - 1) * w + x] || mask[y * w + x - 1];
  for (let x = c.minx + 2; x <= c.maxx - 2; x++) {
    hit += (at(x, c.miny + 1) ? 1 : 0) + (at(x, c.maxy - 1) ? 1 : 0);
    n += 2;
  }
  for (let y = c.miny + 2; y <= c.maxy - 2; y++) {
    hit += (at(c.minx + 1, y) ? 1 : 0) + (at(c.maxx - 1, y) ? 1 : 0);
    n += 2;
  }
  return hit / (n || 1);
}
function gap(a: Comp, b: Comp) {
  const gx = Math.max(0, Math.max(a.minx, b.minx) - Math.min(a.maxx, b.maxx));
  const gy = Math.max(0, Math.max(a.miny, b.miny) - Math.min(a.maxy, b.maxy));
  return Math.hypot(gx, gy);
}

type Band = { top: number; h: number; minx: number; maxx: number; cols: number };
function findBands(mask: Uint8Array, w: number, h: number, from: number): Band[] {
  return splitTall(rawBands(mask, w, h, from), mask, w);
}

/** A tall band is often two heading lines with tight leading; split it at the row-count valley. */
function splitTall(bands: Band[], mask: Uint8Array, w: number): Band[] {
  const out: Band[] = [];
  for (const b of bands) {
    if (b.h < 36) { out.push(b); continue; }
    const rows: number[] = [];
    for (let y = b.top; y < b.top + b.h; y++) {
      let c = 0;
      for (let x = b.minx; x <= b.maxx; x++) c += mask[y * w + x];
      rows.push(c);
    }
    const sm = rows.map((_, i) => (rows[Math.max(0, i - 1)] + rows[i] + rows[Math.min(rows.length - 1, i + 1)]) / 3);
    const max = Math.max(...sm);
    let cut = -1, minV = Infinity;
    for (let i = Math.round(rows.length * 0.3); i < Math.round(rows.length * 0.7); i++) if (sm[i] < minV) { minV = sm[i]; cut = i; }
    const peakA = Math.max(...sm.slice(0, cut)), peakB = Math.max(...sm.slice(cut));
    if (cut > 0 && minV < Math.min(peakA, peakB) * 0.55 && Math.min(peakA, peakB) > max * 0.5) {
      const trim = (from: number, to: number): Band => {
        let t = from, e = to;
        while (t < e && rows[t] <= 1) t++;
        while (e > t && rows[e - 1] <= 1) e--;
        return { top: b.top + t, h: Math.max(1, e - t), minx: b.minx, maxx: b.maxx, cols: b.cols };
      };
      const parts: Band[] = [trim(0, cut), trim(cut, b.h)];
      out.push(...splitTall(parts, mask, w));
    } else out.push(b);
  }
  return out;
}

function rawBands(mask: Uint8Array, w: number, h: number, from: number): Band[] {
  const bands: Band[] = [];
  let start = -1, lastHit = -1;
  const rowHas = (y: number) => {
    let c = 0;
    for (let x = 0; x < w; x++) c += mask[y * w + x];
    return c;
  };
  for (let y = from; y <= h; y++) {
    const c = y < h ? rowHas(y) : 0;
    if (c > 1) {
      if (start < 0) start = y;
      lastHit = y;
    } else if (start >= 0 && y - lastHit > 2) {
      let minx = w, maxx = 0, cols = 0;
      for (let x = 0; x < w; x++) {
        let any = false;
        for (let yy = start; yy <= lastHit; yy++) if (mask[yy * w + x]) { any = true; break; }
        if (any) { cols++; if (x < minx) minx = x; if (x > maxx) maxx = x; }
      }
      bands.push({ top: start, h: lastHit - start + 1, minx, maxx, cols });
      start = -1;
    }
  }
  return bands;
}

function countClusters(mask: Uint8Array, w: number, top: number, bh: number) {
  let clusters = 0, gapRun = 0, inCluster = false;
  for (let x = 0; x < w; x++) {
    let any = false;
    for (let y = top; y < top + bh; y++) if (mask[y * w + x]) { any = true; break; }
    if (any) { if (!inCluster) { clusters++; inCluster = true; } gapRun = 0; }
    else if (inCluster && ++gapRun > w * 0.025) inCluster = false;
  }
  return clusters;
}

function hasTopStrip(content: Uint8Array, solid: Uint8Array, w: number, c: Comp) {
  // browser mock: a thin bar along the top whose rows differ from the body
  const strip = Math.max(3, Math.round(c.h * 0.1));
  let a = 0, b = 0, na = 0, nb = 0;
  for (let y = c.miny; y <= c.maxy; y++) for (let x = c.minx; x <= c.maxx; x++) {
    const v = content[y * w + x];
    if (y < c.miny + strip) { a += v; na++; } else { b += v; nb++; }
  }
  return na > 0 && Math.abs(a / na - b / nb) > 0.1;
}

/** Corner probes: pill / rounded / square for a button-sized box. */
function cornerShape(mask: Uint8Array, w: number, c: Comp, ring: boolean): "square" | "rounded" | "pill" {
  const p = (d: number) => {
    const o = Math.max(1, Math.round(c.h * d));
    const pts = [[c.minx + o, c.miny + o], [c.maxx - o, c.miny + o], [c.minx + o, c.maxy - o], [c.maxx - o, c.maxy - o]];
    return pts.length;
  };
  const tight = Math.max(1, Math.round(c.h * 0.04));
  const probe = (o: number) => [[c.minx + o, c.miny + o], [c.maxx - o, c.miny + o], [c.minx + o, c.maxy - o], [c.maxx - o, c.maxy - o]].filter(([x, y]) => mask[y * w + x] || (ring && (mask[y * w + x + 1] || mask[y * w + x - 1] || mask[(y + 1) * w + x] || mask[(y - 1) * w + x]))).length;
  void p;
  if (probe(0) >= 3 || probe(tight) >= 3) return "square";
  if (probe(Math.max(tight + 1, Math.round(c.h * 0.1))) >= 3) return "rounded";
  return "pill";
}

/** Estimated corner radius / min(w,h) of a filled box. */
function cornerRadiusRatio(mask: Uint8Array, w: number, c: Comp): number {
  const m = Math.min(c.w, c.h);
  for (let o = 1; o < m * 0.5; o++) {
    const pts = [[c.minx + o, c.miny + o], [c.maxx - o, c.miny + o], [c.minx + o, c.maxy - o], [c.maxx - o, c.maxy - o]];
    if (pts.filter(([x, y]) => mask[y * w + x]).length >= 3) return o / 0.293 / m;
  }
  return 0.5;
}
function ratioToRadius(r: number): HeroSpec["radius"] {
  return r < 0.03 ? "none" : r < 0.08 ? "sm" : r < 0.15 ? "md" : r < 0.26 ? "lg" : "xl";
}
