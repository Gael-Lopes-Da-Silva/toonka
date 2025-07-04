import { defineConfig } from 'drizzle-kit';

import 'dotenv/config';

export default defineConfig({
  out: './src/database/migration',
  schema: './src/database/schema.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!
  }
})
