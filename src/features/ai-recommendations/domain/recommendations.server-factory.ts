import { ContentRecommendationAgent } from './content-recommendation-agent';
import { FriendSuggestionAgent } from './friend-suggestion-agent';
import { RecommendationsService } from './recommendations.service';
import { recommendationCacheRepository } from '../data/recommendation-cache.repository';
import { watchHistoryServerRepository } from '@/features/profile/data/watch-history.server';
import { profilesServerRepository } from '@/features/profile/data/profiles.server';
import { friendsServerRepository } from '@/features/profile/data/friends.server';

/**
 * Server-side factory function to create a fully configured RecommendationsService
 * with all server-side dependencies properly injected
 */
export function createServerRecommendationsService(): RecommendationsService {
  // Create agents with their server-side dependencies
  const contentAgent = new ContentRecommendationAgent(
    watchHistoryServerRepository,
    profilesServerRepository,
    friendsServerRepository
  );


  const friendAgent = new FriendSuggestionAgent(
    profilesServerRepository,
    friendsServerRepository,
    watchHistoryServerRepository
  );

  // Create and return the service
  return new RecommendationsService(
    contentAgent,
    friendAgent,
    recommendationCacheRepository
  );
}

// Export singleton instance for server-side usage
export const serverRecommendationsService = createServerRecommendationsService();
