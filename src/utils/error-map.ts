/**
 * Error message mapping for user-friendly error display
 * Maps AppErrorCode to user-facing messages with Zoovie's brand voice
 */

import { AppErrorCode } from "./error-codes";

export interface ErrorMessage {
  title: string;
  message: string;
}

/**
 * User-friendly error messages with Zoovie's witty but compassionate tone
 * All messages are ≤140 characters and action-oriented
 */
export const errorMap: Record<AppErrorCode, ErrorMessage> = {
  // Authentication & Authorization
  [AppErrorCode.UNAUTHORIZED]: {
    title: "Access Required",
    message: "Please sign in to join the conversation and explore habitats.",
  },
  [AppErrorCode.ACCESS_DENIED]: {
    title: "Access Denied",
    message:
      "You don't have permission to access this habitat. Try joining first!",
  },
  [AppErrorCode.INVALID_CREDENTIALS]: {
    title: "Invalid Credentials",
    message:
      "Those credentials look off. Double-check your email and password.",
  },
  [AppErrorCode.SESSION_EXPIRED]: {
    title: "Session Expired",
    message: "Your session has expired. Please sign in again to continue.",
  },

  // Validation Errors
  [AppErrorCode.VALIDATION_ERROR]: {
    title: "Invalid Input",
    message: "Some information needs fixing. Check the highlighted fields.",
  },
  [AppErrorCode.INVALID_INPUT]: {
    title: "Invalid Input",
    message: "That input looks a bit off. Please check and try again.",
  },
  [AppErrorCode.MISSING_REQUIRED_FIELD]: {
    title: "Missing Information",
    message: "Please fill in all required fields to continue.",
  },
  [AppErrorCode.INVALID_UUID]: {
    title: "Invalid ID",
    message: "That ID format is invalid. Please check the link and try again.",
  },
  [AppErrorCode.INVALID_EMAIL]: {
    title: "Invalid Email",
    message: "Please enter a valid email address.",
  },

  // Resource Errors
  [AppErrorCode.NOT_FOUND]: {
    title: "Not Found",
    message:
      "We couldn't find what you're looking for. It might have been moved or deleted.",
  },
  [AppErrorCode.HABITAT_NOT_FOUND]: {
    title: "Habitat Not Found",
    message:
      "This habitat doesn't exist or has been removed. Try exploring other habitats!",
  },
  [AppErrorCode.DISCUSSION_NOT_FOUND]: {
    title: "Discussion Not Found",
    message: "This discussion doesn't exist or has been removed.",
  },
  [AppErrorCode.MESSAGE_NOT_FOUND]: {
    title: "Message Not Found",
    message: "This message doesn't exist or has been removed.",
  },
  [AppErrorCode.USER_NOT_FOUND]: {
    title: "User Not Found",
    message: "This user doesn't exist or their profile is private.",
  },
  [AppErrorCode.WATCH_PARTY_NOT_FOUND]: {
    title: "Streaming Session Not Found",
    message: "This streaming session doesn't exist or has been removed.",
  },

  // Database Errors
  [AppErrorCode.DATABASE_ERROR]: {
    title: "Database Error",
    message: "Something went wrong on our end. Please try again in a moment.",
  },
  [AppErrorCode.DUPLICATE_ENTRY]: {
    title: "Already Exists",
    message:
      "This already exists. Try a different name or check existing items.",
  },
  [AppErrorCode.FOREIGN_KEY_VIOLATION]: {
    title: "Reference Error",
    message: "This item is referenced elsewhere and cannot be modified.",
  },
  [AppErrorCode.CONSTRAINT_VIOLATION]: {
    title: "Constraint Error",
    message:
      "This action violates a system constraint. Please check your input.",
  },
  [AppErrorCode.TRANSACTION_FAILED]: {
    title: "Operation Failed",
    message: "The operation failed. Please try again.",
  },

  // Business Logic Errors
  [AppErrorCode.HABITAT_ALREADY_EXISTS]: {
    title: "Habitat Exists",
    message: "A habitat with this name already exists. Try a different name!",
  },
  [AppErrorCode.HABITAT_CREATION_FAILED]: {
    title: "Creation Failed",
    message: "Failed to create habitat. Please try again.",
  },
  [AppErrorCode.ALREADY_MEMBER]: {
    title: "Already a Member",
    message: "You're already part of this habitat! Welcome back.",
  },
  [AppErrorCode.NOT_MEMBER]: {
    title: "Not a Member",
    message: "You need to join this habitat first to participate.",
  },
  [AppErrorCode.INSUFFICIENT_PERMISSIONS]: {
    title: "Insufficient Permissions",
    message: "You don't have permission to perform this action.",
  },
  [AppErrorCode.CANNOT_LEAVE_OWN_HABITAT]: {
    title: "Cannot Leave",
    message: "You can't leave your own habitat. Transfer ownership first!",
  },
  [AppErrorCode.HABITAT_FULL]: {
    title: "Habitat Full",
    message: "This habitat is at capacity. Try joining another one!",
  },
  [AppErrorCode.WATCH_PARTY_FULL]: {
    title: "Streaming Session Full",
    message: "This streaming session is at capacity. Try joining another one!",
  },
  [AppErrorCode.WATCH_PARTY_ENDED]: {
    title: "Streaming Session Ended",
    message:
      "This streaming session has already ended. Check out upcoming streams!",
  },
  [AppErrorCode.WATCH_PARTY_NOT_STARTED]: {
    title: "Streaming Session Not Started",
    message:
      "This streaming session hasn't started yet. Come back at the scheduled time!",
  },
  [AppErrorCode.ALREADY_PARTICIPANT]: {
    title: "Already Joined",
    message: "You're already part of this streaming session! Welcome back.",
  },
  [AppErrorCode.NOT_PARTICIPANT]: {
    title: "Not a Participant",
    message: "You need to join this streaming session first to participate.",
  },
  [AppErrorCode.CANNOT_JOIN_WATCH_PARTY]: {
    title: "Cannot Join",
    message: "You cannot join this streaming session at this time.",
  },

  // Content Errors
  [AppErrorCode.MESSAGE_TOO_LONG]: {
    title: "Message Too Long",
    message: "Your message is too long. Keep it under 1000 characters.",
  },
  [AppErrorCode.MESSAGE_EMPTY]: {
    title: "Empty Message",
    message: "Your message is empty. Share your thoughts!",
  },
  [AppErrorCode.INAPPROPRIATE_CONTENT]: {
    title: "Inappropriate Content",
    message: "This content violates our community guidelines. Please revise.",
  },
  [AppErrorCode.SPAM_DETECTED]: {
    title: "Spam Detected",
    message: "This looks like spam. Please wait before posting again.",
  },

  // Network & System Errors
  [AppErrorCode.NETWORK_ERROR]: {
    title: "Connection Issue",
    message: "Network connection failed. Check your internet and try again.",
  },
  [AppErrorCode.TIMEOUT_ERROR]: {
    title: "Request Timeout",
    message: "The request timed out. Please try again.",
  },
  [AppErrorCode.SERVER_ERROR]: {
    title: "Server Error",
    message: "Our servers are having issues. Please try again in a moment.",
  },
  [AppErrorCode.SERVICE_UNAVAILABLE]: {
    title: "Service Unavailable",
    message: "This service is temporarily unavailable. Please try again later.",
  },
  [AppErrorCode.RATE_LIMIT_EXCEEDED]: {
    title: "Too Many Requests",
    message: "You're doing that too often. Please wait a moment and try again.",
  },

  // File & Media Errors
  [AppErrorCode.FILE_TOO_LARGE]: {
    title: "File Too Large",
    message: "This file is too large. Please choose a smaller file.",
  },
  [AppErrorCode.INVALID_FILE_TYPE]: {
    title: "Invalid File Type",
    message: "This file type is not supported. Please choose a different file.",
  },
  [AppErrorCode.UPLOAD_FAILED]: {
    title: "Upload Failed",
    message: "File upload failed. Please try again.",
  },

  // Real-time Errors
  [AppErrorCode.CONNECTION_FAILED]: {
    title: "Connection Failed",
    message: "Real-time connection failed. Messages may be delayed.",
  },
  [AppErrorCode.SUBSCRIPTION_FAILED]: {
    title: "Subscription Failed",
    message: "Failed to subscribe to updates. Please refresh the page.",
  },
  [AppErrorCode.REALTIME_ERROR]: {
    title: "Real-time Error",
    message: "Real-time updates are experiencing issues. Please refresh.",
  },

  // Friend Operations
  [AppErrorCode.FRIEND_REQUEST_ALREADY_EXISTS]: {
    title: "Already Connected",
    message: "You've already sent a friend request to this user.",
  },
  [AppErrorCode.FRIEND_REQUEST_NOT_FOUND]: {
    title: "Request Not Found",
    message: "This friend request doesn't exist or has already been handled.",
  },
  [AppErrorCode.CANNOT_FRIEND_SELF]: {
    title: "Invalid Request",
    message: "You can't send a friend request to yourself.",
  },
  [AppErrorCode.PROFILE_NOT_PUBLIC]: {
    title: "Private Profile",
    message: "This user's profile is private and not available for viewing.",
  },
  [AppErrorCode.WATCH_HISTORY_INVALID]: {
    title: "Invalid Watch Data",
    message: "The watch history data is invalid. Please check and try again.",
  },

  // Generic Errors
  [AppErrorCode.UNKNOWN_ERROR]: {
    title: "Unknown Error",
    message: "Something unexpected happened. Please try again.",
  },
  [AppErrorCode.INTERNAL_ERROR]: {
    title: "Internal Error",
    message: "An internal error occurred. Our team has been notified.",
  },
  [AppErrorCode.OPERATION_FAILED]: {
    title: "Operation Failed",
    message: "The operation failed. Please try again.",
  },
};

/**
 * Get user-friendly error message for an error code
 * @param code - The application error code
 * @returns User-friendly error message
 */
export function getErrorMessage(code: AppErrorCode): ErrorMessage {
  return errorMap[code] || errorMap[AppErrorCode.UNKNOWN_ERROR];
}

/**
 * Get error message title only
 * @param code - The application error code
 * @returns Error title
 */
export function getErrorTitle(code: AppErrorCode): string {
  return getErrorMessage(code).title;
}

/**
 * Get error message text only
 * @param code - The application error code
 * @returns Error message text
 */
export function getErrorText(code: AppErrorCode): string {
  return getErrorMessage(code).message;
}
