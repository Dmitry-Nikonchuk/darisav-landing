import { spawnSync } from "node:child_process";
import { resolve } from "node:path";
import { readPm2Environment } from "./pm2-environment.mjs";

const [pm2Bin, appName, releaseDir] = process.argv.slice(2);
if (!pm2Bin || !appName || !releaseDir) {
  throw new Error("Usage: run-server-migrations.mjs <pm2-bin> <app-name> <release-dir>");
}

const { DATABASE_URL } = readPm2Environment(
  pm2Bin,
  appName,
  ["DATABASE_URL"],
  resolve(releaseDir, ".env"),
);
const result = spawnSync(
  process.execPath,
  [
    resolve(releaseDir, "node_modules/prisma/build/index.js"),
    "migrate",
    "deploy",
    "--schema",
    resolve(releaseDir, "prisma/schema.prisma"),
  ],
  {
    cwd: releaseDir,
    env: { ...process.env, DATABASE_URL, NODE_ENV: "production" },
    stdio: "inherit",
  },
);

if (result.error) throw result.error;
if (result.status !== 0) {
  throw new Error(`prisma migrate deploy exited with status ${result.status ?? "unknown"}`);
}
