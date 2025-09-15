import type {
  UserProfile,
  CreateProfileData,
  UpdateProfileData,
  UserProfileDocument,
  PublicProfile,
  ProfileWithFriendStatus,
  WatchHistoryEntry,
} from "../domain/profiles.types";
import { supabase } from "@/utils/supabase/client";
import { friendsRepository } from "./friends.repository";
import { watchHistoryRepository } from "./watch-history.repository";
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
        .select("id")
        .eq("user_id", userId)
        .single();

      if (checkError || !existingProfile) {
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
   * Update last active timestamp (using updated_at since last_active_at doesn't exist)
   */
  async updateLastActive(userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from("user_profiles")
        .update({ updated_at: new Date().toISOString() })
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
   * Get public profiles (for discovery) - excludes current user
   */
  async getPublicProfiles(currentUserId?: string, limit = 20, offset = 0): Promise<PublicProfile[]> {
    try {
      let query = supabase
        .from("user_profiles")
        .select(
          "id, user_id, display_name, avatar_url, favorite_genres, created_at"
        )
        .eq("is_public", true)
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

      // Exclude current user if provided
      if (currentUserId) {
        query = query.neq("user_id", currentUserId);
      }

      const { data: profiles, error } = await query;

      if (error) {
        throw error;
      }

      const publicProfiles = profiles.map((profile: any) => ({
        id: profile.id,
        userId: profile.user_id, // Include userId for friend requests
        displayName: profile.display_name,
        avatarUrl: profile.avatar_url,
        favoriteGenres: profile.favorite_genres,
        createdAt: new Date(profile.created_at),
      }));

      return publicProfiles;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get public profiles with friend status (for discovery)
   */
  async getPublicProfilesWithFriendStatus(currentUserId: string, limit = 20, offset = 0): Promise<ProfileWithFriendStatus[]> {
    try {
      const { data: profiles, error } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("is_public", true)
        .neq("user_id", currentUserId)
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        throw error;
      }

      // Get friend status for each profile
      const profilesWithFriendStatus = await Promise.all(
        profiles.map(async (profile: UserProfileDocument) => {
          const friendStatus = await friendsRepository.getFriendStatus(currentUserId, profile.user_id);
          const mappedProfile = this.mapDatabaseToProfile(profile);

          return {
            ...mappedProfile,
            friendStatus,
          };
        })
      );

      return profilesWithFriendStatus;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get individual profile with friend status and recent watch history
   */
  async getProfileWithFriendStatus(profileId: string, currentUserId: string): Promise<ProfileWithFriendStatus> {
    try {
      // Get the profile
      const profile = await this.getByUserId(profileId);

      // Get friend status
      const friendStatus = await friendsRepository.getFriendStatus(currentUserId, profileId);

      // Get recent watch history (only if friends or profile is public)
      let recentWatchHistory: WatchHistoryEntry[] | undefined;
      if (profile.isPublic || friendStatus.status === 'friends') {
        recentWatchHistory = await watchHistoryRepository.getRecentActivity(profileId, 5);
      }

      // Calculate mutual friends count (placeholder for now - would need more complex query)
      let mutualFriendsCount: number | undefined;
      if (friendStatus.status === 'friends') {
        // This would require a more complex query to find mutual friends
        // For now, we'll leave it undefined and implement later if needed
        mutualFriendsCount = undefined;
      }

      return {
        ...profile,
        friendStatus,
        recentWatchHistory,
        mutualFriendsCount,
      };
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
    };
  }
}

// Export singleton instance
export const profilesRepository = new ProfilesRepository();