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
          display_name: data.displayName,
          email: data.email,
          onboarding_completed: data.onboardingCompleted,
          username: data.username,
          quote: data.quote,
          avatar_url: data.avatarUrl || null,
          favorite_genres: data.favoriteGenres,
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
      const updateData: Partial<UserProfileDocument> = {
        updated_at: new Date().toISOString(),
      };

      if (data.displayName !== undefined) {
        updateData.display_name = data.displayName;
      }
      if (data.avatarUrl !== undefined) {
        updateData.avatar_url = data.avatarUrl;
      }
      if (data.favoriteGenres !== undefined) {
        updateData.favorite_genres = data.favoriteGenres;
      }

      const { data: profile, error } = await supabase
        .from("user_profiles")
        .update(updateData)
        .eq("user_id", userId)
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
      userId: dbProfile.id,
      username: dbProfile.username,
      onboardingCompleted: dbProfile.onboarding_completed,
      displayName: dbProfile.display_name,
      avatarUrl: dbProfile.avatar_url,
      favoriteGenres: dbProfile.favorite_genres || [],
      privacySettings: {
        isPublic: dbProfile.privacy_settings.is_public,
      },
      createdAt: new Date(dbProfile.created_at),
      updatedAt: new Date(dbProfile.updated_at),
      lastActiveAt: new Date(dbProfile.last_active_at),
    };
  }
}

// Export singleton instance
export const profilesRepository = new ProfilesRepository();
