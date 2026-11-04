import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";

export default function CtaBanner() {
  return (
    <section className="bg-primary py-16 text-white">
      <Container className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
        <h2 className="text-2xl font-bold sm:text-3xl">מוכנים להקים את האתר הבא שלכם?</h2>
        <Button href="/contact" variant="light">
          קבלו הצעת מחיר
        </Button>
      </Container>
    </section>
  );
}
