import { AppError, AppErrorCode } from "@/types/error";

export const errorMap: Record<AppErrorCode, AppError> = {
  // Authentication errors
  [AppErrorCode.AUTH_EMAIL_ALREADY_EXISTS]: {
    title: "Email Already Registered",
    message:
      "An account with this email already exists. Try logging in instead.",
  },
  [AppErrorCode.AUTH_INVALID_EMAIL]: {
    title: "Invalid Email",
    message: "Please enter a valid email address.",
  },
  [AppErrorCode.AUTH_WEAK_PASSWORD]: {
    title: "Weak Password",
    message: "Password should be at least 8 characters.",
  },
  [AppErrorCode.AUTH_USER_NOT_FOUND]: {
    title: "Account Not Found",
    message: "No account found with this email. Check your email or sign up.",
  },
  [AppErrorCode.AUTH_WRONG_PASSWORD]: {
    title: "Incorrect Password",
    message: "The password you entered is incorrect. Please try again.",
  },
  [AppErrorCode.AUTH_TOO_MANY_REQUESTS]: {
    title: "Too Many Attempts",
    message:
      "Too many failed attempts. Please wait a few minutes and try again.",
  },
  [AppErrorCode.AUTH_NETWORK_ERROR]: {
    title: "Connection Issue",
    message: "Network error. Please check your connection and try again.",
  },
  [AppErrorCode.AUTH_REQUIRES_RECENT_LOGIN]: {
    title: "Login Required",
    message: "Please log in again to complete this action for security.",
  },
  [AppErrorCode.AUTH_INVALID_CREDENTIAL]: {
    title: "Invalid Credentials",
    message: "The email or password you entered is incorrect.",
  },
  [AppErrorCode.AUTH_USER_DISABLED]: {
    title: "Account Disabled",
    message: "This account has been disabled. Contact support for help.",
  },
  [AppErrorCode.AUTH_OPERATION_NOT_ALLOWED]: {
    title: "Sign-up Disabled",
    message: "Email/password accounts are currently disabled.",
  },

  // Profile errors
  [AppErrorCode.PROFILE_NOT_FOUND]: {
    title: "Profile Not Found",
    message: "Your profile could not be found. Please try refreshing the page.",
  },
  [AppErrorCode.PROFILE_ALREADY_EXISTS]: {
    title: "Profile Exists",
    message: "A profile already exists for this account.",
  },
  [AppErrorCode.PROFILE_UPDATE_FAILED]: {
    title: "Update Failed",
    message: "Could not save your profile changes. Please try again.",
  },
  [AppErrorCode.PROFILE_CREATION_FAILED]: {
    title: "Profile Creation Failed",
    message: "Could not create your profile. Please try again.",
  },
  [AppErrorCode.PROFILE_INVALID_DATA]: {
    title: "Invalid Profile Data",
    message: "Some profile information is invalid. Please check and try again.",
  },
  [AppErrorCode.PROFILE_UNAUTHORIZED]: {
    title: "Access Denied",
    message: "You do not have permission to access this profile.",
  },
  [AppErrorCode.PROFILE_AVATAR_INVALID]: {
    title: "Invalid Avatar",
    message: "The avatar URL is not valid. Please use a different image.",
  },
  [AppErrorCode.PROFILE_DISPLAY_NAME_TAKEN]: {
    title: "Name Unavailable",
    message: "This display name is already taken. Please choose another.",
  },

  // Privacy errors
  [AppErrorCode.PRIVACY_UPDATE_FAILED]: {
    title: "Privacy Update Failed",
    message: "Could not update your privacy settings. Please try again.",
  },
  [AppErrorCode.PRIVACY_INVALID_SETTINGS]: {
    title: "Invalid Privacy Settings",
    message: "The privacy settings are invalid. Please check and try again.",
  },

  // Validation errors
  [AppErrorCode.VALIDATION_INVALID_EMAIL]: {
    title: "Invalid Email",
    message: "Please enter a valid email address.",
  },
  [AppErrorCode.VALIDATION_INVALID_PASSWORD]: {
    title: "Invalid Password",
    message: "Password must be at least 8 characters.",
  },
  [AppErrorCode.VALIDATION_INVALID_DISPLAY_NAME]: {
    title: "Invalid Display Name",
    message:
      "Display name must be 2-50 characters with letters, numbers, and spaces.",
  },
  [AppErrorCode.VALIDATION_INVALID_AVATAR_URL]: {
    title: "Invalid Avatar URL",
    message: "Please enter a valid image URL.",
  },
  [AppErrorCode.VALIDATION_INVALID_GENRES]: {
    title: "Invalid Genres",
    message: "Please select 1-10 favorite genres.",
  },
  [AppErrorCode.VALIDATION_REQUIRED_FIELD]: {
    title: "Required Field",
    message: "This field is required. Please fill it out.",
  },

  // Database errors
  [AppErrorCode.DATABASE_CONNECTION_ERROR]: {
    title: "Connection Error",
    message: "Could not connect to the database. Please try again.",
  },
  [AppErrorCode.DATABASE_PERMISSION_DENIED]: {
    title: "Permission Denied",
    message: "You do not have permission to perform this action.",
  },
  [AppErrorCode.DATABASE_QUOTA_EXCEEDED]: {
    title: "Service Limit Reached",
    message: "Service temporarily unavailable. Please try again later.",
  },
  [AppErrorCode.DATABASE_UNAVAILABLE]: {
    title: "Service Unavailable",
    message: "Database service is temporarily unavailable. Please try again.",
  },

  // Generic errors
  [AppErrorCode.UNKNOWN_ERROR]: {
    title: "Something Went Wrong",
    message: "An unexpected error occurred. Please try again.",
  },
  [AppErrorCode.NETWORK_ERROR]: {
    title: "Network Error",
    message: "Please check your internet connection and try again.",
  },
  [AppErrorCode.RATE_LIMIT_EXCEEDED]: {
    title: "Too Many Requests",
    message: "You are making requests too quickly. Please slow down.",
  },
  [AppErrorCode.PROFILE_DELETE_FAILED]: {
    title: "Too Many Requests",
    message: "You are making requests too quickly. Please slow down.",
  },
  [AppErrorCode.PROFILE_INVALID_DISPLAY_NAME]: {
    title: "Too Many Requests",
    message: "You are making requests too quickly. Please slow down.",
  },
  [AppErrorCode.AUTH_EMAIL_NOT_VERIFIED]: {
    title: "Unverified Email",
    message: "You have to verify your email",
  },

  // Habitat errors
  [AppErrorCode.HABITAT_NOT_FOUND]: {
    title: "Habitat Not Found",
    message: "This habitat doesn't exist or has been removed.",
  },
  [AppErrorCode.HABITAT_ACCESS_DENIED]: {
    title: "Access Denied",
    message: "You don't have permission to access this habitat.",
  },
  [AppErrorCode.HABITAT_CREATION_FAILED]: {
    title: "Creation Failed",
    message: "Could not create the habitat. Please try again.",
  },
  [AppErrorCode.HABITAT_UPDATE_FAILED]: {
    title: "Update Failed",
    message: "Could not update the habitat. Please try again.",
  },
  [AppErrorCode.HABITAT_DELETE_FAILED]: {
    title: "Delete Failed",
    message: "Could not delete the habitat. Please try again.",
  },
  [AppErrorCode.HABITAT_JOIN_FAILED]: {
    title: "Join Failed",
    message: "Could not join the habitat. Please try again.",
  },
  [AppErrorCode.HABITAT_LEAVE_FAILED]: {
    title: "Leave Failed",
    message: "Could not leave the habitat. Please try again.",
  },
  [AppErrorCode.HABITAT_ALREADY_MEMBER]: {
    title: "Already a Member",
    message: "You're already a member of this habitat.",
  },
  [AppErrorCode.HABITAT_NOT_MEMBER]: {
    title: "Not a Member",
    message: "You need to join this habitat first.",
  },
  [AppErrorCode.HABITAT_INVALID_DATA]: {
    title: "Invalid Data",
    message: "Some habitat information is invalid. Please check and try again.",
  },
  [AppErrorCode.HABITAT_INVALID_NAME]: {
    title: "Invalid Name",
    message: "Habitat name must be 3-100 characters long.",
  },
  [AppErrorCode.HABITAT_INVALID_DESCRIPTION]: {
    title: "Invalid Description",
    message: "Description must be 10-500 characters long.",
  },
  [AppErrorCode.HABITAT_INVALID_TAGS]: {
    title: "Invalid Tags",
    message: "Please add 1-5 unique tags, each up to 30 characters.",
  },

  // Message errors
  [AppErrorCode.MESSAGE_NOT_FOUND]: {
    title: "Message Not Found",
    message: "This message no longer exists.",
  },
  [AppErrorCode.MESSAGE_TOO_LONG]: {
    title: "Message Too Long",
    message: "Messages must be 1000 characters or less.",
  },
  [AppErrorCode.MESSAGE_SEND_FAILED]: {
    title: "Send Failed",
    message: "Could not send your message. Please try again.",
  },
  [AppErrorCode.MESSAGE_DELETE_FAILED]: {
    title: "Delete Failed",
    message: "Could not delete the message. Please try again.",
  },
  [AppErrorCode.MESSAGE_INVALID_CONTENT]: {
    title: "Invalid Message",
    message: "Message content is invalid or empty.",
  },
  [AppErrorCode.MESSAGE_UNAUTHORIZED]: {
    title: "Unauthorized",
    message: "You can only delete your own messages.",
  },

  // Real-time connection errors
  [AppErrorCode.REALTIME_CONNECTION_FAILED]: {
    title: "Connection Failed",
    message: "Could not connect to chat. Please refresh and try again.",
  },
  [AppErrorCode.REALTIME_CHANNEL_ERROR]: {
    title: "Chat Error",
    message: "Chat connection interrupted. Messages may be delayed.",
  },
  [AppErrorCode.REALTIME_SUBSCRIPTION_FAILED]: {
    title: "Subscription Failed",
    message: "Could not subscribe to chat updates. Please refresh.",
  },

  // Discussion errors
  [AppErrorCode.DISCUSSION_NOT_FOUND]: {
    title: "Discussion Not Found",
    message: "This discussion doesn't exist or has been removed.",
  },
  [AppErrorCode.DISCUSSION_CREATION_FAILED]: {
    title: "Creation Failed",
    message: "Could not create the discussion. Please try again.",
  },
  [AppErrorCode.DISCUSSION_UPDATE_FAILED]: {
    title: "Update Failed",
    message: "Could not update the discussion. Please try again.",
  },
  [AppErrorCode.DISCUSSION_DELETE_FAILED]: {
    title: "Delete Failed",
    message: "Could not delete the discussion. Please try again.",
  },
  [AppErrorCode.DISCUSSION_INVALID_NAME]: {
    title: "Invalid Name",
    message: "Discussion name must be 3-100 characters long.",
  },
  [AppErrorCode.DISCUSSION_INVALID_DESCRIPTION]: {
    title: "Invalid Description",
    message: "Description must be 500 characters or less.",
  },
  [AppErrorCode.DISCUSSION_UNAUTHORIZED]: {
    title: "Unauthorized",
    message: "You don't have permission to modify this discussion.",
  },

  // Poll errors
  [AppErrorCode.POLL_NOT_FOUND]: {
    title: "Poll Not Found",
    message: "This poll doesn't exist or has been removed.",
  },
  [AppErrorCode.POLL_CREATION_FAILED]: {
    title: "Creation Failed",
    message: "Could not create the poll. Please try again.",
  },
  [AppErrorCode.POLL_UPDATE_FAILED]: {
    title: "Update Failed",
    message: "Could not update the poll. Please try again.",
  },
  [AppErrorCode.POLL_DELETE_FAILED]: {
    title: "Delete Failed",
    message: "Could not delete the poll. Please try again.",
  },
  [AppErrorCode.POLL_INVALID_TITLE]: {
    title: "Invalid Title",
    message: "Poll title must be 5-200 characters long.",
  },
  [AppErrorCode.POLL_INVALID_OPTIONS]: {
    title: "Invalid Options",
    message: "Polls need 2-6 options, each 1-100 characters long.",
  },
  [AppErrorCode.POLL_VOTE_FAILED]: {
    title: "Vote Failed",
    message: "Could not record your vote. Please try again.",
  },
  [AppErrorCode.POLL_UNAUTHORIZED]: {
    title: "Unauthorized",
    message: "You don't have permission to modify this poll.",
  },

  // Watch Party errors
  [AppErrorCode.WATCH_PARTY_NOT_FOUND]: {
    title: "Watch Party Not Found",
    message: "This watch party doesn't exist or has been removed.",
  },
  [AppErrorCode.WATCH_PARTY_CREATION_FAILED]: {
    title: "Creation Failed",
    message: "Could not create the watch party. Please try again.",
  },
  [AppErrorCode.WATCH_PARTY_UPDATE_FAILED]: {
    title: "Update Failed",
    message: "Could not update the watch party. Please try again.",
  },
  [AppErrorCode.WATCH_PARTY_DELETE_FAILED]: {
    title: "Delete Failed",
    message: "Could not delete the watch party. Please try again.",
  },
  [AppErrorCode.WATCH_PARTY_INVALID_TITLE]: {
    title: "Invalid Title",
    message: "Watch party title must be 5-200 characters long.",
  },
  [AppErrorCode.WATCH_PARTY_INVALID_DESCRIPTION]: {
    title: "Invalid Description",
    message: "Description must be 500 characters or less.",
  },
  [AppErrorCode.WATCH_PARTY_INVALID_TIME]: {
    title: "Invalid Time",
    message: "Please schedule the party for a future date and time.",
  },
  [AppErrorCode.WATCH_PARTY_JOIN_FAILED]: {
    title: "Join Failed",
    message: "Could not join the watch party. Please try again.",
  },
  [AppErrorCode.WATCH_PARTY_LEAVE_FAILED]: {
    title: "Leave Failed",
    message: "Could not leave the watch party. Please try again.",
  },
  [AppErrorCode.WATCH_PARTY_FULL]: {
    title: "Party Full",
    message: "This watch party has reached its maximum capacity.",
  },
  [AppErrorCode.WATCH_PARTY_UNAUTHORIZED]: {
    title: "Unauthorized",
    message: "You don't have permission to modify this watch party.",
  },
};
