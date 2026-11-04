import type { GeneratedSite } from "@/lib/generator";

function Frame({ url, children }: { url: string; children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-panel border border-line-strong bg-white shadow-card">
      <div className="flex items-center gap-3 border-b border-line bg-surface-2 px-4 py-2.5" dir="ltr">
        <span className="flex gap-1.5" aria-hidden="true">
          <i className="size-3 rounded-full bg-red-400" />
          <i className="size-3 rounded-full bg-amber-400" />
          <i className="size-3 rounded-full bg-green-400" />
        </span>
        <span className="flex-1 truncate rounded-md bg-card px-3 py-1 text-center text-xs text-ink-subtle">{url}</span>
      </div>
      {children}
    </div>
  );
}

export function PreviewEmpty() {
  return (
    <Frame url="your-site.com">
      <div className="flex aspect-[16/9] min-h-64 flex-col items-center justify-center gap-2 bg-card text-center text-ink-muted">
        <span className="text-4xl" aria-hidden="true">
          🪄
        </span>
        <p className="font-medium">הדמו שלכם יופיע כאן</p>
        <p className="text-sm">כתבו מה אתם רוצים ולחצו על ״צור דמו ב-AI״</p>
      </div>
    </Frame>
  );
}

export function PreviewLoading({ message }: { message: string }) {
  return (
    <Frame url="building…">
      <div className="min-h-64 space-y-4 bg-card p-6" aria-hidden="true">
        <div className="h-8 w-1/3 rounded-lg shimmer" />
        <div className="h-24 rounded-xl shimmer" />
        <div className="grid grid-cols-3 gap-3">
          <div className="h-20 rounded-xl shimmer" />
          <div className="h-20 rounded-xl shimmer" />
          <div className="h-20 rounded-xl shimmer" />
        </div>
      </div>
      <p role="status" aria-live="polite" className="border-t border-line bg-surface px-4 py-3 text-center text-sm font-medium text-violet-200">
        {message}
      </p>
    </Frame>
  );
}

const tileGradients = [
  "linear-gradient(135deg,#f59e0b,#b45309)",
  "linear-gradient(135deg,#6366f1,#1e1b4b)",
  "linear-gradient(135deg,#14b8a6,#134e4a)",
  "linear-gradient(135deg,#ec4899,#831843)",
  "linear-gradient(135deg,#64748b,#0f172a)",
  "linear-gradient(135deg,#84cc16,#365314)",
];

export function PreviewSite({ site }: { site: GeneratedSite }) {
  const { template: t, brand } = site;
  const { bg, fg, accent, soft } = t.palette;

  return (
    <Frame url={`${brand.replace(/\s+/g, "-")}.co.il`}>
      <div className="fade-up" style={{ background: bg, color: fg }}>
        <div className="flex flex-wrap items-center justify-between gap-2 px-5 py-3 text-sm" style={{ background: soft }}>
          <strong style={{ color: accent }}>{brand}</strong>
          <nav className="flex gap-4 opacity-80">
            {t.navItems.map((n) => (
              <span key={n}>{n}</span>
            ))}
          </nav>
        </div>

        <div className="px-6 py-10 text-center sm:py-14">
          <h3 className="text-2xl font-extrabold sm:text-4xl">{t.headline}</h3>
          <p className="mx-auto mt-3 max-w-xl opacity-80">{t.subheadline}</p>
          <span className="mt-6 inline-block rounded-lg px-6 py-2.5 font-semibold text-white" style={{ background: accent }}>
            {t.cta}
          </span>
        </div>

        <div className="grid gap-4 px-6 pb-10 sm:grid-cols-3">
          {t.layout === "gallery" &&
            tileGradients.map((g, i) => (
              <div key={i} className="aspect-[4/3] rounded-xl" style={{ background: g }} aria-hidden="true" />
            ))}

          {t.layout !== "gallery" &&
            t.blocks.map((b) => (
              <div key={b.title} className="rounded-xl p-4" style={{ background: soft }}>
                {t.layout === "products" && (
                  <div className="mb-3 aspect-square rounded-lg" style={{ background: `linear-gradient(135deg, ${accent}, ${soft})` }} aria-hidden="true" />
                )}
                <div className="flex items-baseline justify-between gap-2">
                  <h4 className="font-bold">{b.title}</h4>
                  {b.price && (
                    <span className="font-bold" style={{ color: accent }}>
                      {b.price}
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm opacity-75">{b.text}</p>
              </div>
            ))}
        </div>
      </div>
    </Frame>
  );
}
