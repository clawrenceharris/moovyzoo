/**
 * Error normalization utilities for consistent error handling
 * Converts various error types to standardized AppErrorCode format
 */

import { AppErrorCode } from "./error-codes";
import { getErrorMessage } from "./error-map";
import { ZodError } from "zod";

/**
 * Supabase error interface
 */
interface SupabaseError {
  code?: string;
  message: string;
  details?: string;
  hint?: string;
  status?: number;
}

/**
 * Normalized application error
 */
export interface NormalizedError extends Error {
  code: AppErrorCode;
  originalError?: unknown;
  details?: Record<string, any>;
}

/**
 * Creates a normalized error with consistent structure
 */
export function createNormalizedError(
  code: AppErrorCode,
  originalError?: unknown,
  details?: Record<string, any>
): NormalizedError {
  const errorMessage = getErrorMessage(code);
  const error = new Error(errorMessage.message) as NormalizedError;

  error.name = "NormalizedError";
  error.code = code;
  error.originalError = originalError;
  error.details = details;

  return error;
}

/**
 * Maps Supabase error codes to application error codes
 */
const supabaseErrorMap: Record<string, AppErrorCode> = {
  // Authentication errors
  "401": AppErrorCode.UNAUTHORIZED,
  "403": AppErrorCode.ACCESS_DENIED,
  invalid_credentials: AppErrorCode.INVALID_CREDENTIALS,
  session_expired: AppErrorCode.SESSION_EXPIRED,
  user_not_found: AppErrorCode.USER_NOT_FOUND,

  // Database constraint errors
  "23505": AppErrorCode.DUPLICATE_ENTRY, // unique_violation
  "23503": AppErrorCode.FOREIGN_KEY_VIOLATION, // foreign_key_violation
  "23514": AppErrorCode.CONSTRAINT_VIOLATION, // check_violation
  "23502": AppErrorCode.MISSING_REQUIRED_FIELD, // not_null_violation

  // Permission errors
  "42501": AppErrorCode.ACCESS_DENIED, // insufficient_privilege
  permission_denied: AppErrorCode.ACCESS_DENIED,

  // Not found errors
  "404": AppErrorCode.NOT_FOUND,
  not_found: AppErrorCode.NOT_FOUND,

  // Rate limiting
  "429": AppErrorCode.RATE_LIMIT_EXCEEDED,
  rate_limit_exceeded: AppErrorCode.RATE_LIMIT_EXCEEDED,

  // Server errors
  "500": AppErrorCode.SERVER_ERROR,
  "502": AppErrorCode.SERVICE_UNAVAILABLE,
  "503": AppErrorCode.SERVICE_UNAVAILABLE,
  "504": AppErrorCode.TIMEOUT_ERROR,

  // Network errors
  network_error: AppErrorCode.NETWORK_ERROR,
  timeout: AppErrorCode.TIMEOUT_ERROR,
  connection_error: AppErrorCode.CONNECTION_FAILED,
};

/**
 * Processes Supabase errors and maps them to application error codes
 */
export function processSupabaseError(error: SupabaseError): NormalizedError {
  const code = error.code || error.status?.toString() || "unknown";
  const appErrorCode = supabaseErrorMap[code] || AppErrorCode.DATABASE_ERROR;

  return createNormalizedError(appErrorCode, error, {
    supabaseCode: code,
    supabaseMessage: error.message,
    details: error.details,
    hint: error.hint,
  });
}

/**
 * Processes Zod validation errors
 */
export function processZodError(error: ZodError): NormalizedError {
  const details = {
    validationErrors: error.issues.map((err: any) => ({
      path: err.path.join("."),
      message: err.message,
      code: err.code,
    })),
  };

  return createNormalizedError(AppErrorCode.VALIDATION_ERROR, error, details);
}

/**
 * Processes network/fetch errors
 */
export function processNetworkError(error: any): NormalizedError {
  if (error.name === "AbortError") {
    return createNormalizedError(AppErrorCode.TIMEOUT_ERROR, error);
  }

  if (error.name === "TypeError" && error.message.includes("fetch")) {
    return createNormalizedError(AppErrorCode.NETWORK_ERROR, error);
  }

  // Check for specific HTTP status codes
  if (error.status) {
    const statusCode = error.status.toString();
    const appErrorCode =
      supabaseErrorMap[statusCode] || AppErrorCode.SERVER_ERROR;
    return createNormalizedError(appErrorCode, error);
  }

  return createNormalizedError(AppErrorCode.NETWORK_ERROR, error);
}

