import type { Metadata } from "next";
import Section from "@/components/ui/Section";
import ContactForm from "./ContactForm";

export const metadata: Metadata = { title: "צור קשר" };

export default function ContactPage() {
  return (
    <Section title="צור קשר" subtitle="השאירו פרטים ונחזור אליכם בהקדם.">
      <ContactForm />
    </Section>
  );
}
