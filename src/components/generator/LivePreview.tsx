import type { GeneratedSite } from "@/lib/generator";
import HeroRenderer from "./HeroRenderer";

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

export function PreviewHtml({ html }: { html: string }) {
  return (
    <Frame url="your-site.com">
      {/* Empty sandbox: no scripts, no same-origin access, no forms. */}
      <iframe title="דמו שנוצר ב-AI" sandbox="" srcDoc={html} className="animate-fade-up block h-[600px] w-full bg-white" />
    </Frame>
  );
}

function LockedSections({ site, onUnlock }: { site: GeneratedSite; onUnlock?: () => void }) {
  const { template: t } = site;
  return (
    <div className="relative overflow-hidden bg-white text-neutral-900">
      <div className="pointer-events-none select-none blur-[7px]" aria-hidden="true">
        <div className="grid gap-4 px-6 py-10 sm:grid-cols-3">
          {t.blocks.map((b) => (
            <div key={b.title} className="rounded-xl bg-neutral-100 p-4">
              <h4 className="font-bold">{b.title}</h4>
              <p className="mt-1 text-sm opacity-75">{b.text}</p>
            </div>
          ))}
        </div>
        <div className="space-y-3 px-6 pb-10">
          <div className="h-5 w-1/3 rounded bg-neutral-200" />
          <div className="h-28 rounded-xl bg-neutral-100" />
          <div className="h-5 w-1/2 rounded bg-neutral-200" />
        </div>
      </div>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-white/55 p-6 text-center">
        <span className="text-3xl" aria-hidden="true">🔒</span>
        <p className="font-display text-lg">שאר האתר נעול בדמו</p>
        <p className="max-w-sm text-sm text-neutral-600">בשאר העמודים והסקשנים נבנה אתר מלא ומותאם אישית. רוצים להמשיך?</p>
        {onUnlock && (
          <button type="button" onClick={onUnlock} className="rounded-full bg-neutral-900 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-neutral-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-500">
            צרו איתנו קשר להמשך
          </button>
        )}
      </div>
    </div>
  );
}

export function PreviewSite({ site, onUnlock }: { site: GeneratedSite; onUnlock?: () => void }) {
  const { template: t, brand } = site;
  return (
    <Frame url={`${brand.replace(/\s+/g, "-")}.co.il`}>
      <HeroRenderer spec={site.heroSpec} t={t} brand={brand} />
      <LockedSections site={site} onUnlock={onUnlock} />
    </Frame>
  );
}
