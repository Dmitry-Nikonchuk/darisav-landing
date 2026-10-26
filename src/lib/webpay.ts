import { createHash, randomBytes } from "node:crypto";
import { getAppBaseUrl, safeEqual } from "@/lib/security";
import type { Order } from "@prisma/client";

export type WebPayForm = Record<string, string>;

export type WebPayNotification = {
  batchTimestamp: string;
  currency: string;
  amount: string;
  paymentMethod: string;
  webpayOrderId: string;
  siteOrderId: string;
  transactionId: string;
  paymentType: string;
  rrn: string;
  signature: string;
};

export type VerifiedWebPayTransaction = {
  batchTimestamp: string;
  currency: string;
  amount: string;
  paymentMethod: string;
  webpayOrderId: string;
  siteOrderId?: string;
  transactionId: string;
  paymentType: string;
  rrn: string;
  signature: string;
};

function getRequired(name: string) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is not configured`);
  return value;
}

export function getWebPayConfiguration() {
  const testMode = getRequired("WEBPAY_TEST");
  if (testMode !== "0" && testMode !== "1") {
    throw new Error("WEBPAY_TEST must be 1 (sandbox) or 0 (production)");
  }
  const currency = getRequired("WEBPAY_CURRENCY_ID").toUpperCase();
  if (!["BYN", "USD", "EUR", "RUB"].includes(currency)) {
    throw new Error("WEBPAY_CURRENCY_ID is not supported by WebPay");
  }

  const amount = getRequired("BLONDE_FORMULA_AMOUNT");
  if (!/^\d{1,8}(?:\.\d{1,2})?$/.test(amount) || Number(amount) <= 0) {
    throw new Error("BLONDE_FORMULA_AMOUNT must be a positive amount with up to 2 decimals");
  }

  return {
    testMode,
    currency,
    amount: Number(amount).toFixed(2),
    storeId: getRequired("WEBPAY_STORE_ID"),
    storeName: process.env.WEBPAY_STORE_NAME?.trim() ?? "",
    secretKey: getRequired("WEBPAY_SECRET_KEY"),
    formUrl:
      testMode === "1"
        ? "https://securesandbox.webpay.by/"
        : "https://payment.webpay.by/",
  };
}

export function createWebPayForm(order: Order): WebPayForm {
  const configuration = getWebPayConfiguration();
  const seed = randomBytes(18).toString("hex");
  const amount = Number(order.amount).toFixed(2);
  const baseUrl = getAppBaseUrl();
  const returnUrl = new URL("/checkout/blonde-formula/result", baseUrl);
  returnUrl.searchParams.set("orderId", order.siteOrderId);
  const cancelUrl = new URL(returnUrl);
  cancelUrl.searchParams.set("cancelled", "1");

  const signature = createHash("sha1")
    .update(
      `${seed}${configuration.storeId}${order.siteOrderId}${configuration.testMode}${order.currency}${amount}${configuration.secretKey}`,
      "utf8",
    )
    .digest("hex");

  return {
    "*scart": "",
    wsb_version: "2",
    wsb_language_id: "russian",
    wsb_storeid: configuration.storeId,
    ...(configuration.storeName && { wsb_store: configuration.storeName }),
    wsb_order_num: order.siteOrderId,
    wsb_test: configuration.testMode,
    wsb_currency_id: order.currency,
    wsb_seed: seed,
    wsb_return_url: returnUrl.toString(),
    wsb_cancel_return_url: cancelUrl.toString(),
    wsb_notify_url: new URL("/api/webpay/notify", baseUrl).toString(),
    "wsb_invoice_item_name[0]": "Курс BLONDE FORMULA",
    "wsb_invoice_item_quantity[0]": "1",
    "wsb_invoice_item_price[0]": amount,
    wsb_total: amount,
    wsb_signature: signature,
  };
}

export function parseNotification(formData: FormData): WebPayNotification | null {
  const fields = [
    "batch_timestamp",
    "currency_id",
    "amount",
    "payment_method",
    "order_id",
    "site_order_id",
    "transaction_id",
    "payment_type",
    "rrn",
    "wsb_signature",
  ] as const;
  const values = Object.fromEntries(
    fields.map((field) => [field, formData.get(field)]),
  );
  if (
    fields.some((field) => typeof values[field] !== "string") ||
    !/^\d+$/.test(values.batch_timestamp as string) ||
    !/^\d+$/.test(values.transaction_id as string) ||
    !/^\d+$/.test(values.order_id as string) ||
    !/^[a-zA-Z0-9_-]{1,64}$/.test(values.site_order_id as string)
  ) {
    return null;
  }

  return {
    batchTimestamp: values.batch_timestamp as string,
    currency: (values.currency_id as string).toUpperCase(),
    amount: values.amount as string,
    paymentMethod: values.payment_method as string,
    webpayOrderId: values.order_id as string,
    siteOrderId: values.site_order_id as string,
    transactionId: values.transaction_id as string,
    paymentType: values.payment_type as string,
    rrn: values.rrn as string,
    signature: values.wsb_signature as string,
  };
}

export function verifyNotificationSignature(
  notification: WebPayNotification,
  card?: string,
) {
  const secret = getRequired("WEBPAY_SECRET_KEY");
  const includeCard = process.env.WEBPAY_NOTIFY_SIGNATURE_INCLUDES_CARD === "true";
  const signature = createHash("md5")
    .update(
      [
        notification.batchTimestamp,
        notification.currency,
        notification.amount,
        notification.paymentMethod,
        notification.webpayOrderId,
        notification.siteOrderId,
        notification.transactionId,
        notification.paymentType,
        notification.rrn,
        ...(includeCard ? [card ?? ""] : []),
        secret,
      ].join(""),
      "utf8",
    )
    .digest("hex");
  return safeEqual(signature.toLowerCase(), notification.signature.toLowerCase());
}

export function toMinorUnits(value: string | number) {
  const text = String(value).trim();
  const match = /^(\d+)(?:\.(\d{1,2}))?$/.exec(text);
  if (!match) return null;
  const whole = BigInt(match[1]);
  const fraction = BigInt((match[2] ?? "").padEnd(2, "0"));
  return whole * BigInt(100) + fraction;
}

export function notificationMatchesOrder(
  notification: WebPayNotification,
  order: Order,
) {
  const configured = getWebPayConfiguration();
  const receivedAmount = toMinorUnits(notification.amount);
  const expectedAmount = toMinorUnits(Number(order.amount).toFixed(2));
  return (
    notification.siteOrderId === order.siteOrderId &&
    notification.currency === order.currency &&
    notification.currency === configured.currency &&
    receivedAmount !== null &&
    receivedAmount === expectedAmount &&
    ["1", "4"].includes(notification.paymentType)
  );
}

function xmlEscape(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function readXmlValue(xml: string, tag: string) {
  const pattern = new RegExp(
    `<(?:[\\w.-]+:)?${tag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/(?:[\\w.-]+:)?${tag}>`,
    "i",
  );
  const value = pattern.exec(xml)?.[1]?.trim();
  return value
    ?.replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .replaceAll("&apos;", "'");
}

export async function getVerifiedTransaction(
  transactionId: string,
): Promise<VerifiedWebPayTransaction | null> {
  const configuration = getWebPayConfiguration();
  const username = process.env.WEBPAY_API_USERNAME?.trim();
  const password = process.env.WEBPAY_API_PASSWORD;
  if (!username || !password) return null;

  const apiPassword = createHash("md5").update(password).digest("hex");
  const xml = `<?xml version="1.0" encoding="UTF-8"?><wsb_api_request><command>get_transaction</command><authorization><username>${xmlEscape(username)}</username><password>${apiPassword}</password></authorization><fields><transaction_id>${xmlEscape(transactionId)}</transaction_id></fields></wsb_api_request>`;
  const body = new URLSearchParams({ "*API": "", API_XML_REQUEST: xml });
  const response = await fetch(
    configuration.testMode === "1"
      ? "https://sandbox.webpay.by"
      : "https://billing.webpay.by",
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
      signal: AbortSignal.timeout(10_000),
      cache: "no-store",
    },
  );
  if (!response.ok) throw new Error("WebPay transaction status request failed");
  const responseXml = await response.text();
  const fields = {
    batchTimestamp: readXmlValue(responseXml, "batch_timestamp"),
    currency: readXmlValue(responseXml, "currency_id")?.toUpperCase(),
    amount: readXmlValue(responseXml, "amount"),
    paymentMethod: readXmlValue(responseXml, "payment_method"),
    webpayOrderId: readXmlValue(responseXml, "order_id"),
    siteOrderId: readXmlValue(responseXml, "site_order_id"),
    transactionId: readXmlValue(responseXml, "transaction_id"),
    paymentType: readXmlValue(responseXml, "payment_type"),
    rrn: readXmlValue(responseXml, "rrn") ?? "",
    signature: readXmlValue(responseXml, "wsb_signature"),
  };
  if (
    !fields.batchTimestamp ||
    !fields.currency ||
    !fields.amount ||
    !fields.paymentMethod ||
    !fields.webpayOrderId ||
    fields.transactionId !== transactionId ||
    !fields.paymentType ||
    !fields.signature ||
    !["1", "4"].includes(fields.paymentType)
  ) {
    return null;
  }

  const expectedSignature = createHash("md5")
    .update(
      [
        fields.transactionId,
        fields.batchTimestamp,
        fields.currency,
        fields.amount,
        fields.paymentMethod,
        fields.paymentType,
        fields.webpayOrderId,
        fields.rrn,
        configuration.secretKey,
      ].join(""),
      "utf8",
    )
    .digest("hex");
  if (!safeEqual(expectedSignature, fields.signature.toLowerCase())) return null;
  return {
    batchTimestamp: fields.batchTimestamp,
    currency: fields.currency,
    amount: fields.amount,
    paymentMethod: fields.paymentMethod,
    webpayOrderId: fields.webpayOrderId,
    siteOrderId: fields.siteOrderId,
    transactionId: fields.transactionId,
    paymentType: fields.paymentType,
    rrn: fields.rrn,
    signature: fields.signature,
  };
}
