import { createClient } from '@/utils/supabase/server';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { RecommendationSession } from '../types/recommendations';

/**
 * Repository for recommendation cache operations using Supabase
 * Handles session-based caching of AI-generated recommendations
 */
export class RecommendationCacheRepository {
  /**
   * Get cached recommendations for a user session
   */
  async getCachedRecommendations(
    userId: string, 
    sessionId: string, 
    supabaseClient?: SupabaseClient
  ): Promise<RecommendationSession | null> {
    try {
      const client = supabaseClient || await createClient();
      const { data, error } = await client
        .from('recommendation_sessions')
        .select('*')
        .eq('user_id', userId)
        .eq('session_id', sessionId)
        .single();

      if (error) {
        // Return null for not found errors, throw for other errors
        if (error.code === 'PGRST116') {
          return null;
        }
        throw error;
      }

      if (!data) {
        return null;
      }

      // Map database row to RecommendationSession type
      return {
        user_id: data.user_id,
        session_id: data.session_id,
        content_recommendations: data.content_recommendations,
        friend_suggestions: data.friend_suggestions,
        generated_at: new Date(data.generated_at),
        expires_at: new Date(data.expires_at)
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Cache recommendations for a user session
   */
  async cacheRecommendations(
    session: RecommendationSession, 
    supabaseClient?: SupabaseClient
  ): Promise<void> {
    try {
      const client = supabaseClient || await createClient();
      const { error } = await client
        .from('recommendation_sessions')
        .upsert({
          user_id: session.user_id,
          session_id: session.session_id,
          content_recommendations: session.content_recommendations,
          friend_suggestions: session.friend_suggestions,
          generated_at: session.generated_at.toISOString(),
          expires_at: session.expires_at.toISOString()
        })
        .select()
        .single();

      if (error) {
        throw error;
      }
    } catch (error) {
      throw error;
    }
  }

  /**
   * Clear expired cache entries
   */
  async clearExpiredCache(supabaseClient?: SupabaseClient): Promise<void> {
    try {
      const client = supabaseClient || await createClient();
      const { error } = await client
        .from('recommendation_sessions')
        .delete()
        .lt('expires_at', new Date().toISOString());

      if (error) {
        throw error;
      }
    } catch (error) {
      throw error;
    }
  }

  /**
   * Invalidate all cache entries for a specific user
   */
  async invalidateUserCache(userId: string, supabaseClient?: SupabaseClient): Promise<void> {
    try {
      const client = supabaseClient || await createClient();
      const { error } = await client
        .from('recommendation_sessions')
        .delete()
        .eq('user_id', userId);

      if (error) {
        throw error;
      }
    } catch (error) {
      throw error;
    }
  }
}

// Export singleton instance
export const recommendationCacheRepository = new RecommendationCacheRepository();