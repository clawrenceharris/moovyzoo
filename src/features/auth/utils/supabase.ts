import { createClient } from "@supabase/supabase-js";
import { env, validateEnvironment } from "./env";

// Validate environment variables on module load
validateEnvironment();

const supabaseUrl = env.supabase.url!;
const supabaseAnonKey = env.supabase.anonKey!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

// Type helper for database types (will be generated later)
export type Database = any; // TODO: Replace with generated types
