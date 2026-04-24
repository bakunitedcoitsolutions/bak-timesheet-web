/**
 * Supabase Client Singleton
 *
 * For direct Supabase operations (Storage, Realtime, Auth, etc.)
 * Note: We're using Prisma for database operations via API routes.
 *
 * Usage:
 * - `supabase`: Safe for client-side use (uses anon key, respects RLS)
 *   - File storage (Supabase Storage)
 *   - Real-time subscriptions
 *   - Client-side auth operations
 */

import { createClient } from "@supabase/supabase-js";

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error("NEXT_PUBLIC_SUPABASE_URL environment variable is not set");
}

if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error(
    "NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable is not set"
  );
}

// Client-side Supabase client (safe for browser use)
// Uses anon key and respects Row Level Security (RLS) policies
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  }
);

export default supabase;
