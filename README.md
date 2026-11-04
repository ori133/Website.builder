# סטודיו אתרים — תשתית Next.js

אתר שיווקי בעברית (RTL) לעסק לבניית אתרים. Next.js (App Router) + TypeScript + Tailwind CSS v4.

## הרצה

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # בנייה לפרודקשן
npm run lint
```

## מבנה

- `src/app/` — עמודים: בית, `services`, `portfolio`, `about`, `contact`
- `src/app/api/contact/route.ts` — קבלת טופס צור קשר (ולידציה עם zod)
- `src/components/` — `layout/`, `ui/`, `sections/`
- `src/data/` — תוכן (שירותים, תיק עבודות, ניווט) להחלפה קלה
- `src/app/globals.css` — צבעי המותג ופונט (ב-`@theme`)

## הוספת עמוד

1. צרו `src/app/<שם>/page.tsx`
2. הוסיפו קישור ב-`src/data/site.ts` (`navLinks`)

## שליחת טופס

כרגע הטופס רק מתעד בלוג השרת. יש לחבר מייל/CRM בתוך `src/app/api/contact/route.ts` (ראו TODO).

## הערה

האתר ב-RTL: העדיפו מחלקות לוגיות של Tailwind (`ms-*`, `me-*`, `ps-*`, `text-start`) על פני left/right.
