export type TemplateId = "portfolio" | "restaurant" | "store" | "landing" | "business";

export type Layout = "gallery" | "menu" | "products" | "features";

export type TemplateDef = {
  id: TemplateId;
  label: string;
  keywords: string[];
  defaultBrand: string;
  headline: string;
  subheadline: string;
  cta: string;
  layout: Layout;
  navItems: string[];
  palette: { bg: string; fg: string; accent: string; soft: string };
  blocks: { title: string; text: string; price?: string }[];
};

export const templates: Record<TemplateId, TemplateDef> = {
  portfolio: {
    id: "portfolio",
    label: "תיק עבודות",
    keywords: ["צלם", "צילום", "גלריה", "תיק עבודות", "מעצב", "מעצבת", "אמן", "אמנית", "סטודיו"],
    defaultBrand: "סטודיו לצילום",
    headline: "רגעים שנשארים לנצח",
    subheadline: "צילום מקצועי באור טבעי — חתונות, פורטרטים ואירועים.",
    cta: "לקביעת צילום",
    layout: "gallery",
    navItems: ["עבודות", "אודות", "מחירון", "צור קשר"],
    palette: { bg: "#0f0f12", fg: "#f5f5f4", accent: "#f59e0b", soft: "#1c1c22" },
    blocks: [
      { title: "חתונות", text: "תיעוד מרגש של היום הגדול" },
      { title: "פורטרטים", text: "צילומי סטודיו ובטבע" },
      { title: "אירועים", text: "ימי הולדת, בר מצווה ועוד" },
    ],
  },
  restaurant: {
    id: "restaurant",
    label: "מסעדה / בית קפה",
    keywords: ["מסעדה", "קפה", "בית קפה", "תפריט", "שף", "מאפייה", "בר", "פיצה", "אוכל"],
    defaultBrand: "המסעדה שלי",
    headline: "טעמים שחוזרים אליהם",
    subheadline: "מרכיבים טריים, תפריט עונתי ואווירה חמה — הזמינו שולחן עוד היום.",
    cta: "הזמנת שולחן",
    layout: "menu",
    navItems: ["תפריט", "אודות", "הזמנות", "מיקום"],
    palette: { bg: "#fffaf0", fg: "#2b1d12", accent: "#c2410c", soft: "#fdebd0" },
    blocks: [
      { title: "סלט עונתי", text: "ירקות מהשוק, גבינת עיזים ואגוזים", price: "₪48" },
      { title: "פסטה ביתית", text: "רוטב עגבניות טריות ובזיליקום", price: "₪62" },
      { title: "קינוח השף", text: "מתוק קטן לסיום מושלם", price: "₪36" },
    ],
  },
  store: {
    id: "store",
    label: "חנות אונליין",
    keywords: ["חנות", "מכירה", "מוצרים", "אונליין", "איקומרס", "קניות", "משלוח", "אופנה", "תכשיטים"],
    defaultBrand: "החנות שלי",
    headline: "המוצרים שאתם אוהבים, עד הבית",
    subheadline: "משלוח מהיר, תשלום מאובטח והחזרות בקלות.",
    cta: "לכל המוצרים",
    layout: "products",
    navItems: ["חדש", "הנמכרים ביותר", "מבצעים", "עגלה"],
    palette: { bg: "#ffffff", fg: "#111827", accent: "#db2777", soft: "#fdf2f8" },
    blocks: [
      { title: "מוצר מוביל", text: "הנמכר ביותר החודש", price: "₪129" },
      { title: "קולקציה חדשה", text: "הגיע הרגע למלאי", price: "₪89" },
      { title: "מארז מתנה", text: "אריזה מוכנה למתנה", price: "₪199" },
    ],
  },
  landing: {
    id: "landing",
    label: "דף נחיתה",
    keywords: ["נחיתה", "קורס", "הרשמה", "וובינר", "קמפיין", "לידים", "סדנה", "אפליקציה"],
    defaultBrand: "הקורס שלי",
    headline: "הצעד הבא שלכם מתחיל כאן",
    subheadline: "הצטרפו לאלפי משתתפים שכבר התקדמו — ההרשמה פתוחה לזמן מוגבל.",
    cta: "להרשמה עכשיו",
    layout: "features",
    navItems: ["יתרונות", "המלצות", "שאלות", "הרשמה"],
    palette: { bg: "#f0f9ff", fg: "#0c4a6e", accent: "#0284c7", soft: "#e0f2fe" },
    blocks: [
      { title: "תוכן מעשי", text: "כלים שאפשר ליישם כבר מהשיעור הראשון" },
      { title: "ליווי אישי", text: "מענה מהיר לכל שאלה לאורך הדרך" },
      { title: "גישה לכל החיים", text: "ההקלטות והחומרים נשארים אצלכם" },
    ],
  },
  business: {
    id: "business",
    label: "אתר תדמית",
    keywords: [],
    defaultBrand: "העסק שלי",
    headline: "הפתרון המקצועי שהעסק שלכם צריך",
    subheadline: "ניסיון, שירות אישי ותוצאות — בואו נכיר.",
    cta: "צרו קשר",
    layout: "features",
    navItems: ["שירותים", "אודות", "לקוחות", "צור קשר"],
    palette: { bg: "#f8fafc", fg: "#0f172a", accent: "#4f46e5", soft: "#e0e7ff" },
    blocks: [
      { title: "שירות אישי", text: "ליווי צמוד מהפנייה הראשונה" },
      { title: "מקצועיות", text: "ניסיון עשיר ועבודה לפי הסטנדרטים הגבוהים" },
      { title: "אמינות", text: "שקיפות מלאה ועמידה בלוחות זמנים" },
    ],
  },
};
