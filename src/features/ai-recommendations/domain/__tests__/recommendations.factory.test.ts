import { describe, it, expect, vi } from 'vitest';

// Mock all the repository dependencies
vi.mock('@/features/profile/data/watch-history.repository', () => ({
  watchHistoryRepository: {}
}));

vi.mock('@/features/profile/data/profiles.repository', () => ({
  profilesRepository: {}
}));

vi.mock('@/features/profile/data/friends.repository', () => ({
  friendsRepository: {}
}));

vi.mock('../data/recommendation-cache.repository', () => ({
  recommendationCacheRepository: {}
}));

vi.mock('@/app/api/tmdb/repository', () => ({
  discoverByGenre: vi.fn(),
  getTrendingNowOrUpcoming: vi.fn(),
  getTrendingOrAiringTV: vi.fn()
}));

// Import after mocking
const { createRecommendationsService, recommendationsService } = await import('../recommendations.factory');
const { RecommendationsService } = await import('../recommendations.service');

describe('RecommendationsFactory', () => {
  it('should create a RecommendationsService instance', () => {
    const service = createRecommendationsService();
    expect(service).toBeInstanceOf(RecommendationsService);
  });

  it('should provide a singleton service instance', () => {
    expect(recommendationsService).toBeInstanceOf(RecommendationsService);
  });

  it('should create different instances when called multiple times', () => {
    const service1 = createRecommendationsService();
    const service2 = createRecommendationsService();
    
    expect(service1).toBeInstanceOf(RecommendationsService);
    expect(service2).toBeInstanceOf(RecommendationsService);
    expect(service1).not.toBe(service2); // Different instances
  });

  it('should provide the same singleton instance', async () => {
    const { recommendationsService: service1 } = await import('../recommendations.factory');
    const { recommendationsService: service2 } = await import('../recommendations.factory');
    
    expect(service1).toBe(service2); // Same singleton instance
  });
});