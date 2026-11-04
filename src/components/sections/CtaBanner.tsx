import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import { HeroCard } from "@/components/ui/Card";
import { Heading } from "@/components/ui/Typography";

export default function CtaBanner() {
  return (
    <section className="pb-16 sm:pb-24">
      <Container>
        <HeroCard>
          <div className="flex flex-col items-start justify-between gap-6 p-8 sm:flex-row sm:items-center sm:p-12">
            <Heading level="h2" className="max-w-xl">
              מוכנים להקים את האתר הבא שלכם?
            </Heading>
            <Button href="/contact" size="lg">
              קבלו הצעת מחיר
            </Button>
          </div>
        </HeroCard>
      </Container>
    </section>
  );
}
