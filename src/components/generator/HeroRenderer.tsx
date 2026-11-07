import type { CSSProperties } from "react";
import type { TemplateDef } from "@/data/templates";
import type { HeroSpec } from "@/lib/heroSpec";

/** Readable text colour on top of a filled colour. */
function onColor(hexColor: string) {
  const n = parseInt(hexColor.slice(1), 16);
  const l = 0.2126 * (n >> 16) + 0.7152 * ((n >> 8) & 255) + 0.0722 * (n & 255);
  return l > 170 ? "#111111" : "#ffffff";
}

const radii = { none: "0px", sm: "6px", md: "12px", lg: "20px", xl: "32px" } as const;
const sizes = { md: "1.75rem", lg: "2.25rem", xl: "3rem", "2xl": "3.75rem" } as const;
const fonts = { sans: "inherit", serif: "Georgia, 'Times New Roman', serif", mono: "ui-monospace, Menlo, monospace" } as const;
const tracking = { tight: "-0.03em", normal: "0", wide: "0.08em" } as const;
const padding = { compact: "2rem 1.5rem", normal: "3.5rem 2rem", airy: "5.5rem 2.5rem" } as const;

function background(bg: HeroSpec["bg"]) {
  const [a] = bg.colors;
  if (bg.kind === "solid") return a;
  // radial: colours run from the centre outwards
  if (bg.kind === "radial") return `radial-gradient(circle farthest-corner at ${bg.cx ?? 50}% ${bg.cy ?? 40}%, ${bg.colors.join(", ")})`;
  return `linear-gradient(${bg.angle}deg, ${bg.colors.join(", ")})`;
}

function Visual({ spec }: { spec: HeroSpec }) {
  const { kind, colors } = spec.visual;
  const [c1, c2 = c1, c3 = c2] = colors;
  const r = radii[spec.radius];
  const box = "relative aspect-[4/3] w-full";
  if (kind === "none") return null;
  if (kind === "orbs")
    return (
      <div className={box} aria-hidden="true">
        <i className="absolute start-[6%] top-[4%] aspect-square w-[58%] rounded-full" style={{ background: `radial-gradient(circle at 30% 30%, ${c2}, ${c1})` }} />
        <i className="absolute bottom-[2%] end-[6%] aspect-square w-[38%] rounded-full" style={{ background: c3 }} />
      </div>
    );
  if (kind === "rings")
    return (
      <div className={box} aria-hidden="true">
        {[90, 66, 42].map((s, i) => (
          <i key={s} className="absolute inset-0 m-auto aspect-square rounded-full border-2" style={{ height: `${s}%`, borderColor: [c1, c2, c3][i] }} />
        ))}
      </div>
    );
  if (kind === "grid")
    return (
      <div className={`${box} grid grid-cols-3 gap-2`} aria-hidden="true">
        {Array.from({ length: 9 }, (_, i) => (
          <i key={i} className="aspect-square" style={{ background: [c1, c2, c3][i % 3], opacity: 0.35 + (i % 4) * 0.2, borderRadius: r }} />
        ))}
      </div>
    );
  if (kind === "shapes")
    return (
      <div className={box} aria-hidden="true">
        <i className="absolute start-[6%] top-[10%] size-[46%]" style={{ background: c1, borderRadius: r }} />
        <i className="absolute bottom-[8%] end-[10%] size-[50%] rotate-12" style={{ background: c2, borderRadius: r }} />
        <i className="absolute end-[28%] top-[6%] h-[22%] w-[22%] rounded-full" style={{ background: c3 }} />
      </div>
    );
  if (kind === "browser")
    return (
      <div className={`${box} overflow-hidden border`} style={{ borderRadius: r, borderColor: c2, background: c1 }} aria-hidden="true">
        <div className="flex gap-1.5 p-2.5" style={{ background: c2 }}>
          {[0, 1, 2].map((i) => <i key={i} className="size-2 rounded-full" style={{ background: c3, opacity: 0.8 }} />)}
        </div>
        <div className="space-y-2 p-4">
          <i className="block h-3 w-1/2 rounded" style={{ background: c3 }} />
          <i className="block h-16 rounded" style={{ background: c2 }} />
          <i className="block h-3 w-3/4 rounded" style={{ background: c2 }} />
        </div>
      </div>
    );
  if (kind === "card-stack")
    return (
      <div className={box} aria-hidden="true">
        {[c3, c2, c1].map((c, i) => (
          <i key={i} className="absolute h-[62%] w-[70%] shadow-xl" style={{ background: c, borderRadius: r, top: `${i * 12 + 4}%`, insetInlineStart: `${i * 10}%`, transform: `rotate(${(i - 1) * 5}deg)` }} />
        ))}
      </div>
    );
  // photo-block: abstract image placeholder
  return <div className={box} style={{ borderRadius: r, background: `linear-gradient(135deg, ${c1}, ${c2} 60%, ${c3})` }} aria-hidden="true" />;
}

