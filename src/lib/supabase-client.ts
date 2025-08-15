import { createClient } from "@supabase/supabase-js";

// Environment validation
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}

// Singleton Supabase client for profiles feature
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

// Type helper for database types (will be generated later)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Database = any; // TODO: Replace with generated types
