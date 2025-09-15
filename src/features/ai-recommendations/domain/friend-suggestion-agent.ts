import type { ProfilesRepository } from '@/features/profile/data/profiles.repository';
import type { FriendsRepository } from '@/features/profile/data/friends.repository';
import type { WatchHistoryRepository } from '@/features/profile/data/watch-history.repository';
import type { FriendSuggestion } from '../types/recommendations';
import type { UserProfile, WatchHistoryEntry, PublicProfile } from '@/features/profile/domain/profiles.types';

/**
 * Interface for the subset of ProfilesRepository methods needed by FriendSuggestionAgent
 */
interface ProfilesRepositoryForAgent {
  getPublicProfiles(currentUserId?: string, limit?: number, offset?: number): Promise<PublicProfile[]>;
  getByUserId(userId: string): Promise<UserProfile | null>;
}

/**
 * Interface for the subset of FriendsRepository methods needed by FriendSuggestionAgent
 */
interface FriendsRepositoryForAgent {
  getFriends(userId: string): Promise<UserProfile[]>;
}

/**
 * Interface for the subset of WatchHistoryRepository methods needed by FriendSuggestionAgent
 */
interface WatchHistoryRepositoryForAgent {
  getRecentActivity(userId: string, limit?: number): Promise<WatchHistoryEntry[]>;
}
import { AppErrorCode } from '@/utils/error-codes';
import { createNormalizedError } from '@/utils/normalize-error';

/**
 * Friend Suggestion Agent
 * Generates personalized friend suggestions based on taste similarity
 * using existing friends, profiles, and watch history repositories
 */
export class FriendSuggestionAgent {
  constructor(
    private profilesRepository: ProfilesRepositoryForAgent,
    private friendsRepository: FriendsRepositoryForAgent,
    private watchHistoryRepository: WatchHistoryRepositoryForAgent
  ) {}

  /**
   * Generate friend suggestions for a user
   */
  async generateSuggestions(userId: string): Promise<FriendSuggestion[]> {
    console.log(`[FriendSuggestionAgent] Starting friend suggestion generation for user: ${userId}`);
    
    try {
      // 1. Get candidate pool using existing repositories
      console.log(`[FriendSuggestionAgent] Getting candidate pool for user: ${userId}`);
      const candidates = await this.getCandidatePool(userId);

      if (candidates.length === 0) {
        console.log(`[FriendSuggestionAgent] No candidates found for user: ${userId}`);
        return [];
      }

      // 2. Calculate taste similarity scores
      console.log(`[FriendSuggestionAgent] Calculating taste similarity for ${candidates.length} candidates`);
      const scoredSuggestions = await this.calculateTasteSimilarity(userId, candidates);

      // 3. Rank and filter suggestions
      const finalSuggestions = this.rankSuggestions(scoredSuggestions);
      
      console.log(`[FriendSuggestionAgent] Generated ${finalSuggestions.length} friend suggestions for user: ${userId}`);
      return finalSuggestions;
    } catch (error) {
      console.error(`[FriendSuggestionAgent] Error generating friend suggestions for user ${userId}:`, error);
      
      // For friend suggestions, we can gracefully return empty array
      // since this is a secondary feature
      return [];
    }
  }

  /**
   * Get candidate pool of potential friends (public profiles, exclude existing friends)
   */
  private async getCandidatePool(userId: string): Promise<PublicProfile[]> {
    try {
      // Get public profiles and existing friends with error handling
      const [publicProfilesResult, existingFriendsResult] = await Promise.allSettled([
        this.profilesRepository.getPublicProfiles(userId),
        this.friendsRepository.getFriends(userId)
      ]);

      // Handle public profiles result
      const publicProfiles = publicProfilesResult.status === 'fulfilled' 
        ? publicProfilesResult.value 
        : [];

      if (publicProfilesResult.status === 'rejected') {
        console.warn(`[FriendSuggestionAgent] Failed to load public profiles for user ${userId}:`, publicProfilesResult.reason);
      }

      // Handle existing friends result
      const existingFriends = existingFriendsResult.status === 'fulfilled' 
        ? existingFriendsResult.value 
        : [];

      if (existingFriendsResult.status === 'rejected') {
        console.warn(`[FriendSuggestionAgent] Failed to load existing friends for user ${userId}:`, existingFriendsResult.reason);
      }

      // Create set of existing friend IDs for filtering
      const friendIds = new Set(existingFriends.map(friend => friend.userId));

      // Filter out existing friends
      const candidates = publicProfiles.filter(profile => !friendIds.has(profile.userId));
      
      console.log(`[FriendSuggestionAgent] Found ${candidates.length} potential friend candidates`);
      return candidates;
    } catch (error) {
      console.error(`[FriendSuggestionAgent] Error getting candidate pool for user ${userId}:`, error);
      return [];
    }
  }

