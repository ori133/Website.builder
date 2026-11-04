import Section from "@/components/ui/Section";
import { Card } from "@/components/ui/Card";
import { Heading, Text } from "@/components/ui/Typography";
import { services } from "@/data/services";

export default function Services() {
  return (
    <Section title="השירותים שלנו" subtitle="פתרונות מלאים לעסקים בכל גודל." className="bg-aurora-soft">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {services.map((s) => (
          <Card key={s.title} className="h-full">
            <Heading level="h3">{s.title}</Heading>
            <Text size="sm" className="mt-2">
              {s.description}
            </Text>
          </Card>
        ))}
      </div>
    </Section>
  );
}
