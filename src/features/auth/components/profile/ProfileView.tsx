'use client'

import React from 'react'
import { useProfile } from '../../hooks/useProfile'
import { useAuth } from '../../hooks/useAuth'
import { styles, cn } from '@/styles/styles'
import type { UserProfile, Badge } from '../../types'

interface ProfileViewProps {
  uid?: string
  onEdit?: () => void
  className?: string
}

interface BadgeDisplayProps {
  badges: Badge[]
  className?: string
}

function BadgeDisplay({ badges, className }: BadgeDisplayProps) {
  if (badges.length === 0) {
    return (
      <div className={cn('py-4 text-center', className)}>
        <p className="text-sm text-gray-500">No badges earned yet</p>
      </div>
    )
  }

  return (
    <div className={cn('grid grid-cols-2 gap-3 sm:grid-cols-3', className)}>
      {badges.map((badge) => (
        <div
          key={badge.id}
          className="flex flex-col items-center rounded-lg border border-gray-200 bg-gray-50 p-3"
          title={badge.description}
        >
          {badge.iconUrl ? (
            <img
              src={badge.iconUrl}
              alt={badge.name}
              className="mb-2 h-8 w-8"
            />
          ) : (
            <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-accent">
              <span className="text-xs font-bold text-white">
                {badge.name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <span className="text-center text-xs font-medium text-gray-700">
            {badge.name}
          </span>
          <span className="mt-1 text-xs text-gray-500">
            {badge.earnedAt.toLocaleDateString()}
          </span>
        </div>
      ))}
    </div>
  )
}

interface GenreListProps {
  genres: string[]
  className?: string
}

function GenreList({ genres, className }: GenreListProps) {
  if (genres.length === 0) {
    return (
      <p className={cn('text-sm text-gray-500', className)}>
        No favorite genres selected
      </p>
    )
  }

  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {genres.map((genre) => (
        <span
          key={genre}
          className="rounded-full bg-primary px-3 py-1 text-sm text-white"
        >
          {genre}
        </span>
      ))}
    </div>
  )
}

interface ProfileHeaderProps {
  profile: UserProfile
  isOwnProfile: boolean
  onEdit?: () => void
}

function ProfileHeader({ profile, isOwnProfile, onEdit }: ProfileHeaderProps) {
  return (
    <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
      {/* Avatar */}
      <div className="flex-shrink-0">
        {profile.avatarUrl ? (
          <img
            src={profile.avatarUrl}
            alt={`${profile.displayName}'s avatar`}
            className="h-20 w-20 rounded-full border-4 border-gray-200 object-cover"
            onError={(e) => {
              // Fallback to default avatar on error
              const target = e.target as HTMLImageElement
              target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                profile.displayName
              )}&size=80&background=E50914&color=fff`
            }}
          />
        ) : (
          <div className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-gray-200 bg-primary">
            <span className="text-2xl font-bold text-white">
              {profile.displayName.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
      </div>

      {/* Profile Info */}
      <div className="min-w-0 flex-1">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="truncate text-2xl font-bold text-gray-900">
              {profile.displayName}
            </h1>
            <div className="mt-1 flex items-center gap-2">
              <span
                className={cn(
                  'inline-flex items-center rounded-full px-2 py-1 text-xs font-medium',
                  profile.isPublic
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                )}
              >
                {profile.isPublic ? 'Public Profile' : 'Private Profile'}
              </span>
              <span className="text-sm text-gray-500">
                Member since {profile.createdAt.toLocaleDateString()}
              </span>
            </div>
          </div>

          {/* Edit Button */}
          {isOwnProfile && onEdit && (
            <button onClick={onEdit} className="btn btn-outline flex-shrink-0">
              Edit Profile
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

interface PrivateProfileMessageProps {
  isOwnProfile: boolean
  profileOwnerName: string
}

function PrivateProfileMessage({
  isOwnProfile,
  profileOwnerName,
}: PrivateProfileMessageProps) {
  return (
    <div className="py-12 text-center">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
        <svg
          className="h-8 w-8 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
          />
        </svg>
      </div>
      <h3 className="mb-2 text-lg font-medium text-gray-900">
        {isOwnProfile ? 'Your Profile is Private' : 'Private Profile'}
      </h3>
      <p className="mx-auto max-w-md text-gray-600">
        {isOwnProfile
          ? 'Your profile is set to private. Only you can see your profile information. You can change this in your privacy settings.'
          : `${profileOwnerName}'s profile is private and cannot be viewed by other users.`}
      </p>
    </div>
  )
}

export function ProfileView({ uid, onEdit, className }: ProfileViewProps) {
  const { user } = useAuth()
  const { profile, isLoading, error, isOwnProfile } = useProfile(uid)

  // Loading state
  if (isLoading) {
    return (
      <div className={cn(styles.card, className)}>
        <div className="animate-pulse">
          {/* Header skeleton */}
          <div className="mb-6 flex items-center gap-4">
            <div className="h-20 w-20 rounded-full bg-gray-200" />
            <div className="flex-1">
              <div className="mb-2 h-6 w-48 rounded bg-gray-200" />
              <div className="h-4 w-32 rounded bg-gray-200" />
            </div>
          </div>

          {/* Content skeleton */}
          <div className="space-y-6">
            <div>
              <div className="mb-3 h-5 w-32 rounded bg-gray-200" />
              <div className="flex gap-2">
                <div className="h-6 w-16 rounded bg-gray-200" />
                <div className="h-6 w-20 rounded bg-gray-200" />
                <div className="w-18 h-6 rounded bg-gray-200" />
              </div>
            </div>
            <div>
              <div className="mb-3 h-5 w-24 rounded bg-gray-200" />
              <div className="grid grid-cols-3 gap-3">
                <div className="h-20 rounded bg-gray-200" />
                <div className="h-20 rounded bg-gray-200" />
                <div className="h-20 rounded bg-gray-200" />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className={cn(styles.card, className)}>
        <div className="py-12 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <svg
              className="h-8 w-8 text-red-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h3 className="mb-2 text-lg font-medium text-gray-900">
            {error.title}
          </h3>
          <p className="text-gray-600">{error.message}</p>
        </div>
      </div>
    )
  }

  // No profile found
  if (!profile) {
    return (
      <div className={cn(styles.card, className)}>
        <div className="py-12 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
            <svg
              className="h-8 w-8 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
          <h3 className="mb-2 text-lg font-medium text-gray-900">
            Profile Not Found
          </h3>
          <p className="text-gray-600">
            The requested profile could not be found or does not exist.
          </p>
        </div>
      </div>
    )
  }

  // Private profile check
  if (!profile.isPublic && !isOwnProfile) {
    return (
      <div className={cn(styles.card, className)}>
        <PrivateProfileMessage
          isOwnProfile={isOwnProfile}
          profileOwnerName={profile.displayName}
        />
      </div>
    )
  }

  // Render full profile
  return (
    <div className={cn(styles.card, className)}>
      {/* Profile Header */}
      <ProfileHeader
        profile={profile}
        isOwnProfile={isOwnProfile}
        onEdit={onEdit}
      />

      {/* Profile Content */}
      <div className="mt-8 space-y-8">
        {/* Favorite Genres */}
        <section>
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Favorite Genres
          </h2>
          <GenreList genres={profile.favoriteGenres} />
        </section>

        {/* Badges */}
        <section>
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Badges ({profile.badges.length})
          </h2>
          <BadgeDisplay badges={profile.badges} />
        </section>

        {/* Profile Stats */}
        <section>
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Profile Stats
          </h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-lg bg-gray-50 p-4 text-center">
              <div className="text-2xl font-bold text-primary">
                {profile.favoriteGenres.length}
              </div>
              <div className="text-sm text-gray-600">Favorite Genres</div>
            </div>
            <div className="rounded-lg bg-gray-50 p-4 text-center">
              <div className="text-2xl font-bold text-primary">
                {profile.badges.length}
              </div>
              <div className="text-sm text-gray-600">Badges Earned</div>
            </div>
            <div className="rounded-lg bg-gray-50 p-4 text-center">
              <div className="text-2xl font-bold text-primary">
                {Math.floor(
                  (Date.now() - profile.createdAt.getTime()) /
                    (1000 * 60 * 60 * 24)
                )}
              </div>
              <div className="text-sm text-gray-600">Days Active</div>
            </div>
            <div className="rounded-lg bg-gray-50 p-4 text-center">
              <div className="text-2xl font-bold text-primary">
                {profile.isPublic ? 'Public' : 'Private'}
              </div>
              <div className="text-sm text-gray-600">Profile Status</div>
            </div>
          </div>
        </section>

        {/* Private profile notice for own profile */}
        {!profile.isPublic && isOwnProfile && (
          <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
            <div className="flex items-start">
              <svg
                className="mr-3 mt-0.5 h-5 w-5 flex-shrink-0 text-yellow-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <div>
                <h3 className="text-sm font-medium text-yellow-800">
                  Private Profile
                </h3>
                <p className="mt-1 text-sm text-yellow-700">
                  Your profile is currently private. Other users cannot view
                  your profile information. You can change this in your privacy
                  settings.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
