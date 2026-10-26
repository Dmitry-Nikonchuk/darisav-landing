import { OrderStatus } from "@prisma/client";
import { ensureCourseInvite } from "@/lib/course-access";
import { getPrisma } from "@/lib/prisma";
import { getTelegramSession } from "@/lib/telegram-auth";
import { getVerifiedTransaction } from "@/lib/webpay";
import { recordVerifiedApiTransaction } from "@/lib/payments";
import { jsonError } from "@/lib/security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ siteOrderId: string }> };
const verifiableStatuses: OrderStatus[] = [OrderStatus.pending_payment, OrderStatus.expired];
const accessStatuses: OrderStatus[] = [OrderStatus.paid, OrderStatus.access_pending];

export async function GET(request: Request, context: RouteContext) {
  const session = getTelegramSession(request);
  if (!session) return jsonError("Войдите через Telegram, чтобы проверить заказ.", 401);

  const { siteOrderId } = await context.params;
  const prisma = getPrisma();
  let order = await prisma.order.findFirst({
    where: {
      siteOrderId,
      telegramUserId: BigInt(session.telegramUserId),
    },
    include: { accessGrant: true },
  });
  if (!order) return jsonError("Заказ не найден.", 404);

  const url = new URL(request.url);
  const transactionId = url.searchParams.get("wsb_tid");
  if (
    transactionId &&
    /^\d+$/.test(transactionId) &&
    verifiableStatuses.includes(order.status) &&
    (!order.lastPaymentCheckAt || Date.now() - order.lastPaymentCheckAt.getTime() > 15_000)
  ) {
    const claimed = await prisma.order.updateMany({
      where: {
        id: order.id,
        status: { in: [OrderStatus.pending_payment, OrderStatus.expired] },
        OR: [
          { lastPaymentCheckAt: null },
          { lastPaymentCheckAt: { lt: new Date(Date.now() - 15_000) } },
        ],
      },
      data: { lastPaymentCheckAt: new Date() },
    });

    if (claimed.count > 0) {
      try {
        const transaction = await getVerifiedTransaction(transactionId);
        if (transaction) {
          await recordVerifiedApiTransaction(siteOrderId, transaction);
        }
      } catch {
        // The notification remains the primary confirmation path; keep the order pending.
      }
      order = await prisma.order.findUnique({
        where: { id: order.id },
        include: { accessGrant: true },
      });
      if (!order) return jsonError("Заказ не найден.", 404);
    }
  }

  if (order.status === OrderStatus.pending_payment && order.expiresAt < new Date()) {
    await prisma.order.update({
      where: { id: order.id },
      data: { status: OrderStatus.expired },
    });
    order.status = OrderStatus.expired;
  }

  let inviteUrl: string | null = null;
  if (accessStatuses.includes(order.status)) {
    try {
      inviteUrl = await ensureCourseInvite(order.id);
    } catch {
      inviteUrl = null;
    }
  }

  return Response.json({
    status: order.status,
    accessReady: order.status === OrderStatus.access_granted || Boolean(inviteUrl),
    inviteUrl,
  });
}
