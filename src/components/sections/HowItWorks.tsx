import Section from "@/components/ui/Section";
import { Card } from "@/components/ui/Card";
import { Heading, Text } from "@/components/ui/Typography";

const steps = [
  { n: "1", title: "כתבו מה אתם רוצים", text: "משפט אחד מספיק: סוג העסק, הסגנון והמטרה." },
  { n: "2", title: "ראו דמו בשניות", text: "ה-AI מציג תבנית חיה שמותאמת לבקשה שלכם." },
  { n: "3", title: "נבנה את זה באמת", text: "משאירים פרטים, ואנחנו הופכים את הדמו לאתר מלא." },
];

export default function HowItWorks() {
  return (
    <Section title="איך זה עובד" subtitle="מרעיון לאתר חי בשלושה צעדים.">
      <ol className="grid gap-6 sm:grid-cols-3">
        {steps.map((s) => (
          <li key={s.n}>
            <Card className="h-full">
              <span className="flex size-10 items-center justify-center rounded-full bg-violet-500 font-display text-sm text-white shadow-glow-sm">
                {s.n}
              </span>
              <Heading level="h3" className="mt-5">
                {s.title}
              </Heading>
              <Text size="sm" className="mt-2">
                {s.text}
              </Text>
            </Card>
          </li>
        ))}
      </ol>
    </Section>
  );
}
