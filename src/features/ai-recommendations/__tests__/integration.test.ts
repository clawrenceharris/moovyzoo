import { describe, it, expect, beforeEach, vi } from 'vitest';
import { RecommendationsService } from '../domain/recommendations.service';
import { ContentRecommendationAgent } from '../domain/content-recommendation-agent';
import { FriendSuggestionAgent } from '../domain/friend-suggestion-agent';
import { RecommendationCacheRepository } from '../data/recommendation-cache.repository';

// Mock all dependencies
vi.mock('../domain/content-recommendation-agent');
vi.mock('../domain/friend-suggestion-agent');
vi.mock('../data/recommendation-cache.repository');

describe('AI Recommendations Integration', () => {
  let service: RecommendationsService;
  let mockContentAgent: jest.Mocked<ContentRecommendationAgent>;
  let mockFriendAgent: jest.Mocked<FriendSuggestionAgent>;
  let mockCacheRepository: jest.Mocked<RecommendationCacheRepository>;

  beforeEach(() => {
    mockContentAgent = {
      generateRecommendations: vi.fn()
    } as any;

    mockFriendAgent = {
      generateSuggestions: vi.fn()
    } as any;

    mockCacheRepository = {
      getCachedRecommendations: vi.fn(),
      cacheRecommendations: vi.fn(),
      clearExpiredCache: vi.fn(),
      invalidateUserCache: vi.fn()
    } as any;

    service = new RecommendationsService(
      mockContentAgent,
      mockFriendAgent,
      mockCacheRepository
    );

    vi.clearAllMocks();
  });

  it('should create service with all dependencies', () => {
    expect(service).toBeInstanceOf(RecommendationsService);
  });

  it('should orchestrate content and friend agents for fresh recommendations', async () => {
    // Arrange
    const mockContentRecs = [
      {
        tmdb_id: 123,
        title: 'Test Movie',
        media_type: 'movie' as const,
        match_score: 85,
        short_explanation: 'Great match'
      }
    ];

    const mockFriendSuggestions = [
      {
        user_id: 'friend-123',
        display_name: 'John Doe',
        taste_match_score: 75,
        short_rationale: 'Similar taste'
      }
    ];

    mockCacheRepository.getCachedRecommendations.mockResolvedValue(null);
    mockContentAgent.generateRecommendations.mockResolvedValue(mockContentRecs);
    mockFriendAgent.generateSuggestions.mockResolvedValue(mockFriendSuggestions);
    mockCacheRepository.cacheRecommendations.mockResolvedValue();

    // Act
    const result = await service.getRecommendations('user-123', 'session-456');

    // Assert
    expect(result).toEqual({
      content_recommendations: mockContentRecs,
      friend_suggestions: mockFriendSuggestions,
      cached: false
    });

    expect(mockContentAgent.generateRecommendations).toHaveBeenCalledWith('user-123');
    expect(mockFriendAgent.generateSuggestions).toHaveBeenCalledWith('user-123');
    expect(mockCacheRepository.cacheRecommendations).toHaveBeenCalled();
  });

  it('should handle service initialization with proper dependency injection', () => {
    // This test verifies that the service can be properly instantiated
    // with all its dependencies, which is important for the overall architecture
    expect(service).toBeDefined();
    expect(typeof service.getRecommendations).toBe('function');
    expect(typeof service.refreshRecommendations).toBe('function');
    expect(typeof service.cleanupExpiredCache).toBe('function');
  });
});