'use client'

import React, { useState, useCallback, ReactNode } from 'react'
import { SignupForm } from './SignupForm'
import { LoginForm } from './LoginForm'
import { useAuth } from '../../hooks/useAuth'
import { cn, styles } from '@/styles/styles'

type AuthMode = 'login' | 'signup' | 'forgot-password'

interface AuthLayoutProps {
  initialMode?: AuthMode
  onSuccess?: () => void
  onForgotPassword?: (email: string) => void
  className?: string
  children?: ReactNode
}

interface ForgotPasswordFormProps {
  onBack: () => void
  onSubmit: (email: string) => void
  initialEmail?: string
  className?: string
}

function ForgotPasswordForm({
  onBack,
  onSubmit,
  initialEmail = '',
  className,
}: ForgotPasswordFormProps) {
  const { resetPassword, loading, error, clearError } = useAuth()
  const [email, setEmail] = useState(initialEmail)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [emailError, setEmailError] = useState<string | null>(null)

  const validateEmail = (email: string): string | null => {
    if (!email) return 'Email is required'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return 'Please enter a valid email address'
    }
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const error = validateEmail(email)
    setEmailError(error)

    if (error) return

    try {
      await resetPassword(email)
      setIsSubmitted(true)
      onSubmit(email)
    } catch (error) {
      console.error('Password reset failed:', error)
    }
  }

  const handleEmailChange = (value: string) => {
    setEmail(value)
    if (error) clearError()
    if (emailError) setEmailError(null)
  }

  if (isSubmitted) {
    return (
      <div className={cn('w-full max-w-md text-center', className)}>
        <div className="rounded-xl border border-green-200 bg-green-50 p-6">
          <div className="mb-4 flex justify-center">
            <svg
              className="h-12 w-12 text-green-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h3 className="mb-2 text-lg font-semibold text-gray-900">
            Check your email
          </h3>
          <p className="mb-4 text-sm text-gray-600">
            We&apos;ve sent a password reset link to <strong>{email}</strong>
          </p>
          <p className="mb-6 text-xs text-gray-500">
            Didn&apos;t receive the email? Check your spam folder or try again.
          </p>
          <button onClick={onBack} className="btn btn-outline w-full">
            Back to Sign In
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('w-full max-w-md', className)}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold text-gray-900">
            Reset your password
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Enter your email address and we&apos;ll send you a link to reset
            your password.
          </p>
        </div>

        <div>
          <label htmlFor="reset-email" className={styles.label}>
            Email Address
          </label>
          <input
            id="reset-email"
            type="email"
            value={email}
            onChange={(e) => handleEmailChange(e.target.value)}
            className={cn(styles.input, emailError && styles.inputError)}
            placeholder="Enter your email"
            disabled={loading}
            autoComplete="email"
          />
          {emailError && <p className={styles.errorText}>{emailError}</p>}
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-3">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !email}
          className={cn(
            'btn btn-primary w-full',
            (loading || !email) && 'cursor-not-allowed opacity-50'
          )}
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <div className={styles.spinner} />
              <span className="ml-2">Sending...</span>
            </div>
          ) : (
            'Send Reset Link'
          )}
        </button>

        <div className="text-center">
          <button
            type="button"
            onClick={onBack}
            className="text-sm text-gray-600 hover:text-gray-800"
            disabled={loading}
          >
            ← Back to Sign In
          </button>
        </div>
      </form>
    </div>
  )
}

export function AuthLayout({
  initialMode = 'login',
  onSuccess,
  onForgotPassword,
  className,
  children,
}: AuthLayoutProps) {
  const [mode, setMode] = useState<AuthMode>(initialMode)
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('')

  const handleSwitchToLogin = useCallback(() => {
    setMode('login')
  }, [])

  const handleSwitchToSignup = useCallback(() => {
    setMode('signup')
  }, [])

  const handleForgotPassword = useCallback(
    (email: string) => {
      setForgotPasswordEmail(email)
      setMode('forgot-password')
      onForgotPassword?.(email)
    },
    [onForgotPassword]
  )

  const handleForgotPasswordSubmit = useCallback((email: string) => {
    // This is called after successful password reset email send
    // The form handles the success state internally
  }, [])

  // If children are provided, render them instead of the default forms
  if (children) {
    return (
      <div
        className={cn(
          'flex min-h-screen flex-col justify-center bg-gray-50 py-12 sm:px-6 lg:px-8',
          className
        )}
      >
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-primary">MoovyZoo</h1>
            <p className="mt-2 text-sm text-gray-600">
              Your social platform for TV and film lovers
            </p>
          </div>
        </div>
        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className={cn(styles.card, 'bg-white')}>{children}</div>
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'flex min-h-screen flex-col justify-center bg-gray-50 py-12 sm:px-6 lg:px-8',
        className
      )}
    >
      {/* Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-primary">MoovyZoo</h1>
          <p className="mt-2 text-sm text-gray-600">
            Your social platform for TV and film lovers
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className={cn(styles.card, 'bg-white')}>
          {/* Mode Header */}
          <div className="mb-6 text-center">
            {mode === 'login' && (
              <>
                <h2 className="text-2xl font-bold text-gray-900">
                  Welcome back
                </h2>
                <p className="mt-2 text-sm text-gray-600">
                  Sign in to your account to continue
                </p>
              </>
            )}
            {mode === 'signup' && (
              <>
                <h2 className="text-2xl font-bold text-gray-900">
                  Create your account
                </h2>
                <p className="mt-2 text-sm text-gray-600">
                  Join the community of film and TV lovers
                </p>
              </>
            )}
          </div>

          {/* Form Content */}
          {mode === 'login' && (
            <LoginForm
              onSuccess={onSuccess}
              onSwitchToSignup={handleSwitchToSignup}
              onForgotPassword={handleForgotPassword}
            />
          )}

          {mode === 'signup' && (
            <SignupForm
              onSuccess={onSuccess}
              onSwitchToLogin={handleSwitchToLogin}
            />
          )}

          {mode === 'forgot-password' && (
            <ForgotPasswordForm
              onBack={handleSwitchToLogin}
              onSubmit={handleForgotPasswordSubmit}
              initialEmail={forgotPasswordEmail}
            />
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>

      {/* Loading Overlay */}
      <div
        className="fixed inset-0 z-50 flex hidden items-center justify-center bg-black bg-opacity-50"
        id="auth-loading-overlay"
      >
        <div className="flex items-center space-x-3 rounded-xl bg-white p-6">
          <div className={styles.spinner} />
          <span className="text-gray-700">Processing...</span>
        </div>
      </div>
    </div>
  )
}

// Error Boundary for Auth Layout
interface AuthErrorBoundaryState {
  hasError: boolean
  error?: Error
}

interface AuthErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
}

export class AuthErrorBoundary extends React.Component<
  AuthErrorBoundaryProps,
  AuthErrorBoundaryState
> {
  constructor(props: AuthErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): AuthErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Auth Error Boundary caught an error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="flex min-h-screen flex-col justify-center bg-gray-50 py-12 sm:px-6 lg:px-8">
          <div className="sm:mx-auto sm:w-full sm:max-w-md">
            <div className={cn(styles.card, 'bg-white text-center')}>
              <div className="mb-4 flex justify-center">
                <svg
                  className="h-12 w-12 text-red-600"
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
              </div>
              <h2 className="mb-2 text-xl font-semibold text-gray-900">
                Something went wrong
              </h2>
              <p className="mb-4 text-sm text-gray-600">
                We encountered an error while loading the authentication form.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="btn btn-primary"
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// Export individual components for flexibility
export { SignupForm, LoginForm, ForgotPasswordForm }
