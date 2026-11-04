import Container from "@/components/ui/Container";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import IconButton from "@/components/ui/IconButton";
import { ArrowDown } from "@/components/ui/Icons";
import { HeroCard } from "@/components/ui/Card";
import { Heading, Text } from "@/components/ui/Typography";
import GradientText from "@/components/ui/GradientText";
import HeroVisual from "@/components/visual/HeroVisual";
import GeneratorDemo from "@/components/generator/GeneratorDemo";

export default function Hero() {
  return (
    <section className="pt-4 sm:pt-6">
      <Container>
        <HeroCard>
          {/* Physics scene fills the whole card; objects can drift behind the text. */}
          <HeroVisual className="absolute inset-0 z-0" />
          <div className="relative z-10 flex min-h-[34rem] items-center p-6 sm:p-10 lg:min-h-[40rem] lg:p-[var(--spacing-inset)]">
            <div className="relative isolate flex max-w-2xl flex-col items-start gap-6 animate-fade-up">
              <span className="text-scrim" aria-hidden="true" />
              <Badge tag="חדש">דמו להמחשת היכולות</Badge>
              <Heading level="display">
                תארו את האתר שלכם — <GradientText>ה-AI יראה לכם אותו</GradientText> תוך שניות
              </Heading>
              <Text size="lg" className="max-w-md">
                כתבו איזה אתר אתם צריכים וקבלו דוגמה חיה. זו רק הדגמה של מה שאנחנו יודעים לעשות, והאתר הסופי יעוצב ויותאם אישית עבורכם.
              </Text>
              <Button href="#generator" size="lg" className="mt-4">
                נסו את המחולל
              </Button>
            </div>
          </div>
          <IconButton href="#generator" label="גללו למחולל" size="lg" className="absolute! bottom-6 end-6 z-10 hidden sm:inline-flex">
            <ArrowDown />
          </IconButton>
        </HeroCard>
      </Container>

      <Container className="reveal py-16 text-center sm:py-24">
        <GeneratorDemo />
      </Container>
    </section>
  );
}
