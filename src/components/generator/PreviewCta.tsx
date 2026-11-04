import Button from "@/components/ui/Button";

export default function PreviewCta({ onOpen }: { onOpen: () => void }) {
  return (
    <div className="animate-fade-up mb-4 flex flex-col items-start justify-between gap-3 rounded-panel border border-line-strong bg-aurora px-5 py-5 shadow-glow sm:flex-row sm:items-center sm:px-6">
      <p className="font-display text-base">אהבתם את הדוגמה? נבנה לכם אתר אמיתי ומותאם אישית</p>
      <Button onClick={onOpen} className="max-sm:w-full max-sm:justify-between">השאר פרטים</Button>
    </div>
  );
}
