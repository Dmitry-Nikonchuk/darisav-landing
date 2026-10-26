import { OrderStatus } from "@prisma/client";
import { getPrisma } from "@/lib/prisma";
import { revokeCourseAccess } from "@/lib/course-access";
import { safeEqual } from "@/lib/security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ siteOrderId: string }> };
const reversibleStatuses: OrderStatus[] = [
  OrderStatus.paid,
  OrderStatus.access_pending,
  OrderStatus.access_granted,
];

export async function POST(request: Request, context: RouteContext) {
  const secret = process.env.ADMIN_API_SECRET;
  const authorization = request.headers.get("authorization") ?? "";
  if (!secret || !safeEqual(authorization, `Bearer ${secret}`)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let status: "refunded" | "chargeback";
  try {
    const body = (await request.json()) as { status?: string };
    if (body.status !== "refunded" && body.status !== "chargeback") {
      return Response.json({ error: "Invalid status" }, { status: 400 });
    }
    status = body.status;
  } catch {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }

  const { siteOrderId } = await context.params;
  const prisma = getPrisma();
  const order = await prisma.order.findUnique({ where: { siteOrderId } });
  if (!order) return Response.json({ error: "Order not found" }, { status: 404 });
  if (order.status === status) {
    try {
      await revokeCourseAccess(order.id);
      return Response.json({ status });
    } catch {
      return Response.json({ error: "Access revocation needs retry" }, { status: 503 });
    }
  }
  if (!reversibleStatuses.includes(order.status)) {
    return Response.json({ error: "Order cannot be reversed from its current state" }, { status: 409 });
  }

  await prisma.$transaction([
    prisma.order.update({
      where: { id: order.id },
      data: {
        status,
        ...(status === OrderStatus.refunded
          ? { refundedAt: new Date() }
          : { chargebackAt: new Date() }),
      },
    }),
    prisma.paymentEvent.create({
      data: {
        eventType: "manual_reversal",
        siteOrderId,
        webpayOrderId: order.webpayOrderId,
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        paymentType: status,
        signatureValid: false,
        accepted: false,
        rejectionReason: "admin_confirmed_reversal",
      },
    }),
  ]);

  try {
    await revokeCourseAccess(order.id);
  } catch {
    return Response.json({ error: "Access revocation needs retry" }, { status: 503 });
  }
  return Response.json({ status });
}
