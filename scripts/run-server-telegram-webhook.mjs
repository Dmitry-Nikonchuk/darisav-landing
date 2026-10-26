import { spawnSync } from "node:child_process";
import { resolve } from "node:path";
import { readPm2Environment } from "./pm2-environment.mjs";

const [pm2Bin, appName, releaseDir] = process.argv.slice(2);
if (!pm2Bin || !appName || !releaseDir) {
  throw new Error("Usage: run-server-telegram-webhook.mjs <pm2-bin> <app-name> <release-dir>");
}

const environment = readPm2Environment(pm2Bin, appName, [
  "APP_BASE_URL",
  "TELEGRAM_BOT_TOKEN",
  "TELEGRAM_WEBHOOK_SECRET",
], resolve(releaseDir, ".env"));
const result = spawnSync(
  process.execPath,
  [resolve(releaseDir, "scripts/set-telegram-webhook.mjs")],
  { cwd: releaseDir, env: { ...process.env, ...environment }, stdio: "inherit" },
);

if (result.error) throw result.error;
if (result.status !== 0) {
  throw new Error(`Telegram webhook setup exited with status ${result.status ?? "unknown"}`);
}
