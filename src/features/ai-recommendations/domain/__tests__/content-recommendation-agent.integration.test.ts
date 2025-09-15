import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ContentRecommendationAgent } from '../content-recommendation-agent';
import { watchHistoryRepository } from '@/features/profile/data/watch-history.repository';
import { profilesRepository } from '@/features/profile/data/profiles.repository';
import { friendsRepository } from '@/features/profile/data/friends.repository';
import type { UserProfile, WatchHistoryEntry } from '@/features/profile/domain/profiles.types';

// Mock TMDB repository to avoid API key requirement
vi.mock('@/app/api/tmdb/repository', () => ({
  discoverByGenre: vi.fn().mockResolvedValue([
    {
      id: 550,
      title: 'Fight Club',
      genre_ids: [18, 53],
      vote_average: 8.4,
      poster_path: '/poster.jpg'
    }
  ]),
  getTrendingNowOrUpcoming: vi.fn().mockResolvedValue([
    {
      id: 27205,
      title: 'Inception',
      genre_ids: [28, 878, 53],
      vote_average: 8.8,
      poster_path: '/inception.jpg'
    }
  ]),
  getTrendingOrAiringTV: vi.fn().mockResolvedValue([
    {
      id: 1399,
      name: 'Game of Thrones',
      genre_ids: [18, 10759, 10765],
      vote_average: 9.2,
      poster_path: '/got.jpg'
    }
  ])
}));

// Mock repositories
vi.mock('@/features/profile/data/watch-history.repository');
vi.mock('@/features/profile/data/profiles.repository');
vi.mock('@/features/profile/data/friends.repository');

describe('ContentRecommendationAgent Integration', () => {
  let agent: ContentRecommendationAgent;

  const mockUserProfile: UserProfile = {
    id: 'profile-1',
    userId: 'user-1',
    email: 'test@example.com',
    displayName: 'Test User',
    favoriteGenres: ['Action', 'Sci-Fi'],
    favoriteTitles: ['Inception', 'The Matrix'],
    isPublic: true,
    onboardingCompleted: true,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const mockWatchHistory: WatchHistoryEntry[] = [
    {
      id: 'watch-1',
      userId: 'user-1',
      movieId: '27205',
      title: 'Inception',
      mediaType: 'movie',
      status: 'watched',
      rating: 9,
      watchedAt: new Date('2024-01-15')
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock repository methods
    vi.mocked(profilesRepository.getByUserId).mockResolvedValue(mockUserProfile);
    vi.mocked(watchHistoryRepository.getRecentActivity).mockResolvedValue(mockWatchHistory);

    agent = new ContentRecommendationAgent(
      watchHistoryRepository,
      profilesRepository,
      friendsRepository
    );
  });

  it('should generate recommendations with real repository integration', async () => {
    // Act
    const recommendations = await agent.generateRecommendations('user-1');

    // Assert
    expect(recommendations).toBeInstanceOf(Array);
    expect(recommendations.length).toBeGreaterThan(0);
    
    // Check that recommendations have required properties
    recommendations.forEach(rec => {
      expect(rec).toHaveProperty('tmdb_id');
      expect(rec).toHaveProperty('title');
      expect(rec).toHaveProperty('media_type');
      expect(rec).toHaveProperty('match_score');
      expect(rec).toHaveProperty('short_explanation');
      expect(rec.match_score).toBeGreaterThanOrEqual(0);
      expect(rec.match_score).toBeLessThanOrEqual(100);
    });

    // Verify repository methods were called
    expect(profilesRepository.getByUserId).toHaveBeenCalledWith('user-1');
    expect(watchHistoryRepository.getRecentActivity).toHaveBeenCalledWith('user-1', 50);
  });

  it('should build taste profile correctly', async () => {
    // Act
    const tasteProfile = await agent.buildTasteProfile('user-1');

    // Assert
    expect(tasteProfile).toEqual({
      user_id: 'user-1',
      favorite_genres: ['Action', 'Sci-Fi'],
      favorite_titles: ['Inception', 'The Matrix'],
      recent_watches: mockWatchHistory,
      genre_weights: {
        'Action': 0.5,
        'Sci-Fi': 0.5
      },
      rating_patterns: {
        average_rating: 9,
        rating_distribution: {
          9: 1
        }
      }
    });
  });

  it('should handle errors gracefully and provide fallback', async () => {
    // Arrange - make repository throw error
    vi.mocked(profilesRepository.getByUserId).mockRejectedValue(new Error('Database error'));

    // Act
    const recommendations = await agent.generateRecommendations('user-1');

    // Assert - should still return recommendations (fallback)
    expect(recommendations).toBeInstanceOf(Array);
  });
});