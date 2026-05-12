// @ts-nocheck
import { defineConfig } from "prisma/config";
import "dotenv/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    // For migrations, Prisma 7 prefers a direct connection (port 5432)
    url: process.env.DIRECT_URL || process.env.DATABASE_URL,
  },
});
