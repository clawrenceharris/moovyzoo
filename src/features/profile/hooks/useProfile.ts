import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { profilesService } from "../domain/profiles.service";
import type {
  UserProfile,
  CreateProfileData,
  UpdateProfileData,
} from "../domain/profiles.types";

/**
 * Hook for managing user profile data with TanStack Query
 */
export function useProfile(userId: string) {
  const queryClient = useQueryClient();

  // Query for getting user profile
  const profileQuery = useQuery({
    queryKey: ["profile", userId],
    queryFn: async () => {
      return await profilesService.getProfile(userId);
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      // Don't retry if profile not found
      if (error.message.includes("not found")) {
        return false;
      }
      return failureCount < 3;
    },
  });

  // Mutation for creating profile
  const createProfileMutation = useMutation({
    mutationFn: async (data: CreateProfileData) => {
      return await profilesService.createProfile(data);
    },
    onSuccess: (data) => {
      // Update cache with new profile
      queryClient.setQueryData(["profile", data.userId], data);
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ["profiles"] });
    },
  });

  // Mutation for updating profile
  const updateProfileMutation = useMutation({
    mutationFn: async (data: UpdateProfileData) => {
      return await profilesService.updateProfile(userId, data);
    },
    onSuccess: (data) => {
      // Update cache with updated profile
      queryClient.setQueryData(["profile", userId], data);
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ["profiles"] });
    },
  });

  // Mutation for deleting profile
  const deleteProfileMutation = useMutation({
    mutationFn: async () => {
      return await profilesService.deleteProfile(userId);
    },
    onSuccess: () => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: ["profile", userId] });
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ["profiles"] });
    },
  });

  // Function to update last active
  const updateLastActive = async () => {
    if (!userId) return;

    try {
      await profilesService.updateLastActive(userId);
      // Optimistically update the cache
      queryClient.setQueryData(
        ["profile", userId],
        (old: UserProfile | undefined) => {
          if (!old) return old;
          return { ...old, lastActiveAt: new Date() };
        }
      );
    } catch (error) {
      // Silently fail for last active updates
      console.warn("Failed to update last active:", error);
    }
  };

  // Function to check if profile exists
  const checkProfileExists = async (): Promise<boolean> => {
    if (!userId) return false;

    try {
      return await profilesService.profileExists(userId);
    } catch {
      return false;
    }
  };

  return {
    // Query state
    profile: profileQuery.data,
    isLoading: profileQuery.isLoading,
    isError: profileQuery.isError,
    error: profileQuery.error,

    // Mutations
    createProfile: createProfileMutation.mutate,
    updateProfile: updateProfileMutation.mutate,
    deleteProfile: deleteProfileMutation.mutate,

    // Mutation states
    isCreating: createProfileMutation.isPending,
    isUpdating: updateProfileMutation.isPending,
    isDeleting: deleteProfileMutation.isPending,

    // Mutation errors
    createError: createProfileMutation.error,
    updateError: updateProfileMutation.error,
    deleteError: deleteProfileMutation.error,

    // Utility functions
    updateLastActive,
    checkProfileExists,

    // Query controls
    refetch: profileQuery.refetch,
    invalidate: () =>
      queryClient.invalidateQueries({ queryKey: ["profile", userId] }),
  };
}
