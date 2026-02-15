/**
 * Prisma Client Singleton for Supabase
 *
 * ⚠️ SERVER-SIDE ONLY ⚠️
 * This Prisma client should ONLY be used in:
 * - API Routes (/app/api/**)
 * - Server Components
 * - Server Actions
 * - Middleware (with caution)
 *
 * NEVER import this in client components ("use client")
 * Use API routes or Server Actions to access the database from the frontend.
 *
 * Supabase is built on PostgreSQL, so we use the PostgreSQL adapter.
 * For production, consider using Supabase's connection pooler URL:
 * postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
 */

import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../../prisma/generated/prisma/client";

// Ensure this is only used server-side
if (typeof window !== "undefined") {
  throw new Error(
    "Prisma Client cannot be used in client components. Use API routes or Server Actions instead."
  );
}

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

// Create a PostgreSQL connection pool
// Prisma 7 requires a Pool instance for the adapter (cannot use connection string directly)
// This connection only exists on the server-side

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pool: Pool | undefined;
};

const pool =
  globalForPrisma.pool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 20, // Maximum number of clients in the pool
    idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
    connectionTimeoutMillis: 20000, // Return an error after 20 seconds if connection could not be established
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.pool = pool;
}

// Create the Prisma adapter
const adapter = new PrismaPg(pool);

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
