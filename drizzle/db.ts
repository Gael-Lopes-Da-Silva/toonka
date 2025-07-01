import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema';

export const db = drizzle(new Database('./db/db.sqlite'), { schema });
