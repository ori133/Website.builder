import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import NetworkBackground from "@/components/decor/NetworkBackground";
import HeroWaves from "@/components/decor/HeroWaves";

export default function Hero() {
  return (
    <section className="relative isolate overflow-hidden pt-16 sm:pt-24">
      <NetworkBackground />
      <Container>
        <div className="mx-auto max-w-5xl text-center">
          <h1 className="display">
            אתרים שמביאים <span className="italic">לקוחות</span> לעסק שלכם
          </h1>
          <p className="mx-auto mt-8 max-w-2xl text-lg text-muted sm:text-xl">
            אנחנו מעצבים ובונים אתרים מהירים, מודרניים ומותאמים לנייד — מהרעיון ועד העלאה לאוויר.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Button href="/contact">בואו נדבר</Button>
            <Button href="/portfolio" variant="secondary">
              לתיק העבודות
            </Button>
          </div>
        </div>
      </Container>
      <div className="mt-14 sm:mt-20 px-3 sm:px-6">
        <HeroWaves />
      </div>
    </section>
  );
}
