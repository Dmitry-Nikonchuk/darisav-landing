import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
} from "node:crypto";
import { AccessGrantStatus, OrderStatus } from "@prisma/client";
import { getPrisma } from "@/lib/prisma";

const paymentConfirmedStatuses: OrderStatus[] = [OrderStatus.paid, OrderStatus.access_pending];
const validGrantStatuses: AccessGrantStatus[] = [
  AccessGrantStatus.invite_created,
  AccessGrantStatus.join_requested,
];

type TelegramResponse<T> = {
  ok: boolean;
  result?: T;
  error_code?: number;
};

function getBotToken() {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) throw new Error("TELEGRAM_BOT_TOKEN is not configured");
  return token;
}

function getChannelId() {
  const channelId = process.env.TELEGRAM_CHANNEL_ID;
  if (!channelId) throw new Error("TELEGRAM_CHANNEL_ID is not configured");
  return channelId;
}

function getEncryptionKey() {
  const value = process.env.APP_ENCRYPTION_KEY;
  if (!value || !/^[a-f\d]{64}$/i.test(value)) {
    throw new Error("APP_ENCRYPTION_KEY must be a 32-byte hexadecimal key");
  }
  return Buffer.from(value, "hex");
}

function encryptInviteLink(link: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", getEncryptionKey(), iv);
  const ciphertext = Buffer.concat([cipher.update(link, "utf8"), cipher.final()]);
  return {
    ciphertext: ciphertext.toString("base64url"),
    iv: iv.toString("base64url"),
    authTag: cipher.getAuthTag().toString("base64url"),
    hash: createHash("sha256").update(link).digest("hex"),
  };
}

function decryptInviteLink(grant: {
  inviteLinkCiphertext: string | null;
  inviteLinkIv: string | null;
  inviteLinkAuthTag: string | null;
}) {
  if (!grant.inviteLinkCiphertext || !grant.inviteLinkIv || !grant.inviteLinkAuthTag) {
    return null;
  }
  const decipher = createDecipheriv(
    "aes-256-gcm",
    getEncryptionKey(),
    Buffer.from(grant.inviteLinkIv, "base64url"),
  );
  decipher.setAuthTag(Buffer.from(grant.inviteLinkAuthTag, "base64url"));
  return Buffer.concat([
    decipher.update(Buffer.from(grant.inviteLinkCiphertext, "base64url")),
    decipher.final(),
  ]).toString("utf8");
}

