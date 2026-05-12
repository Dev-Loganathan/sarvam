// @ts-nocheck
import { defineConfig } from "prisma/config";
import "dotenv/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    // This is used by Prisma CLI for migrations and introspection
    url: process.env.DATABASE_URL,
  },
});
