import Section from "@/components/ui/Section";
import { Card } from "@/components/ui/Card";
import { Heading, Text } from "@/components/ui/Typography";

const steps = [
  { n: "1", title: "כתבו מה אתם רוצים", text: "משפט אחד מספיק: סוג העסק, הסגנון והמטרה." },
  { n: "2", title: "ראו דמו בשניות", text: "ה-AI מציג דוגמה חיה שמראה את היכולות שלנו. זו לא הגרסה הסופית." },
  { n: "3", title: "נבנה את זה באמת", text: "משאירים פרטים, ואנחנו מעצבים ובונים עבורכם אתר מלא ומותאם אישית." },
];

export default function HowItWorks() {
  return (
    <Section id="how" title="איך זה עובד" subtitle="מדוגמה מהירה לאתר אמיתי בשלושה צעדים.">
      <ol className="grid gap-4 sm:gap-6 md:grid-cols-3">
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
