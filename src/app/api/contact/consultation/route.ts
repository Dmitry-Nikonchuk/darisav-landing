import { isSameOriginRequest } from "@/lib/security";
import { z } from "zod";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const consultationSchema = z.object({
  name: z.string().trim().min(1).max(100),
  phone: z.string().trim().min(7).max(30).regex(/^\+?[\d\s().-]+$/),
  telegram: z
    .string()
    .trim()
    .max(33)
    .refine((value) => value === "" || /^@?[A-Za-z0-9_]{5,32}$/.test(value)),
  consent: z.literal("accepted"),
});

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) {
    return Response.json({ error: "Недопустимый запрос." }, { status: 403 });
  }

  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > 10_000) {
    return Response.json({ error: "Слишком большой запрос." }, { status: 413 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: "Проверьте заполнение формы." }, { status: 400 });
  }

  const parsed = consultationSchema.safeParse(payload);
  if (!parsed.success) {
    return Response.json(
      { error: "Проверьте имя, номер телефона и Telegram-ник." },
      { status: 400 },
    );
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const adminChatId = process.env.TELEGRAM_ADMIN_CHAT_ID;
  if (!token || !adminChatId || !/^-?\d{1,20}$/.test(adminChatId)) {
    console.error("[consultation] Telegram delivery is not configured", {
      hasBotToken: Boolean(token),
      hasAdminChatId: Boolean(adminChatId),
    });
    return Response.json(
      { error: "Форма временно недоступна. Напишите нам в Telegram." },
      { status: 503 },
    );
  }

  const { name, phone, telegram } = parsed.data;
  const message = [
    "Новая заявка на консультацию",
    `Имя: ${name}`,
    `Телефон: ${phone}`,
    `Telegram: ${telegram || "не указан"}`,
  ].join("\n");

  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: adminChatId, text: message }),
      signal: AbortSignal.timeout(10_000),
      cache: "no-store",
    });
    const result = (await response.json()) as {
      ok?: boolean;
      error_code?: number;
    };

    if (!response.ok || !result.ok) {
      console.error("[consultation] Telegram delivery failed", {
        status: response.status,
        telegramErrorCode: result.error_code,
      });
      return Response.json(
        { error: "Не удалось отправить заявку. Попробуйте ещё раз или напишите нам в Telegram." },
        { status: 502 },
      );
    }

    console.info("[consultation] Telegram delivery succeeded");
    return Response.json({ sent: true });
  } catch (error) {
    console.error("[consultation] Telegram request failed", {
      errorName: error instanceof Error ? error.name : "UnknownError",
      errorMessage: error instanceof Error ? error.message.slice(0, 200) : "Unknown error",
    });
    return Response.json(
      { error: "Не удалось отправить заявку. Попробуйте ещё раз или напишите нам в Telegram." },
      { status: 502 },
    );
  }
}