  /**
   * Calculate taste similarity between current user and candidates
   */
  private async calculateTasteSimilarity(
    userId: string,
    candidates: PublicProfile[]
  ): Promise<FriendSuggestion[]> {
    if (candidates.length === 0) {
      return [];
    }

    try {
      // Get current user's profile and watch history with error handling
      const [currentUserProfileResult, currentUserWatchHistoryResult] = await Promise.allSettled([
        this.profilesRepository.getByUserId(userId),
        this.watchHistoryRepository.getRecentActivity(userId, 50)
      ]);

      // Handle current user profile result
      const currentUserProfile = currentUserProfileResult.status === 'fulfilled' && currentUserProfileResult.value
        ? currentUserProfileResult.value 
        : {
            id: 'temp-id',
            userId,
            email: '',
            displayName: 'User',
            username: null,
            avatarUrl: null,
            bio: null,
            quote: null,
            favoriteGenres: [],
            favoriteTitles: [],
            isPublic: true,
            onboardingCompleted: false,
            createdAt: new Date(),
            updatedAt: new Date()
          };

      if (currentUserProfileResult.status === 'rejected') {
        console.warn(`[FriendSuggestionAgent] Failed to load current user profile for ${userId}:`, currentUserProfileResult.reason);
      }

      // Handle watch history result (not used in current implementation but kept for future)
      if (currentUserWatchHistoryResult.status === 'rejected') {
        console.warn(`[FriendSuggestionAgent] Failed to load watch history for user ${userId}:`, currentUserWatchHistoryResult.reason);
      }

      const suggestions: FriendSuggestion[] = [];

      for (const candidate of candidates) {
        try {
          // Calculate similarity components based on available data
          const sharedGenres = this.calculateSharedGenres(
            currentUserProfile.favoriteGenres,
            candidate.favoriteGenres || []
          );

          // For PublicProfile, we don't have favorite titles or detailed watch history
          // So we'll base similarity mainly on genres for now
          const sharedTitles: string[] = [];
          const sharedHighRatedTitles: string[] = [];

          // Calculate taste match score (0-100)
          const tasteMatchScore = this.calculateTasteMatchScore({
            sharedGenres,
            sharedTitles,
            sharedHighRatedTitles,
            currentUserProfile,
            candidateGenres: candidate.favoriteGenres || []
          });

          // Generate rationale
          const rationale = this.generateRationale({
            sharedGenres,
            sharedTitles,
            sharedHighRatedTitles,
            candidateName: candidate.displayName
          });

          // Only include suggestions with some similarity (minimum 10% match)
          if (tasteMatchScore >= 10) {
            console.log(`[FriendSuggestionAgent] Creating suggestion with user_id: ${candidate.userId} for candidate: ${candidate.displayName}`);
            suggestions.push({
              user_id: candidate.userId, // Use userId for friend requests
              display_name: candidate.displayName,
              avatar_url: candidate.avatarUrl || undefined,
              taste_match_score: tasteMatchScore,
              short_rationale: rationale,
              shared_titles: sharedTitles.length > 0 ? sharedTitles : undefined,
              shared_genres: sharedGenres.length > 0 ? sharedGenres : undefined,
              mutual_friends_count: 0 // Placeholder - would need more complex query
            });
          }
        } catch (error) {
          console.warn(`[FriendSuggestionAgent] Failed to calculate similarity for candidate ${candidate.id}:`, error);
        }
      }

      return suggestions;
    } catch (error) {
      console.error(`[FriendSuggestionAgent] Error calculating taste similarity for user ${userId}:`, error);
      return [];
    }
  }

