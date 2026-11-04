import Section from "@/components/ui/Section";

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
          <li key={s.n} className="rounded-xl border border-slate-200 p-6">
            <span className="flex size-10 items-center justify-center rounded-full bg-primary font-bold text-white">{s.n}</span>
            <h3 className="mt-4 text-lg font-semibold">{s.title}</h3>
            <p className="mt-2 text-sm text-muted">{s.text}</p>
          </li>
        ))}
      </ol>
    </Section>
  );
}