/**
 * Main error normalization function
 * Converts any error to a standardized NormalizedError
 */
export function normalizeError(error: unknown): NormalizedError {
  // Already normalized (check for our specific normalized error structure)
  if (
    error &&
    typeof error === "object" &&
    "code" in error &&
    "originalError" in error &&
    "name" in error &&
    (error as any).name === "NormalizedError"
  ) {
    return error as NormalizedError;
  }

  // Zod validation error
  if (error instanceof ZodError) {
    return processZodError(error);
  }

  // Supabase error (check for common Supabase error properties)
  if (
    error &&
    typeof error === "object" &&
    ("code" in error || "status" in error)
  ) {
    return processSupabaseError(error as SupabaseError);
  }

  // Network/fetch error
  if (error && typeof error === "object" && "name" in error) {
    const errorName = (error as Error).name;
    if (["AbortError", "TypeError", "NetworkError"].includes(errorName)) {
      return processNetworkError(error);
    }
  }

  // Standard Error object
  if (error instanceof Error) {
    // Check if it's a specific business logic error based on message
    const message = error.message.toLowerCase();

    if (
      message.includes("unauthorized") ||
      message.includes("not authenticated")
    ) {
      return createNormalizedError(AppErrorCode.UNAUTHORIZED, error);
    }

    if (message.includes("forbidden") || message.includes("access denied")) {
      return createNormalizedError(AppErrorCode.ACCESS_DENIED, error);
    }

    if (message.includes("not found")) {
      return createNormalizedError(AppErrorCode.NOT_FOUND, error);
    }

    if (message.includes("timeout")) {
      return createNormalizedError(AppErrorCode.TIMEOUT_ERROR, error);
    }

    if (message.includes("network") || message.includes("connection")) {
      return createNormalizedError(AppErrorCode.NETWORK_ERROR, error);
    }

    // Generic error
    return createNormalizedError(AppErrorCode.UNKNOWN_ERROR, error);
  }

  // String error
  if (typeof error === "string") {
    const stringError = new Error(error);
    return createNormalizedError(AppErrorCode.UNKNOWN_ERROR, stringError);
  }

  // Unknown error type
  const unknownError = new Error("An unknown error occurred");
  return createNormalizedError(AppErrorCode.UNKNOWN_ERROR, unknownError, {
    originalError: error,
  });
}

/**
 * Checks if an error is retryable based on its code
 */
export function isRetryableError(error: NormalizedError): boolean {
  const retryableCodes = [
    AppErrorCode.NETWORK_ERROR,
    AppErrorCode.TIMEOUT_ERROR,
    AppErrorCode.SERVER_ERROR,
    AppErrorCode.SERVICE_UNAVAILABLE,
    AppErrorCode.DATABASE_ERROR,
    AppErrorCode.TRANSACTION_FAILED,
    AppErrorCode.CONNECTION_FAILED,
    AppErrorCode.SUBSCRIPTION_FAILED,
    AppErrorCode.REALTIME_ERROR,
    AppErrorCode.UPLOAD_FAILED,
    AppErrorCode.OPERATION_FAILED,
  ];

  return retryableCodes.includes(error.code);
}

/**
 * Checks if an error should be shown to the user
 */
export function isUserFacingError(error: NormalizedError): boolean {
  const internalCodes = [
    AppErrorCode.DATABASE_ERROR,
    AppErrorCode.FOREIGN_KEY_VIOLATION,
    AppErrorCode.TRANSACTION_FAILED,
    AppErrorCode.SERVER_ERROR,
    AppErrorCode.INTERNAL_ERROR,
    AppErrorCode.UNKNOWN_ERROR,
  ];

  return !internalCodes.includes(error.code);
}

/**
 * Gets a user-friendly error message from a normalized error
 */
export function getUserErrorMessage(error: unknown): string {
  const normalizedError = normalizeError(error);
  if (isUserFacingError(normalizedError)) {
    return getErrorMessage(normalizedError.code).message;
  }

  // Return generic message for internal errors
  return getErrorMessage(AppErrorCode.UNKNOWN_ERROR).message;
}
