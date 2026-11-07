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

## חיבור Claude מקומי (לבדיקות בלבד)

המחולל בדף הבית שולח את הפרומפט ל-Claude CLI שמותקן אצלכם (`claude -p`, מודל `claude-sonnet-5-5`, בלי כלים) ומציג את ה-HTML שחזר ב-iframe מבודד (`sandbox` ריק, בלי סקריפטים).

- דורש `claude` מותקן ומחובר למחשב שבו רץ השרת.
- עובד ב-`npm run dev` (הנתיב `/api/generate` מקבל בקשות רק מ-`localhost`). בפרודקשן הוא כבוי אלא אם הגדרתם `ENABLE_LOCAL_CLAUDE=1` — **אל תעשו זאת בפריסה ציבורית**.
- אם החיבור נכשל, המחולל חוזר לסימולציה המקומית.
- כל בקשה צורכת מהמכסה של החשבון שלכם. לפריסה אמיתית יש להחליף ב-Anthropic API עם מפתח בצד שרת.
