import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().trim().min(2, "נא להזין שם מלא"),
  email: z.string().trim().email("כתובת אימייל לא תקינה"),
  phone: z
    .string()
    .trim()
    .regex(/^[0-9+\-\s]{9,15}$/, "מספר טלפון לא תקין")
    .optional()
    .or(z.literal("")),
  message: z.string().trim().min(10, "ההודעה קצרה מדי (לפחות 10 תווים)").max(2000, "ההודעה ארוכה מדי"),
});

export const generateSchema = z.object({
  prompt: z.string().trim().min(3).max(500),
});

export type ContactInput = z.infer<typeof contactSchema>;
