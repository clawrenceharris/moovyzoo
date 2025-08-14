import { AuthError } from 'firebase/auth'
import { FirestoreError } from 'firebase/firestore'
import { ZodError } from 'zod'
import { AppErrorCode } from './error-codes'
import { errorMap, ErrorMessage } from './error-map'

export interface NormalizedError {
  code: AppErrorCode
  title: string
  message: string
  originalError?: unknown
}

export interface ApiErrorResponse {
  ok: false
  code: AppErrorCode
  message: string
}

/**
 * Normalize Firebase Auth errors to app error codes
 */
export function normalizeAuthError(error: AuthError): AppErrorCode {
  switch (error.code) {
    case 'auth/email-already-in-use':
      return AppErrorCode.AUTH_EMAIL_ALREADY_EXISTS
    case 'auth/invalid-email':
      return AppErrorCode.AUTH_INVALID_EMAIL
    case 'auth/weak-password':
      return AppErrorCode.AUTH_WEAK_PASSWORD
    case 'auth/user-not-found':
      return AppErrorCode.AUTH_USER_NOT_FOUND
    case 'auth/wrong-password':
      return AppErrorCode.AUTH_WRONG_PASSWORD
    case 'auth/too-many-requests':
      return AppErrorCode.AUTH_TOO_MANY_REQUESTS
    case 'auth/network-request-failed':
      return AppErrorCode.AUTH_NETWORK_ERROR
    case 'auth/requires-recent-login':
      return AppErrorCode.AUTH_REQUIRES_RECENT_LOGIN
    case 'auth/invalid-credential':
      return AppErrorCode.AUTH_INVALID_CREDENTIAL
    case 'auth/user-disabled':
      return AppErrorCode.AUTH_USER_DISABLED
    case 'auth/operation-not-allowed':
      return AppErrorCode.AUTH_OPERATION_NOT_ALLOWED
    default:
      return AppErrorCode.UNKNOWN_ERROR
  }
}

/**
 * Normalize Firestore errors to app error codes
 */
export function normalizeFirestoreError(error: FirestoreError): AppErrorCode {
  switch (error.code) {
    case 'permission-denied':
      return AppErrorCode.DATABASE_PERMISSION_DENIED
    case 'not-found':
      return AppErrorCode.PROFILE_NOT_FOUND
    case 'already-exists':
      return AppErrorCode.PROFILE_ALREADY_EXISTS
    case 'resource-exhausted':
      return AppErrorCode.DATABASE_QUOTA_EXCEEDED
    case 'unavailable':
      return AppErrorCode.DATABASE_UNAVAILABLE
    case 'deadline-exceeded':
    case 'aborted':
      return AppErrorCode.DATABASE_CONNECTION_ERROR
    default:
      return AppErrorCode.UNKNOWN_ERROR
  }
}

/**
 * Normalize Zod validation errors to app error codes
 */
export function normalizeZodError(error: ZodError): AppErrorCode {
  // Check the first error to determine the most appropriate code
  const firstError = error.errors[0]
  if (!firstError) return AppErrorCode.VALIDATION_REQUIRED_FIELD

  const path = firstError.path.join('.')

  switch (path) {
    case 'email':
      return AppErrorCode.VALIDATION_INVALID_EMAIL
    case 'password':
      return AppErrorCode.VALIDATION_INVALID_PASSWORD
    case 'displayName':
      return AppErrorCode.VALIDATION_INVALID_DISPLAY_NAME
    case 'avatarUrl':
      return AppErrorCode.VALIDATION_INVALID_AVATAR_URL
    case 'favoriteGenres':
      return AppErrorCode.VALIDATION_INVALID_GENRES
    default:
      if (
        firstError.code === 'invalid_type' &&
        firstError.received === 'undefined'
      ) {
        return AppErrorCode.VALIDATION_REQUIRED_FIELD
      }
      return AppErrorCode.PROFILE_INVALID_DATA
  }
}

/**
 * Normalize any error to a consistent format
 */
export function normalizeError(error: unknown): NormalizedError {
  let code: AppErrorCode

  if (isAuthError(error)) {
    code = normalizeAuthError(error)
  } else if (isFirestoreError(error)) {
    code = normalizeFirestoreError(error)
  } else if (isZodError(error)) {
    code = normalizeZodError(error)
  } else if (error instanceof Error) {
    // Handle custom app errors
    if (error.message.includes('rate limit')) {
      code = AppErrorCode.RATE_LIMIT_EXCEEDED
    } else if (
      error.message.includes('network') ||
      error.message.includes('connection')
    ) {
      code = AppErrorCode.NETWORK_ERROR
    } else {
      code = AppErrorCode.UNKNOWN_ERROR
    }
  } else {
    code = AppErrorCode.UNKNOWN_ERROR
  }

  const errorMessage = errorMap[code]

  return {
    code,
    title: errorMessage.title,
    message: errorMessage.message,
    originalError: error,
  }
}

/**
 * Get error message for a specific error code
 */
export function getErrorMessage(code: AppErrorCode): ErrorMessage {
  return errorMap[code] || errorMap[AppErrorCode.UNKNOWN_ERROR]
}

/**
 * Create API error response
 */
export function createApiErrorResponse(error: unknown): ApiErrorResponse {
  const normalized = normalizeError(error)
  return {
    ok: false,
    code: normalized.code,
    message: normalized.message,
  }
}

/**
 * Type guards for error detection
 */
export function isAuthError(error: unknown): error is AuthError {
  return (
    error !== null &&
    error !== undefined &&
    typeof error === 'object' &&
    'code' in error &&
    typeof (error as AuthError).code === 'string' &&
    (error as AuthError).code.startsWith('auth/')
  )
}

export function isFirestoreError(error: unknown): error is FirestoreError {
  return (
    error !== null &&
    error !== undefined &&
    typeof error === 'object' &&
    'code' in error &&
    typeof (error as FirestoreError).code === 'string' &&
    !((error as FirestoreError).code as string).startsWith('auth/')
  )
}

export function isZodError(error: unknown): error is ZodError {
  return error instanceof ZodError
}

/**
 * Log error with normalized information (without sensitive data)
 */
export function logError(error: unknown, context?: string): void {
  const normalized = normalizeError(error)

  // Only log non-sensitive information
  console.error('App Error:', {
    context,
    code: normalized.code,
    title: normalized.title,
    message: normalized.message,
    // Don't log the original error in production to avoid sensitive data leaks
    ...(process.env.NODE_ENV === 'development' && { originalError: error }),
  })
}
