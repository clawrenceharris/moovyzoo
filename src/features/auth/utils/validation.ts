import { z } from 'zod'
import {
  signupSchema,
  loginSchema,
  profileUpdateSchema,
  privacySettingsSchema,
  onboardingDataSchema,
  genreSelectionSchema,
  displayNameOnboardingSchema,
  avatarOnboardingSchema,
} from '../types'

// Validation result type
export interface ValidationResult<T> {
  success: boolean
  data?: T
  errors?: Record<string, string[]>
}

// Generic validation function
export function validateData<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): ValidationResult<T> {
  try {
    const validatedData = schema.parse(data)
    return {
      success: true,
      data: validatedData,
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string[]> = {}

      error.errors.forEach((err) => {
        const path = err.path.join('.')
        if (!errors[path]) {
          errors[path] = []
        }
        errors[path].push(err.message)
      })

      return {
        success: false,
        errors,
      }
    }

    return {
      success: false,
      errors: { general: ['Validation failed'] },
    }
  }
}

// Specific validation functions
export const validators = {
  // Auth validation
  validateSignup: (data: unknown) => validateData(signupSchema, data),
  validateLogin: (data: unknown) => validateData(loginSchema, data),

  // Profile validation
  validateProfileUpdate: (data: unknown) =>
    validateData(profileUpdateSchema, data),
  validatePrivacySettings: (data: unknown) =>
    validateData(privacySettingsSchema, data),

  // Onboarding validation
  validateOnboardingData: (data: unknown) =>
    validateData(onboardingDataSchema, data),
  validateGenreSelection: (data: unknown) =>
    validateData(genreSelectionSchema, data),
  validateDisplayNameOnboarding: (data: unknown) =>
    validateData(displayNameOnboardingSchema, data),
  validateAvatarOnboarding: (data: unknown) =>
    validateData(avatarOnboardingSchema, data),
}

// Utility functions for common validations
export const validationUtils = {
  // Check if email is valid
  isValidEmail: (email: string): boolean => {
    return z.string().email().safeParse(email).success
  },

  // Check if password meets requirements
  isValidPassword: (password: string): boolean => {
    return signupSchema.shape.password.safeParse(password).success
  },

  // Check if display name is valid
  isValidDisplayName: (displayName: string): boolean => {
    return displayNameOnboardingSchema.shape.displayName.safeParse(displayName)
      .success
  },

  // Check if URL is valid
  isValidUrl: (url: string): boolean => {
    return z.string().url().safeParse(url).success
  },

  // Get password strength score (0-4)
  getPasswordStrength: (password: string): number => {
    let score = 0

    if (password.length >= 8) score++
    if (/[a-z]/.test(password)) score++
    if (/[A-Z]/.test(password)) score++
    if (/\d/.test(password)) score++
    if (/[^a-zA-Z\d]/.test(password)) score++

    return Math.min(score, 4)
  },

  // Get password strength label
  getPasswordStrengthLabel: (password: string): string => {
    const strength = validationUtils.getPasswordStrength(password)

    switch (strength) {
      case 0:
      case 1:
        return 'Weak'
      case 2:
        return 'Fair'
      case 3:
        return 'Good'
      case 4:
        return 'Strong'
      default:
        return 'Weak'
    }
  },

  // Sanitize display name
  sanitizeDisplayName: (displayName: string): string => {
    return displayName.trim().replace(/\s+/g, ' ')
  },

  // Validate and sanitize avatar URL
  validateAvatarUrl: (
    url: string
  ): { isValid: boolean; sanitizedUrl?: string } => {
    if (!url || url.trim() === '') {
      return { isValid: true, sanitizedUrl: undefined }
    }

    const trimmedUrl = url.trim()
    const isValid = validationUtils.isValidUrl(trimmedUrl)

    return {
      isValid,
      sanitizedUrl: isValid ? trimmedUrl : undefined,
    }
  },
}

// Form field validation helpers
export const fieldValidators = {
  // Real-time email validation
  validateEmailField: (email: string): string | null => {
    if (!email) return null
    if (!validationUtils.isValidEmail(email)) {
      return 'Please enter a valid email address'
    }
    return null
  },

  // Real-time password validation
  validatePasswordField: (password: string): string | null => {
    if (!password) return null
    if (password.length < 8) {
      return 'Password must be at least 8 characters long'
    }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      return 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    }
    return null
  },

  // Real-time display name validation
  validateDisplayNameField: (displayName: string): string | null => {
    if (!displayName) return null
    if (displayName.length < 2) {
      return 'Display name must be at least 2 characters'
    }
    if (displayName.length > 50) {
      return 'Display name must be less than 50 characters'
    }
    if (!/^[a-zA-Z0-9\s_-]+$/.test(displayName)) {
      return 'Display name can only contain letters, numbers, spaces, hyphens, and underscores'
    }
    return null
  },

  // Real-time avatar URL validation
  validateAvatarUrlField: (url: string): string | null => {
    if (!url || url.trim() === '') return null
    if (!validationUtils.isValidUrl(url.trim())) {
      return 'Please enter a valid URL'
    }
    return null
  },
}
