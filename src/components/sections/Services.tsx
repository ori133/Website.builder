import Section from "@/components/ui/Section";
import { services } from "@/data/services";

export default function Services() {
  return (
    <Section title="השירותים שלנו" subtitle="פתרונות מלאים לעסקים בכל גודל." className="bg-surface">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {services.map((s) => (
          <article key={s.title} className="rounded-xl border border-slate-200 bg-background p-6 shadow-sm">
            <h3 className="text-lg font-semibold">{s.title}</h3>
            <p className="mt-2 text-sm text-muted">{s.description}</p>
          </article>
        ))}
      </div>
    </Section>
  );
}
