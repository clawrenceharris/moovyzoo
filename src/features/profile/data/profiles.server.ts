import { createClient } from "@/utils/supabase/server";
import type { 
  UserProfile, 
  UserProfileDocument, 
  ProfileWithFriendStatus,
  PublicProfile,
  WatchHistoryEntry 
} from "../domain/profiles.types";
import { friendsServerRepository } from "./friends.server";
import { watchHistoryServerRepository } from "./watch-history.server";

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
   * Get profile by user ID - alias for getProfileByUserId for compatibility with ProfilesRepository interface
   */
  async getByUserId(userId: string): Promise<UserProfile | null> {
    return this.getProfileByUserId(userId);
  }

  /**
   * Get public profiles (for discovery) - excludes current user (server-side)
   */
  async getPublicProfiles(currentUserId?: string, limit = 20, offset = 0): Promise<PublicProfile[]> {
    try {
      const supabase = await createClient();
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

      console.log(`[ProfilesServerRepository] getPublicProfiles returning ${publicProfiles.length} profiles:`, 
        publicProfiles.map(p => ({ id: p.id, userId: p.userId, displayName: p.displayName })));

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
      const supabase = await createClient();
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
          const friendStatus = await friendsServerRepository.getFriendStatus(currentUserId, profile.user_id);
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
      const profile = await this.getProfileByUserId(profileId);
      
      if (!profile) {
        throw new Error('Profile not found');
      }
      
      // Get friend status
      const friendStatus = await friendsServerRepository.getFriendStatus(currentUserId, profileId);
      
      // Get recent watch history (only if friends or profile is public)
      let recentWatchHistory: WatchHistoryEntry[] | undefined;
      if (profile.isPublic || friendStatus.status === 'friends') {
        recentWatchHistory = await watchHistoryServerRepository.getRecentActivity(profileId, 5);
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
export const profilesServerRepository = new ProfilesServerRepository();