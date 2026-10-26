import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as typeof globalThis & {
  prisma?: PrismaClient;
};

function getMySqlConfig() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is not configured");

  const url = new URL(connectionString);
  if (url.protocol !== "mysql:") {
    throw new Error("DATABASE_URL must use the mysql:// protocol");
  }

  const database = decodeURIComponent(url.pathname.replace(/^\//, ""));
  if (!url.hostname || !database || !url.username) {
    throw new Error("DATABASE_URL must include host, user, and database");
  }

  return {
    host: url.hostname,
    port: Number(url.port || 3306),
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database,
    connectionLimit: 5,
    acquireTimeout: 10_000,
    connectTimeout: 5_000,
    ...(url.searchParams.has("ssl") && {
      ssl: {
        rejectUnauthorized:
          url.searchParams.get("sslaccept") !== "accept_invalid_certs",
      },
    }),
  };
}

export function getPrisma() {
  if (!globalForPrisma.prisma) {
    const adapter = new PrismaMariaDb(getMySqlConfig());
    globalForPrisma.prisma = new PrismaClient({ adapter });
  }
  return globalForPrisma.prisma;
}
