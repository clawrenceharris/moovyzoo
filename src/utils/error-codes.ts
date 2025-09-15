/**
 * Application error codes for consistent error handling
 * Used across the Habitats feature for standardized error responses
 */

export enum AppErrorCode {
  // Authentication & Authorization
  UNAUTHORIZED = "UNAUTHORIZED",
  ACCESS_DENIED = "ACCESS_DENIED",
  INVALID_CREDENTIALS = "INVALID_CREDENTIALS",
  SESSION_EXPIRED = "SESSION_EXPIRED",

  // Validation Errors
  VALIDATION_ERROR = "VALIDATION_ERROR",
  INVALID_INPUT = "INVALID_INPUT",
  MISSING_REQUIRED_FIELD = "MISSING_REQUIRED_FIELD",
  INVALID_UUID = "INVALID_UUID",
  INVALID_EMAIL = "INVALID_EMAIL",

  // Resource Errors
  NOT_FOUND = "NOT_FOUND",
  HABITAT_NOT_FOUND = "HABITAT_NOT_FOUND",
  DISCUSSION_NOT_FOUND = "DISCUSSION_NOT_FOUND",
  MESSAGE_NOT_FOUND = "MESSAGE_NOT_FOUND",
  USER_NOT_FOUND = "USER_NOT_FOUND",
  WATCH_PARTY_NOT_FOUND = "WATCH_PARTY_NOT_FOUND",

  // Database Errors
  DATABASE_ERROR = "DATABASE_ERROR",
  DUPLICATE_ENTRY = "DUPLICATE_ENTRY",
  FOREIGN_KEY_VIOLATION = "FOREIGN_KEY_VIOLATION",
  CONSTRAINT_VIOLATION = "CONSTRAINT_VIOLATION",
  TRANSACTION_FAILED = "TRANSACTION_FAILED",

  // Business Logic Errors
  HABITAT_ALREADY_EXISTS = "HABITAT_ALREADY_EXISTS",
  HABITAT_CREATION_FAILED = "HABITAT_CREATION_FAILED",
  ALREADY_MEMBER = "ALREADY_MEMBER",
  NOT_MEMBER = "NOT_MEMBER",
  INSUFFICIENT_PERMISSIONS = "INSUFFICIENT_PERMISSIONS",
  CANNOT_LEAVE_OWN_HABITAT = "CANNOT_LEAVE_OWN_HABITAT",
  HABITAT_FULL = "HABITAT_FULL",
  WATCH_PARTY_FULL = "WATCH_PARTY_FULL",
  WATCH_PARTY_ENDED = "WATCH_PARTY_ENDED",
  WATCH_PARTY_NOT_STARTED = "WATCH_PARTY_NOT_STARTED",
  ALREADY_PARTICIPANT = "ALREADY_PARTICIPANT",
  NOT_PARTICIPANT = "NOT_PARTICIPANT",
  CANNOT_JOIN_WATCH_PARTY = "CANNOT_JOIN_WATCH_PARTY",

  // Content Errors
  MESSAGE_TOO_LONG = "MESSAGE_TOO_LONG",
  MESSAGE_EMPTY = "MESSAGE_EMPTY",
  INAPPROPRIATE_CONTENT = "INAPPROPRIATE_CONTENT",
  SPAM_DETECTED = "SPAM_DETECTED",

  // Network & System Errors
  NETWORK_ERROR = "NETWORK_ERROR",
  TIMEOUT_ERROR = "TIMEOUT_ERROR",
  SERVER_ERROR = "SERVER_ERROR",
  SERVICE_UNAVAILABLE = "SERVICE_UNAVAILABLE",
  RATE_LIMIT_EXCEEDED = "RATE_LIMIT_EXCEEDED",

  // File & Media Errors
  FILE_TOO_LARGE = "FILE_TOO_LARGE",
  INVALID_FILE_TYPE = "INVALID_FILE_TYPE",
  UPLOAD_FAILED = "UPLOAD_FAILED",

