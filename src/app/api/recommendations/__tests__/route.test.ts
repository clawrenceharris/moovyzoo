import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// Mock all dependencies before importing the route handlers
vi.mock('@/utils/supabase/server', () => ({
  createClient: vi.fn()
}));

vi.mock('@/features/ai-recommendations/domain/recommendations.factory', () => ({
  recommendationsService: {
    getRecommendations: vi.fn(),
    refreshRecommendations: vi.fn()
  }
}));

vi.mock('@/utils/normalize-error', () => ({
  normalizeError: vi.fn().mockReturnValue({ code: 'SERVER_ERROR' }),
  getUserErrorMessage: vi.fn()
}));

vi.mock('@/utils/error-codes', () => ({
  AppErrorCode: {
    UNAUTHORIZED: 'UNAUTHORIZED',
    RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED'
  }
}));

vi.mock('@/utils/rate-limiter', () => ({
  recommendationsRateLimiter: {
    isAllowed: vi.fn().mockReturnValue(true),
    getTimeUntilReset: vi.fn().mockReturnValue(60000)
  },
  refreshRateLimiter: {
    isAllowed: vi.fn().mockReturnValue(true),
    getTimeUntilReset: vi.fn().mockReturnValue(300000)
  }
}));

// Now import the route handlers
import { GET } from '../route';
import { POST } from '../refresh/route';
import { createClient } from '@/utils/supabase/server';
import { recommendationsService } from '@/features/ai-recommendations/domain/recommendations.factory';
import { getUserErrorMessage } from '@/utils/normalize-error';
import { recommendationsRateLimiter, refreshRateLimiter } from '@/utils/rate-limiter';

const mockCreateClient = vi.mocked(createClient);
const mockRecommendationsService = vi.mocked(recommendationsService);
const mockGetUserErrorMessage = vi.mocked(getUserErrorMessage);
const mockRecommendationsRateLimiter = vi.mocked(recommendationsRateLimiter);
const mockRefreshRateLimiter = vi.mocked(refreshRateLimiter);

describe('/api/recommendations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/recommendations', () => {
    it('should return 401 when user is not authenticated', async () => {
      // Arrange
      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: null },
            error: new Error('Not authenticated')
          })
        }
      };
      mockCreateClient.mockResolvedValue(mockSupabase as any);
      mockGetUserErrorMessage.mockReturnValue('Unauthorized access');

      const request = new NextRequest('http://localhost:3000/api/recommendations');

      // Act
      const response = await GET(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(401);
      expect(data.error).toBeDefined();
      expect(data.code).toBe('UNAUTHORIZED');
    });

    it('should return recommendations for authenticated user', async () => {
      // Arrange
      const mockUser = { id: 'user-123' };
      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: mockUser },
            error: null
          })
        }
      };
      mockCreateClient.mockResolvedValue(mockSupabase as any);

      const mockRecommendations = {
        content_recommendations: [
          {
            tmdb_id: 123,
            title: 'Test Movie',
            media_type: 'movie' as const,
            match_score: 85,
            short_explanation: 'Great action movie'
          }
        ],
        friend_suggestions: [
          {
            user_id: 'friend-123',
            display_name: 'John Doe',
            taste_match_score: 90,
            short_rationale: 'Similar taste in action movies'
          }
        ],
        cached: false
      };

      mockRecommendationsService.getRecommendations.mockResolvedValue(mockRecommendations);

      const request = new NextRequest('http://localhost:3000/api/recommendations');

      // Act
      const response = await GET(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual({
        content_recommendations: mockRecommendations.content_recommendations,
        friend_suggestions: mockRecommendations.friend_suggestions,
        cached: false,
        generated_at: expect.any(String)
      });
    });

    it('should handle service errors gracefully', async () => {
      // Arrange
      const mockUser = { id: 'user-123' };
      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: mockUser },
            error: null
          })
        }
      };
      mockCreateClient.mockResolvedValue(mockSupabase as any);
      mockGetUserErrorMessage.mockReturnValue('Service unavailable');

      mockRecommendationsService.getRecommendations.mockRejectedValue(
        new Error('Service unavailable')
      );

      const request = new NextRequest('http://localhost:3000/api/recommendations');

      // Act
      const response = await GET(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(500);
      expect(data.error).toBeDefined();
      expect(data.success).toBe(false);
    });

    it('should return 429 when rate limit exceeded', async () => {
      // Arrange
      const mockUser = { id: 'user-123' };
      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: mockUser },
            error: null
          })
        }
      };
      mockCreateClient.mockResolvedValue(mockSupabase as any);
      mockGetUserErrorMessage.mockReturnValue('Rate limit exceeded');
      mockRecommendationsRateLimiter.isAllowed.mockReturnValue(false);
      mockRecommendationsRateLimiter.getTimeUntilReset.mockReturnValue(30000);

      const request = new NextRequest('http://localhost:3000/api/recommendations');

      // Act
      const response = await GET(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(429);
      expect(data.error).toBeDefined();
      expect(data.code).toBe('RATE_LIMIT_EXCEEDED');
      expect(data.retryAfter).toBe(30);
    });
  });

  describe('POST /api/recommendations/refresh', () => {
    it('should return 401 when user is not authenticated', async () => {
      // Arrange
      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: null },
            error: new Error('Not authenticated')
          })
        }
      };
      mockCreateClient.mockResolvedValue(mockSupabase as any);
      mockGetUserErrorMessage.mockReturnValue('Unauthorized access');

      const request = new NextRequest('http://localhost:3000/api/recommendations/refresh', {
        method: 'POST'
      });

      // Act
      const response = await POST(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(401);
      expect(data.error).toBeDefined();
      expect(data.code).toBe('UNAUTHORIZED');
    });

    it('should refresh recommendations for authenticated user', async () => {
      // Arrange
      const mockUser = { id: 'user-123' };
      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: mockUser },
            error: null
          })
        }
      };
      mockCreateClient.mockResolvedValue(mockSupabase as any);

      const mockRecommendations = {
        content_recommendations: [],
        friend_suggestions: [],
        cached: false
      };

      mockRecommendationsService.refreshRecommendations.mockResolvedValue(mockRecommendations);

      const request = new NextRequest('http://localhost:3000/api/recommendations/refresh', {
        method: 'POST',
        body: JSON.stringify({ force_refresh: true })
      });

      // Act
      const response = await POST(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual({
        content_recommendations: [],
        friend_suggestions: [],
        generated_at: expect.any(String)
      });
    });

    it('should return 429 when refresh rate limit exceeded', async () => {
      // Arrange
      const mockUser = { id: 'user-123' };
      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: mockUser },
            error: null
          })
        }
      };
      mockCreateClient.mockResolvedValue(mockSupabase as any);
      mockGetUserErrorMessage.mockReturnValue('Rate limit exceeded');
      mockRefreshRateLimiter.isAllowed.mockReturnValue(false);
      mockRefreshRateLimiter.getTimeUntilReset.mockReturnValue(180000);

      const request = new NextRequest('http://localhost:3000/api/recommendations/refresh', {
        method: 'POST'
      });

      // Act
      const response = await POST(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(429);
      expect(data.error).toBeDefined();
      expect(data.code).toBe('RATE_LIMIT_EXCEEDED');
      expect(data.retryAfter).toBe(180);
    });
  });
});