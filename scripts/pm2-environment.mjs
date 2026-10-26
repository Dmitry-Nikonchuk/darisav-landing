import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { parse } from "dotenv";

export function readPm2Environment(pm2Bin, appName, requiredVariables, envFile) {
  const processes = JSON.parse(
    execFileSync(pm2Bin, ["jlist"], { encoding: "utf8" }),
  );
  const app = processes.find(
    (processInfo) =>
      processInfo.name === appName || processInfo.pm2_env?.name === appName,
  );
  const processId = app?.pm_id ?? app?.pm2_env?.pm_id;
  if (processId === undefined) {
    throw new Error(`PM2 process "${appName}" was not found`);
  }

  const output = execFileSync(pm2Bin, ["env", String(processId)], {
    encoding: "utf8",
  });
  const available = new Map();
  for (const line of output.split(/\r?\n/)) {
    const match = /^\s*(?:\d+\s*:\s*)?([A-Z_][A-Z\d_]*)\s*:\s*(.*)$/.exec(line);
    if (match) available.set(match[1], match[2]);
  }

  const fileEnvironment = envFile && existsSync(envFile)
    ? parse(readFileSync(envFile))
    : {};
  const environment = {};
  for (const name of requiredVariables) {
    const value = available.get(name) || fileEnvironment[name];
    if (!value) throw new Error(`${name} is missing from PM2 process environment`);
    environment[name] = value;
  }
  return environment;
}
