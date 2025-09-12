import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '../route';
import { NextRequest } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { watchHistoryServerRepository } from '@/features/profile/data/watch-history.server';
import { AppErrorCode } from '@/utils/error-codes';

// Mock dependencies
vi.mock('@/utils/supabase/server');
vi.mock('@/features/profile/data/watch-history.server');

const mockCreateClient = vi.mocked(createClient);
const mockWatchHistoryRepository = vi.mocked(watchHistoryServerRepository);

describe('POST /api/watch-history', () => {
  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
  };

  const validWatchHistoryData = {
    movieId: '12345',
    title: 'Test Movie',
    posterUrl: '/test-poster.jpg',
    mediaType: 'movie' as const,
    status: 'watched' as const,
    rating: 8,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create watch history entry successfully', async () => {
    // Arrange
    const mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: mockUser },
          error: null,
        }),
      },
    };
    mockCreateClient.mockResolvedValue(mockSupabase as any);

    const mockWatchEntry = {
      id: 'watch-123',
      userId: mockUser.id,
      ...validWatchHistoryData,
      watchedAt: new Date(),
    };
    mockWatchHistoryRepository.addWatchEntry.mockResolvedValue(mockWatchEntry);

    const request = new NextRequest('http://localhost/api/watch-history', {
      method: 'POST',
      body: JSON.stringify(validWatchHistoryData),
    });

    // Act
    const response = await POST(request);
    const data = await response.json();

    // Assert
    expect(response.status).toBe(201);
    expect(data.success).toBe(true);
    expect(data.data).toEqual({
      id: mockWatchEntry.id,
      movieId: mockWatchEntry.movieId,
      title: mockWatchEntry.title,
      posterUrl: mockWatchEntry.posterUrl,
      mediaType: mockWatchEntry.mediaType,
      status: mockWatchEntry.status,
      rating: mockWatchEntry.rating,
      watchedAt: mockWatchEntry.watchedAt.toISOString(),
    });
    expect(mockWatchHistoryRepository.addWatchEntry).toHaveBeenCalledWith({
      userId: mockUser.id,
      ...validWatchHistoryData,
    });
  });

  it('should return 401 when user is not authenticated', async () => {
    // Arrange
    const mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: null },
          error: new Error('Not authenticated'),
        }),
      },
    };
    mockCreateClient.mockResolvedValue(mockSupabase as any);

    const request = new NextRequest('http://localhost/api/watch-history', {
      method: 'POST',
      body: JSON.stringify(validWatchHistoryData),
    });

    // Act
    const response = await POST(request);
    const data = await response.json();

    // Assert
    expect(response.status).toBe(401);
    expect(data.code).toBe(AppErrorCode.UNAUTHORIZED);
  });

  it('should return 400 for invalid request data', async () => {
    // Arrange
    const mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: mockUser },
          error: null,
        }),
      },
    };
    mockCreateClient.mockResolvedValue(mockSupabase as any);

    const invalidData = {
      movieId: '', // Invalid: empty string
      title: 'Test Movie',
      mediaType: 'invalid', // Invalid: not 'movie' or 'tv'
      status: 'watched',
    };

    const request = new NextRequest('http://localhost/api/watch-history', {
      method: 'POST',
      body: JSON.stringify(invalidData),
    });

    // Act
    const response = await POST(request);
    const data = await response.json();

    // Assert
    expect(response.status).toBe(400);
    expect(data.code).toBe(AppErrorCode.VALIDATION_ERROR);
    expect(data.details).toBeDefined();
  });

  it('should return 400 for invalid TMDB data', async () => {
    // Arrange
    const mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: mockUser },
          error: null,
        }),
      },
    };
    mockCreateClient.mockResolvedValue(mockSupabase as any);

    mockWatchHistoryRepository.addWatchEntry.mockRejectedValue(
      new Error('Valid TMDB movie/TV ID is required')
    );

    const request = new NextRequest('http://localhost/api/watch-history', {
      method: 'POST',
      body: JSON.stringify(validWatchHistoryData),
    });

    // Act
    const response = await POST(request);
    const data = await response.json();

    // Assert
    expect(response.status).toBe(400);
    expect(data.code).toBe(AppErrorCode.WATCH_HISTORY_INVALID);
  });

  it('should handle repository errors gracefully', async () => {
    // Arrange
    const mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: mockUser },
          error: null,
        }),
      },
    };
    mockCreateClient.mockResolvedValue(mockSupabase as any);

    mockWatchHistoryRepository.addWatchEntry.mockRejectedValue(
      new Error('Database connection failed')
    );

    const request = new NextRequest('http://localhost/api/watch-history', {
      method: 'POST',
      body: JSON.stringify(validWatchHistoryData),
    });

    // Act
    const response = await POST(request);
    const data = await response.json();

    // Assert
    expect(response.status).toBe(500);
    expect(data.error).toBeDefined();
  });

  it('should handle missing required fields', async () => {
    // Arrange
    const mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: mockUser },
          error: null,
        }),
      },
    };
    mockCreateClient.mockResolvedValue(mockSupabase as any);

    const incompleteData = {
      movieId: '12345',
      // Missing title, mediaType, status
    };

    const request = new NextRequest('http://localhost/api/watch-history', {
      method: 'POST',
      body: JSON.stringify(incompleteData),
    });

    // Act
    const response = await POST(request);
    const data = await response.json();

    // Assert
    expect(response.status).toBe(400);
    expect(data.code).toBe(AppErrorCode.VALIDATION_ERROR);
  });

  it('should handle invalid rating values', async () => {
    // Arrange
    const mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: mockUser },
          error: null,
        }),
      },
    };
    mockCreateClient.mockResolvedValue(mockSupabase as any);

    const invalidRatingData = {
      ...validWatchHistoryData,
      rating: 15, // Invalid: should be 1-10
    };

    const request = new NextRequest('http://localhost/api/watch-history', {
      method: 'POST',
      body: JSON.stringify(invalidRatingData),
    });

    // Act
    const response = await POST(request);
    const data = await response.json();

    // Assert
    expect(response.status).toBe(400);
    expect(data.code).toBe(AppErrorCode.VALIDATION_ERROR);
  });
});