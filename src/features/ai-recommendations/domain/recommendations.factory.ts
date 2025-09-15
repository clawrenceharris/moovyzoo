import { ContentRecommendationAgent } from './content-recommendation-agent';
import { FriendSuggestionAgent } from './friend-suggestion-agent';
import { RecommendationsService } from './recommendations.service';
import { recommendationCacheRepository } from '../data/recommendation-cache.repository';
import { watchHistoryRepository } from '@/features/profile/data/watch-history.repository';
import { profilesRepository } from '@/features/profile/data/profiles.repository';
import { friendsRepository } from '@/features/profile/data/friends.repository';

/**
 * Factory function to create a fully configured RecommendationsService
 * with all dependencies properly injected
 */
export function createRecommendationsService(): RecommendationsService {
  // Create agents with their dependencies
  const contentAgent = new ContentRecommendationAgent(
    watchHistoryRepository,
    profilesRepository,
    friendsRepository
  );

  const friendAgent = new FriendSuggestionAgent(
    profilesRepository,
    friendsRepository,
    watchHistoryRepository
  );

  // Create and return the service
  return new RecommendationsService(
    contentAgent,
    friendAgent,
    recommendationCacheRepository
  );
}

// Export singleton instance for convenience
export const recommendationsService = createRecommendationsService();