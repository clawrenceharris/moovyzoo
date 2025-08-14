'use client'

import React, { useState, useEffect } from 'react'
import { useProfile } from '../../hooks/useProfile'
import { genreUtils } from '../../utils/firebase'
import { fieldValidators } from '../../utils/validation'
import { styles, cn } from '@/styles/styles'
import type { ProfileUpdateData, Genre } from '../../types'

interface ProfileFormProps {
  onSuccess?: () => void
  onCancel?: () => void
  className?: string
}

export function ProfileForm({
  onSuccess,
  onCancel,
  className,
}: ProfileFormProps) {
  const { profile, updateProfile, isUpdating, updateError } = useProfile()

  // Form state
  const [formData, setFormData] = useState<ProfileUpdateData>({
    displayName: '',
    avatarUrl: '',
    favoriteGenres: [],
    isPublic: true,
  })

  // UI state
  const [genres, setGenres] = useState<Genre[]>([])
  const [genreSearch, setGenreSearch] = useState('')
  const [isLoadingGenres, setIsLoadingGenres] = useState(false)
  const [avatarPreviewError, setAvatarPreviewError] = useState<string | null>(
    null
  )
  const [fieldErrors, setFieldErrors] = useState<Record<string, string | null>>(
    {}
  )
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)

  // Initialize form data when profile loads
  useEffect(() => {
    if (profile) {
      setFormData({
        displayName: profile.displayName || '',
        avatarUrl: profile.avatarUrl || '',
        favoriteGenres: profile.favoriteGenres || [],
        isPublic: profile.isPublic,
      })
    }
  }, [profile])

  // Load genres on component mount
  useEffect(() => {
    const loadGenres = async () => {
      setIsLoadingGenres(true)
      try {
        const fetchedGenres = await genreUtils.getGenres()
        setGenres(fetchedGenres)
      } catch (error) {
        console.error('Failed to load genres:', error)
      } finally {
        setIsLoadingGenres(false)
      }
    }

    loadGenres()
  }, [])

  // Filter genres based on search
  const filteredGenres = genres.filter((genre) =>
    genre.name.toLowerCase().includes(genreSearch.toLowerCase())
  )

  // Handle form field changes
  const handleFieldChange = (field: keyof ProfileUpdateData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))

    // Clear field error when user starts typing
    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: null }))
    }

    // Real-time validation
    let error: string | null = null
    switch (field) {
      case 'displayName':
        error = fieldValidators.validateDisplayNameField(value)
        break
      case 'avatarUrl':
        error = fieldValidators.validateAvatarUrlField(value)
        setAvatarPreviewError(error)
        break
    }

    if (error) {
      setFieldErrors((prev) => ({ ...prev, [field]: error }))
    }
  }

  // Handle genre selection
  const handleGenreToggle = (genreId: string) => {
    const currentGenres = formData.favoriteGenres || []
    const isSelected = currentGenres.includes(genreId)

    let newGenres: string[]
    if (isSelected) {
      newGenres = currentGenres.filter((id) => id !== genreId)
    } else {
      if (currentGenres.length >= 10) {
        setFieldErrors((prev) => ({
          ...prev,
          favoriteGenres: 'You can select up to 10 favorite genres',
        }))
        return
      }
      newGenres = [...currentGenres, genreId]
    }

    handleFieldChange('favoriteGenres', newGenres)

    // Clear genre error if at least one is selected
    if (newGenres.length > 0 && fieldErrors.favoriteGenres) {
      setFieldErrors((prev) => ({ ...prev, favoriteGenres: null }))
    }
  }

  // Validate form before submission
  const validateForm = (): boolean => {
    const errors: Record<string, string | null> = {}

    // Validate display name
    const displayNameError = fieldValidators.validateDisplayNameField(
      formData.displayName || ''
    )
    if (displayNameError) {
      errors.displayName = displayNameError
    }

    // Validate avatar URL if provided
    if (formData.avatarUrl) {
      const avatarError = fieldValidators.validateAvatarUrlField(
        formData.avatarUrl
      )
      if (avatarError) {
        errors.avatarUrl = avatarError
      }
    }

    // Validate favorite genres
    if (!formData.favoriteGenres || formData.favoriteGenres.length === 0) {
      errors.favoriteGenres = 'Please select at least one favorite genre'
    }

    setFieldErrors(errors)
    return Object.values(errors).every((error) => error === null)
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    try {
      await updateProfile(formData)
      setShowSuccessMessage(true)
      setTimeout(() => setShowSuccessMessage(false), 3000)
      onSuccess?.()
    } catch (error) {
      // Error is handled by the hook
    }
  }

  // Handle avatar image load error
  const handleAvatarError = () => {
    setAvatarPreviewError('Could not load image from this URL')
  }

  if (!profile) {
    return (
      <div className={cn(styles.card, className)}>
        <div className="flex items-center justify-center py-8">
          <div className={styles.spinner} />
          <span className="ml-2 text-gray-600">Loading profile...</span>
        </div>
      </div>
    )
  }

  return (
    <div className={cn(styles.card, className)}>
      <div className={styles.cardHeader}>
        <h2 className="text-xl font-semibold text-gray-900">Edit Profile</h2>
        <p className="mt-1 text-sm text-gray-600">
          Update your profile information and preferences
        </p>
      </div>

      {showSuccessMessage && (
        <div className="mb-4 rounded-xl border border-green-200 bg-green-50 p-3">
          <p className="text-sm text-green-800">
            Profile updated successfully!
          </p>
        </div>
      )}

      {updateError && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3">
          <p className="text-sm text-red-800">{updateError.message}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Display Name */}
        <div>
          <label htmlFor="displayName" className={styles.label}>
            Display Name *
          </label>
          <input
            id="displayName"
            type="text"
            value={formData.displayName || ''}
            onChange={(e) => handleFieldChange('displayName', e.target.value)}
            className={cn(
              styles.input,
              fieldErrors.displayName && styles.inputError
            )}
            placeholder="Enter your display name"
            maxLength={50}
          />
          {fieldErrors.displayName && (
            <p className={styles.errorText}>{fieldErrors.displayName}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            {(formData.displayName || '').length}/50 characters
          </p>
        </div>

        {/* Avatar URL */}
        <div>
          <label htmlFor="avatarUrl" className={styles.label}>
            Avatar URL
          </label>
          <input
            id="avatarUrl"
            type="url"
            value={formData.avatarUrl || ''}
            onChange={(e) => handleFieldChange('avatarUrl', e.target.value)}
            className={cn(
              styles.input,
              fieldErrors.avatarUrl && styles.inputError
            )}
            placeholder="https://example.com/your-avatar.jpg"
          />
          {fieldErrors.avatarUrl && (
            <p className={styles.errorText}>{fieldErrors.avatarUrl}</p>
          )}

          {/* Avatar Preview */}
          {formData.avatarUrl && !avatarPreviewError && (
            <div className="mt-3">
              <p className="mb-2 text-sm text-gray-600">Preview:</p>
              <img
                src={formData.avatarUrl}
                alt="Avatar preview"
                className="h-16 w-16 rounded-full border-2 border-gray-200 object-cover"
                onError={handleAvatarError}
              />
            </div>
          )}

          {avatarPreviewError && (
            <p className="mt-1 text-sm text-orange-600">{avatarPreviewError}</p>
          )}
        </div>

        {/* Favorite Genres */}
        <div>
          <label className={styles.label}>
            Favorite Genres * ({(formData.favoriteGenres || []).length}/10)
          </label>

          {/* Genre Search */}
          <div className="mb-3">
            <input
              type="text"
              value={genreSearch}
              onChange={(e) => setGenreSearch(e.target.value)}
              className={styles.input}
              placeholder="Search genres..."
            />
          </div>

          {/* Genre Selection */}
          <div className="max-h-48 overflow-y-auto rounded-xl border border-gray-200 p-3">
            {isLoadingGenres ? (
              <div className="flex items-center justify-center py-4">
                <div className={styles.spinner} />
                <span className="ml-2 text-gray-600">Loading genres...</span>
              </div>
            ) : filteredGenres.length === 0 ? (
              <p className="py-4 text-center text-gray-500">
                {genreSearch
                  ? 'No genres found matching your search'
                  : 'No genres available'}
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {filteredGenres.map((genre) => {
                  const isSelected = (formData.favoriteGenres || []).includes(
                    genre.id
                  )
                  return (
                    <button
                      key={genre.id}
                      type="button"
                      onClick={() => handleGenreToggle(genre.id)}
                      className={cn(
                        'rounded-lg border p-2 text-left text-sm transition-colors',
                        isSelected
                          ? 'border-primary bg-primary text-white'
                          : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                      )}
                    >
                      {genre.name}
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {fieldErrors.favoriteGenres && (
            <p className={styles.errorText}>{fieldErrors.favoriteGenres}</p>
          )}
        </div>

        {/* Privacy Settings */}
        <div>
          <label className={styles.label}>Privacy Settings</label>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="radio"
                name="privacy"
                checked={formData.isPublic === true}
                onChange={() => handleFieldChange('isPublic', true)}
                className="mr-2 text-primary focus:ring-primary"
              />
              <span className="text-sm">
                <strong>Public</strong> - Your profile is visible to other users
              </span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="privacy"
                checked={formData.isPublic === false}
                onChange={() => handleFieldChange('isPublic', false)}
                className="mr-2 text-primary focus:ring-primary"
              />
              <span className="text-sm">
                <strong>Private</strong> - Your profile is only visible to you
              </span>
            </label>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex flex-col gap-3 border-t border-gray-200 pt-4 sm:flex-row">
          <button
            type="submit"
            disabled={isUpdating}
            className={cn(
              'btn btn-primary flex-1 sm:flex-none',
              isUpdating && 'cursor-not-allowed opacity-50'
            )}
          >
            {isUpdating ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </button>

          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={isUpdating}
              className="btn btn-outline flex-1 sm:flex-none"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  )
}
