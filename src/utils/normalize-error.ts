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

  // ---------- AUTH ERRORS ----------
  if (code === "email_address_invalid") {
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
  if (message.includes("message") && message.includes("too long")) {
    return AppErrorCode.MESSAGE_TOO_LONG;
  }
  if (message.includes("message is too long")) {
    return AppErrorCode.MESSAGE_TOO_LONG;
  }
  if (message.includes("message") && message.includes("invalid")) {
    return AppErrorCode.MESSAGE_INVALID_CONTENT;
  }
  if (message.includes("message content is invalid")) {
    return AppErrorCode.MESSAGE_INVALID_CONTENT;
  }
  if (message.includes("message content is required")) {
    return AppErrorCode.MESSAGE_INVALID_CONTENT;
  }
  if (message.includes("message content cannot be empty")) {
    return AppErrorCode.MESSAGE_INVALID_CONTENT;
  }
  if (message.includes("unauthorized to delete")) {
    return AppErrorCode.MESSAGE_UNAUTHORIZED;
  }
  if (message.includes("realtime") || message.includes("websocket")) {
    return AppErrorCode.REALTIME_CONNECTION_FAILED;
  }

  // ---------- HABITAT CREATION ERRORS ----------
  if (message.includes("habitat name") && message.includes("required")) {
    return AppErrorCode.HABITAT_INVALID_NAME;
  }
  if (message.includes("habitat name") && message.includes("invalid")) {
    return AppErrorCode.HABITAT_INVALID_NAME;
  }
  if (
    message.includes("habitat name") &&
    (message.includes("too long") || message.includes("too short"))
  ) {
    return AppErrorCode.HABITAT_INVALID_NAME;
  }
  if (message.includes("habitat description") && message.includes("required")) {
    return AppErrorCode.HABITAT_INVALID_DESCRIPTION;
  }
  if (message.includes("habitat description") && message.includes("invalid")) {
    return AppErrorCode.HABITAT_INVALID_DESCRIPTION;
  }
  if (
    message.includes("habitat description") &&
    (message.includes("too long") || message.includes("too short"))
  ) {
    return AppErrorCode.HABITAT_INVALID_DESCRIPTION;
  }
  if (
    message.includes("tags") &&
    (message.includes("required") || message.includes("invalid"))
  ) {
    return AppErrorCode.HABITAT_INVALID_TAGS;
  }
  if (message.includes("maximum") && message.includes("tags")) {
    return AppErrorCode.HABITAT_INVALID_TAGS;
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
  if (message.includes("message") && message.includes("too long")) {
    return AppErrorCode.MESSAGE_TOO_LONG;
  }
  if (message.includes("message is too long")) {
    return AppErrorCode.MESSAGE_TOO_LONG;
  }
  if (message.includes("message content is invalid")) {
    return AppErrorCode.MESSAGE_INVALID_CONTENT;
  }
  if (message.includes("message content is required")) {
    return AppErrorCode.MESSAGE_INVALID_CONTENT;
  }
  if (message.includes("message content cannot be empty")) {
    return AppErrorCode.MESSAGE_INVALID_CONTENT;
  }
  if (message.includes("unauthorized to delete")) {
    return AppErrorCode.MESSAGE_UNAUTHORIZED;
  }
  if (message.includes("realtime") && message.includes("connection")) {
    return AppErrorCode.REALTIME_CONNECTION_FAILED;
  }

  // Habitat creation errors
  if (message.includes("habitat name") && message.includes("required")) {
    return AppErrorCode.HABITAT_INVALID_NAME;
  }
  if (message.includes("habitat name") && message.includes("invalid")) {
    return AppErrorCode.HABITAT_INVALID_NAME;
  }
  if (
    message.includes("habitat name") &&
    (message.includes("too long") || message.includes("too short"))
  ) {
    return AppErrorCode.HABITAT_INVALID_NAME;
  }
  if (message.includes("habitat description") && message.includes("required")) {
    return AppErrorCode.HABITAT_INVALID_DESCRIPTION;
  }
  if (message.includes("habitat description") && message.includes("invalid")) {
    return AppErrorCode.HABITAT_INVALID_DESCRIPTION;
  }
  if (
    message.includes("habitat description") &&
    (message.includes("too long") || message.includes("too short"))
  ) {
    return AppErrorCode.HABITAT_INVALID_DESCRIPTION;
  }
  if (
    message.includes("tags") &&
    (message.includes("required") || message.includes("invalid"))
  ) {
    return AppErrorCode.HABITAT_INVALID_TAGS;
  }
  if (message.includes("maximum") && message.includes("tags")) {
    return AppErrorCode.HABITAT_INVALID_TAGS;
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