  // Real-time Errors
  CONNECTION_FAILED = "CONNECTION_FAILED",
  SUBSCRIPTION_FAILED = "SUBSCRIPTION_FAILED",
  REALTIME_ERROR = "REALTIME_ERROR",

  // Friend Operations
  FRIEND_REQUEST_ALREADY_EXISTS = "FRIEND_REQUEST_ALREADY_EXISTS",
  FRIEND_REQUEST_NOT_FOUND = "FRIEND_REQUEST_NOT_FOUND",
  CANNOT_FRIEND_SELF = "CANNOT_FRIEND_SELF",
  PROFILE_NOT_PUBLIC = "PROFILE_NOT_PUBLIC",
  WATCH_HISTORY_INVALID = "WATCH_HISTORY_INVALID",

  // AI Recommendations Errors
  RECOMMENDATIONS_GENERATION_FAILED = "RECOMMENDATIONS_GENERATION_FAILED",
  TMDB_API_ERROR = "TMDB_API_ERROR",
  INSUFFICIENT_USER_DATA = "INSUFFICIENT_USER_DATA",
  RECOMMENDATION_CACHE_ERROR = "RECOMMENDATION_CACHE_ERROR",

  // Generic Errors
  UNKNOWN_ERROR = "UNKNOWN_ERROR",
  INTERNAL_ERROR = "INTERNAL_ERROR",
  OPERATION_FAILED = "OPERATION_FAILED",
}

/**
 * Error severity levels for logging and handling
 */
export enum ErrorSeverity {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  CRITICAL = "critical",
}

/**
 * Error category for grouping related errors
 */
export enum ErrorCategory {
  AUTHENTICATION = "authentication",
  AUTHORIZATION = "authorization",
  VALIDATION = "validation",
  DATABASE = "database",
  BUSINESS_LOGIC = "business_logic",
  NETWORK = "network",
  SYSTEM = "system",
  CONTENT = "content",
  REALTIME = "realtime",
}

/**
 * Error metadata for enhanced error handling
 */
export interface ErrorMetadata {
  code: AppErrorCode;
  category: ErrorCategory;
  severity: ErrorSeverity;
  retryable: boolean;
  userFacing: boolean;
}

/**
 * Error metadata mapping for all application error codes
 */
