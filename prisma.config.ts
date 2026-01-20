/**
 * Prisma Configuration for Supabase
 * Prisma 7 requires connection URLs to be defined here instead of schema.prisma
 *
 * Supabase Connection String Format:
 * - Direct connection: postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
 * - Connection pooler (recommended for production/serverless):
 *   postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
 *
 * Get your connection string from: Supabase Dashboard → Settings → Database → Connection string
 */

import "dotenv/config";
import { defineConfig, env } from "@prisma/config";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

export default defineConfig({
  schema: "./prisma/schema.prisma",
  datasource: {
    url: env("DATABASE_URL"),
  },
});
