import { ZodError } from "zod";
import { AuthApiError } from "@supabase/supabase-js";
import { AppError, AppErrorCode } from "@/types/error";
import { errorMap } from "./error-map";

export function getFriendlyErrorMessage(error: unknown): string {
  const normalizedError = normalizeError(error);
  return normalizedError.message;
}

/**
 * Normalize various error types to AppErrorCode
 * Always use errorMap from auth/utils/error-map.ts for user messages
 */
export function normalizeError(error: any): AppError {
  if (isTmdbError(error)) {
    return errorMap[normalizeTmbdError(error)];
  }

  if (isSupabaseError(error) || isAuthApiError(error)) {
    return errorMap[
      normalizeSupabaseError(error) || normalizeStandardError(error)
    ];
  }
  if (error instanceof Error) {
    return errorMap[normalizeStandardError(error)];
  }
  return errorMap[AppErrorCode.UNKNOWN_ERROR];
}

function isAuthApiError(error: unknown): error is AuthApiError {
  return error instanceof AuthApiError;
}

function isSupabaseError(
  error: unknown
): error is { code: string; message: string } {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    "message" in error &&
    typeof (error as any).code === "string" &&
    typeof (error as any).message === "string"
  );
}

function normalizeTmbdError(error: any): AppErrorCode {
  if (error.message.includes("401")) {
    return AppErrorCode.TMDB_UNAUTHORIZED;
  }
  if (error.message.includes("network") || error.message.includes("fetch")) {
    return AppErrorCode.NETWORK_ERROR;
  }
  return AppErrorCode.TMDB_SEARCH_FAILED;
}

/**
 * Normalize Supabase Auth + Database errors into internal AppErrorCode.
 * This function should be called anywhere you receive a Supabase `error` object.
 */
export function normalizeSupabaseError(error: {
  code?: string;
  message?: string;
}): AppErrorCode | null {
  const code = error.code?.toLowerCase() || "";
  const message = error.message?.toLowerCase() || "";

  // ---------- AUTH ERRORS ---------
  if (
    code === "email_address_already_registered" ||
    message.includes("already registered") ||
    message.includes("user already exists")
  ) {
    return AppErrorCode.AUTH_EMAIL_ALREADY_EXISTS;
  }

  if (code === "invalid_credentials" || message.includes("invalid login")) {
    return AppErrorCode.AUTH_INVALID_CREDENTIAL;
  }
  if (message.includes("user not found")) {
    return AppErrorCode.AUTH_USER_NOT_FOUND;
  }
  if (message.includes("password") && message.includes("incorrect")) {
    return AppErrorCode.AUTH_WRONG_PASSWORD;
  }
  if (message.includes("too many requests") || code === "too_many_requests") {
    return AppErrorCode.AUTH_TOO_MANY_REQUESTS;
  }
  if (message.includes("requires recent login")) {
    return AppErrorCode.AUTH_REQUIRES_RECENT_LOGIN;
  }
  if (message.includes("disabled") && message.includes("account")) {
    return AppErrorCode.AUTH_USER_DISABLED;
  }
  if (message.includes("operation not allowed")) {
    return AppErrorCode.AUTH_OPERATION_NOT_ALLOWED;
  }

  // ---------- DATABASE ERRORS ----------
  if (code === "pgrst116" || message.includes("not found")) {
    // Check if it's habitat-related
    if (message.includes("habitat")) {
      return AppErrorCode.HABITAT_NOT_FOUND;
    }
    return AppErrorCode.PROFILE_NOT_FOUND;
  }
  if (
    code === "23505" || // Postgres unique_violation
    message.includes("duplicate key") ||
    message.includes("already exists")
  ) {
    // Check if it's habitat membership related
    if (message.includes("habitat_members")) {
      return AppErrorCode.HABITAT_ALREADY_MEMBER;
    }
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

  // ---------- HABITAT-SPECIFIC ERRORS ----------
  if (message.includes("habitat") && message.includes("access denied")) {
    return AppErrorCode.HABITAT_ACCESS_DENIED;
  }
  if (message.includes("access denied to habitat")) {
    return AppErrorCode.HABITAT_ACCESS_DENIED;
  }
  if (message.includes("access denied to private habitat")) {
    return AppErrorCode.HABITAT_ACCESS_DENIED;
  }
  if (message.includes("cannot join private habitat")) {
    return AppErrorCode.HABITAT_ACCESS_DENIED;
  }
  if (message.includes("habitat") && message.includes("not member")) {
    return AppErrorCode.HABITAT_NOT_MEMBER;
  }
  if (message.includes("user is not a member")) {
    return AppErrorCode.HABITAT_NOT_MEMBER;
  }
  if (message.includes("already a member")) {
    return AppErrorCode.HABITAT_ALREADY_MEMBER;
  }
  if (message.includes("owners cannot leave")) {
    return AppErrorCode.HABITAT_ACCESS_DENIED;
  }

  if (message.includes("unauthorized to delete")) {
    return AppErrorCode.MESSAGE_UNAUTHORIZED;
  }
  if (message.includes("realtime") || message.includes("websocket")) {
    return AppErrorCode.REALTIME_CONNECTION_FAILED;
  }

  // ---------- FALLBACKS ----------
  if (message.includes("network")) {
    return AppErrorCode.NETWORK_ERROR;
  }
  if (message.includes("rate limit")) {
    return AppErrorCode.RATE_LIMIT_EXCEEDED;
  }

  return null;
}
/**
 * Normalize standard JavaScript errors
 */
function normalizeStandardError(
  error: Error | { message: string }
): AppErrorCode {
  const message = error.message.toLowerCase();

  // Habitat-specific errors
  if (message.includes("habitat not found")) {
    return AppErrorCode.HABITAT_NOT_FOUND;
  }
  if (message.includes("habitat") && message.includes("access denied")) {
    return AppErrorCode.HABITAT_ACCESS_DENIED;
  }
  if (message.includes("access denied to habitat")) {
    return AppErrorCode.HABITAT_ACCESS_DENIED;
  }
  if (message.includes("access denied to private habitat")) {
    return AppErrorCode.HABITAT_ACCESS_DENIED;
  }
  if (message.includes("cannot join private habitat")) {
    return AppErrorCode.HABITAT_ACCESS_DENIED;
  }
  if (message.includes("user is not a member")) {
    return AppErrorCode.HABITAT_NOT_MEMBER;
  }
  if (message.includes("already a member")) {
    return AppErrorCode.HABITAT_ALREADY_MEMBER;
  }
  if (message.includes("owners cannot leave")) {
    return AppErrorCode.HABITAT_ACCESS_DENIED;
  }

  if (message.includes("unauthorized to delete")) {
    return AppErrorCode.MESSAGE_UNAUTHORIZED;
  }
  if (message.includes("realtime") && message.includes("connection")) {
    return AppErrorCode.REALTIME_CONNECTION_FAILED;
  }
  // Profile errors
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
function isTmdbError(error: any) {
  if (error instanceof Error) {
    return error.message.includes("TMDB");
  }
}
