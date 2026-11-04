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
          <div className="grid min-h-[34rem] items-center gap-6 p-6 sm:p-10 lg:min-h-[40rem] lg:grid-cols-2 lg:p-[var(--spacing-inset)]">
            <div className="relative z-10 flex flex-col items-start gap-6 animate-fade-up">
              <Badge tag="חדש">מחולל אתרים מבוסס AI</Badge>
              <Heading level="display">
                תארו את האתר שלכם — <GradientText>ה-AI יראה לכם אותו</GradientText> תוך שניות
              </Heading>
              <Text size="lg" className="max-w-md">
                כתבו במילים שלכם איזה אתר אתם צריכים, וקבלו דמו חי. אהבתם? נהפוך אותו לאתר אמיתי.
              </Text>
              <Button href="#generator" size="lg" className="mt-4">
                נסו את המחולל
              </Button>
            </div>
            <HeroVisual className="relative -order-1 h-72 sm:h-96 lg:order-none lg:h-[32rem]" />
          </div>
          <IconButton href="#generator" label="גללו למחולל" size="lg" className="absolute bottom-6 end-6 hidden sm:inline-flex">
            <ArrowDown />
          </IconButton>
        </HeroCard>
      </Container>

      <Container className="py-16 text-center sm:py-24">
        <GeneratorDemo />
      </Container>
    </section>
  );
}
