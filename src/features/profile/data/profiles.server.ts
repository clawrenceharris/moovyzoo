import { createClient } from "@/utils/supabase/server";
import type { UserProfile, UserProfileDocument } from "../domain/profiles.types";

/**
 * Server-side profile operations using Supabase server client
 */
export class ProfilesServerRepository {
  /**
   * Get current user's profile
   */
  async getCurrentUserProfile(): Promise<UserProfile | null> {
    try {
      const supabase = await createClient();
      
      // Get current user
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        return null;
      }

      // Get profile data
      const { data: profile, error } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error || !profile) {
        return null;
      }

      return this.mapDatabaseToProfile(profile);
    } catch (error) {
      console.error("Error fetching current user profile:", error);
      return null;
    }
  }

  /**
   * Get profile by user ID (server-side)
   */
  async getProfileByUserId(userId: string): Promise<UserProfile | null> {
    try {
      const supabase = await createClient();
      
      const { data: profile, error } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (error || !profile) {
        return null;
      }

      return this.mapDatabaseToProfile(profile);
    } catch (error) {
      console.error("Error fetching profile:", error);
      return null;
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
export const profilesServerRepository = new ProfilesServerRepository();