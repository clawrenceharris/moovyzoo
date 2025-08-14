'use client'

import React, { useState } from 'react'
import { useProfile } from '../../hooks/useProfile'
import { cn, styles } from '@/styles/styles'

interface PrivacySettingsProps {
  className?: string
}

export function PrivacySettings({ className }: PrivacySettingsProps) {
  const { profile, updatePrivacySettings, isUpdatingPrivacy, privacyError } =
    useProfile()
  const [showConfirmation, setShowConfirmation] = useState(false)

  if (!profile) {
    return (
      <div className={cn(styles.card.base, className)}>
        <div className="animate-pulse">
          <div className="mb-4 h-6 w-48 rounded bg-gray-300"></div>
          <div className="mb-2 h-4 w-full rounded bg-gray-300"></div>
          <div className="h-4 w-3/4 rounded bg-gray-300"></div>
        </div>
      </div>
    )
  }

  const handleTogglePrivacy = () => {
    const newPrivacySetting = !profile.isPublic
    updatePrivacySettings({ isPublic: newPrivacySetting })
    setShowConfirmation(true)

    // Hide confirmation after 3 seconds
    setTimeout(() => {
      setShowConfirmation(false)
    }, 3000)
  }

  return (
    <div className={cn(styles.card.base, className)}>
      {/* Header */}
      <div className="mb-6">
        <h3 className={cn(styles.text.h3, 'mb-2')}>Privacy Settings</h3>
        <p className={cn(styles.text.secondary, styles.text.bodySm)}>
          Control who can see your profile and activity on MoovyZoo
        </p>
      </div>

      {/* Privacy Toggle */}
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div className="mr-4 flex-1">
            <div className="mb-2 flex items-center">
              <h4 className={cn(styles.text.h4, 'mr-2')}>Profile Visibility</h4>
              <span
                className={cn(
                  'badge',
                  profile.isPublic ? 'badge-accent' : 'badge-secondary'
                )}
              >
                {profile.isPublic ? 'Public' : 'Private'}
              </span>
            </div>
            <p
              className={cn(styles.text.secondary, styles.text.bodySm, 'mb-3')}
            >
              {profile.isPublic
                ? 'Your profile is visible to all MoovyZoo users. Others can find you in searches and see your favorite genres and activity.'
                : "Your profile is private. Only you can see your profile information, and you won't appear in public searches."}
            </p>

            {/* Privacy Implications */}
            <div className="bg-dark-bg-tertiary mb-4 rounded-lg p-4">
              <h5 className={cn(styles.text.labelMd, 'mb-2 font-medium')}>
                {profile.isPublic
                  ? 'Public Profile Includes:'
                  : 'Private Profile Means:'}
              </h5>
              <ul
                className={cn(
                  styles.text.bodySm,
                  styles.text.secondary,
                  'space-y-1'
                )}
              >
                {profile.isPublic ? (
                  <>
                    <li>• Your display name and avatar</li>
                    <li>• Your favorite movie genres</li>
                    <li>• Your earned badges and achievements</li>
                    <li>• Your participation in public chat rooms</li>
                  </>
                ) : (
                  <>
                    <li>• You won't appear in user searches</li>
                    <li>• Others can't view your profile details</li>
                    <li>• Your activity remains private</li>
                    <li>• You can still join chat rooms and watch parties</li>
                  </>
                )}
              </ul>
            </div>
          </div>

          {/* Toggle Switch */}
          <div className="flex-shrink-0">
            <button
              onClick={handleTogglePrivacy}
              disabled={isUpdatingPrivacy}
              className={cn(
                'focus:ring-offset-dark-bg-primary relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
                profile.isPublic
                  ? 'bg-primary'
                  : 'bg-dark-bg-tertiary border-dark-border-primary border',
                isUpdatingPrivacy && 'cursor-not-allowed opacity-50'
              )}
              aria-label={`Make profile ${profile.isPublic ? 'private' : 'public'}`}
            >
              <span
                className={cn(
                  'inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200',
                  profile.isPublic ? 'translate-x-6' : 'translate-x-1'
                )}
              />
              {isUpdatingPrivacy && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-3 w-3 animate-spin rounded-full border border-white border-t-transparent" />
                </div>
              )}
            </button>
          </div>
        </div>

        {/* Action Button */}
        <div className="border-dark-border-primary border-t pt-4">
          <button
            onClick={handleTogglePrivacy}
            disabled={isUpdatingPrivacy}
            className={cn(
              styles.button.outline,
              'w-full sm:w-auto',
              isUpdatingPrivacy && styles.interactive.disabled
            )}
          >
            {isUpdatingPrivacy ? (
              <>
                <div className="spinner spinner-sm mr-2" />
                Updating...
              </>
            ) : (
              <>Make Profile {profile.isPublic ? 'Private' : 'Public'}</>
            )}
          </button>
        </div>
      </div>

      {/* Success Confirmation */}
      {showConfirmation && !privacyError && (
        <div className="bg-success/10 border-success/20 animate-slide-up-fade mt-4 rounded-lg border p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg
                className="text-success h-5 w-5"
                fill="currentColor"
                viewBox="0 0 20 20"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className={cn(styles.text.bodySm, 'text-success')}>
                Privacy settings updated successfully! Changes are now in
                effect.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Error Display */}
      {privacyError && (
        <div className="bg-error/10 border-error/20 mt-4 rounded-lg border p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg
                className="text-error h-5 w-5"
                fill="currentColor"
                viewBox="0 0 20 20"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h4 className={cn(styles.text.labelMd, 'text-error font-medium')}>
                {privacyError.title}
              </h4>
              <p className={cn(styles.text.bodySm, 'text-error mt-1')}>
                {privacyError.message}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Additional Privacy Information */}
      <div className="border-dark-border-primary mt-6 border-t pt-6">
        <h4 className={cn(styles.text.h4, 'mb-3')}>Privacy Tips</h4>
        <div className="space-y-2">
          <p className={cn(styles.text.bodySm, styles.text.secondary)}>
            • You can change your privacy settings at any time
          </p>
          <p className={cn(styles.text.bodySm, styles.text.secondary)}>
            • Private profiles can still participate in chat rooms and watch
            parties
          </p>
          <p className={cn(styles.text.bodySm, styles.text.secondary)}>
            • Your privacy settings don't affect your ability to discover movies
            and content
          </p>
          <p className={cn(styles.text.bodySm, styles.text.secondary)}>
            • Making your profile public helps you connect with other movie
            lovers
          </p>
        </div>
      </div>
    </div>
  )
}
