import Button from "@/components/ui/Button";

export default function PreviewCta({ onOpen }: { onOpen: () => void }) {
  return (
    <div className="animate-fade-up mb-4 flex flex-col items-start justify-between gap-3 rounded-panel border border-line-strong bg-aurora px-6 py-5 shadow-glow sm:flex-row sm:items-center">
      <p className="font-display text-base">אהבת את התוצאה? בוא נבנה את זה באמת</p>
      <Button onClick={onOpen}>השאר פרטים</Button>
    </div>
  );
}
