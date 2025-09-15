import { describe, it, expect, beforeEach, vi } from 'vitest';
import { RecommendationsService } from '../recommendations.service';
import type { ContentRecommendationAgent } from '../content-recommendation-agent';
import type { FriendSuggestionAgent } from '../friend-suggestion-agent';
import type { RecommendationCacheRepository } from '../../data/recommendation-cache.repository';
import type { ContentRecommendation, FriendSuggestion, RecommendationSession } from '../../types/recommendations';

describe('RecommendationsService', () => {
  let service: RecommendationsService;
  let mockContentAgent: jest.Mocked<ContentRecommendationAgent>;
  let mockFriendAgent: jest.Mocked<FriendSuggestionAgent>;
  let mockCacheRepository: jest.Mocked<RecommendationCacheRepository>;

  const mockContentRecommendations: ContentRecommendation[] = [
    {
      tmdb_id: 123,
      title: 'Test Movie',
      media_type: 'movie',
      match_score: 85,
      short_explanation: 'Great match for your taste'
    }
  ];

  const mockFriendSuggestions: FriendSuggestion[] = [
    {
      user_id: 'friend-789',
      display_name: 'John Doe',
      taste_match_score: 75,
      short_rationale: 'Similar movie preferences'
    }
  ];

  const mockCachedSession: RecommendationSession = {
    user_id: 'user-123',
    session_id: 'session-456',
    content_recommendations: mockContentRecommendations,
    friend_suggestions: mockFriendSuggestions,
    generated_at: new Date('2024-01-15T10:00:00Z'),
    expires_at: new Date('2024-01-16T10:00:00Z')
  };

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

  describe('getRecommendations', () => {
    it('should return cached recommendations when available and not expired', async () => {
      // Arrange
      const futureExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now
      const validCachedSession = { ...mockCachedSession, expires_at: futureExpiry };
      
      mockCacheRepository.getCachedRecommendations.mockResolvedValue(validCachedSession);

      // Act
      const result = await service.getRecommendations('user-123', 'session-456', false);

      // Assert
      expect(result).toEqual({
        content_recommendations: mockContentRecommendations,
        friend_suggestions: mockFriendSuggestions,
        cached: true
      });
      expect(mockCacheRepository.getCachedRecommendations).toHaveBeenCalledWith('user-123', 'session-456', undefined);
      expect(mockContentAgent.generateRecommendations).not.toHaveBeenCalled();
      expect(mockFriendAgent.generateSuggestions).not.toHaveBeenCalled();
    });

    it('should generate fresh recommendations when cache is expired', async () => {
      // Arrange
      const expiredSession = { ...mockCachedSession, expires_at: new Date('2024-01-14T10:00:00Z') };
      mockCacheRepository.getCachedRecommendations.mockResolvedValue(expiredSession);
      mockContentAgent.generateRecommendations.mockResolvedValue(mockContentRecommendations);
      mockFriendAgent.generateSuggestions.mockResolvedValue(mockFriendSuggestions);
      mockCacheRepository.cacheRecommendations.mockResolvedValue();

      // Act
      const result = await service.getRecommendations('user-123', 'session-456', false);

      // Assert
      expect(result).toEqual({
        content_recommendations: mockContentRecommendations,
        friend_suggestions: mockFriendSuggestions,
        cached: false
      });
      expect(mockContentAgent.generateRecommendations).toHaveBeenCalledWith('user-123');
      expect(mockFriendAgent.generateSuggestions).toHaveBeenCalledWith('user-123');
      expect(mockCacheRepository.cacheRecommendations).toHaveBeenCalledWith(expect.any(Object), undefined);
    });

    it('should generate fresh recommendations when no cache exists', async () => {
      // Arrange
      mockCacheRepository.getCachedRecommendations.mockResolvedValue(null);
      mockContentAgent.generateRecommendations.mockResolvedValue(mockContentRecommendations);
      mockFriendAgent.generateSuggestions.mockResolvedValue(mockFriendSuggestions);
      mockCacheRepository.cacheRecommendations.mockResolvedValue();

      // Act
      const result = await service.getRecommendations('user-123', 'session-456', false);

      // Assert
      expect(result).toEqual({
        content_recommendations: mockContentRecommendations,
        friend_suggestions: mockFriendSuggestions,
        cached: false
      });
      expect(mockContentAgent.generateRecommendations).toHaveBeenCalledWith('user-123');
      expect(mockFriendAgent.generateSuggestions).toHaveBeenCalledWith('user-123');
      expect(mockCacheRepository.cacheRecommendations).toHaveBeenCalledWith(expect.any(Object), undefined);
    });

    it('should force refresh when forceRefresh is true', async () => {
      // Arrange
      const validCachedSession = { ...mockCachedSession, expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000) };
      mockCacheRepository.getCachedRecommendations.mockResolvedValue(validCachedSession);
      mockContentAgent.generateRecommendations.mockResolvedValue(mockContentRecommendations);
      mockFriendAgent.generateSuggestions.mockResolvedValue(mockFriendSuggestions);
      mockCacheRepository.cacheRecommendations.mockResolvedValue();

      // Act
      const result = await service.getRecommendations('user-123', 'session-456', true);

      // Assert
      expect(result).toEqual({
        content_recommendations: mockContentRecommendations,
        friend_suggestions: mockFriendSuggestions,
        cached: false
      });
      expect(mockContentAgent.generateRecommendations).toHaveBeenCalledWith('user-123');
      expect(mockFriendAgent.generateSuggestions).toHaveBeenCalledWith('user-123');
      expect(mockCacheRepository.cacheRecommendations).toHaveBeenCalledWith(expect.any(Object), undefined);
    });

    it('should handle agent failures gracefully', async () => {
      // Arrange
      mockCacheRepository.getCachedRecommendations.mockResolvedValue(null);
      mockContentAgent.generateRecommendations.mockRejectedValue(new Error('Content agent failed'));
      mockFriendAgent.generateSuggestions.mockResolvedValue(mockFriendSuggestions);

      // Act
      const result = await service.getRecommendations('user-123', 'session-456', false);

      // Assert
      expect(result).toEqual({
        content_recommendations: [],
        friend_suggestions: mockFriendSuggestions,
        cached: false
      });
    });

    it('should handle cache failures gracefully', async () => {
      // Arrange
      mockCacheRepository.getCachedRecommendations.mockRejectedValue(new Error('Cache failed'));
      mockContentAgent.generateRecommendations.mockResolvedValue(mockContentRecommendations);
      mockFriendAgent.generateSuggestions.mockResolvedValue(mockFriendSuggestions);
      mockCacheRepository.cacheRecommendations.mockResolvedValue();

      // Act
      const result = await service.getRecommendations('user-123', 'session-456', false);

      // Assert
      expect(result).toEqual({
        content_recommendations: mockContentRecommendations,
        friend_suggestions: mockFriendSuggestions,
        cached: false
      });
    });
  });

  describe('refreshRecommendations', () => {
    it('should invalidate cache and generate fresh recommendations', async () => {
      // Arrange
      mockCacheRepository.invalidateUserCache.mockResolvedValue();
      mockContentAgent.generateRecommendations.mockResolvedValue(mockContentRecommendations);
      mockFriendAgent.generateSuggestions.mockResolvedValue(mockFriendSuggestions);
      mockCacheRepository.cacheRecommendations.mockResolvedValue();

      // Act
      const result = await service.refreshRecommendations('user-123', 'session-456');

      // Assert
      expect(result).toEqual({
        content_recommendations: mockContentRecommendations,
        friend_suggestions: mockFriendSuggestions,
        cached: false
      });
      expect(mockCacheRepository.invalidateUserCache).toHaveBeenCalledWith('user-123', undefined);
      expect(mockContentAgent.generateRecommendations).toHaveBeenCalledWith('user-123');
      expect(mockFriendAgent.generateSuggestions).toHaveBeenCalledWith('user-123');
    });
  });

  describe('cleanupExpiredCache', () => {
    it('should call cache repository cleanup method', async () => {
      // Arrange
      mockCacheRepository.clearExpiredCache.mockResolvedValue();

      // Act
      await service.cleanupExpiredCache();

      // Assert
      expect(mockCacheRepository.clearExpiredCache).toHaveBeenCalledWith(undefined);
    });
  });
});