import { supabase } from "./supabase-client";
import type {
  UserProfile,
  CreateProfileData,
  UpdateProfileData,
  PublicProfile,
  ProfileOperationResult,
} from "../domain/profiles.types";

/**
 * Repository for profile data operations using Supabase
 * Contains only database access logic, no business rules
 */
export class ProfilesRepository {
  /**
   * Create a new user profile
   */
  async create(
    data: CreateProfileData
  ): Promise<ProfileOperationResult<UserProfile>> {
    try {
      const { data: profile, error } = await supabase
        .from("user_profiles")
        .insert({
          user_id: data.userId,
          display_name: data.displayName,
          avatar_url: data.avatarUrl || null,
          favorite_genres: data.favoriteGenres,
          privacy_settings: data.privacySettings || {
            profileVisibility: "public",
            showFavoriteGenres: true,
            allowDirectMessages: true,
          },
        })
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return {
        success: true,
        data: this.mapDatabaseToProfile(profile),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Get profile by user ID
   */
  async getByUserId(
    userId: string
  ): Promise<ProfileOperationResult<UserProfile>> {
    try {
      const { data: profile, error } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          return { success: false, error: "Profile not found" };
        }
        return { success: false, error: error.message };
      }

      return {
        success: true,
        data: this.mapDatabaseToProfile(profile),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Update profile by user ID
   */
  async updateByUserId(
    userId: string,
    data: UpdateProfileData
  ): Promise<ProfileOperationResult<UserProfile>> {
    try {
      const updateData: any = {
        updated_at: new Date().toISOString(),
      };

      if (data.displayName !== undefined) {
        updateData.display_name = data.displayName;
      }
      if (data.avatarUrl !== undefined) {
        updateData.avatar_url = data.avatarUrl || null;
      }
      if (data.favoriteGenres !== undefined) {
        updateData.favorite_genres = data.favoriteGenres;
      }
      if (data.privacySettings !== undefined) {
        // Merge with existing privacy settings
        const { data: currentProfile } = await supabase
          .from("user_profiles")
          .select("privacy_settings")
          .eq("user_id", userId)
          .single();

        updateData.privacy_settings = {
          ...currentProfile?.privacy_settings,
          ...data.privacySettings,
        };
      }

      const { data: profile, error } = await supabase
        .from("user_profiles")
        .update(updateData)
        .eq("user_id", userId)
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return {
        success: true,
        data: this.mapDatabaseToProfile(profile),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Update last active timestamp
   */
  async updateLastActive(
    userId: string
  ): Promise<ProfileOperationResult<void>> {
    try {
      const { error } = await supabase
        .from("user_profiles")
        .update({ last_active_at: new Date().toISOString() })
        .eq("user_id", userId);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Check if profile exists for user
   */
  async existsByUserId(
    userId: string
  ): Promise<ProfileOperationResult<boolean>> {
    try {
      const { data, error } = await supabase
        .from("user_profiles")
        .select("id")
        .eq("user_id", userId)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          return { success: true, data: false };
        }
        return { success: false, error: error.message };
      }

      return { success: true, data: !!data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Get public profiles (for discovery)
   */
  async getPublicProfiles(
    limit = 20,
    offset = 0
  ): Promise<ProfileOperationResult<PublicProfile[]>> {
    try {
      const { data: profiles, error } = await supabase
        .from("user_profiles")
        .select(
          "id, display_name, avatar_url, favorite_genres, privacy_settings, last_active_at"
        )
        .eq("privacy_settings->profileVisibility", "public")
        .order("last_active_at", { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        return { success: false, error: error.message };
      }

      const publicProfiles = profiles.map((profile) => ({
        id: profile.id,
        displayName: profile.display_name,
        avatarUrl: profile.avatar_url,
        favoriteGenres: profile.privacy_settings?.showFavoriteGenres
          ? profile.favorite_genres
          : undefined,
        lastActiveAt: new Date(profile.last_active_at),
      }));

      return { success: true, data: publicProfiles };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Delete profile by user ID
   */
  async deleteByUserId(userId: string): Promise<ProfileOperationResult<void>> {
    try {
      const { error } = await supabase
        .from("user_profiles")
        .delete()
        .eq("user_id", userId);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Map database row to UserProfile type
   */
  private mapDatabaseToProfile(dbProfile: any): UserProfile {
    return {
      id: dbProfile.id,
      userId: dbProfile.user_id,
      displayName: dbProfile.display_name,
      avatarUrl: dbProfile.avatar_url,
      favoriteGenres: dbProfile.favorite_genres || [],
      privacySettings: dbProfile.privacy_settings || {
        profileVisibility: "public",
        showFavoriteGenres: true,
        allowDirectMessages: true,
      },
      createdAt: new Date(dbProfile.created_at),
      updatedAt: new Date(dbProfile.updated_at),
      lastActiveAt: new Date(dbProfile.last_active_at),
    };
  }
}

// Export singleton instance
export const profilesRepository = new ProfilesRepository();
