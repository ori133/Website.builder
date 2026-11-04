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

- `src/app/` — עמודים: בית (מחולל דמו, איך זה עובד, מה אפשר לבנות) ו-`contact`
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

## מחולל הדמו: בחירת Hero בהשראת תמונה

הלקוח מתאר את האתר, ואז מעלה צילום מסך של Hero שאהב (למשל מ-Dribbble) או מדביק קישור ל-shot. `POST /api/analyze-inspiration` שולח את התמונה ל-Claude, שמחזיר מפרט מובנה (פריסה, צבעים, טיפוגרפיה וכו') הנבדק ב-zod (`src/lib/heroSpec.ts`) ומצויר על ידי `HeroRenderer`. שאר האתר בתצוגה נעול ומטושטש עם קריאה ליצירת קשר.

- משתנה סביבה נדרש בשרת: `ANTHROPIC_API_KEY`. בלי מפתח, או אם הניתוח נכשל, האתר מציג Hero בסגנון ברירת מחדל.
- אופציונלי: `ANTHROPIC_MODEL` (ברירת מחדל `claude-opus-5-5`).
- הגבלת קצב ב-`route.ts` היא בזיכרון בלבד (מופע שרת אחד); בפרודקשן מומלץ אחסון משותף.
