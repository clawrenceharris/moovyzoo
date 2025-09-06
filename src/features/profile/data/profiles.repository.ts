import type {
  UserProfile,
  CreateProfileData,
  UpdateProfileData,
  UserProfileDocument,
  PublicProfile,
  PublicProfileDocument,
} from "../domain/profiles.types";
import { supabase } from "@/utils/supabase/client";
/**
 * Repository for profile data operations using Supabase
 * Contains only database access logic, no business rules
 */
export class ProfilesRepository {
  /**
   * Create a new user profile
   */
  async create(data: CreateProfileData): Promise<UserProfile> {
    try {
      const { data: profile, error } = await supabase
        .from("user_profiles")
        .insert({
          user_id: data.userId,
          email: data.email,
          display_name: data.displayName,
          username: data.username,
          avatar_url: data.avatarUrl || null,
          bio: data.bio,
          quote: data.quote,
          favorite_genres: data.favoriteGenres || [],
          favorite_titles: data.favoriteTitles || [],
          is_public: data.isPublic ?? true,
          onboarding_completed: data.onboardingCompleted ?? false,
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return this.mapDatabaseToProfile(profile);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get profile by user ID
   */
  async getByUserId(userId: string): Promise<UserProfile> {
    try {
      const { data: profile, error } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("user_id", userId)
        .single();
      if (error) {
        throw error;
      }

      return this.mapDatabaseToProfile(profile);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update profile by user ID
   */
  async updateByUserId(
    userId: string,
    data: UpdateProfileData
  ): Promise<UserProfile> {
    try {

      // First check if profile exists
      const { data: existingProfile, error: checkError } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("user_id", userId)
        .single();


      if (checkError) {
        console.error("Error checking existing profile:", checkError);
        throw new Error(`Profile not found: ${checkError.message}`);
      }

      if (!existingProfile) {
        throw new Error("Profile not found");
      }

      const updateData: Partial<UserProfileDocument> = {};

      if (data.displayName !== undefined) {
        updateData.display_name = data.displayName;
      }
      if (data.username !== undefined) {
        updateData.username = data.username;
      }
      if (data.avatarUrl !== undefined) {
        updateData.avatar_url = data.avatarUrl;
      }
      if (data.bio !== undefined) {
        updateData.bio = data.bio;
      }
      if (data.quote !== undefined) {
        updateData.quote = data.quote;
      }
      if (data.favoriteGenres !== undefined) {
        updateData.favorite_genres = data.favoriteGenres;
      }
      if (data.favoriteTitles !== undefined) {
        updateData.favorite_titles = data.favoriteTitles;
      }
      if (data.isPublic !== undefined) {
        updateData.is_public = data.isPublic;
      }
      if (data.onboardingCompleted !== undefined) {
        updateData.onboarding_completed = data.onboardingCompleted;
      }

      // Check if there's actually data to update
      if (Object.keys(updateData).length === 0) {
        console.log("No data to update, returning existing profile");
        return this.mapDatabaseToProfile(existingProfile);
      }

      const { data: updatedProfile, error } = await supabase
        .from("user_profiles")
        .update(updateData)
        .eq("user_id", userId)
        .select()
        .single();


      if (error) {
        console.error("Update error details:", {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        throw error;
      }

      if (!updatedProfile) {
        throw new Error("Update succeeded but no profile returned");
      }

      return this.mapDatabaseToProfile(updatedProfile);
    } catch (error) {
      console.error("Error in updateByUserId:", error);
      throw error;
    }
  }

  /**
   * Update last active timestamp
   */
  async updateLastActive(userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from("user_profiles")
        .update({ last_active_at: new Date().toISOString() })
        .eq("user_id", userId);

      if (error) {
        throw error;
      }
    } catch (error) {
      throw error;
    }
  }

  /**
   * Check if profile exists for user
   */
  async existsByUserId(userId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from("user_profiles")
        .select("id")
        .eq("user_id", userId)
        .single();

      if (error) {
        throw error;
      }

      return !!data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get public profiles (for discovery)
   */
  async getPublicProfiles(limit = 20, offset = 0): Promise<PublicProfile[]> {
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
        throw error;
      }

      const publicProfiles = profiles.map((profile: PublicProfileDocument) => ({
        id: profile.id,
        displayName: profile.display_name,
        avatarUrl: profile.avatar_url,
        favoriteGenres: profile.privacy_settings?.show_favorite_genres
          ? profile.favorite_genres
          : undefined,
        lastActiveAt: new Date(profile.last_active_at),
      }));

      return publicProfiles;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Delete profile by user ID
   */
  async deleteByUserId(userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from("user_profiles")
        .delete()
        .eq("user_id", userId);

      if (error) {
        throw error;
      }
    } catch (error) {
      throw error;
    }
  }

  /**
   * Map database row to UserProfile type
   */
  private mapDatabaseToProfile(dbProfile: UserProfileDocument): UserProfile {
    return {
      id: dbProfile.id,
      userId: dbProfile.user_id,
      email: dbProfile.email,
      displayName: dbProfile.display_name,
      username: dbProfile.username,
      avatarUrl: dbProfile.avatar_url,
      bio: dbProfile.bio,
      quote: dbProfile.quote,
      favoriteGenres: dbProfile.favorite_genres || [],
      favoriteTitles: dbProfile.favorite_titles || [],
      isPublic: dbProfile.is_public,
      onboardingCompleted: dbProfile.onboarding_completed,
      createdAt: new Date(dbProfile.created_at),
      updatedAt: new Date(dbProfile.updated_at),
      lastActiveAt: dbProfile.last_active_at ? new Date(dbProfile.last_active_at) : undefined,
    };
  }
}

// Export singleton instance
export const profilesRepository = new ProfilesRepository();
