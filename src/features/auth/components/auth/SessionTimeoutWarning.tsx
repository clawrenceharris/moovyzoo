'use client'

import React from 'react'
import { useSessionTimeoutWarning } from '../../hooks/useSessionTimeout'
import { cn, styles } from '@/styles/styles'

interface SessionTimeoutWarningProps {
  className?: string
}

export function SessionTimeoutWarning({
  className,
}: SessionTimeoutWarningProps) {
  const { showWarning, formattedCountdown, dismissWarning, extendSession } =
    useSessionTimeoutWarning()

  if (!showWarning) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className={cn(styles.card.base, 'mx-4 w-full max-w-md', className)}>
        {/* Header */}
        <div className="mb-6">
          <div className="mb-2 flex items-center">
            <div className="flex-shrink-0">
              <svg
                className="text-warning h-8 w-8"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className={cn(styles.text.h3, 'text-warning')}>
                Session Expiring Soon
              </h3>
            </div>
          </div>
          <p className={cn(styles.text.secondary, styles.text.bodySm)}>
            Your session will expire due to inactivity. You'll be automatically
            logged out to protect your account.
          </p>
        </div>

        {/* Countdown */}
        <div className="mb-6 text-center">
          <div className="bg-warning/10 border-warning/20 mb-4 inline-flex h-20 w-20 items-center justify-center rounded-full border-2">
            <span className={cn(styles.text.h2, 'text-warning font-mono')}>
              {formattedCountdown}
            </span>
          </div>
          <p className={cn(styles.text.bodySm, styles.text.secondary)}>
            Time remaining before automatic logout
          </p>
        </div>

        {/* Security Information */}
        <div className="bg-info/10 border-info/20 mb-6 rounded-lg border p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg
                className="text-info mt-0.5 h-5 w-5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h4 className={cn(styles.text.labelMd, 'text-info font-medium')}>
                Why does this happen?
              </h4>
              <p className={cn(styles.text.bodySm, 'text-info mt-1')}>
                Automatic logout helps protect your account when you're away
                from your device.
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            onClick={dismissWarning}
            className={cn(styles.button.outline, 'flex-1')}
          >
            Logout Now
          </button>
          <button
            onClick={extendSession}
            className={cn(styles.button.primary, 'flex-1')}
          >
            Stay Logged In
          </button>
        </div>

        {/* Additional Security Tips */}
        <div className="border-dark-border-primary mt-6 border-t pt-4">
          <h5 className={cn(styles.text.labelSm, 'mb-2 font-medium')}>
            Security Tips:
          </h5>
          <ul
            className={cn(
              styles.text.bodySm,
              styles.text.tertiary,
              'space-y-1'
            )}
          >
            <li>• Always log out when using shared computers</li>
            <li>• Keep your browser and device secure</li>
            <li>• Use strong, unique passwords</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

/**
 * Global session timeout warning provider
 * This should be placed at the app level to handle session timeouts globally
 */
export function SessionTimeoutProvider({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      {children}
      <SessionTimeoutWarning />
    </>
  )
}
