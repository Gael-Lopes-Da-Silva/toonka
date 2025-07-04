import { defineConfig } from "drizzle-kit"

if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not set")

export default defineConfig({
  out: "./src/lib/server/database/migration/",
  schema: "./src/lib/server/database/schema.ts",
  dialect: "postgresql",
  dbCredentials: { url: process.env.DATABASE_URL },
  verbose: true,
  strict: true
})
