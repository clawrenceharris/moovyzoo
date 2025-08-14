import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from './useAuth'
import { profileOperations } from '../utils/profile-operations'
import type {
  UserProfile,
  ProfileUpdateData,
  PrivacySettings,
  OnboardingData,
} from '../types'
import type { NormalizedError } from '../utils/normalize'

// Query keys for profile-related queries
export const profileQueryKeys = {
  all: ['profiles'] as const,
  profile: (uid: string) => [...profileQueryKeys.all, 'profile', uid] as const,
  publicProfiles: (options?: any) =>
    [...profileQueryKeys.all, 'public', options] as const,
}

/**
 * Hook for managing user profile data with TanStack Query
 */
export function useProfile(uid?: string) {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  // Use provided uid or current user's uid
  const targetUid = uid || user?.uid

  // Query for getting profile data
  const {
    data: profile,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: profileQueryKeys.profile(targetUid || ''),
    queryFn: async () => {
      if (!targetUid) {
        throw new Error('No user ID provided')
      }

      const result = await profileOperations.getProfile(targetUid)
      if (!result.success) {
        throw result.error
      }
      return result.data
    },
    enabled: !!targetUid,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })

  // Mutation for creating profile
  const createProfileMutation = useMutation({
    mutationFn: async (data: OnboardingData) => {
      if (!user?.uid) {
        throw new Error('User must be authenticated to create profile')
      }

      const result = await profileOperations.createProfile(user.uid, data)
      if (!result.success) {
        throw result.error
      }
      return result.data
    },
    onSuccess: (data) => {
      // Update the profile query cache
      if (data && user?.uid) {
        queryClient.setQueryData(profileQueryKeys.profile(user.uid), data)
      }
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: profileQueryKeys.all })
    },
  })

  // Mutation for updating profile with optimistic updates
  const updateProfileMutation = useMutation({
    mutationFn: async (updates: ProfileUpdateData) => {
      if (!targetUid) {
        throw new Error('No user ID provided for profile update')
      }

      const result = await profileOperations.updateProfile(targetUid, updates)
      if (!result.success) {
        throw result.error
      }
      return result.data
    },
    onMutate: async (updates) => {
      if (!targetUid) return

      // Cancel outgoing refetches
      await queryClient.cancelQueries({
        queryKey: profileQueryKeys.profile(targetUid),
      })

      // Snapshot the previous value
      const previousProfile = queryClient.getQueryData<UserProfile>(
        profileQueryKeys.profile(targetUid)
      )

      // Optimistically update the cache
      if (previousProfile) {
        const optimisticProfile: UserProfile = {
          ...previousProfile,
          ...updates,
          updatedAt: new Date(),
        }
        queryClient.setQueryData(
          profileQueryKeys.profile(targetUid),
          optimisticProfile
        )
      }

      return { previousProfile }
    },
    onError: (error, updates, context) => {
      // Rollback on error
      if (context?.previousProfile && targetUid) {
        queryClient.setQueryData(
          profileQueryKeys.profile(targetUid),
          context.previousProfile
        )
      }
    },
    onSuccess: (data) => {
      // Update with server response
      if (data && targetUid) {
        queryClient.setQueryData(profileQueryKeys.profile(targetUid), data)
      }
    },
    onSettled: () => {
      // Always refetch after mutation settles
      if (targetUid) {
        queryClient.invalidateQueries({
          queryKey: profileQueryKeys.profile(targetUid),
        })
      }
    },
  })

  // Mutation for updating privacy settings
  const updatePrivacyMutation = useMutation({
    mutationFn: async (settings: PrivacySettings) => {
      if (!targetUid) {
        throw new Error('No user ID provided for privacy update')
      }

      const result = await profileOperations.updatePrivacySettings(
        targetUid,
        settings
      )
      if (!result.success) {
        throw result.error
      }
      return result.data
    },
    onMutate: async (settings) => {
      if (!targetUid) return

      await queryClient.cancelQueries({
        queryKey: profileQueryKeys.profile(targetUid),
      })

      const previousProfile = queryClient.getQueryData<UserProfile>(
        profileQueryKeys.profile(targetUid)
      )

      if (previousProfile) {
        const optimisticProfile: UserProfile = {
          ...previousProfile,
          isPublic: settings.isPublic,
          updatedAt: new Date(),
        }
        queryClient.setQueryData(
          profileQueryKeys.profile(targetUid),
          optimisticProfile
        )
      }

      return { previousProfile }
    },
    onError: (error, settings, context) => {
      if (context?.previousProfile && targetUid) {
        queryClient.setQueryData(
          profileQueryKeys.profile(targetUid),
          context.previousProfile
        )
      }
    },
    onSuccess: (data) => {
      if (data && targetUid) {
        queryClient.setQueryData(profileQueryKeys.profile(targetUid), data)
      }
      // Invalidate public profiles cache since visibility changed
      queryClient.invalidateQueries({
        queryKey: profileQueryKeys.publicProfiles(),
      })
    },
  })

  // Mutation for updating last active timestamp
  const updateLastActiveMutation = useMutation({
    mutationFn: async () => {
      if (!user?.uid) {
        throw new Error('User must be authenticated to update last active')
      }

      const result = await profileOperations.updateLastActive(user.uid)
      if (!result.success) {
        throw result.error
      }
    },
    // Don't update cache for last active - it's not critical for UI
  })

  return {
    // Profile data
    profile,
    isLoading,
    error: error as NormalizedError | null,

    // Profile operations
    refetch,
    createProfile: createProfileMutation.mutate,
    updateProfile: updateProfileMutation.mutate,
    updatePrivacySettings: updatePrivacyMutation.mutate,
    updateLastActive: updateLastActiveMutation.mutate,

    // Mutation states
    isCreating: createProfileMutation.isPending,
    isUpdating: updateProfileMutation.isPending,
    isUpdatingPrivacy: updatePrivacyMutation.isPending,
    isUpdatingLastActive: updateLastActiveMutation.isPending,

    // Mutation errors
    createError: createProfileMutation.error as NormalizedError | null,
    updateError: updateProfileMutation.error as NormalizedError | null,
    privacyError: updatePrivacyMutation.error as NormalizedError | null,
    lastActiveError: updateLastActiveMutation.error as NormalizedError | null,

    // Helper methods
    isOwnProfile: targetUid === user?.uid,
    hasProfile: !!profile,
  }
}

