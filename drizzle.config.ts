/// <reference types="node" />

import { defineConfig } from 'drizzle-kit';
import 'dotenv/config';

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./src/db/migrations",
  dialect: "postgresql",
  strict: true,
  verbose: true,
  dbCredentials: {
    password: process.env.DB_PASSWORD ?? '',
    user: process.env.DB_USER ?? '',
    host: process.env.DB_HOST ?? '',
    port: Number(process.env.DB_PORT),
    database: process.env.DB_NAME ?? '',
    ssl: false
  }
});