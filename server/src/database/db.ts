import postgres from "postgres";

import { drizzle } from "drizzle-orm/postgres-js";
import { schema } from "./schema.ts";

import "dotenv/config";

if (!process.env.DATABASE_URL) {
	throw new Error("DATABASE_URL is not set in .env");
}

const client = postgres(process.env.DATABASE_URL);
export const db = drizzle(client, { schema });
