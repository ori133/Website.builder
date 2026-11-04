import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import { HeroCard } from "@/components/ui/Card";
import { Heading } from "@/components/ui/Typography";

export default function CtaBanner() {
  return (
    <section className="reveal pb-12 sm:pb-24">
      <Container>
        <HeroCard>
          <div className="flex flex-col items-start justify-between gap-6 p-6 sm:flex-row sm:items-center sm:p-12">
            <Heading level="h2" className="max-w-xl">
              רוצים את האתר האמיתי? נבנה אותו יחד
            </Heading>
            <Button href="/contact" size="lg" className="max-sm:w-full max-sm:justify-between">
              דברו איתנו
            </Button>
          </div>
        </HeroCard>
      </Container>
    </section>
  );
}
