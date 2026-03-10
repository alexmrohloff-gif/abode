import "dotenv/config";
import type { PrismaConfig } from "prisma";

export default {
  schema: "prisma/schema.prisma",
  datasource: {
    // Use process.env directly so the config does not throw if the variable
    // is missing at load time; Prisma will still use this value if set.
    url: process.env.DATABASE_URL ?? ""
  }
} satisfies PrismaConfig;



