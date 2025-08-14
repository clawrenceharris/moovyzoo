'use client'

import { useState, useCallback } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { validators, fieldValidators } from '../../utils/validation'
import { cn, styles } from '@/styles/styles'
import type { LoginFormData } from '../../types'

interface LoginFormProps {
  onSuccess?: () => void
  onSwitchToSignup?: () => void
  onForgotPassword?: (email: string) => void
  className?: string
}

export function LoginForm({
  onSuccess,
  onSwitchToSignup,
  onForgotPassword,
  className,
}: LoginFormProps) {
  const { login, loading, error, clearError } = useAuth()

  const [formData, setFormData] = useState<LoginFormData>({
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
  const [isRateLimited, setIsRateLimited] = useState(false)

  // Handle input changes with real-time validation
  const handleInputChange = useCallback(
    (field: keyof LoginFormData, value: string) => {
      setFormData((prev) => ({ ...prev, [field]: value }))

      // Clear any existing auth errors when user starts typing
      if (error) {
        clearError()
      }

      // Clear rate limiting state when user starts typing
      if (isRateLimited) {
        setIsRateLimited(false)
      }

      // Real-time validation for touched fields
      if (touched[field]) {
        let fieldError: string | null = null

        if (field === 'email') {
          fieldError = fieldValidators.validateEmailField(value)
        } else if (field === 'password') {
          // For login, we just check if password is provided
          fieldError = value ? null : 'Password is required'
        }

        setFieldErrors((prev) => ({ ...prev, [field]: fieldError }))
      }
    },
    [touched, error, clearError, isRateLimited]
  )

  // Handle field blur (mark as touched and validate)
  const handleFieldBlur = useCallback(
    (field: keyof LoginFormData) => {
      setTouched((prev) => ({ ...prev, [field]: true }))

      let fieldError: string | null = null
      const value = formData[field]

      if (field === 'email') {
        fieldError = fieldValidators.validateEmailField(value)
      } else if (field === 'password') {
        fieldError = value ? null : 'Password is required'
      }

      setFieldErrors((prev) => ({ ...prev, [field]: fieldError }))
    },
    [formData]
  )

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Mark all fields as touched
    setTouched({ email: true, password: true })

    // Validate all fields
    const emailError = fieldValidators.validateEmailField(formData.email)
    const passwordError = formData.password ? null : 'Password is required'

    setFieldErrors({
      email: emailError,
      password: passwordError,
    })

    // Check if there are any field errors
    if (emailError || passwordError) {
      return
    }

    // Validate with Zod schema
    const validation = validators.validateLogin(formData)
    if (!validation.success) {
      console.error('Form validation failed:', validation.errors)
      return
    }

    try {
      await login(formData)
      onSuccess?.()
    } catch (error) {
      // Check if error is rate limiting related
      if (
        error instanceof Error &&
        error.message.includes('Too many failed login attempts')
      ) {
        setIsRateLimited(true)
      }
      console.error('Login failed:', error)
    }
  }

  // Handle forgot password
  const handleForgotPassword = () => {
    if (formData.email && !fieldErrors.email) {
      onForgotPassword?.(formData.email)
    } else {
      // If no email or invalid email, still call the handler
      onForgotPassword?.(formData.email)
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
          <label htmlFor="login-email" className={styles.label}>
            Email Address
          </label>
          <input
            id="login-email"
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
          <div className="flex items-center justify-between">
            <label htmlFor="login-password" className={styles.label}>
              Password
            </label>
            {onForgotPassword && (
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-sm text-primary hover:text-red-700"
                disabled={loading}
              >
                Forgot password?
              </button>
            )}
          </div>
          <div className="relative">
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              onBlur={() => handleFieldBlur('password')}
              className={cn(
                styles.input,
                'pr-10',
                fieldErrors.password && styles.inputError
              )}
              placeholder="Enter your password"
              disabled={loading}
              autoComplete="current-password"
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
          {fieldErrors.password && (
            <p className={styles.errorText}>{fieldErrors.password}</p>
          )}
        </div>

        {/* Auth Error Display */}
        {error && (
          <div
            className={cn(
              'rounded-xl border p-3',
              isRateLimited
                ? 'border-yellow-200 bg-yellow-50'
                : 'border-red-200 bg-red-50'
            )}
          >
            <div className="flex items-start">
              {isRateLimited ? (
                <svg
                  className="mr-2 mt-0.5 h-5 w-5 flex-shrink-0 text-yellow-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              ) : (
                <svg
                  className="mr-2 mt-0.5 h-5 w-5 flex-shrink-0 text-red-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              )}
              <p
                className={cn(
                  'text-sm',
                  isRateLimited ? 'text-yellow-700' : 'text-red-600'
                )}
              >
                {error}
              </p>
            </div>
            {isRateLimited && (
              <div className="mt-2 text-xs text-yellow-600">
                <p>For security reasons, please wait before trying again.</p>
              </div>
            )}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || !isFormValid || isRateLimited}
          className={cn(
            'btn btn-primary w-full',
            (loading || !isFormValid || isRateLimited) &&
              'cursor-not-allowed opacity-50'
          )}
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <div className={styles.spinner} />
              <span className="ml-2">Signing In...</span>
            </div>
          ) : (
            'Sign In'
          )}
        </button>

        {/* Switch to Signup */}
        {onSwitchToSignup && (
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={onSwitchToSignup}
                className="font-medium text-primary hover:text-red-700"
                disabled={loading}
              >
                Create account
              </button>
            </p>
          </div>
        )}
      </form>
    </div>
  )
}
