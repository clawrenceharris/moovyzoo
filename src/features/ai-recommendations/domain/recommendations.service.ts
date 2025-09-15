import type { SupabaseClient } from '@supabase/supabase-js';
import type { ContentRecommendationAgent } from './content-recommendation-agent';
import type { FriendSuggestionAgent } from './friend-suggestion-agent';
import type { RecommendationCacheRepository } from '../data/recommendation-cache.repository';
import type { ContentRecommendation, FriendSuggestion, RecommendationSession } from '../types/recommendations';

/**
 * Recommendations Service
 * Orchestrates both content and friend recommendation agents with caching
 * Implements session-based caching with 24-hour expiration
 */
export class RecommendationsService {
  constructor(
    private contentAgent: ContentRecommendationAgent,
    private friendAgent: FriendSuggestionAgent,
    private cacheRepository: RecommendationCacheRepository
  ) {}

  /**
   * Get recommendations for a user with caching
   */
  async getRecommendations(
    userId: string, 
    sessionId: string, 
    forceRefresh = false,
    supabaseClient?: SupabaseClient
  ): Promise<{
    content_recommendations: ContentRecommendation[];
    friend_suggestions: FriendSuggestion[];
    cached: boolean;
  }> {
    const startTime = Date.now();
    console.log(`[RecommendationsService] Starting recommendation generation for user: ${userId}, session: ${sessionId}, forceRefresh: ${forceRefresh}`);
    
    try {
      // Check cache first unless force refresh
      if (!forceRefresh) {
        console.log(`[RecommendationsService] Checking cache for user: ${userId}`);
        
        try {
          const cached = await this.cacheRepository.getCachedRecommendations(userId, sessionId, supabaseClient);
          if (cached && cached.expires_at > new Date()) {
            const cacheAge = Date.now() - cached.generated_at.getTime();
            console.log(`[RecommendationsService] Cache hit for user: ${userId}, age: ${Math.round(cacheAge / 1000 / 60)} minutes`);
            
            return {
              content_recommendations: cached.content_recommendations,
              friend_suggestions: cached.friend_suggestions,
              cached: true
            };
          } else if (cached) {
            console.log(`[RecommendationsService] Cache expired for user: ${userId}`);
          } else {
            console.log(`[RecommendationsService] No cache found for user: ${userId}`);
          }
        } catch (cacheError) {
          console.warn(`[RecommendationsService] Cache check failed for user ${userId}:`, cacheError);
        }
      }

      // Generate fresh recommendations
      console.log(`[RecommendationsService] Generating fresh recommendations for user: ${userId}`);
      const [contentRecs, friendSuggestions] = await Promise.allSettled([
        this.contentAgent.generateRecommendations(userId),
        this.friendAgent.generateSuggestions(userId)
      ]);

      // Handle results, using empty arrays for failures
      const contentRecommendations = contentRecs.status === 'fulfilled' ? contentRecs.value : [];
      const friendRecommendationsResult = friendSuggestions.status === 'fulfilled' ? friendSuggestions.value : [];

      // Log generation results
      if (contentRecs.status === 'rejected') {
        console.error(`[RecommendationsService] Content recommendations failed for user ${userId}:`, contentRecs.reason);
      } else {
        console.log(`[RecommendationsService] Generated ${contentRecommendations.length} content recommendations for user: ${userId}`);
      }

      if (friendSuggestions.status === 'rejected') {
        console.error(`[RecommendationsService] Friend suggestions failed for user ${userId}:`, friendSuggestions.reason);
      } else {
        console.log(`[RecommendationsService] Generated ${friendRecommendationsResult.length} friend suggestions for user: ${userId}`);
      }

      // Cache the results
      const session: RecommendationSession = {
        user_id: userId,
        session_id: sessionId,
        content_recommendations: contentRecommendations,
        friend_suggestions: friendRecommendationsResult,
        generated_at: new Date(),
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
      };

      try {
        await this.cacheRepository.cacheRecommendations(session, supabaseClient);
        console.log(`[RecommendationsService] Successfully cached recommendations for user: ${userId}`);
      } catch (cacheError) {
        // Log cache error but don't fail the request
        console.warn(`[RecommendationsService] Failed to cache recommendations for user ${userId}:`, cacheError);
      }

      const totalTime = Date.now() - startTime;
      console.log(`[RecommendationsService] Completed recommendation generation for user: ${userId} in ${totalTime}ms`);

      return {
        content_recommendations: contentRecommendations,
        friend_suggestions: friendRecommendationsResult,
        cached: false
      };
    } catch (error) {
      const totalTime = Date.now() - startTime;
      console.error(`[RecommendationsService] Unexpected error in recommendation generation for user ${userId} after ${totalTime}ms:`, error);
      
      // If cache check fails, try to generate fresh recommendations as fallback
      console.log(`[RecommendationsService] Attempting fallback generation for user: ${userId}`);
      
      try {
        const [contentRecs, friendSuggestions] = await Promise.allSettled([
          this.contentAgent.generateRecommendations(userId),
          this.friendAgent.generateSuggestions(userId)
        ]);

        const contentRecommendations = contentRecs.status === 'fulfilled' ? contentRecs.value : [];
        const friendRecommendationsResult = friendSuggestions.status === 'fulfilled' ? friendSuggestions.value : [];

        console.log(`[RecommendationsService] Fallback generation completed for user: ${userId}`);

        return {
          content_recommendations: contentRecommendations,
          friend_suggestions: friendRecommendationsResult,
          cached: false
        };
      } catch (generateError) {
        console.error(`[RecommendationsService] Fallback generation also failed for user ${userId}:`, generateError);
        
        // Return empty recommendations as last resort
        return {
          content_recommendations: [],
          friend_suggestions: [],
          cached: false
        };
      }
    }
  }

  /**
   * Refresh recommendations by invalidating cache and generating fresh ones
   */
  async refreshRecommendations(
    userId: string, 
    sessionId: string,
    supabaseClient?: SupabaseClient
  ): Promise<{
    content_recommendations: ContentRecommendation[];
    friend_suggestions: FriendSuggestion[];
    cached: boolean;
  }> {
    console.log(`[RecommendationsService] Refreshing recommendations for user: ${userId}`);
    
    try {
      // Invalidate existing cache
      await this.cacheRepository.invalidateUserCache(userId, supabaseClient);
      console.log(`[RecommendationsService] Cache invalidated for user: ${userId}`);
    } catch (error) {
      console.warn(`[RecommendationsService] Failed to invalidate cache for user ${userId}:`, error);
    }

    // Generate fresh recommendations
    return this.getRecommendations(userId, sessionId, true, supabaseClient);
  }

  /**
   * Clean up expired cache entries
   */
  async cleanupExpiredCache(supabaseClient?: SupabaseClient): Promise<void> {
    console.log(`[RecommendationsService] Starting cache cleanup`);
    
    try {
      await this.cacheRepository.clearExpiredCache(supabaseClient);
      console.log(`[RecommendationsService] Cache cleanup completed successfully`);
    } catch (error) {
      console.error(`[RecommendationsService] Failed to cleanup expired cache:`, error);
      throw error;
    }
  }
}