'use client'

import { useState, useCallback } from 'react'
import { useAuth } from '../../hooks/useAuth'
import {
  validators,
  validationUtils,
  fieldValidators,
} from '../../utils/validation'
import { cn, styles } from '@/styles/styles'
import type { SignupFormData } from '../../types'

interface SignupFormProps {
  onSuccess?: () => void
  onSwitchToLogin?: () => void
  className?: string
}

export function SignupForm({
  onSuccess,
  onSwitchToLogin,
  className,
}: SignupFormProps) {
  const { signup, loading, error, clearError } = useAuth()

  const [formData, setFormData] = useState<SignupFormData>({
    email: '',
    password: '',
  })

  const [fieldErrors, setFieldErrors] = useState<Record<string, string | null>>(
    {
      email: null,
      password: null,
    }
  )

  const [touched, setTouched] = useState<Record<string, boolean>>({
    email: false,
    password: false,
  })

  const [showPassword, setShowPassword] = useState(false)

  // Handle input changes with real-time validation
  const handleInputChange = useCallback(
    (field: keyof SignupFormData, value: string) => {
      setFormData((prev) => ({ ...prev, [field]: value }))

      // Clear any existing auth errors when user starts typing
      if (error) {
        clearError()
      }

      // Real-time validation for touched fields
      if (touched[field]) {
        let fieldError: string | null = null

        if (field === 'email') {
          fieldError = fieldValidators.validateEmailField(value)
        } else if (field === 'password') {
          fieldError = fieldValidators.validatePasswordField(value)
        }

        setFieldErrors((prev) => ({ ...prev, [field]: fieldError }))
      }
    },
    [touched, error, clearError]
  )

  // Handle field blur (mark as touched and validate)
  const handleFieldBlur = useCallback(
    (field: keyof SignupFormData) => {
      setTouched((prev) => ({ ...prev, [field]: true }))

      let fieldError: string | null = null
      const value = formData[field]

      if (field === 'email') {
        fieldError = fieldValidators.validateEmailField(value)
      } else if (field === 'password') {
        fieldError = fieldValidators.validatePasswordField(value)
      }

      setFieldErrors((prev) => ({ ...prev, [field]: fieldError }))
    },
    [formData]
  )

  // Get password strength info
  const passwordStrength = validationUtils.getPasswordStrength(
    formData.password
  )
  const passwordStrengthLabel = validationUtils.getPasswordStrengthLabel(
    formData.password
  )

  // Password strength color classes
  const getPasswordStrengthColor = (strength: number) => {
    switch (strength) {
      case 0:
      case 1:
        return 'text-red-600 bg-red-100'
      case 2:
        return 'text-yellow-600 bg-yellow-100'
      case 3:
        return 'text-blue-600 bg-blue-100'
      case 4:
        return 'text-green-600 bg-green-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Mark all fields as touched
    setTouched({ email: true, password: true })

    // Validate all fields
    const emailError = fieldValidators.validateEmailField(formData.email)
    const passwordError = fieldValidators.validatePasswordField(
      formData.password
    )

    setFieldErrors({
      email: emailError,
      password: passwordError,
    })

    // Check if there are any field errors
    if (emailError || passwordError) {
      return
    }

    // Validate with Zod schema
    const validation = validators.validateSignup(formData)
    if (!validation.success) {
      // This shouldn't happen if field validation is working correctly
      console.error('Form validation failed:', validation.errors)
      return
    }

    try {
      await signup(formData)
      onSuccess?.()
    } catch (error) {
      // Error is handled by the useAuth hook
      console.error('Signup failed:', error)
    }
  }

  // Check if form is valid
  const isFormValid =
    !fieldErrors.email &&
    !fieldErrors.password &&
    formData.email &&
    formData.password

  return (
    <div className={cn('w-full max-w-md', className)}>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Email Field */}
        <div>
          <label htmlFor="signup-email" className={styles.label}>
            Email Address
          </label>
          <input
            id="signup-email"
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            onBlur={() => handleFieldBlur('email')}
            className={cn(styles.input, fieldErrors.email && styles.inputError)}
            placeholder="Enter your email"
            disabled={loading}
            autoComplete="email"
          />
          {fieldErrors.email && (
            <p className={styles.errorText}>{fieldErrors.email}</p>
          )}
        </div>

        {/* Password Field */}
        <div>
          <label htmlFor="signup-password" className={styles.label}>
            Password
          </label>
          <div className="relative">
            <input
              id="signup-password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              onBlur={() => handleFieldBlur('password')}
              className={cn(
                styles.input,
                'pr-10',
                fieldErrors.password && styles.inputError
              )}
              placeholder="Create a password"
              disabled={loading}
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
              disabled={loading}
            >
              {showPassword ? (
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                  />
                </svg>
              ) : (
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
              )}
            </button>
          </div>

          {/* Password Strength Indicator */}
          {formData.password && (
            <div className="mt-2">
              <div className="mb-1 flex items-center justify-between">
                <span className="text-xs text-gray-600">
                  Password strength:
                </span>
                <span
                  className={cn(
                    'rounded-full px-2 py-1 text-xs',
                    getPasswordStrengthColor(passwordStrength)
                  )}
                >
                  {passwordStrengthLabel}
                </span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-gray-200">
                <div
                  className={cn(
                    'h-1.5 rounded-full transition-all duration-300',
                    passwordStrength === 0
                      ? 'bg-gray-300'
                      : passwordStrength === 1
                        ? 'bg-red-500'
                        : passwordStrength === 2
                          ? 'bg-yellow-500'
                          : passwordStrength === 3
                            ? 'bg-blue-500'
                            : 'bg-green-500'
                  )}
                  style={{ width: `${(passwordStrength / 4) * 100}%` }}
                />
              </div>
            </div>
          )}

          {fieldErrors.password && (
            <p className={styles.errorText}>{fieldErrors.password}</p>
          )}

          {/* Password Requirements */}
          {formData.password && !fieldErrors.password && (
            <div className="mt-2 text-xs text-gray-600">
              <p>Password requirements:</p>
              <ul className="mt-1 list-inside list-disc space-y-1">
                <li
                  className={
                    formData.password.length >= 8 ? 'text-green-600' : ''
                  }
                >
                  At least 8 characters
                </li>
                <li
                  className={
                    /[a-z]/.test(formData.password) ? 'text-green-600' : ''
                  }
                >
                  One lowercase letter
                </li>
                <li
                  className={
                    /[A-Z]/.test(formData.password) ? 'text-green-600' : ''
                  }
                >
                  One uppercase letter
                </li>
                <li
                  className={
                    /\d/.test(formData.password) ? 'text-green-600' : ''
                  }
                >
                  One number
                </li>
              </ul>
            </div>
          )}
        </div>

        {/* Auth Error Display */}
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-3">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || !isFormValid}
          className={cn(
            'btn btn-primary w-full',
            (loading || !isFormValid) && 'cursor-not-allowed opacity-50'
          )}
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <div className={styles.spinner} />
              <span className="ml-2">Creating Account...</span>
            </div>
          ) : (
            'Create Account'
          )}
        </button>

        {/* Switch to Login */}
        {onSwitchToLogin && (
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <button
                type="button"
                onClick={onSwitchToLogin}
                className="font-medium text-primary hover:text-red-700"
                disabled={loading}
              >
                Sign in
              </button>
            </p>
          </div>
        )}
      </form>
    </div>
  )
}
