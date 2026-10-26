const baseUrl = process.env.APP_BASE_URL;
const token = process.env.TELEGRAM_BOT_TOKEN;
const secret = process.env.TELEGRAM_WEBHOOK_SECRET;

if (!baseUrl || !token || !secret) {
  throw new Error("APP_BASE_URL, TELEGRAM_BOT_TOKEN, and TELEGRAM_WEBHOOK_SECRET are required");
}
if (!/^[A-Za-z0-9_-]{1,256}$/.test(secret)) {
  throw new Error("TELEGRAM_WEBHOOK_SECRET must use 1-256 letters, numbers, underscores, or hyphens");
}

const webhookUrl = new URL("/api/telegram/webhook", baseUrl);
if (webhookUrl.protocol !== "https:") {
  throw new Error("Telegram webhook URL must use HTTPS");
}

const response = await fetch(`https://api.telegram.org/bot${token}/setWebhook`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    url: webhookUrl.toString(),
    secret_token: secret,
    allowed_updates: ["chat_join_request"],
  }),
});
const result = await response.json();
if (!response.ok || !result.ok) {
  throw new Error(`Telegram setWebhook failed (${result.error_code ?? response.status})`);
}

console.log(`Telegram webhook configured: ${webhookUrl.pathname}`);
