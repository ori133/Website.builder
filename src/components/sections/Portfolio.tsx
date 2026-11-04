import Section from "@/components/ui/Section";
import { Heading, Text } from "@/components/ui/Typography";
import { projects } from "@/data/portfolio";

const tints = [
  "from-violet-500 via-violet-800 to-card",
  "from-neon-blue/70 via-violet-900 to-card",
  "from-neon-pink/60 via-violet-900 to-card",
];

export default function Portfolio({ limit }: { limit?: number }) {
  const items = limit ? projects.slice(0, limit) : projects;
  return (
    <Section title="עבודות נבחרות" subtitle="כמה מהפרויקטים שבנינו לאחרונה.">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((p, i) => (
          <article key={p.title} className="overflow-hidden rounded-panel border border-line bg-surface/70 transition hover:border-line-strong">
            <div className={`aspect-video bg-gradient-to-br ${tints[i % tints.length]}`} aria-hidden="true" />
            <div className="p-5">
              <p className="font-display text-xs text-violet-200">{p.category}</p>
              <Heading level="h3" className="mt-1">
                {p.title}
              </Heading>
              <Text size="sm" className="mt-1">
                {p.description}
              </Text>
            </div>
          </article>
        ))}
      </div>
    </Section>
  );
}
