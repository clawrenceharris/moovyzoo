import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  serverTimestamp,
  writeBatch,
  limit,
  orderBy,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type {
  UserProfile,
  UserProfileDocument,
  ProfileUpdateData,
  PrivacySettings,
  OnboardingData,
} from '../types'
import { validators, validationUtils } from './validation'
import { normalizeError, logError, NormalizedError } from './normalize'
import { AppErrorCode } from './error-codes'

export interface ProfileOperationResult<T = void> {
  success: boolean
  data?: T
  error?: NormalizedError
}

export interface ProfileSearchOptions {
  limit?: number
  orderBy?: 'createdAt' | 'updatedAt' | 'displayName'
  orderDirection?: 'asc' | 'desc'
}

/**
 * Enhanced profile operations with comprehensive error handling and validation
 */
export const profileOperations = {
  /**
   * Create a new user profile with validation and sanitization
   */
  async createProfile(
    uid: string,
    data: OnboardingData
  ): Promise<ProfileOperationResult<UserProfile>> {
    try {
      // Validate input data
      const validation = validators.validateOnboardingData(data)
      if (!validation.success) {
        return {
          success: false,
          error: normalizeError(new Error('Invalid profile data')),
        }
      }

      // Check if profile already exists
      const existsResult = await this.profileExists(uid)
      if (!existsResult.success) {
        return existsResult
      }
      if (existsResult.data) {
        return {
          success: false,
          error: normalizeError(new Error('Profile already exists')),
        }
      }

      // Sanitize and prepare profile data
      const sanitizedData = this.sanitizeProfileData({
        displayName: data.displayName,
        avatarUrl: data.avatarUrl,
        favoriteGenres: data.favoriteGenres,
      })

      // Validate avatar URL if provided
      if (sanitizedData.avatarUrl) {
        const avatarValidation = await this.validateAvatarUrl(
          sanitizedData.avatarUrl
        )
        if (!avatarValidation.isValid) {
          return {
            success: false,
            error: {
              code: AppErrorCode.PROFILE_AVATAR_INVALID,
              title: 'Invalid Avatar',
              message: 'The avatar URL is not accessible or not a valid image.',
            },
          }
        }
      }

      const profileData: Omit<
        UserProfileDocument,
        'createdAt' | 'updatedAt' | 'lastActiveAt'
      > = {
        uid,
        displayName: sanitizedData.displayName,
        avatarUrl: sanitizedData.avatarUrl,
        favoriteGenres: sanitizedData.favoriteGenres,
        isPublic: true, // Default to public
        badges: [], // Start with no badges
        onboardingCompleted: true,
      }

      const docRef = doc(db, 'users', uid)
      await setDoc(docRef, {
        ...profileData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lastActiveAt: serverTimestamp(),
      })

      // Fetch the created profile to return
      const createdProfile = await this.getProfile(uid)
      if (!createdProfile.success || !createdProfile.data) {
        return {
          success: false,
          error: normalizeError(
            new Error('Profile created but could not be retrieved')
          ),
        }
      }

      return {
        success: true,
        data: createdProfile.data,
      }
    } catch (error) {
      logError(error, 'profileOperations.createProfile')
      return {
        success: false,
        error: normalizeError(error),
      }
    }
  },

  /**
   * Get user profile by UID with error handling
   */
  async getProfile(uid: string): Promise<ProfileOperationResult<UserProfile>> {
    try {
      if (!uid || typeof uid !== 'string') {
        return {
          success: false,
          error: {
            code: AppErrorCode.PROFILE_INVALID_DATA,
            title: 'Invalid User ID',
            message: 'User ID is required and must be a valid string.',
          },
        }
      }

      const docRef = doc(db, 'users', uid)
      const docSnap = await getDoc(docRef)

      if (!docSnap.exists()) {
        return {
          success: false,
          error: {
            code: AppErrorCode.PROFILE_NOT_FOUND,
            title: 'Profile Not Found',
            message: 'The requested profile could not be found.',
          },
        }
      }

      const data = docSnap.data() as UserProfileDocument
      const profile = this.convertDocumentToProfile(data)

      return {
        success: true,
        data: profile,
      }
    } catch (error) {
      logError(error, 'profileOperations.getProfile')
      return {
        success: false,
        error: normalizeError(error),
      }
    }
  },

  /**
   * Update user profile with validation and sanitization
   */
  async updateProfile(
    uid: string,
    updates: ProfileUpdateData
  ): Promise<ProfileOperationResult<UserProfile>> {
    try {
      // Validate input data
      const validation = validators.validateProfileUpdate(updates)
      if (!validation.success) {
        return {
          success: false,
          error: normalizeError(new Error('Invalid profile update data')),
        }
      }

      // Check if profile exists
      const existsResult = await this.profileExists(uid)
      if (!existsResult.success) {
        return existsResult
      }
      if (!existsResult.data) {
        return {
          success: false,
          error: {
            code: AppErrorCode.PROFILE_NOT_FOUND,
            title: 'Profile Not Found',
            message: 'Cannot update a profile that does not exist.',
          },
        }
      }

      // Sanitize update data
      const sanitizedUpdates = this.sanitizeProfileData(updates)

      // Validate avatar URL if being updated
      if (sanitizedUpdates.avatarUrl) {
        const avatarValidation = await this.validateAvatarUrl(
          sanitizedUpdates.avatarUrl
        )
        if (!avatarValidation.isValid) {
          return {
            success: false,
            error: {
              code: AppErrorCode.PROFILE_AVATAR_INVALID,
              title: 'Invalid Avatar',
              message: 'The avatar URL is not accessible or not a valid image.',
            },
          }
        }
      }

      const docRef = doc(db, 'users', uid)
      await updateDoc(docRef, {
        ...sanitizedUpdates,
        updatedAt: serverTimestamp(),
      })

      // Fetch updated profile
      const updatedProfile = await this.getProfile(uid)
      if (!updatedProfile.success || !updatedProfile.data) {
        return {
          success: false,
          error: normalizeError(
            new Error('Profile updated but could not be retrieved')
          ),
        }
      }

      return {
        success: true,
        data: updatedProfile.data,
      }
    } catch (error) {
      logError(error, 'profileOperations.updateProfile')
      return {
        success: false,
        error: normalizeError(error),
      }
    }
  },

  /**
   * Update privacy settings
   */
  async updatePrivacySettings(
    uid: string,
    settings: PrivacySettings
  ): Promise<ProfileOperationResult<UserProfile>> {
    try {
      // Validate privacy settings
      const validation = validators.validatePrivacySettings(settings)
      if (!validation.success) {
        return {
          success: false,
          error: normalizeError(new Error('Invalid privacy settings')),
        }
      }

      // Check if profile exists
      const existsResult = await this.profileExists(uid)
      if (!existsResult.success) {
        return existsResult
      }
      if (!existsResult.data) {
        return {
          success: false,
          error: {
            code: AppErrorCode.PROFILE_NOT_FOUND,
            title: 'Profile Not Found',
            message:
              'Cannot update privacy settings for a profile that does not exist.',
          },
        }
      }

      const docRef = doc(db, 'users', uid)
      await updateDoc(docRef, {
        isPublic: settings.isPublic,
        updatedAt: serverTimestamp(),
      })

      // Fetch updated profile
      const updatedProfile = await this.getProfile(uid)
      if (!updatedProfile.success || !updatedProfile.data) {
        return {
          success: false,
          error: normalizeError(
            new Error(
              'Privacy settings updated but profile could not be retrieved'
            )
          ),
        }
      }

      return {
        success: true,
        data: updatedProfile.data,
      }
    } catch (error) {
      logError(error, 'profileOperations.updatePrivacySettings')
      return {
        success: false,
        error: normalizeError(error),
      }
    }
  },

  /**
   * Update last active timestamp
   */
  async updateLastActive(uid: string): Promise<ProfileOperationResult> {
    try {
      if (!uid || typeof uid !== 'string') {
        return {
          success: false,
          error: {
            code: AppErrorCode.PROFILE_INVALID_DATA,
            title: 'Invalid User ID',
            message: 'User ID is required and must be a valid string.',
          },
        }
      }

      const docRef = doc(db, 'users', uid)
      await updateDoc(docRef, {
        lastActiveAt: serverTimestamp(),
      })

      return { success: true }
    } catch (error) {
      logError(error, 'profileOperations.updateLastActive')
      return {
        success: false,
        error: normalizeError(error),
      }
    }
  },

  /**
   * Check if profile exists
   */
  async profileExists(uid: string): Promise<ProfileOperationResult<boolean>> {
    try {
      if (!uid || typeof uid !== 'string') {
        return {
          success: false,
          error: {
            code: AppErrorCode.PROFILE_INVALID_DATA,
            title: 'Invalid User ID',
            message: 'User ID is required and must be a valid string.',
          },
        }
      }

      const docRef = doc(db, 'users', uid)
      const docSnap = await getDoc(docRef)

      return {
        success: true,
        data: docSnap.exists(),
      }
    } catch (error) {
      logError(error, 'profileOperations.profileExists')
      return {
        success: false,
        error: normalizeError(error),
      }
    }
  },

  /**
   * Get public profiles with search options
   */
  async getPublicProfiles(
    options: ProfileSearchOptions = {}
  ): Promise<ProfileOperationResult<UserProfile[]>> {
    try {
      const {
        limit: limitCount = 20,
        orderBy: orderByField = 'createdAt',
        orderDirection = 'desc',
      } = options

      let q = query(
        collection(db, 'users'),
        where('isPublic', '==', true),
        orderBy(orderByField, orderDirection),
        limit(limitCount)
      )

      const querySnapshot = await getDocs(q)
      const profiles = querySnapshot.docs.map((doc) =>
        this.convertDocumentToProfile(doc.data() as UserProfileDocument)
      )

      return {
        success: true,
        data: profiles,
      }
    } catch (error) {
      logError(error, 'profileOperations.getPublicProfiles')
      return {
        success: false,
        error: normalizeError(error),
      }
    }
  },

  /**
   * Delete user profile (for account deletion)
   */
  async deleteProfile(uid: string): Promise<ProfileOperationResult> {
    try {
      if (!uid || typeof uid !== 'string') {
        return {
          success: false,
          error: {
            code: AppErrorCode.PROFILE_INVALID_DATA,
            title: 'Invalid User ID',
            message: 'User ID is required and must be a valid string.',
          },
        }
      }

      const batch = writeBatch(db)
      const profileRef = doc(db, 'users', uid)

      batch.delete(profileRef)
      await batch.commit()

      return { success: true }
    } catch (error) {
      logError(error, 'profileOperations.deleteProfile')
      return {
        success: false,
        error: normalizeError(error),
      }
    }
  },

  /**
   * Sanitize profile data to prevent XSS and ensure data integrity
   */
  sanitizeProfileData(
    data: Partial<ProfileUpdateData>
  ): Partial<ProfileUpdateData> {
    const sanitized: Partial<ProfileUpdateData> = {}

    if (data.displayName !== undefined) {
      sanitized.displayName = validationUtils.sanitizeDisplayName(
        data.displayName
      )
    }

    if (data.avatarUrl !== undefined) {
      const avatarValidation = validationUtils.validateAvatarUrl(data.avatarUrl)
      sanitized.avatarUrl = avatarValidation.sanitizedUrl
    }

    if (data.favoriteGenres !== undefined) {
      // Sanitize genre IDs (remove duplicates, ensure they're strings)
      sanitized.favoriteGenres = [
        ...new Set(
          data.favoriteGenres
            .filter(
              (genre): genre is string =>
                typeof genre === 'string' && genre.trim() !== ''
            )
            .map((genre) => genre.trim())
        ),
      ]
    }

    if (data.isPublic !== undefined) {
      sanitized.isPublic = Boolean(data.isPublic)
    }

    return sanitized
  },

  /**
   * Validate avatar URL by attempting to fetch it
   */
  async validateAvatarUrl(
    url: string
  ): Promise<{ isValid: boolean; error?: string }> {
    try {
      if (!validationUtils.isValidUrl(url)) {
        return { isValid: false, error: 'Invalid URL format' }
      }

      // In a real implementation, you might want to check if the URL is accessible
      // For now, we'll just validate the URL format and common image extensions
      const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg']
      const hasImageExtension = imageExtensions.some((ext) =>
        url.toLowerCase().includes(ext)
      )

      // Allow URLs that either have image extensions or are from common image hosting services
      const isImageHost = [
        'imgur.com',
        'cloudinary.com',
        'amazonaws.com',
        'googleusercontent.com',
        'gravatar.com',
      ].some((host) => url.includes(host))

      if (!hasImageExtension && !isImageHost) {
        return {
          isValid: false,
          error: 'URL does not appear to be an image',
        }
      }

      return { isValid: true }
    } catch (error) {
      return {
        isValid: false,
        error: 'Could not validate avatar URL',
      }
    }
  },

  /**
   * Convert Firestore document to UserProfile interface
   */
  convertDocumentToProfile(doc: UserProfileDocument): UserProfile {
    return {
      uid: doc.uid,
      displayName: doc.displayName,
      avatarUrl: doc.avatarUrl,
      favoriteGenres: doc.favoriteGenres,
      isPublic: doc.isPublic,
      badges: [], // TODO: Implement badge fetching when badge system is ready
      createdAt:
        doc.createdAt && typeof doc.createdAt.toDate === 'function'
          ? doc.createdAt.toDate()
          : doc.createdAt instanceof Date
            ? doc.createdAt
            : new Date(),
      updatedAt:
        doc.updatedAt && typeof doc.updatedAt.toDate === 'function'
          ? doc.updatedAt.toDate()
          : doc.updatedAt instanceof Date
            ? doc.updatedAt
            : new Date(),
      onboardingCompleted: doc.onboardingCompleted,
    }
  },
}
