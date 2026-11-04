import Section from "@/components/ui/Section";
import { projects } from "@/data/portfolio";

export default function Portfolio({ limit }: { limit?: number }) {
  const items = limit ? projects.slice(0, limit) : projects;
  return (
    <Section title="עבודות נבחרות" subtitle="כמה מהפרויקטים שבנינו לאחרונה.">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((p) => (
          <article
            key={p.title}
            className="overflow-hidden rounded-3xl border border-border transition hover:-translate-y-0.5 hover:shadow-soft"
          >
            <div className="aspect-video bg-(image:--gradient-hero)" aria-hidden="true" />
            <div className="p-6">
              <p className="text-xs font-medium text-accent">{p.category}</p>
              <h3 className="mt-1 text-lg font-semibold">{p.title}</h3>
              <p className="mt-1 text-sm text-muted">{p.description}</p>
            </div>
          </article>
        ))}
      </div>
    </Section>
  );
}
