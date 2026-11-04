import type { Metadata } from "next";
import Section from "@/components/ui/Section";
import CtaBanner from "@/components/sections/CtaBanner";

export const metadata: Metadata = { title: "אודות" };

export default function AboutPage() {
  return (
    <>
      <Section title="מי אנחנו">
        <div className="max-w-2xl space-y-4 text-muted">
          <p>אנחנו סטודיו קטן ומקצועי שמתמחה בבניית אתרים לעסקים. הגישה שלנו פשוטה: תקשורת ברורה, עיצוב נקי וביצועים מעולים.</p>
          <p>(טקסט זמני — יש להחליף בסיפור האמיתי של העסק.)</p>
        </div>
      </Section>
      <CtaBanner />
    </>
  );
}
