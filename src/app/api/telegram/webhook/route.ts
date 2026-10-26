import { getPrisma } from "@/lib/prisma";
import { processJoinRequest } from "@/lib/course-access";
import { safeEqual } from "@/lib/security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type TelegramUpdate = {
  update_id: number;
  chat_join_request?: {
    chat: { id: number | string };
    from: { id: number | string };
    invite_link?: { invite_link?: string };
  };
};

export async function POST(request: Request) {
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
  const supplied = request.headers.get("x-telegram-bot-api-secret-token") ?? "";
  if (!secret || !safeEqual(secret, supplied)) {
    return new Response("Unauthorized", { status: 401 });
  }

  let update: TelegramUpdate;
  try {
    update = (await request.json()) as TelegramUpdate;
    if (!Number.isSafeInteger(update.update_id) || update.update_id < 0) {
      return new Response("Invalid update", { status: 400 });
    }
  } catch {
    return new Response("Invalid update", { status: 400 });
  }

  const prisma = getPrisma();
  const updateId = BigInt(update.update_id);
  const existing = await prisma.telegramUpdate.findUnique({ where: { updateId } });
  if (existing?.status === "processed") return new Response("OK", { status: 200 });

  await prisma.telegramUpdate.upsert({
    where: { updateId },
    create: { updateId, status: "processing", attempts: 1 },
    update: { status: "processing", attempts: { increment: 1 } },
  });

  try {
    await processJoinRequest(update);
    await prisma.telegramUpdate.update({
      where: { updateId },
      data: { status: "processed", processedAt: new Date() },
    });
    return new Response("OK", { status: 200 });
  } catch {
    await prisma.telegramUpdate.update({
      where: { updateId },
      data: { status: "failed" },
    });
    return new Response("Temporarily unavailable", { status: 500 });
  }
}
