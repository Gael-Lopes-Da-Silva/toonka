import { defineConfig } from "drizzle-kit";

import "dotenv/config";

if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not set");

export default defineConfig({
	out: "./src/database/migration/",
	schema: "./src/database/schema.ts",
	dialect: "postgresql",
	dbCredentials: { url: process.env.DATABASE_URL },
	verbose: true,
	strict: true,
});
