export * from './types';
export * from './domain';
export * from './data';
export * from './hooks';
export * from './components';

// Main exports for external use
export { ContentRecommendationAgent } from './domain/content-recommendation-agent';
export { FriendSuggestionAgent } from './domain/friend-suggestion-agent';
export { RecommendationsService } from './domain/recommendations.service';
export { createRecommendationsService, recommendationsService } from './domain/recommendations.factory';
export { RecommendationCacheRepository, recommendationCacheRepository } from './data/recommendation-cache.repository';