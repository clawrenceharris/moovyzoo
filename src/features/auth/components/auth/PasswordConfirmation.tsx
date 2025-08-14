'use client'

import React, { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { passwordConfirmationUtils } from '../../utils/security'
import { cn, styles } from '@/styles/styles'

interface PasswordConfirmationProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (confirmed: boolean) => void
  operation: string
  title?: string
  description?: string
  className?: string
}

export function PasswordConfirmation({
  isOpen,
  onClose,
  onConfirm,
  operation,
  title,
  description,
  className,
}: PasswordConfirmationProps) {
  const { reauthenticate } = useAuth()
  const [password, setPassword] = useState('')
  const [isConfirming, setIsConfirming] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsConfirming(true)

    try {
      await reauthenticate(password)
      onConfirm(true)
      onClose()
      setPassword('')
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Authentication failed')
      onConfirm(false)
    } finally {
      setIsConfirming(false)
    }
  }

  const handleCancel = () => {
    setPassword('')
    setError(null)
    onConfirm(false)
    onClose()
  }

  const operationTitle = title || `Confirm ${operation.replace('_', ' ')}`
  const operationDescription =
    description ||
    `Please enter your password to confirm this ${operation.replace('_', ' ')} operation.`

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className={cn(styles.card.base, 'mx-4 w-full max-w-md', className)}>
        {/* Header */}
        <div className="mb-6">
          <div className="mb-2 flex items-center justify-between">
            <h3 className={cn(styles.text.h3)}>{operationTitle}</h3>
            <button
              onClick={handleCancel}
              className="text-text-tertiary hover:text-text-primary transition-colors"
              aria-label="Close"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <p className={cn(styles.text.secondary, styles.text.bodySm)}>
            {operationDescription}
          </p>
        </div>

        {/* Security Notice */}
        <div className="bg-warning/10 border-warning/20 mb-6 rounded-lg border p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg
                className="text-warning mt-0.5 h-5 w-5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h4
                className={cn(styles.text.labelMd, 'text-warning font-medium')}
              >
                Security Verification Required
              </h4>
              <p className={cn(styles.text.bodySm, 'text-warning mt-1')}>
                This action requires password confirmation for your security.
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="password" className={styles.form.label}>
              Current Password *
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={cn(styles.form.input, error && styles.form.inputError)}
              placeholder="Enter your current password"
              required
              autoFocus
              disabled={isConfirming}
            />
            {error && <p className={styles.form.error}>{error}</p>}
          </div>

          {/* Actions */}
          <div className="flex flex-col-reverse gap-3 pt-4 sm:flex-row">
            <button
              type="button"
              onClick={handleCancel}
              disabled={isConfirming}
              className={cn(
                styles.button.outline,
                'flex-1 sm:flex-none',
                isConfirming && styles.interactive.disabled
              )}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!password.trim() || isConfirming}
              className={cn(
                styles.button.primary,
                'flex-1 sm:flex-none',
                (!password.trim() || isConfirming) &&
                  styles.interactive.disabled
              )}
            >
              {isConfirming ? (
                <>
                  <div className="spinner spinner-sm mr-2" />
                  Confirming...
                </>
              ) : (
                'Confirm'
              )}
            </button>
          </div>
        </form>

        {/* Security Tips */}
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
            <li>• Never share your password with anyone</li>
            <li>• Use a strong, unique password for your account</li>
            <li>• Log out from shared or public computers</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

/**
 * Hook for managing password confirmation dialogs
 */
export function usePasswordConfirmation() {
  const [isOpen, setIsOpen] = useState(false)
  const [currentOperation, setCurrentOperation] = useState<string>('')
  const [confirmationPromise, setConfirmationPromise] = useState<{
    resolve: (confirmed: boolean) => void
    reject: (error: Error) => void
  } | null>(null)

  const requestConfirmation = (operation: string): Promise<boolean> => {
    // Check if operation requires confirmation
    if (!passwordConfirmationUtils.requiresConfirmation(operation)) {
      return Promise.resolve(true)
    }

    return new Promise((resolve, reject) => {
      setCurrentOperation(operation)
      setConfirmationPromise({ resolve, reject })
      setIsOpen(true)
    })
  }

  const handleConfirm = (confirmed: boolean) => {
    if (confirmationPromise) {
      confirmationPromise.resolve(confirmed)
      setConfirmationPromise(null)
    }
    setIsOpen(false)
    setCurrentOperation('')
  }

  const handleClose = () => {
    if (confirmationPromise) {
      confirmationPromise.resolve(false)
      setConfirmationPromise(null)
    }
    setIsOpen(false)
    setCurrentOperation('')
  }

  return {
    isOpen,
    currentOperation,
    requestConfirmation,
    handleConfirm,
    handleClose,
  }
}
