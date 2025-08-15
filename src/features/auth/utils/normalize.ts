import { AuthError } from "@supabase/supabase-js";
import { ZodError } from "zod";
import { AppErrorCode } from "../../../utils/error-codes";
import { errorMap, ErrorMessage } from "../../../utils/error-map";

export interface NormalizedError {
  code: AppErrorCode;
  title: string;
  message: string;
  originalError?: unknown;
}

export interface ApiErrorResponse {
  ok: false;
  code: AppErrorCode;
  message: string;
}

/**
 * Normalize Supabase Auth errors to app error codes
 */
export function normalizeAuthError(error: AuthError): AppErrorCode {
  const message = error.message.toLowerCase();

  if (
    message.includes("email already registered") ||
    message.includes("user already registered")
  ) {
    return AppErrorCode.AUTH_EMAIL_ALREADY_EXISTS;
  }
  if (message.includes("invalid email")) {
    return AppErrorCode.AUTH_INVALID_EMAIL;
  }
  if (message.includes("password") && message.includes("weak")) {
    return AppErrorCode.AUTH_WEAK_PASSWORD;
  }
  if (message.includes("email not confirmed")) {
    return AppErrorCode.AUTH_USER_NOT_FOUND;
  }
  if (
    message.includes("invalid login credentials") ||
    message.includes("invalid credentials")
  ) {
    return AppErrorCode.AUTH_WRONG_PASSWORD;
  }
  if (message.includes("too many requests")) {
    return AppErrorCode.AUTH_TOO_MANY_REQUESTS;
  }
  if (message.includes("network")) {
    return AppErrorCode.AUTH_NETWORK_ERROR;
  }
  if (
    message.includes("session not found") ||
    message.includes("jwt expired")
  ) {
    return AppErrorCode.AUTH_REQUIRES_RECENT_LOGIN;
  }
  if (message.includes("signup is disabled")) {
    return AppErrorCode.AUTH_OPERATION_NOT_ALLOWED;
  }

  return AppErrorCode.UNKNOWN_ERROR;
}

/**
 * Normalize Supabase database errors to app error codes
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function normalizeSupabaseError(error: any): AppErrorCode {
  if (!error || typeof error !== "object") {
    return AppErrorCode.UNKNOWN_ERROR;
  }

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

  return AppErrorCode.UNKNOWN_ERROR;
}

/**
 * Normalize Zod validation errors to app error codes
 */
export function normalizeZodError(error: ZodError): AppErrorCode {
  // Check the first error to determine the most appropriate code
  const firstError = error.issues[0];
  if (!firstError) return AppErrorCode.VALIDATION_REQUIRED_FIELD;

  const path = firstError.path.join(".");

  switch (path) {
    case "email":
      return AppErrorCode.VALIDATION_INVALID_EMAIL;
    case "password":
      return AppErrorCode.VALIDATION_INVALID_PASSWORD;
    case "displayName":
      return AppErrorCode.VALIDATION_INVALID_DISPLAY_NAME;
    case "avatarUrl":
      return AppErrorCode.VALIDATION_INVALID_AVATAR_URL;
    case "favoriteGenres":
      return AppErrorCode.VALIDATION_INVALID_GENRES;
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
 * Normalize any error to a consistent format
 */
export function normalizeError(error: unknown): NormalizedError {
  let code: AppErrorCode;

  if (isAuthError(error)) {
    code = normalizeAuthError(error);
  } else if (isSupabaseError(error)) {
    code = normalizeSupabaseError(error);
  } else if (isZodError(error)) {
    code = normalizeZodError(error);
  } else if (error instanceof Error) {
    // Handle custom app errors
    if (error.message.includes("rate limit")) {
      code = AppErrorCode.RATE_LIMIT_EXCEEDED;
    } else if (
      error.message.includes("network") ||
      error.message.includes("connection")
    ) {
      code = AppErrorCode.NETWORK_ERROR;
    } else {
      code = AppErrorCode.UNKNOWN_ERROR;
    }
  } else {
    code = AppErrorCode.UNKNOWN_ERROR;
  }

  const errorMessage = errorMap[code];

  return {
    code,
    title: errorMessage.title,
    message: errorMessage.message,
    originalError: error,
  };
}

/**
 * Get error message for a specific error code
 */
export function getErrorMessage(code: AppErrorCode): ErrorMessage {
  return errorMap[code] || errorMap[AppErrorCode.UNKNOWN_ERROR];
}

/**
 * Create API error response
 */
export function createApiErrorResponse(error: unknown): ApiErrorResponse {
  const normalized = normalizeError(error);
  return {
    ok: false,
    code: normalized.code,
    message: normalized.message,
  };
}

/**
 * Type guards for error detection
 */
export function isAuthError(error: unknown): error is AuthError {
  return (
    error !== null &&
    error !== undefined &&
    typeof error === "object" &&
    "message" in error &&
    typeof (error as AuthError).message === "string"
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isSupabaseError(error: unknown): error is any {
  return (
    error !== null &&
    error !== undefined &&
    typeof error === "object" &&
    ("code" in error || "message" in error) &&
    !isAuthError(error)
  );
}

export function isZodError(error: unknown): error is ZodError {
  return error instanceof ZodError;
}

/**
 * Log error with normalized information (without sensitive data)
 */
export function logError(error: unknown, context?: string): void {
  const normalized = normalizeError(error);

  // Only log non-sensitive information
  console.error("App Error:", {
    context,
    code: normalized.code,
    title: normalized.title,
    message: normalized.message,
    // Don't log the original error in production to avoid sensitive data leaks
    ...(process.env.NODE_ENV === "development" && { originalError: error }),
  });
}
