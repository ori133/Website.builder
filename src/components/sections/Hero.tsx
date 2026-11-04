import Container from "@/components/ui/Container";
import GeneratorDemo from "@/components/generator/GeneratorDemo";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-indigo-50 via-white to-background py-16 sm:py-24">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 start-1/2 size-[36rem] -translate-x-1/2 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 blur-3xl"
      />
      <Container className="relative text-center">
        <p className="mx-auto mb-4 w-fit rounded-full border border-indigo-200 bg-white/80 px-4 py-1 text-sm font-medium text-primary">
          ✨ מחולל אתרים מבוסס AI
        </p>
        <h1 className="mx-auto max-w-3xl text-4xl font-extrabold leading-tight sm:text-6xl">
          תארו את האתר שלכם — <span className="text-primary">ה-AI יראה לכם אותו</span> תוך שניות
        </h1>
        <p className="mx-auto mt-5 mb-10 max-w-2xl text-lg text-muted">
          כתבו במילים שלכם איזה אתר אתם צריכים, וקבלו דמו חי. אהבתם? נהפוך אותו לאתר אמיתי.
        </p>
        <GeneratorDemo />
      </Container>
    </section>
  );
}