/**
 * Hook for managing public profiles list
 */
export function usePublicProfiles(options?: {
  limit?: number
  orderBy?: 'createdAt' | 'updatedAt' | 'displayName'
  orderDirection?: 'asc' | 'desc'
}) {
  const {
    data: profiles,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: profileQueryKeys.publicProfiles(options),
    queryFn: async () => {
      const result = await profileOperations.getPublicProfiles(options)
      if (!result.success) {
        throw result.error
      }
      return result.data || []
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  })

  return {
    profiles: profiles || [],
    isLoading,
    error: error as NormalizedError | null,
    refetch,
  }
}

/**
 * Hook for checking if a profile exists
 */
export function useProfileExists(uid?: string) {
  const { user } = useAuth()
  const targetUid = uid || user?.uid

  const {
    data: exists,
    isLoading,
    error,
  } = useQuery({
    queryKey: [...profileQueryKeys.all, 'exists', targetUid],
    queryFn: async () => {
      if (!targetUid) {
        throw new Error('No user ID provided')
      }

      const result = await profileOperations.profileExists(targetUid)
      if (!result.success) {
        throw result.error
      }
      return result.data
    },
    enabled: !!targetUid,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 60 * 1000, // 1 minute
  })

  return {
    exists: exists ?? false,
    isLoading,
    error: error as NormalizedError | null,
  }
}

/**
 * Hook for prefetching profile data
 */
export function usePrefetchProfile() {
  const queryClient = useQueryClient()

  const prefetchProfile = async (uid: string) => {
    await queryClient.prefetchQuery({
      queryKey: profileQueryKeys.profile(uid),
      queryFn: async () => {
        const result = await profileOperations.getProfile(uid)
        if (!result.success) {
          throw result.error
        }
        return result.data
      },
      staleTime: 5 * 60 * 1000,
    })
  }

  return { prefetchProfile }
}

/**
 * Hook for invalidating profile queries
 */
export function useInvalidateProfile() {
  const queryClient = useQueryClient()

  const invalidateProfile = (uid?: string) => {
    if (uid) {
      queryClient.invalidateQueries({ queryKey: profileQueryKeys.profile(uid) })
    } else {
      queryClient.invalidateQueries({ queryKey: profileQueryKeys.all })
    }
  }

  const invalidatePublicProfiles = () => {
    queryClient.invalidateQueries({
      queryKey: profileQueryKeys.publicProfiles(),
    })
  }

  return {
    invalidateProfile,
    invalidatePublicProfiles,
  }
}
