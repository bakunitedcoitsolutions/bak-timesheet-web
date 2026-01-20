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
 * 
 * - `supabaseAdmin`: SERVER-SIDE ONLY (uses service role key, bypasses RLS)
 *   - Server-side operations that need admin access
 *   - Only use in API routes or Server Components
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

// Server-side Supabase admin client (SERVER-SIDE ONLY)
// Uses service role key and bypasses RLS - only use in API routes or Server Components
export const supabaseAdmin = process.env.SUPABASE_SERVICE_ROLE_KEY
  ? (() => {
      // Ensure this is only used server-side
      if (typeof window !== "undefined") {
        throw new Error(
          "supabaseAdmin cannot be used in client components. Use API routes or Server Components instead."
        );
      }
      return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY,
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false,
          },
        }
      );
    })()
  : null;

export default supabase;
