import "dotenv/config";

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { schema } from "./schema.ts";

if (!process.env.DATABASE_URL) {
	throw new Error("DATABASE_URL is not set in .env");
}

const client = postgres(process.env.DATABASE_URL);
export const db = drizzle(client, { schema });
