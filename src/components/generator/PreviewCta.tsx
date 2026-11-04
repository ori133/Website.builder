export default function PreviewCta({ onOpen }: { onOpen: () => void }) {
  return (
    <div className="fade-up mb-4 flex flex-col items-start justify-between gap-3 rounded-2xl bg-gradient-to-l from-primary to-indigo-500 px-5 py-4 text-white shadow-lg sm:flex-row sm:items-center">
      <p className="text-lg font-bold">אהבת את התוצאה? בוא נבנה את זה באמת</p>
      <button
        type="button"
        onClick={onOpen}
        className="rounded-lg bg-white px-5 py-2.5 font-semibold text-primary transition hover:bg-indigo-50"
      >
        השאר פרטים
      </button>
    </div>
  );
}