async function telegramApi<T>(method: string, payload: Record<string, unknown>) {
  const response = await fetch(`https://api.telegram.org/bot${getBotToken()}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(10_000),
    cache: "no-store",
  });
  const result = (await response.json()) as TelegramResponse<T>;
  if (!response.ok || !result.ok) {
    throw new Error(`Telegram ${method} failed (${result.error_code ?? response.status})`);
  }
  return result.result as T;
}

export async function revokeInviteLink(link: string) {
  try {
    await telegramApi<boolean>("revokeChatInviteLink", {
      chat_id: getChannelId(),
      invite_link: link,
    });
  } catch {
    // The invitation may already be revoked or consumed; the grant remains authoritative.
  }
}

async function isTelegramMember(userId: bigint) {
  const member = await telegramApi<{ status: string; is_member?: boolean }>(
    "getChatMember",
    { chat_id: getChannelId(), user_id: String(userId) },
  );
  return ["member", "administrator", "creator"].includes(member.status) || member.is_member === true;
}

export async function ensureCourseInvite(orderId: string) {
  const prisma = getPrisma();
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { accessGrant: true },
  });
  if (
    !order ||
    !paymentConfirmedStatuses.includes(order.status) ||
    order.expiresAt < new Date() && order.status === OrderStatus.pending_payment
  ) {
    return null;
  }

  const grant = await prisma.accessGrant.upsert({
    where: { orderId: order.id },
    create: { orderId: order.id, telegramUserId: order.telegramUserId },
    update: { telegramUserId: order.telegramUserId },
  });
  if (
    grant.status === AccessGrantStatus.invite_created &&
    grant.inviteExpiresAt &&
    grant.inviteExpiresAt > new Date()
  ) {
    return decryptInviteLink(grant);
  }

  if (grant.inviteLinkCiphertext && grant.inviteExpiresAt && grant.inviteExpiresAt <= new Date()) {
    const expiredLink = decryptInviteLink(grant);
    if (expiredLink) await revokeInviteLink(expiredLink);
    await prisma.accessGrant.update({
      where: { id: grant.id },
      data: {
        status: AccessGrantStatus.pending,
        inviteLinkHash: null,
        inviteLinkCiphertext: null,
        inviteLinkIv: null,
        inviteLinkAuthTag: null,
        inviteExpiresAt: null,
        claimLeaseUntil: null,
      },
    });
  }

  const now = new Date();
  const claimLeaseUntil = new Date(now.getTime() + 30_000);
  const claim = await prisma.accessGrant.updateMany({
    where: {
      id: grant.id,
      status: { in: [AccessGrantStatus.pending, AccessGrantStatus.failed] },
      OR: [{ claimLeaseUntil: null }, { claimLeaseUntil: { lt: now } }],
    },
    data: { status: AccessGrantStatus.pending, claimLeaseUntil },
  });
  if (claim.count === 0) {
    const latest = await prisma.accessGrant.findUnique({ where: { id: grant.id } });
    if (
      latest?.status === AccessGrantStatus.invite_created &&
      latest.inviteExpiresAt &&
      latest.inviteExpiresAt > new Date()
    ) {
      return decryptInviteLink(latest);
    }
    return null;
  }

  try {
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const created = await telegramApi<{ invite_link: string }>("createChatInviteLink", {
      chat_id: getChannelId(),
      name: order.siteOrderId.slice(-32),
      expire_date: Math.floor(expiresAt.getTime() / 1000),
      creates_join_request: true,
    });
    const encrypted = encryptInviteLink(created.invite_link);
    await prisma.$transaction([
      prisma.accessGrant.update({
        where: { id: grant.id },
        data: {
          status: AccessGrantStatus.invite_created,
          inviteLinkHash: encrypted.hash,
          inviteLinkCiphertext: encrypted.ciphertext,
          inviteLinkIv: encrypted.iv,
          inviteLinkAuthTag: encrypted.authTag,
          inviteExpiresAt: expiresAt,
          claimLeaseUntil: null,
        },
      }),
      prisma.order.update({
        where: { id: order.id },
        data: { status: OrderStatus.access_pending },
      }),
    ]);
    return created.invite_link;
  } catch (error) {
    await prisma.accessGrant.update({
      where: { id: grant.id },
      data: { status: AccessGrantStatus.failed, claimLeaseUntil: null },
    });
    throw error;
  }
}

export async function processJoinRequest(update: {
  chat_join_request?: {
    chat: { id: number | string };
    from: { id: number | string };
    invite_link?: { invite_link?: string };
  };
}) {
  const request = update.chat_join_request;
  if (!request || String(request.chat.id) !== getChannelId()) return;

  const prisma = getPrisma();
  const userId = BigInt(String(request.from.id));
  const invite = request.invite_link?.invite_link;
  const grant = invite
    ? await prisma.accessGrant.findUnique({
        where: { inviteLinkHash: createHash("sha256").update(invite).digest("hex") },
        include: { order: true },
      })
    : await prisma.accessGrant.findFirst({
        where: {
          telegramUserId: userId,
          status: { in: [AccessGrantStatus.invite_created, AccessGrantStatus.join_requested] },
          inviteExpiresAt: { gt: new Date() },
          order: { status: { in: [OrderStatus.paid, OrderStatus.access_pending] } },
        },
        include: { order: true },
        orderBy: { createdAt: "desc" },
      });

  const eligible = Boolean(
    grant &&
      grant.telegramUserId === userId &&
      validGrantStatuses.includes(grant.status) &&
      grant.inviteExpiresAt &&
      grant.inviteExpiresAt > new Date() &&
      paymentConfirmedStatuses.includes(grant.order.status),
  );

  if (!eligible || !grant) {
    await telegramApi<boolean>("declineChatJoinRequest", {
      chat_id: getChannelId(),
      user_id: String(userId),
    });
    return;
  }

  await prisma.accessGrant.update({
    where: { id: grant.id },
    data: { status: AccessGrantStatus.join_requested, joinRequestedAt: new Date() },
  });
  if (!(await isTelegramMember(userId))) {
    await telegramApi<boolean>("approveChatJoinRequest", {
      chat_id: getChannelId(),
      user_id: String(userId),
    });
  }
  await prisma.$transaction([
    prisma.accessGrant.update({
      where: { id: grant.id },
      data: { status: AccessGrantStatus.access_granted, grantedAt: new Date() },
    }),
    prisma.order.update({
      where: { id: grant.orderId },
      data: { status: OrderStatus.access_granted },
    }),
  ]);
  const link = decryptInviteLink(grant);
  if (link) await revokeInviteLink(link);
}

export async function revokeCourseAccess(orderId: string) {
  const prisma = getPrisma();
  const grant = await prisma.accessGrant.findUnique({ where: { orderId } });
  if (!grant) return;
  const link = decryptInviteLink(grant);
  if (link) {
    await telegramApi<boolean>("revokeChatInviteLink", {
      chat_id: getChannelId(),
      invite_link: link,
    }).catch(() => undefined);
  }

  if (grant.status === AccessGrantStatus.access_granted) {
    await telegramApi<boolean>("banChatMember", {
      chat_id: getChannelId(),
      user_id: String(grant.telegramUserId),
    });
  }

  await prisma.accessGrant.update({
    where: { id: grant.id },
    data: {
      status: AccessGrantStatus.revoked,
      revokedAt: new Date(),
      inviteLinkHash: null,
      inviteLinkCiphertext: null,
      inviteLinkIv: null,
      inviteLinkAuthTag: null,
    },
  });
}
