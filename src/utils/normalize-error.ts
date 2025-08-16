import { ZodError } from "zod";
import { AuthApiError } from "@supabase/supabase-js";
import { AppError, AppErrorCode } from "@/types/error";
import { errorMap } from "./error-map";

export function getFriendlyErrorMessage(error: unknown): string {
  return (
    (error as AppError)?.message ?? errorMap[AppErrorCode.UNKNOWN_ERROR].message
  );
}

/**
 * Normalize various error types to AppErrorCode
 * Always use errorMap from auth/utils/error-map.ts for user messages
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function normalizeError(error: any): AppError {
  // Handle Zod validation errors
  if (error instanceof ZodError) {
    return errorMap[normalizeZodError(error)];
  }

  // Handle Supabase errors
  if (isAuthApiError(error) || isSupabaseError(error)) {
    console.log("Returning: " + normalizeSupabaseError(error));
    return errorMap[normalizeSupabaseError(error)];
  }

  // Handle standard errors
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    typeof (error as any).code === "string" &&
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    typeof (error as any).message === "string"
  );
}

/**
 * Normalize Zod validation errors
 */
function normalizeZodError(error: ZodError): AppErrorCode {
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
 * Normalize Supabase Auth + Database errors into internal AppErrorCode.
 * This function should be called anywhere you receive a Supabase `error` object.
 */
export function normalizeSupabaseError(error: {
  code?: string;
  message?: string;
}): AppErrorCode {
  const code = error.code?.toLowerCase() || "";
  const message = error.message?.toLowerCase() || "";
  console.log("code: " + code);

  // ---------- AUTH ERRORS ----------
  if (code === "email_address_invalid") {
    console.log("Returning: " + AppErrorCode.AUTH_INVALID_EMAIL);
    return AppErrorCode.AUTH_INVALID_EMAIL;
  }
  if (code === "email_not_confirmed") {
    return AppErrorCode.AUTH_EMAIL_NOT_VERIFIED;
  }
  if (
    code === "email_address_already_registered" ||
    message.includes("already registered") ||
    message.includes("user already exists")
  ) {
    return AppErrorCode.AUTH_EMAIL_ALREADY_EXISTS;
  }
  if (code === "weak_password" || message.includes("weak password")) {
    return AppErrorCode.AUTH_WEAK_PASSWORD;
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
    return AppErrorCode.PROFILE_NOT_FOUND;
  }
  if (
    code === "23505" || // Postgres unique_violation
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

  // ---------- VALIDATION ERRORS ----------
  if (message.includes("required")) {
    return AppErrorCode.VALIDATION_REQUIRED_FIELD;
  }
  if (message.includes("invalid") && message.includes("password")) {
    return AppErrorCode.VALIDATION_INVALID_PASSWORD;
  }
  if (message.includes("invalid") && message.includes("display name")) {
    return AppErrorCode.VALIDATION_INVALID_DISPLAY_NAME;
  }
  if (message.includes("invalid") && message.includes("avatar")) {
    return AppErrorCode.VALIDATION_INVALID_AVATAR_URL;
  }
  if (message.includes("invalid") && message.includes("genre")) {
    return AppErrorCode.VALIDATION_INVALID_GENRES;
  }

  // ---------- FALLBACKS ----------
  if (message.includes("network")) {
    return AppErrorCode.NETWORK_ERROR;
  }
  if (message.includes("rate limit")) {
    return AppErrorCode.RATE_LIMIT_EXCEEDED;
  }

  return AppErrorCode.UNKNOWN_ERROR;
}
/**
 * Normalize standard JavaScript errors
 */
function normalizeStandardError(
  error: Error | { message: string }
): AppErrorCode {
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
