import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";

export default function Hero() {
  return (
    <section className="bg-gradient-to-b from-indigo-50 to-background py-20 sm:py-28">
      <Container>
        <div className="max-w-3xl">
          <h1 className="text-4xl font-extrabold leading-tight sm:text-6xl">
            אתרים שמביאים <span className="text-primary">לקוחות</span> לעסק שלכם
          </h1>
          <p className="mt-6 text-lg text-muted">
            אנחנו מעצבים ובונים אתרים מהירים, מודרניים ומותאמים לנייד — מהרעיון ועד העלאה לאוויר.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button href="/contact">בואו נדבר</Button>
            <Button href="/portfolio" variant="secondary">
              לתיק העבודות
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}
