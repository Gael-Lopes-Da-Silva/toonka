import postgres from "postgres"

import { drizzle } from "drizzle-orm/postgres-js"
import { schema } from "./schema"
import { env } from "$env/dynamic/private"

if (!env.DATABASE_URL) throw new Error("DATABASE_URL is not set in .env")

const client = postgres(env.DATABASE_URL)

export const db = drizzle(client, { schema })
