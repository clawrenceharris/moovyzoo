import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { RecommendationSession } from '../../types/recommendations';

// Create mock functions
const mockSingle = vi.fn();
const mockSelect = vi.fn(() => ({ single: mockSingle }));
const mockEq = vi.fn(() => ({ eq: vi.fn(() => ({ single: mockSingle })) }));
const mockLt = vi.fn();
const mockEqDelete = vi.fn();
const mockDelete = vi.fn(() => ({ lt: mockLt, eq: mockEqDelete }));
const mockUpsert = vi.fn(() => ({ select: mockSelect }));
const mockFrom = vi.fn(() => ({
  select: vi.fn(() => ({ eq: mockEq })),
  delete: mockDelete,
  upsert: mockUpsert
}));

const mockSupabase = { from: mockFrom };

// Mock the server client creation
vi.mock('@/utils/supabase/server', () => ({
  createClient: vi.fn(() => Promise.resolve(mockSupabase))
}));

// Import after mocking
const { RecommendationCacheRepository } = await import('../recommendation-cache.repository');

describe('RecommendationCacheRepository', () => {
  let repository: RecommendationCacheRepository;
  const mockSession: RecommendationSession = {
    user_id: 'user-123',
    session_id: 'session-456',
    content_recommendations: [
      {
        tmdb_id: 123,
        title: 'Test Movie',
        media_type: 'movie',
        match_score: 85,
        short_explanation: 'Great match for your taste'
      }
    ],
    friend_suggestions: [
      {
        user_id: 'friend-789',
        display_name: 'John Doe',
        taste_match_score: 75,
        short_rationale: 'Similar movie preferences'
      }
    ],
    generated_at: new Date('2024-01-15T10:00:00Z'),
    expires_at: new Date('2024-01-16T10:00:00Z')
  };

  beforeEach(() => {
    repository = new RecommendationCacheRepository();
    vi.clearAllMocks();
  });

  describe('getCachedRecommendations', () => {
    it('should return cached recommendations when they exist', async () => {
      // Arrange
      const mockDbResult = {
        user_id: mockSession.user_id,
        session_id: mockSession.session_id,
        content_recommendations: mockSession.content_recommendations,
        friend_suggestions: mockSession.friend_suggestions,
        generated_at: mockSession.generated_at.toISOString(),
        expires_at: mockSession.expires_at.toISOString()
      };

      mockSingle.mockResolvedValue({
        data: mockDbResult,
        error: null
      });

      // Act
      const result = await repository.getCachedRecommendations('user-123', 'session-456', mockSupabase as any);

      // Assert
      expect(result).toEqual(mockSession);
      expect(mockFrom).toHaveBeenCalledWith('recommendation_sessions');
    });

    it('should return null when no cached recommendations exist', async () => {
      // Arrange
      mockSingle.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116' } // Not found error
      });

      // Act
      const result = await repository.getCachedRecommendations('user-123', 'session-456', mockSupabase as any);

      // Assert
      expect(result).toBeNull();
    });

    it('should throw error when database query fails', async () => {
      // Arrange
      mockSingle.mockResolvedValue({
        data: null,
        error: { message: 'Database connection failed' }
      });

      // Act & Assert
      await expect(
        repository.getCachedRecommendations('user-123', 'session-456', mockSupabase as any)
      ).rejects.toThrow('Database connection failed');
    });
  });

  describe('cacheRecommendations', () => {
    it('should successfully cache recommendations', async () => {
      // Arrange
      mockSingle.mockResolvedValue({
        data: { id: 'cache-id-123' },
        error: null
      });

      // Act
      await repository.cacheRecommendations(mockSession, mockSupabase as any);

      // Assert
      expect(mockFrom).toHaveBeenCalledWith('recommendation_sessions');
      expect(mockUpsert).toHaveBeenCalledWith({
        user_id: mockSession.user_id,
        session_id: mockSession.session_id,
        content_recommendations: mockSession.content_recommendations,
        friend_suggestions: mockSession.friend_suggestions,
        generated_at: mockSession.generated_at.toISOString(),
        expires_at: mockSession.expires_at.toISOString()
      });
    });

    it('should throw error when caching fails', async () => {
      // Arrange
      mockSingle.mockResolvedValue({
        data: null,
        error: { message: 'Insert failed' }
      });

      // Act & Assert
      await expect(
        repository.cacheRecommendations(mockSession, mockSupabase as any)
      ).rejects.toThrow('Insert failed');
    });
  });

  describe('clearExpiredCache', () => {
    it('should successfully clear expired cache entries', async () => {
      // Arrange
      mockLt.mockResolvedValue({
        error: null
      });

      // Act
      await repository.clearExpiredCache(mockSupabase as any);

      // Assert
      expect(mockFrom).toHaveBeenCalledWith('recommendation_sessions');
      expect(mockLt).toHaveBeenCalledWith('expires_at', expect.any(String));
    });

    it('should throw error when cleanup fails', async () => {
      // Arrange
      mockLt.mockResolvedValue({
        error: { message: 'Delete failed' }
      });

      // Act & Assert
      await expect(repository.clearExpiredCache(mockSupabase as any)).rejects.toThrow('Delete failed');
    });
  });

  describe('invalidateUserCache', () => {
    it('should successfully invalidate user cache', async () => {
      // Arrange
      mockEqDelete.mockResolvedValue({
        error: null
      });

      // Act
      await repository.invalidateUserCache('user-123', mockSupabase as any);

      // Assert
      expect(mockFrom).toHaveBeenCalledWith('recommendation_sessions');
    });

    it('should throw error when invalidation fails', async () => {
      // Arrange
      mockEqDelete.mockResolvedValue({
        error: { message: 'Delete failed' }
      });

      // Act & Assert
      await expect(repository.invalidateUserCache('user-123', mockSupabase as any)).rejects.toThrow('Delete failed');
    });
  });
});