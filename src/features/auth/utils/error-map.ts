import { AppErrorCode } from './error-codes'

export interface ErrorMessage {
  title: string
  message: string
}

export const errorMap: Record<AppErrorCode, ErrorMessage> = {
  // Authentication errors
  [AppErrorCode.AUTH_EMAIL_ALREADY_EXISTS]: {
    title: 'Email Already Registered',
    message:
      'An account with this email already exists. Try logging in instead.',
  },
  [AppErrorCode.AUTH_INVALID_EMAIL]: {
    title: 'Invalid Email',
    message: 'Please enter a valid email address.',
  },
  [AppErrorCode.AUTH_WEAK_PASSWORD]: {
    title: 'Weak Password',
    message:
      'Password should be at least 8 characters with mixed case and numbers.',
  },
  [AppErrorCode.AUTH_USER_NOT_FOUND]: {
    title: 'Account Not Found',
    message: 'No account found with this email. Check your email or sign up.',
  },
  [AppErrorCode.AUTH_WRONG_PASSWORD]: {
    title: 'Incorrect Password',
    message: 'The password you entered is incorrect. Please try again.',
  },
  [AppErrorCode.AUTH_TOO_MANY_REQUESTS]: {
    title: 'Too Many Attempts',
    message:
      'Too many failed attempts. Please wait a few minutes and try again.',
  },
  [AppErrorCode.AUTH_NETWORK_ERROR]: {
    title: 'Connection Issue',
    message: 'Network error. Please check your connection and try again.',
  },
  [AppErrorCode.AUTH_REQUIRES_RECENT_LOGIN]: {
    title: 'Login Required',
    message: 'Please log in again to complete this action for security.',
  },
  [AppErrorCode.AUTH_INVALID_CREDENTIAL]: {
    title: 'Invalid Credentials',
    message: 'The email or password you entered is incorrect.',
  },
  [AppErrorCode.AUTH_USER_DISABLED]: {
    title: 'Account Disabled',
    message: 'This account has been disabled. Contact support for help.',
  },
  [AppErrorCode.AUTH_OPERATION_NOT_ALLOWED]: {
    title: 'Sign-up Disabled',
    message: 'Email/password accounts are currently disabled.',
  },

  // Profile errors
  [AppErrorCode.PROFILE_NOT_FOUND]: {
    title: 'Profile Not Found',
    message: 'Your profile could not be found. Please try refreshing the page.',
  },
  [AppErrorCode.PROFILE_ALREADY_EXISTS]: {
    title: 'Profile Exists',
    message: 'A profile already exists for this account.',
  },
  [AppErrorCode.PROFILE_UPDATE_FAILED]: {
    title: 'Update Failed',
    message: 'Could not save your profile changes. Please try again.',
  },
  [AppErrorCode.PROFILE_CREATION_FAILED]: {
    title: 'Profile Creation Failed',
    message: 'Could not create your profile. Please try again.',
  },
  [AppErrorCode.PROFILE_INVALID_DATA]: {
    title: 'Invalid Profile Data',
    message: 'Some profile information is invalid. Please check and try again.',
  },
  [AppErrorCode.PROFILE_UNAUTHORIZED]: {
    title: 'Access Denied',
    message: 'You do not have permission to access this profile.',
  },
  [AppErrorCode.PROFILE_AVATAR_INVALID]: {
    title: 'Invalid Avatar',
    message: 'The avatar URL is not valid. Please use a different image.',
  },
  [AppErrorCode.PROFILE_DISPLAY_NAME_TAKEN]: {
    title: 'Name Unavailable',
    message: 'This display name is already taken. Please choose another.',
  },

  // Privacy errors
  [AppErrorCode.PRIVACY_UPDATE_FAILED]: {
    title: 'Privacy Update Failed',
    message: 'Could not update your privacy settings. Please try again.',
  },
  [AppErrorCode.PRIVACY_INVALID_SETTINGS]: {
    title: 'Invalid Privacy Settings',
    message: 'The privacy settings are invalid. Please check and try again.',
  },

  // Validation errors
  [AppErrorCode.VALIDATION_INVALID_EMAIL]: {
    title: 'Invalid Email',
    message: 'Please enter a valid email address.',
  },
  [AppErrorCode.VALIDATION_INVALID_PASSWORD]: {
    title: 'Invalid Password',
    message:
      'Password must be at least 8 characters with mixed case and numbers.',
  },
  [AppErrorCode.VALIDATION_INVALID_DISPLAY_NAME]: {
    title: 'Invalid Display Name',
    message:
      'Display name must be 2-50 characters with letters, numbers, and spaces.',
  },
  [AppErrorCode.VALIDATION_INVALID_AVATAR_URL]: {
    title: 'Invalid Avatar URL',
    message: 'Please enter a valid image URL.',
  },
  [AppErrorCode.VALIDATION_INVALID_GENRES]: {
    title: 'Invalid Genres',
    message: 'Please select 1-10 favorite genres.',
  },
  [AppErrorCode.VALIDATION_REQUIRED_FIELD]: {
    title: 'Required Field',
    message: 'This field is required. Please fill it out.',
  },

  // Database errors
  [AppErrorCode.DATABASE_CONNECTION_ERROR]: {
    title: 'Connection Error',
    message: 'Could not connect to the database. Please try again.',
  },
  [AppErrorCode.DATABASE_PERMISSION_DENIED]: {
    title: 'Permission Denied',
    message: 'You do not have permission to perform this action.',
  },
  [AppErrorCode.DATABASE_QUOTA_EXCEEDED]: {
    title: 'Service Limit Reached',
    message: 'Service temporarily unavailable. Please try again later.',
  },
  [AppErrorCode.DATABASE_UNAVAILABLE]: {
    title: 'Service Unavailable',
    message: 'Database service is temporarily unavailable. Please try again.',
  },

  // Generic errors
  [AppErrorCode.UNKNOWN_ERROR]: {
    title: 'Something Went Wrong',
    message: 'An unexpected error occurred. Please try again.',
  },
  [AppErrorCode.NETWORK_ERROR]: {
    title: 'Network Error',
    message: 'Please check your internet connection and try again.',
  },
  [AppErrorCode.RATE_LIMIT_EXCEEDED]: {
    title: 'Too Many Requests',
    message: 'You are making requests too quickly. Please slow down.',
  },
}
