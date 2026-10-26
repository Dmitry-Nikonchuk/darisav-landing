import { OrderStatus } from "@prisma/client";
import type { VerifiedWebPayTransaction, WebPayNotification } from "@/lib/webpay";
import { notificationMatchesOrder } from "@/lib/webpay";
import { ensureCourseInvite } from "@/lib/course-access";
import { getPrisma } from "@/lib/prisma";

const reversedStatuses: OrderStatus[] = [OrderStatus.refunded, OrderStatus.chargeback];

export async function recordWebPayEvent(
  notification: WebPayNotification,
  signatureValid: boolean,
  eventType = "webpay_notification",
) {
  const prisma = getPrisma();
  const order = await prisma.order.findUnique({
    where: { siteOrderId: notification.siteOrderId },
  });

  const matches = Boolean(
    signatureValid && order && notificationMatchesOrder(notification, order),
  );
  let rejectionReason: string | null = null;
  if (!signatureValid) rejectionReason = "invalid_signature";
  else if (!order) rejectionReason = "unknown_order";
  else if (!notificationMatchesOrder(notification, order)) {
    rejectionReason = "order_amount_currency_or_type_mismatch";
  } else if (reversedStatuses.includes(order.status)) {
    rejectionReason = "order_is_reversed";
  } else if (
    order.webpayTransactionId &&
    order.webpayTransactionId !== notification.transactionId
  ) {
    rejectionReason = "order_has_another_transaction";
  }

  const accepted = matches && !rejectionReason;
  const idempotentTransactionId = signatureValid
    ? notification.transactionId
    : null;

  try {
    await prisma.$transaction(async (transaction) => {
      await transaction.paymentEvent.create({
        data: {
          eventType,
          transactionId: idempotentTransactionId,
          siteOrderId: notification.siteOrderId,
          webpayOrderId: notification.webpayOrderId,
          orderId: order?.id,
          amount: /^\d+(?:\.\d{1,2})?$/.test(notification.amount)
            ? notification.amount
            : null,
          currency: /^[A-Z]{3}$/.test(notification.currency)
            ? notification.currency
            : null,
          paymentMethod: notification.paymentMethod.slice(0, 64),
          paymentType: notification.paymentType.slice(0, 16),
          signatureValid,
          accepted,
          rejectionReason,
        },
      });

      if (accepted && order) {
        await transaction.order.update({
          where: { id: order.id },
          data: {
            status: OrderStatus.paid,
            webpayOrderId: notification.webpayOrderId,
            webpayTransactionId: notification.transactionId,
            paidAt: order.paidAt ?? new Date(),
          },
        });
        await transaction.accessGrant.upsert({
          where: { orderId: order.id },
          create: { orderId: order.id, telegramUserId: order.telegramUserId },
          update: {},
        });
      }
    });
  } catch (error) {
    if (
      error instanceof Error &&
      "code" in error &&
      (error as { code?: string }).code === "P2002"
    ) {
      const duplicate = await prisma.paymentEvent.findUnique({
        where: { transactionId: idempotentTransactionId ?? "" },
      });
      if (!duplicate) throw error;
      return { accepted: duplicate.accepted, duplicate: true, orderId: duplicate.orderId };
    }
    throw error;
  }

  if (accepted && order) {
    try {
      await ensureCourseInvite(order.id);
    } catch {
      // The order remains paid; the result page retries invite creation.
    }
  }

  return { accepted, duplicate: false, orderId: order?.id ?? null };
}

export async function recordVerifiedApiTransaction(
  siteOrderId: string,
  transaction: VerifiedWebPayTransaction,
) {
  if (transaction.siteOrderId !== siteOrderId) return false;
  return (
    await recordWebPayEvent(
      {
        batchTimestamp: transaction.batchTimestamp,
        currency: transaction.currency,
        amount: transaction.amount,
        paymentMethod: transaction.paymentMethod,
        webpayOrderId: transaction.webpayOrderId,
        siteOrderId,
        transactionId: transaction.transactionId,
        paymentType: transaction.paymentType,
        rrn: transaction.rrn,
        signature: transaction.signature,
      },
      true,
      "webpay_transaction_check",
    )
  ).accepted;
}
