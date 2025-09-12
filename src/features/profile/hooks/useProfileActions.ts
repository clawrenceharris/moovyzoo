import { useMutation, useQueryClient } from "@tanstack/react-query";
import { profilesService } from "../domain/profiles.service";
import type {
  CreateProfileData,
  UpdateProfileData,
} from "../domain/profiles.types";

/**
 * Hook for managing user profile data with TanStack Query
 */
export function useProfileActions(userId: string) {
  const queryClient = useQueryClient();
  // Query for getting user profile

  // Mutation for creating profile
  const createProfileMutation = useMutation({
    mutationFn: async (data: CreateProfileData) => {
      const result = await profilesService.createProfile(data);
      if (!result.success || !result.data) {
        const err = new Error(result.errorCode || "CREATE_PROFILE_FAILED");
        throw err;
      }
      return result.data;
    },
    onError: (error) => {
      console.error("createProfile error:", error);
    },
    onSuccess: (profile) => {
      // Update cache with new profile
      queryClient.setQueryData(["profile", profile.userId], profile);
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ["profiles"] });
    },
  });

  // Mutation for updating profile
  const updateProfileMutation = useMutation({
    mutationFn: async (data: UpdateProfileData) => {
      const result = await profilesService.updateProfile(userId, data);
      if (!result.success || !result.data) {
        const err = new Error(result.errorCode || "UPDATE_PROFILE_FAILED");
        throw err;
      }
      return result.data;
    },
    onSuccess: (profile) => {
      // Update cache with updated profile
      queryClient.setQueryData(["profile", userId], profile);
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ["profiles"] });
    },
  });

  // Mutation for deleting profile
  const deleteProfileMutation = useMutation({
    mutationFn: async () => {
      const result = await profilesService.deleteProfile(userId);
      if (!result.success) {
        const err = new Error(result.errorCode || "DELETE_PROFILE_FAILED");
        throw err;
      }
      return true;
    },
    onSuccess: () => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: ["profile", userId] });
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ["profiles"] });
    },
  });

  // Function to update last active

  // Function to check if profile exists
  const checkProfileExists = async (userId: string): Promise<boolean> => {
    try {
      return await profilesService.profileExists(userId);
    } catch {
      return false;
    }
  };

  return {
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
    checkProfileExists,
  };
}
