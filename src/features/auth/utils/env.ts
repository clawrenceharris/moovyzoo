/**
 * Environment variable validation utilities for Supabase configuration
 */

export const env = {
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  },
  app: {
    url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  },
} as const;

/**
 * Validates that all required environment variables are present
 */
export function validateEnvironment(): void {
  const required = [
    { key: "NEXT_PUBLIC_SUPABASE_URL", value: env.supabase.url },
    { key: "NEXT_PUBLIC_SUPABASE_ANON_KEY", value: env.supabase.anonKey },
  ];

  const missing = required.filter(({ value }) => !value);

  if (missing.length > 0) {
    const missingKeys = missing.map(({ key }) => key).join(", ");
    throw new Error(
      `Missing required environment variables: ${missingKeys}. ` +
        "Please check your .env file and ensure all Supabase credentials are configured."
    );
  }
}

/**
 * Checks if we're in development mode
 */
export function isDevelopment(): boolean {
  return process.env.NODE_ENV === "development";
}

/**
 * Checks if we're in production mode
 */
export function isProduction(): boolean {
  return process.env.NODE_ENV === "production";
}
