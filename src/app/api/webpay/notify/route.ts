import { parseNotification, verifyNotificationSignature } from "@/lib/webpay";
import { recordWebPayEvent } from "@/lib/payments";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const notification = parseNotification(form);
    if (!notification) return new Response("OK", { status: 200 });

    const card = form.get("card");
    const signatureValid = verifyNotificationSignature(
      notification,
      typeof card === "string" ? card : undefined,
    );
    await recordWebPayEvent(notification, signatureValid);
    return new Response("OK", { status: 200 });
  } catch {
    // A server-side failure should trigger WebPay's notification retry.
    return new Response("Temporarily unavailable", { status: 500 });
  }
}
