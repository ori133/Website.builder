import type { Metadata } from "next";
import Container from "@/components/ui/Container";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import IconButton from "@/components/ui/IconButton";
import { ArrowDown } from "@/components/ui/Icons";
import { Card, GlassPanel, HeroCard } from "@/components/ui/Card";
import { Field, Input, Textarea } from "@/components/ui/Field";
import GradientText from "@/components/ui/GradientText";
import { Heading, Text } from "@/components/ui/Typography";
import HeroVisual from "@/components/visual/HeroVisual";

export const metadata: Metadata = {
  title: "Design System",
  robots: { index: false, follow: false },
};

const colors: { group: string; items: { name: string; cls: string; hex: string }[] }[] = [
  {
    group: "Surfaces",
    items: [
      { name: "bg", cls: "bg-bg", hex: "#05001f" },
      { name: "card", cls: "bg-card", hex: "#050309" },
      { name: "surface", cls: "bg-surface", hex: "#0d0a1f" },
      { name: "surface-2", cls: "bg-surface-2", hex: "#1a191e" },
    ],
  },
  {
    group: "Violet",
    items: [
      { name: "violet-200", cls: "bg-violet-200", hex: "#c9a8ff" },
      { name: "violet-300", cls: "bg-violet-300", hex: "#c5a3f1" },
      { name: "violet-400", cls: "bg-violet-400", hex: "#9a67ee" },
      { name: "violet-500", cls: "bg-violet-500", hex: "#7239e1" },
      { name: "violet-600", cls: "bg-violet-600", hex: "#6838c3" },
      { name: "violet-800", cls: "bg-violet-800", hex: "#3b1f8d" },
      { name: "violet-900", cls: "bg-violet-900", hex: "#22115a" },
    ],
  },
  {
    group: "Neon (accents)",
    items: [
      { name: "neon-pink", cls: "bg-neon-pink", hex: "#ff2bd6" },
      { name: "neon-blue", cls: "bg-neon-blue", hex: "#2f6bff" },
      { name: "neon-green", cls: "bg-neon-green", hex: "#18e29a" },
      { name: "neon-amber", cls: "bg-neon-amber", hex: "#ffa626" },
    ],
  },
  {
    group: "Text & feedback",
    items: [
      { name: "ink", cls: "bg-ink", hex: "#faf9fc" },
      { name: "on-light", cls: "bg-on-light", hex: "#0b0a0d" },
      { name: "success", cls: "bg-success", hex: "#4ade80" },
      { name: "danger", cls: "bg-danger", hex: "#ff6b81" },
    ],
  },
];

function Block({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24 border-t border-line py-12">
      <Heading level="h2" className="mb-8">
        {title}
      </Heading>
      {children}
    </section>
  );
}

