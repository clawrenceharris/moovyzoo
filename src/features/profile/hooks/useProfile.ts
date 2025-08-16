import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { profilesService } from "../domain/profiles.service";
import { errorMap } from "../../../utils/error-map";
import type {
  UserProfile,
  CreateProfileData,
  UpdateProfileData,
} from "../domain/profiles.types";

/**
 * Hook for managing user profile data with TanStack Query
 */
export function useProfile(userId?: string) {
  const queryClient = useQueryClient();

  // Query for getting user profile
  const profileQuery = useQuery({
    queryKey: ["profile", userId],
    queryFn: async () => {
      if (!userId) throw new Error("User ID is required");

      const result = await profilesService.getProfile(userId);
      if (!result.success) {
        const errorMessage = result.errorCode
          ? errorMap[result.errorCode as keyof typeof errorMap]
          : errorMap.UNKNOWN_ERROR;
        throw new Error(errorMessage.message);
      }

      return result.data!;
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
      const result = await profilesService.createProfile(data);
      if (!result.success) {
        const errorMessage = result.errorCode
          ? errorMap[result.errorCode as keyof typeof errorMap]
          : errorMap.UNKNOWN_ERROR;
        throw new Error(errorMessage.message);
      }
      return result.data!;
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
      if (!userId) throw new Error("User ID is required");

      const result = await profilesService.updateProfile(userId, data);
      if (!result.success) {
        const errorMessage = result.errorCode
          ? errorMap[result.errorCode as keyof typeof errorMap]
          : errorMap.UNKNOWN_ERROR;
        throw new Error(errorMessage.message);
      }
      return result.data!;
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
      if (!userId) throw new Error("User ID is required");

      const result = await profilesService.deleteProfile(userId);
      if (!result.success) {
        const errorMessage = result.errorCode
          ? errorMap[result.errorCode as keyof typeof errorMap]
          : errorMap.UNKNOWN_ERROR;
        throw new Error(errorMessage.message);
      }
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
      const result = await profilesService.profileExists(userId);
      return result.success ? result.data! : false;
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
