import "dotenv/config";
import { defineConfig } from "prisma/config";

// The fallback is only for generating Prisma Client during dependency install/build.
// Database commands and runtime must receive the real DATABASE_URL.
const databaseUrl =
  process.env.DATABASE_URL ?? "mysql://generate:generate@127.0.0.1:3306/darisav";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: { path: "prisma/migrations" },
  datasource: { url: databaseUrl },
});