export const errorMetadata: Record<AppErrorCode, ErrorMetadata> = {
  // Authentication & Authorization
  [AppErrorCode.UNAUTHORIZED]: {
    code: AppErrorCode.UNAUTHORIZED,
    category: ErrorCategory.AUTHENTICATION,
    severity: ErrorSeverity.MEDIUM,
    retryable: false,
    userFacing: true,
  },
  [AppErrorCode.ACCESS_DENIED]: {
    code: AppErrorCode.ACCESS_DENIED,
    category: ErrorCategory.AUTHORIZATION,
    severity: ErrorSeverity.MEDIUM,
    retryable: false,
    userFacing: true,
  },
  [AppErrorCode.INVALID_CREDENTIALS]: {
    code: AppErrorCode.INVALID_CREDENTIALS,
    category: ErrorCategory.AUTHENTICATION,
    severity: ErrorSeverity.LOW,
    retryable: false,
    userFacing: true,
  },
  [AppErrorCode.SESSION_EXPIRED]: {
    code: AppErrorCode.SESSION_EXPIRED,
    category: ErrorCategory.AUTHENTICATION,
    severity: ErrorSeverity.MEDIUM,
    retryable: false,
    userFacing: true,
  },

  // Validation Errors
  [AppErrorCode.VALIDATION_ERROR]: {
    code: AppErrorCode.VALIDATION_ERROR,
    category: ErrorCategory.VALIDATION,
    severity: ErrorSeverity.LOW,
    retryable: false,
    userFacing: true,
  },
  [AppErrorCode.INVALID_INPUT]: {
    code: AppErrorCode.INVALID_INPUT,
    category: ErrorCategory.VALIDATION,
    severity: ErrorSeverity.LOW,
    retryable: false,
    userFacing: true,
  },
  [AppErrorCode.MISSING_REQUIRED_FIELD]: {
    code: AppErrorCode.MISSING_REQUIRED_FIELD,
    category: ErrorCategory.VALIDATION,
    severity: ErrorSeverity.LOW,
    retryable: false,
    userFacing: true,
  },
  [AppErrorCode.INVALID_UUID]: {
    code: AppErrorCode.INVALID_UUID,
    category: ErrorCategory.VALIDATION,
    severity: ErrorSeverity.LOW,
    retryable: false,
    userFacing: true,
  },
  [AppErrorCode.INVALID_EMAIL]: {
    code: AppErrorCode.INVALID_EMAIL,
    category: ErrorCategory.VALIDATION,
    severity: ErrorSeverity.LOW,
    retryable: false,
    userFacing: true,
  },

  // Resource Errors
  [AppErrorCode.NOT_FOUND]: {
    code: AppErrorCode.NOT_FOUND,
    category: ErrorCategory.BUSINESS_LOGIC,
    severity: ErrorSeverity.LOW,
    retryable: false,
    userFacing: true,
  },
  [AppErrorCode.HABITAT_NOT_FOUND]: {
    code: AppErrorCode.HABITAT_NOT_FOUND,
    category: ErrorCategory.BUSINESS_LOGIC,
    severity: ErrorSeverity.LOW,
    retryable: false,
    userFacing: true,
  },
  [AppErrorCode.DISCUSSION_NOT_FOUND]: {
    code: AppErrorCode.DISCUSSION_NOT_FOUND,
    category: ErrorCategory.BUSINESS_LOGIC,
    severity: ErrorSeverity.LOW,
    retryable: false,
    userFacing: true,
  },
  [AppErrorCode.MESSAGE_NOT_FOUND]: {
    code: AppErrorCode.MESSAGE_NOT_FOUND,
    category: ErrorCategory.BUSINESS_LOGIC,
    severity: ErrorSeverity.LOW,
    retryable: false,
    userFacing: true,
  },
  [AppErrorCode.USER_NOT_FOUND]: {
    code: AppErrorCode.USER_NOT_FOUND,
    category: ErrorCategory.BUSINESS_LOGIC,
    severity: ErrorSeverity.LOW,
    retryable: false,
    userFacing: true,
  },
  [AppErrorCode.WATCH_PARTY_NOT_FOUND]: {
    code: AppErrorCode.WATCH_PARTY_NOT_FOUND,
    category: ErrorCategory.BUSINESS_LOGIC,
    severity: ErrorSeverity.LOW,
    retryable: false,
    userFacing: true,
  },

  // Database Errors
  [AppErrorCode.DATABASE_ERROR]: {
    code: AppErrorCode.DATABASE_ERROR,
    category: ErrorCategory.DATABASE,
    severity: ErrorSeverity.HIGH,
    retryable: true,
    userFacing: false,
  },
  [AppErrorCode.DUPLICATE_ENTRY]: {
    code: AppErrorCode.DUPLICATE_ENTRY,
    category: ErrorCategory.DATABASE,
    severity: ErrorSeverity.LOW,
    retryable: false,
    userFacing: true,
  },
  [AppErrorCode.FOREIGN_KEY_VIOLATION]: {
    code: AppErrorCode.FOREIGN_KEY_VIOLATION,
    category: ErrorCategory.DATABASE,
    severity: ErrorSeverity.MEDIUM,
    retryable: false,
    userFacing: false,
  },
  [AppErrorCode.CONSTRAINT_VIOLATION]: {
    code: AppErrorCode.CONSTRAINT_VIOLATION,
    category: ErrorCategory.DATABASE,
    severity: ErrorSeverity.MEDIUM,
    retryable: false,
    userFacing: true,
  },
  [AppErrorCode.TRANSACTION_FAILED]: {
    code: AppErrorCode.TRANSACTION_FAILED,
    category: ErrorCategory.DATABASE,
    severity: ErrorSeverity.HIGH,
    retryable: true,
    userFacing: false,
  },

  // Business Logic Errors
  [AppErrorCode.HABITAT_ALREADY_EXISTS]: {
    code: AppErrorCode.HABITAT_ALREADY_EXISTS,
    category: ErrorCategory.BUSINESS_LOGIC,
    severity: ErrorSeverity.LOW,
    retryable: false,
    userFacing: true,
  },
  [AppErrorCode.HABITAT_CREATION_FAILED]: {
    code: AppErrorCode.HABITAT_CREATION_FAILED,
    category: ErrorCategory.BUSINESS_LOGIC,
    severity: ErrorSeverity.MEDIUM,
    retryable: true,
    userFacing: true,
  },
  [AppErrorCode.ALREADY_MEMBER]: {
    code: AppErrorCode.ALREADY_MEMBER,
    category: ErrorCategory.BUSINESS_LOGIC,
    severity: ErrorSeverity.LOW,
    retryable: false,
    userFacing: true,
  },
  [AppErrorCode.NOT_MEMBER]: {
    code: AppErrorCode.NOT_MEMBER,
    category: ErrorCategory.BUSINESS_LOGIC,
    severity: ErrorSeverity.LOW,
    retryable: false,
    userFacing: true,
  },
  [AppErrorCode.INSUFFICIENT_PERMISSIONS]: {
    code: AppErrorCode.INSUFFICIENT_PERMISSIONS,
    category: ErrorCategory.AUTHORIZATION,
    severity: ErrorSeverity.MEDIUM,
    retryable: false,
    userFacing: true,
  },
  [AppErrorCode.CANNOT_LEAVE_OWN_HABITAT]: {
    code: AppErrorCode.CANNOT_LEAVE_OWN_HABITAT,
    category: ErrorCategory.BUSINESS_LOGIC,
    severity: ErrorSeverity.LOW,
    retryable: false,
    userFacing: true,
  },
  [AppErrorCode.HABITAT_FULL]: {
    code: AppErrorCode.HABITAT_FULL,
    category: ErrorCategory.BUSINESS_LOGIC,
    severity: ErrorSeverity.LOW,
    retryable: false,
    userFacing: true,
  },
  [AppErrorCode.WATCH_PARTY_FULL]: {
    code: AppErrorCode.WATCH_PARTY_FULL,
    category: ErrorCategory.BUSINESS_LOGIC,
    severity: ErrorSeverity.LOW,
    retryable: false,
    userFacing: true,
  },
  [AppErrorCode.WATCH_PARTY_ENDED]: {
    code: AppErrorCode.WATCH_PARTY_ENDED,
    category: ErrorCategory.BUSINESS_LOGIC,
    severity: ErrorSeverity.LOW,
    retryable: false,
    userFacing: true,
  },
  [AppErrorCode.WATCH_PARTY_NOT_STARTED]: {
    code: AppErrorCode.WATCH_PARTY_NOT_STARTED,
    category: ErrorCategory.BUSINESS_LOGIC,
    severity: ErrorSeverity.LOW,
    retryable: false,
    userFacing: true,
  },
  [AppErrorCode.ALREADY_PARTICIPANT]: {
    code: AppErrorCode.ALREADY_PARTICIPANT,
    category: ErrorCategory.BUSINESS_LOGIC,
    severity: ErrorSeverity.LOW,
    retryable: false,
    userFacing: true,
  },
  [AppErrorCode.NOT_PARTICIPANT]: {
    code: AppErrorCode.NOT_PARTICIPANT,
    category: ErrorCategory.BUSINESS_LOGIC,
    severity: ErrorSeverity.LOW,
    retryable: false,
    userFacing: true,
  },
  [AppErrorCode.CANNOT_JOIN_WATCH_PARTY]: {
    code: AppErrorCode.CANNOT_JOIN_WATCH_PARTY,
    category: ErrorCategory.BUSINESS_LOGIC,
    severity: ErrorSeverity.LOW,
    retryable: false,
    userFacing: true,
  },

  // Content Errors
  [AppErrorCode.MESSAGE_TOO_LONG]: {
    code: AppErrorCode.MESSAGE_TOO_LONG,
    category: ErrorCategory.CONTENT,
    severity: ErrorSeverity.LOW,
    retryable: false,
    userFacing: true,
  },
  [AppErrorCode.MESSAGE_EMPTY]: {
    code: AppErrorCode.MESSAGE_EMPTY,
    category: ErrorCategory.CONTENT,
    severity: ErrorSeverity.LOW,
    retryable: false,
    userFacing: true,
  },
  [AppErrorCode.INAPPROPRIATE_CONTENT]: {
    code: AppErrorCode.INAPPROPRIATE_CONTENT,
    category: ErrorCategory.CONTENT,
    severity: ErrorSeverity.MEDIUM,
    retryable: false,
    userFacing: true,
  },
  [AppErrorCode.SPAM_DETECTED]: {
    code: AppErrorCode.SPAM_DETECTED,
    category: ErrorCategory.CONTENT,
    severity: ErrorSeverity.MEDIUM,
    retryable: false,
    userFacing: true,
  },

  // Network & System Errors
  [AppErrorCode.NETWORK_ERROR]: {
    code: AppErrorCode.NETWORK_ERROR,
    category: ErrorCategory.NETWORK,
    severity: ErrorSeverity.MEDIUM,
    retryable: true,
    userFacing: true,
  },
  [AppErrorCode.TIMEOUT_ERROR]: {
    code: AppErrorCode.TIMEOUT_ERROR,
    category: ErrorCategory.NETWORK,
    severity: ErrorSeverity.MEDIUM,
    retryable: true,
    userFacing: true,
  },
  [AppErrorCode.SERVER_ERROR]: {
    code: AppErrorCode.SERVER_ERROR,
    category: ErrorCategory.SYSTEM,
    severity: ErrorSeverity.HIGH,
    retryable: true,
    userFacing: false,
  },
  [AppErrorCode.SERVICE_UNAVAILABLE]: {
    code: AppErrorCode.SERVICE_UNAVAILABLE,
    category: ErrorCategory.SYSTEM,
    severity: ErrorSeverity.HIGH,
    retryable: true,
    userFacing: true,
  },
  [AppErrorCode.RATE_LIMIT_EXCEEDED]: {
    code: AppErrorCode.RATE_LIMIT_EXCEEDED,
    category: ErrorCategory.SYSTEM,
    severity: ErrorSeverity.MEDIUM,
    retryable: true,
    userFacing: true,
  },

  // File & Media Errors
  [AppErrorCode.FILE_TOO_LARGE]: {
    code: AppErrorCode.FILE_TOO_LARGE,
    category: ErrorCategory.VALIDATION,
    severity: ErrorSeverity.LOW,
    retryable: false,
    userFacing: true,
  },
  [AppErrorCode.INVALID_FILE_TYPE]: {
    code: AppErrorCode.INVALID_FILE_TYPE,
    category: ErrorCategory.VALIDATION,
    severity: ErrorSeverity.LOW,
    retryable: false,
    userFacing: true,
  },
  [AppErrorCode.UPLOAD_FAILED]: {
    code: AppErrorCode.UPLOAD_FAILED,
    category: ErrorCategory.SYSTEM,
    severity: ErrorSeverity.MEDIUM,
    retryable: true,
    userFacing: true,
  },

  // Real-time Errors
  [AppErrorCode.CONNECTION_FAILED]: {
    code: AppErrorCode.CONNECTION_FAILED,
    category: ErrorCategory.REALTIME,
    severity: ErrorSeverity.MEDIUM,
    retryable: true,
    userFacing: true,
  },
  [AppErrorCode.SUBSCRIPTION_FAILED]: {
    code: AppErrorCode.SUBSCRIPTION_FAILED,
    category: ErrorCategory.REALTIME,
    severity: ErrorSeverity.MEDIUM,
    retryable: true,
    userFacing: true,
  },
  [AppErrorCode.REALTIME_ERROR]: {
    code: AppErrorCode.REALTIME_ERROR,
    category: ErrorCategory.REALTIME,
    severity: ErrorSeverity.MEDIUM,
    retryable: true,
    userFacing: true,
  },

  // Friend Operations
  [AppErrorCode.FRIEND_REQUEST_ALREADY_EXISTS]: {
    code: AppErrorCode.FRIEND_REQUEST_ALREADY_EXISTS,
    category: ErrorCategory.BUSINESS_LOGIC,
    severity: ErrorSeverity.LOW,
    retryable: false,
    userFacing: true,
  },
  [AppErrorCode.FRIEND_REQUEST_NOT_FOUND]: {
    code: AppErrorCode.FRIEND_REQUEST_NOT_FOUND,
    category: ErrorCategory.BUSINESS_LOGIC,
    severity: ErrorSeverity.LOW,
    retryable: false,
    userFacing: true,
  },
  [AppErrorCode.CANNOT_FRIEND_SELF]: {
    code: AppErrorCode.CANNOT_FRIEND_SELF,
    category: ErrorCategory.BUSINESS_LOGIC,
    severity: ErrorSeverity.LOW,
    retryable: false,
    userFacing: true,
  },
  [AppErrorCode.PROFILE_NOT_PUBLIC]: {
    code: AppErrorCode.PROFILE_NOT_PUBLIC,
    category: ErrorCategory.BUSINESS_LOGIC,
    severity: ErrorSeverity.LOW,
    retryable: false,
    userFacing: true,
  },
  [AppErrorCode.WATCH_HISTORY_INVALID]: {
    code: AppErrorCode.WATCH_HISTORY_INVALID,
    category: ErrorCategory.VALIDATION,
    severity: ErrorSeverity.LOW,
    retryable: false,
    userFacing: true,
  },

  // Generic Errors
  [AppErrorCode.UNKNOWN_ERROR]: {
    code: AppErrorCode.UNKNOWN_ERROR,
    category: ErrorCategory.SYSTEM,
    severity: ErrorSeverity.HIGH,
    retryable: false,
    userFacing: false,
  },
  [AppErrorCode.INTERNAL_ERROR]: {
    code: AppErrorCode.INTERNAL_ERROR,
    category: ErrorCategory.SYSTEM,
    severity: ErrorSeverity.CRITICAL,
    retryable: false,
    userFacing: false,
  },
  [AppErrorCode.OPERATION_FAILED]: {
    code: AppErrorCode.OPERATION_FAILED,
    category: ErrorCategory.SYSTEM,
    severity: ErrorSeverity.MEDIUM,
    retryable: true,
    userFacing: true,
  },

  // AI Recommendations Errors
  [AppErrorCode.RECOMMENDATIONS_GENERATION_FAILED]: {
    code: AppErrorCode.RECOMMENDATIONS_GENERATION_FAILED,
    category: ErrorCategory.SYSTEM,
    severity: ErrorSeverity.MEDIUM,
    retryable: true,
    userFacing: true,
  },
  [AppErrorCode.TMDB_API_ERROR]: {
    code: AppErrorCode.TMDB_API_ERROR,
    category: ErrorCategory.NETWORK,
    severity: ErrorSeverity.MEDIUM,
    retryable: true,
    userFacing: true,
  },
  [AppErrorCode.INSUFFICIENT_USER_DATA]: {
    code: AppErrorCode.INSUFFICIENT_USER_DATA,
    category: ErrorCategory.BUSINESS_LOGIC,
    severity: ErrorSeverity.LOW,
    retryable: false,
    userFacing: true,
  },
  [AppErrorCode.RECOMMENDATION_CACHE_ERROR]: {
    code: AppErrorCode.RECOMMENDATION_CACHE_ERROR,
    category: ErrorCategory.SYSTEM,
    severity: ErrorSeverity.LOW,
    retryable: true,
    userFacing: false,
  },
};
