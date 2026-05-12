// @ts-nocheck
import { defineConfig } from "prisma/config";
import "dotenv/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    // Port 5432 is unreachable from Render; using 6543 for everything.
    url: process.env.DATABASE_URL,
  },
});
