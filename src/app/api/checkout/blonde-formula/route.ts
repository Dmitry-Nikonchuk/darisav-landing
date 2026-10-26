import { OrderStatus } from "@prisma/client";
import { getPrisma } from "@/lib/prisma";
import { getTelegramSession } from "@/lib/telegram-auth";
import { getWebPayConfiguration, createWebPayForm } from "@/lib/webpay";
import { isSameOriginRequest, jsonError } from "@/lib/security";
import { randomUUID } from "node:crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) return jsonError("Недействительный запрос.", 403);
  const session = getTelegramSession(request);
  if (!session) return jsonError("Сначала войдите через Telegram.", 401);

  try {
    const configuration = getWebPayConfiguration();
    const prisma = getPrisma();
    const telegramUserId = BigInt(session.sub);
    const now = new Date();
    const order = await prisma.order.create({
      data: {
        siteOrderId: `BF-${randomUUID().replaceAll("-", "")}`,
        productCode: "BLONDE_FORMULA",
        amount: configuration.amount,
        currency: configuration.currency,
        status: OrderStatus.pending_payment,
        telegramUserId,
        expiresAt: new Date(now.getTime() + 20 * 60 * 1000),
      },
    });
    return Response.json({
      action: configuration.formUrl,
      fields: createWebPayForm(order),
    });
  } catch {
    return jsonError(
      "Не удалось создать заказ. Проверьте настройки оплаты или попробуйте позже.",
      503,
    );
  }
}