  /**
   * Calculate shared genres between two users
   */
  private calculateSharedGenres(userGenres: string[], candidateGenres: string[]): string[] {
    return userGenres.filter(genre => candidateGenres.includes(genre));
  }

  /**
   * Calculate shared favorite titles between two users
   */
  private calculateSharedTitles(userTitles: string[], candidateTitles: string[]): string[] {
    return userTitles.filter(title => candidateTitles.includes(title));
  }

  /**
   * Calculate shared high-rated titles (8+ rating) between two users
   */
  private calculateSharedHighRatedTitles(
    userWatchHistory: WatchHistoryEntry[],
    candidateWatchHistory: WatchHistoryEntry[]
  ): string[] {
    const userHighRated = new Set(
      userWatchHistory
        .filter(entry => entry.rating && entry.rating >= 8)
        .map(entry => entry.title)
    );

    const candidateHighRated = candidateWatchHistory
      .filter(entry => entry.rating && entry.rating >= 8)
      .map(entry => entry.title);

    return candidateHighRated.filter(title => userHighRated.has(title));
  }

  /**
   * Calculate overall taste match score (0-100)
   * Based on: shared_high_rated_titles (60%), shared_genres (25%), shared_titles (15%)
   */
  private calculateTasteMatchScore(params: {
    sharedGenres: string[];
    sharedTitles: string[];
    sharedHighRatedTitles: string[];
    currentUserProfile: UserProfile | any;
    candidateGenres: string[];
  }): number {
    const { sharedGenres, sharedTitles, sharedHighRatedTitles, currentUserProfile, candidateGenres } = params;

    // Shared high-rated titles (60% weight)
    const highRatedScore = Math.min(60, sharedHighRatedTitles.length * 20);

    // Shared genres (25% weight)
    const genreScore = sharedGenres.length > 0 
      ? Math.min(25, (sharedGenres.length / Math.max(currentUserProfile.favoriteGenres.length, candidateGenres.length)) * 25)
      : 0;

    // Shared favorite titles (15% weight)
    const titleScore = sharedTitles.length > 0
      ? Math.min(15, (sharedTitles.length / Math.max(currentUserProfile.favoriteTitles.length, 1)) * 15)
      : 0;

    return Math.round(highRatedScore + genreScore + titleScore);
  }

  /**
   * Generate explainable rationale for friend suggestion
   */
  private generateRationale(params: {
    sharedGenres: string[];
    sharedTitles: string[];
    sharedHighRatedTitles: string[];
    candidateName: string;
  }): string {
    const { sharedGenres, sharedTitles, sharedHighRatedTitles } = params;
    const rationales: string[] = [];

    if (sharedHighRatedTitles.length > 0) {
      if (sharedHighRatedTitles.length === 1) {
        rationales.push(`Also gave ${sharedHighRatedTitles[0]} a high rating`);
      } else {
        rationales.push(`Both rated ${sharedHighRatedTitles.slice(0, 2).join(' & ')} highly`);
      }
    }

    if (sharedGenres.length > 0) {
      rationales.push(`Shared interest in ${sharedGenres.slice(0, 2).join(', ')}`);
    }

    if (sharedTitles.length > 0 && rationales.length === 0) {
      rationales.push(`Both love ${sharedTitles.slice(0, 2).join(', ')}`);
    }

    if (rationales.length === 0) {
      rationales.push('Similar taste profile');
    }

    return rationales.join(' • ');
  }

  /**
   * Rank and filter suggestions
   */
  private rankSuggestions(suggestions: FriendSuggestion[]): FriendSuggestion[] {
    // Sort by taste match score (highest first)
    const ranked = suggestions.sort((a, b) => b.taste_match_score - a.taste_match_score);

    // Filter out suggestions with very low scores (< 10)
    const filtered = ranked.filter(suggestion => suggestion.taste_match_score >= 10);

    // Return top 10 suggestions
    return filtered.slice(0, 10);
  }
}