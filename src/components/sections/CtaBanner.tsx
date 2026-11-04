import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";

export default function CtaBanner() {
  return (
    <section className="relative isolate overflow-hidden bg-slate-950 py-20 text-white sm:py-24">
      <div
        aria-hidden="true"
        className="absolute -bottom-40 -start-24 -z-10 h-80 w-[36rem] rounded-full bg-(image:--gradient-hero) opacity-50 blur-3xl"
      />
      <Container className="flex flex-col items-start justify-between gap-8 sm:flex-row sm:items-center">
        <h2 className="max-w-xl text-3xl font-medium tracking-tight sm:text-4xl">מוכנים להקים את האתר הבא שלכם?</h2>
        <Button href="/contact" variant="light">
          קבלו הצעת מחיר
        </Button>
      </Container>
    </section>
  );
}
