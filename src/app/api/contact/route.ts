import { contactSchema } from "@/lib/validation";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ errors: { message: ["בקשה לא תקינה"] } }, { status: 400 });
  }

  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ errors: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  // TODO: לחבר שליחה בפועל (מייל / CRM / וובהוק). כרגע רק לוג בצד שרת.
  console.log("New contact request:", parsed.data);

  return Response.json({ ok: true });
}
