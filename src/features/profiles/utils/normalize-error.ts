import { ZodError } from "zod";
import { AppErrorCode } from "../../../utils/error-codes";

/**
 * Normalize various error types to AppErrorCode
 * Always use errorMap from auth/utils/error-map.ts for user messages
 */
export function normalizeError(error: unknown): string {
  // Handle Zod validation errors
  if (error instanceof ZodError) {
    return normalizeZodError(error);
  }

  // Handle Supabase errors
  if (isSupabaseError(error)) {
    return normalizeSupabaseError(error);
  }

  // Handle standard errors
  if (error instanceof Error) {
    return normalizeStandardError(error);
  }

  return AppErrorCode.UNKNOWN_ERROR;
}

/**
 * Normalize Zod validation errors
 */
function normalizeZodError(error: ZodError): string {
  const firstError = error.issues[0];
  if (!firstError) return AppErrorCode.VALIDATION_REQUIRED_FIELD;

  const path = firstError.path.join(".");

  switch (path) {
    case "displayName":
      return AppErrorCode.VALIDATION_INVALID_DISPLAY_NAME;
    case "avatarUrl":
      return AppErrorCode.VALIDATION_INVALID_AVATAR_URL;
    case "favoriteGenres":
      return AppErrorCode.VALIDATION_INVALID_GENRES;
    case "privacySettings":
      return "PROFILE_INVALID_PRIVACY_SETTINGS";
    case "userId":
      return AppErrorCode.VALIDATION_REQUIRED_FIELD;
    default:
      if (
        firstError.code === "invalid_type" &&
        firstError.input === "undefined"
      ) {
        return AppErrorCode.VALIDATION_REQUIRED_FIELD;
      }
      return AppErrorCode.PROFILE_INVALID_DATA;
  }
}

/**
 * Normalize Supabase database errors
 */
function normalizeSupabaseError(error: {
  code: string;
  message: string;
}): string {
  const code = error.code;
  const message = error.message?.toLowerCase() || "";

  // Handle common Supabase error codes
  if (code === "PGRST116" || message.includes("not found")) {
    return AppErrorCode.PROFILE_NOT_FOUND;
  }
  if (
    code === "23505" ||
    message.includes("duplicate key") ||
    message.includes("already exists")
  ) {
    return AppErrorCode.PROFILE_ALREADY_EXISTS;
  }
  if (code === "42501" || message.includes("permission denied")) {
    return AppErrorCode.DATABASE_PERMISSION_DENIED;
  }
  if (message.includes("connection") || message.includes("timeout")) {
    return AppErrorCode.DATABASE_CONNECTION_ERROR;
  }
  if (message.includes("quota") || message.includes("limit")) {
    return AppErrorCode.DATABASE_QUOTA_EXCEEDED;
  }
  if (message.includes("unavailable") || message.includes("service")) {
    return AppErrorCode.DATABASE_UNAVAILABLE;
  }

  return AppErrorCode.DATABASE_CONNECTION_ERROR;
}

/**
 * Normalize standard JavaScript errors
 */
function normalizeStandardError(error: Error): string {
  const message = error.message.toLowerCase();

  if (message.includes("profile not found")) {
    return AppErrorCode.PROFILE_NOT_FOUND;
  }
  if (message.includes("already exists")) {
    return AppErrorCode.PROFILE_ALREADY_EXISTS;
  }
  if (message.includes("permission") || message.includes("unauthorized")) {
    return AppErrorCode.DATABASE_PERMISSION_DENIED;
  }
  if (message.includes("network") || message.includes("connection")) {
    return AppErrorCode.NETWORK_ERROR;
  }
  if (message.includes("rate limit")) {
    return AppErrorCode.RATE_LIMIT_EXCEEDED;
  }

  return AppErrorCode.UNKNOWN_ERROR;
}

/**
 * Type guard for Supabase errors
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isSupabaseError(error: unknown): error is any {
  return (
    error !== null &&
    error !== undefined &&
    typeof error === "object" &&
    ("code" in error || "message" in error)
  );
}