export default function DesignSystemPage() {
  return (
    <Container className="py-12">
      <header className="mb-4">
        <Badge tag="v1">Nebula — dark premium / aurora</Badge>
        <Heading level="display" className="mt-6">
          Design <GradientText>System</GradientText>
        </Heading>
        <Text size="lg" className="mt-4 max-w-2xl">
          טוקנים, טיפוגרפיה וקומפוננטות של האתר, בהשראת הסרטון. המקור: <code dir="ltr">src/app/globals.css</code>.
        </Text>
      </header>

      <Block id="color" title="צבעים">
        <div className="space-y-8">
          {colors.map((g) => (
            <div key={g.group}>
              <p className="mb-3 text-sm text-ink-subtle" dir="ltr">
                {g.group}
              </p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
                {g.items.map((c) => (
                  <div key={c.name} className="overflow-hidden rounded-control border border-line">
                    <div className={`h-16 ${c.cls}`} />
                    <div className="bg-surface p-2.5 text-xs" dir="ltr">
                      <p className="text-ink">{c.name}</p>
                      <p className="text-ink-subtle">{c.hex}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="h-32 rounded-panel border border-line bg-aurora" />
          <div className="flex h-32 items-center justify-center rounded-panel border border-line bg-card">
            <span className="font-display text-2xl text-gradient">text-gradient</span>
          </div>
          <div className="flex h-32 items-center justify-center rounded-panel border border-line-strong bg-glass text-sm text-ink-muted">bg-glass</div>
        </div>
      </Block>

      <Block id="type" title="טיפוגרפיה">
        <div className="space-y-6">
          <Heading level="display">Display — תארו את האתר</Heading>
          <Heading level="h1">H1 — כותרת ראשית</Heading>
          <Heading level="h2">H2 — כותרת משנית</Heading>
          <Heading level="h3">H3 — כותרת כרטיס</Heading>
          <Text size="lg">Body large — גוף טקסט גדול, למשפט פתיח.</Text>
          <Text>Body — גוף טקסט רגיל לפסקאות ותיאורים ארוכים יותר.</Text>
          <Text size="sm" tone="subtle">Small / subtle — הערות ומידע משני.</Text>
          <p className="text-sm text-ink-subtle" dir="ltr">
            Display: Rubik · Body: Assistant
          </p>
        </div>
      </Block>

      <Block id="radius" title="רדיוסים וצללים">
        <div className="flex flex-wrap items-end gap-6 text-xs text-ink-subtle" dir="ltr">
          {[
            ["control · 12", "rounded-control"],
            ["panel · 24", "rounded-panel"],
            ["card · 40", "rounded-card"],
            ["pill", "rounded-pill"],
          ].map(([l, c]) => (
            <div key={l} className="text-center">
              <div className={`mb-2 h-20 w-28 border border-line-strong bg-surface ${c}`} />
              {l}
            </div>
          ))}
          <div className="text-center">
            <div className="mb-2 h-20 w-28 rounded-panel bg-violet-500 shadow-glow" />
            shadow-glow
          </div>
        </div>
      </Block>

      <Block id="buttons" title="כפתורים">
        <div className="space-y-6">
          <div className="flex flex-wrap items-center gap-4">
            <Button href="#buttons">Primary</Button>
            <Button href="#buttons" size="lg">Primary large</Button>
            <Button href="#buttons" arrow={false}>No arrow</Button>
            <Button disabled>Disabled</Button>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <Button variant="secondary">Secondary</Button>
            <Button variant="secondary" disabled>Disabled</Button>
            <Button variant="ghost">Ghost</Button>
            <IconButton label="גלילה למטה"><ArrowDown /></IconButton>
            <IconButton label="גלילה למטה" size="lg"><ArrowDown /></IconButton>
          </div>
          <Badge tag="חדש">הודעה חדשה עם תג</Badge>
        </div>
      </Block>

      <Block id="forms" title="טפסים וכרטיסים">
        <div className="grid gap-8 md:grid-cols-2">
          <GlassPanel className="space-y-4 p-6">
            <Field id="ds-name" label="שם מלא">
              <Input id="ds-name" placeholder="ישראל ישראלי" />
            </Field>
            <Field id="ds-email" label="אימייל" errors={["כתובת אימייל לא תקינה"]}>
              <Input id="ds-email" dir="ltr" defaultValue="oops" aria-invalid />
            </Field>
            <Field id="ds-msg" label="הודעה">
              <Textarea id="ds-msg" rows={3} />
            </Field>
          </GlassPanel>
          <div className="space-y-4">
            <Card>
              <Heading level="h3">Card</Heading>
              <Text size="sm" className="mt-2">כרטיס זכוכית כהה לתוכן, עם מסגרת שמתחזקת ב-hover.</Text>
            </Card>
            <GlassPanel className="p-6 text-sm text-ink-muted">GlassPanel — משטח שקוף עם טשטוש.</GlassPanel>
          </div>
        </div>
      </Block>

      <Block id="hero" title="Hero Card + אובייקט תלת־ממדי">
        <HeroCard>
          <HeroVisual className="absolute inset-0 z-0" />
          <div className="relative z-10 flex min-h-[28rem] items-center p-6 sm:p-10">
            <div className="relative isolate flex max-w-lg flex-col items-start gap-5">
              <span className="text-scrim" aria-hidden="true" />
              <Badge tag="New">Introducing our new hosting</Badge>
              <Heading level="h1">
                Build on <GradientText>decentralized</GradientText> protocol
              </Heading>
              <Text className="max-w-sm">הרכיב המלא: Badge, כותרת בגרדיאנט, טקסט, CTA ואובייקטים בפיזיקה אמיתית שמגיבים לעכבר.</Text>
              <Button href="#hero">Schedule demo</Button>
            </div>
          </div>
        </HeroCard>
      </Block>
    </Container>
  );
}