export default function HeroRenderer({ spec, t, brand }: { spec: HeroSpec; t: TemplateDef; brand: string }) {
  const r = radii[spec.radius];
  const split = spec.layout === "split-start" || spec.layout === "split-end";
  const stacked = spec.layout === "stacked-visual";
  const center = spec.align === "center" && !split && spec.layout !== "end" && spec.layout !== "start";
  const endAligned = spec.layout === "end";
  const b = spec.button;
  const btnRadius = b.shape === "pill" ? "9999px" : b.shape === "rounded" ? r === "0px" ? "8px" : r : "0px";

  const btn = (label: string, primary: boolean): CSSProperties => ({
    borderRadius: btnRadius,
    padding: "0.65rem 1.5rem",
    fontWeight: 600,
    display: "inline-block",
    ...(primary && b.fill !== "outline"
      ? { background: b.fill === "gradient" ? `linear-gradient(90deg, ${spec.accent}, ${spec.visual.colors[0]})` : spec.accent, color: onColor(b.fill === "gradient" ? spec.accent : spec.accent) }
      : { border: `1.5px solid ${primary ? spec.accent : spec.textMuted}`, color: primary ? spec.accent : spec.text }),
  });

  const textBlock = (
    <div className={`flex flex-col gap-4 ${center ? "items-center text-center" : endAligned ? "items-end text-end" : "items-start text-start"}`}>
      {spec.extras.badge && (
        <span className="rounded-full px-3 py-1 text-xs font-semibold" style={{ background: `${spec.accent}33`, color: spec.accent }}>
          {t.label}
        </span>
      )}
      <h3
        style={{
          fontSize: sizes[spec.heading.size],
          fontWeight: Number(spec.heading.weight),
          fontFamily: fonts[spec.heading.font],
          letterSpacing: tracking[spec.heading.tracking],
          textTransform: spec.heading.uppercase ? "uppercase" : undefined,
          lineHeight: 1.1,
        }}
        className="max-sm:!text-3xl"
      >
        {t.headline}
      </h3>
      <p className="max-w-lg" style={{ color: spec.textMuted, opacity: 0.85 }}>
        {t.subheadline}
      </p>
      <div className="mt-2 flex flex-wrap gap-3">
        <span style={btn(t.cta, true)}>{t.cta}</span>
        {b.secondary && <span style={btn("למידע נוסף", false)}>למידע נוסף</span>}
      </div>
      {spec.extras.stats && (
        <div className="mt-4 flex gap-8">
          {[["120+", "לקוחות"], ["8", "שנות ניסיון"], ["4.9", "דירוג"]].map(([n, l]) => (
            <div key={l}>
              <div className="text-xl font-bold" style={{ color: spec.accent }}>{n}</div>
              <div className="text-xs" style={{ color: spec.textMuted, opacity: 0.7 }}>{l}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const visual = spec.visual.kind !== "none" && <Visual spec={spec} />;

  return (
    <div style={{ background: background(spec.bg), color: spec.text }} className="fade-up">
      {spec.nav !== "none" && (
        <div className={`flex items-center justify-between gap-4 px-5 py-3 text-sm ${spec.nav === "pill" ? "mx-auto mt-4 w-[92%] max-w-xl rounded-full border" : spec.nav === "bar" ? "border-b" : ""}`}
          style={{ borderColor: `${spec.textMuted}33`, background: spec.nav === "pill" ? `${spec.text}12` : undefined }}>
          <strong style={{ color: spec.accent }}>{brand}</strong>
          <nav className="flex flex-wrap gap-x-3 gap-y-1 text-xs sm:gap-4 sm:text-sm" style={{ opacity: 0.8 }}>
            {t.navItems.map((n) => <span key={n}>{n}</span>)}
          </nav>
        </div>
      )}
      <div style={{ padding: padding[spec.spacing] }}>
        {split ? (
          <div className={`grid items-center gap-8 sm:grid-cols-2 ${spec.layout === "split-end" ? "sm:[&>*:first-child]:order-2" : ""}`}>
            {textBlock}
            {visual}
          </div>
        ) : stacked ? (
          <div className="flex flex-col items-center gap-8">
            {textBlock}
            {visual && <div className="w-full max-w-md">{visual}</div>}
          </div>
        ) : (
          <div className={center ? "mx-auto max-w-2xl" : endAligned ? "ms-auto max-w-xl" : "max-w-xl"}>{textBlock}</div>
        )}
        {spec.extras.logos && (
          <div className="mt-10 flex flex-wrap justify-center gap-6" aria-hidden="true">
            {[0, 1, 2, 3, 4].map((i) => <i key={i} className="h-3 w-16 rounded-full" style={{ background: spec.textMuted, opacity: 0.25 }} />)}
          </div>
        )}
      </div>
    </div>
  );
}
