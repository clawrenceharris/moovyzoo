import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ContentRecommendationAgent } from '../content-recommendation-agent';
import { WatchHistoryRepository } from '@/features/profile/data/watch-history.repository';
import { ProfilesRepository } from '@/features/profile/data/profiles.repository';
import { FriendsRepository } from '@/features/profile/data/friends.repository';
import type { UserProfile, WatchHistoryEntry } from '@/features/profile/domain/profiles.types';
import type { ContentRecommendation, TasteProfile } from '../../types/recommendations';
import { discoverByGenre, getTrendingNowOrUpcoming, getTrendingOrAiringTV } from '@/app/api/tmdb/repository';

// Mock the repositories
vi.mock('@/features/profile/data/watch-history.repository');
vi.mock('@/features/profile/data/profiles.repository');
vi.mock('@/features/profile/data/friends.repository');

// Mock TMDB repository functions
vi.mock('@/app/api/tmdb/repository', () => ({
  discoverByGenre: vi.fn(),
  getTrendingNowOrUpcoming: vi.fn(),
  getTrendingOrAiringTV: vi.fn()
}));

describe('ContentRecommendationAgent', () => {
  let agent: ContentRecommendationAgent;
  let mockWatchHistoryRepo: vi.Mocked<WatchHistoryRepository>;
  let mockProfilesRepo: vi.Mocked<ProfilesRepository>;
  let mockFriendsRepo: vi.Mocked<FriendsRepository>;

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
    },
    {
      id: 'watch-2',
      userId: 'user-1',
      movieId: '603',
      title: 'The Matrix',
      mediaType: 'movie',
      status: 'watched',
      rating: 8,
      watchedAt: new Date('2024-01-10')
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    
    mockWatchHistoryRepo = {
      getRecentActivity: vi.fn(),
      getUserWatchHistory: vi.fn(),
      addWatchEntry: vi.fn(),
      updateWatchEntry: vi.fn(),
      getWatchEntry: vi.fn(),
      deleteWatchEntry: vi.fn()
    } as any;

    mockProfilesRepo = {
      getByUserId: vi.fn(),
      create: vi.fn(),
      updateByUserId: vi.fn(),
      updateLastActive: vi.fn(),
      existsByUserId: vi.fn(),
      getPublicProfiles: vi.fn(),
      getPublicProfilesWithFriendStatus: vi.fn(),
      getProfileWithFriendStatus: vi.fn(),
      deleteByUserId: vi.fn()
    } as any;

    mockFriendsRepo = {
      getFriends: vi.fn(),
      sendFriendRequest: vi.fn(),
      acceptFriendRequest: vi.fn(),
      declineFriendRequest: vi.fn(),
      getFriendStatus: vi.fn(),
      getPendingRequests: vi.fn(),
      removeFriend: vi.fn()
    } as any;

    // Mock TMDB repository functions
    vi.mocked(discoverByGenre).mockResolvedValue([]);
    vi.mocked(getTrendingNowOrUpcoming).mockResolvedValue([]);
    vi.mocked(getTrendingOrAiringTV).mockResolvedValue([]);

    agent = new ContentRecommendationAgent(
      mockWatchHistoryRepo,
      mockProfilesRepo,
      mockFriendsRepo
    );
  });

  describe('buildTasteProfile', () => {
    it('should build taste profile from user data', async () => {
      // Arrange
      mockProfilesRepo.getByUserId.mockResolvedValue(mockUserProfile);
      mockWatchHistoryRepo.getRecentActivity.mockResolvedValue(mockWatchHistory);

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
          average_rating: 8.5,
          rating_distribution: {
            8: 1,
            9: 1
          }
        }
      });

      expect(mockProfilesRepo.getByUserId).toHaveBeenCalledWith('user-1');
      expect(mockWatchHistoryRepo.getRecentActivity).toHaveBeenCalledWith('user-1', 50);
    });

    it('should handle users with no watch history', async () => {
      // Arrange
      mockProfilesRepo.getByUserId.mockResolvedValue(mockUserProfile);
      mockWatchHistoryRepo.getRecentActivity.mockResolvedValue([]);

      // Act
      const tasteProfile = await agent.buildTasteProfile('user-1');

      // Assert
      expect(tasteProfile.recent_watches).toEqual([]);
      expect(tasteProfile.rating_patterns.average_rating).toBe(0);
      expect(tasteProfile.rating_patterns.rating_distribution).toEqual({});
    });
  });

  describe('generateRecommendations', () => {
    it('should generate content recommendations for active user', async () => {
      // Arrange
      mockProfilesRepo.getByUserId.mockResolvedValue(mockUserProfile);
      mockWatchHistoryRepo.getRecentActivity.mockResolvedValue(mockWatchHistory);

      // Act
      const recommendations = await agent.generateRecommendations('user-1');

      // Assert
      expect(recommendations).toBeInstanceOf(Array);
      expect(mockProfilesRepo.getByUserId).toHaveBeenCalledWith('user-1');
      expect(mockWatchHistoryRepo.getRecentActivity).toHaveBeenCalledWith('user-1', 50);
    });

    it('should handle cold start users with fallback strategy', async () => {
      // Arrange
      const coldStartProfile = {
        ...mockUserProfile,
        favoriteGenres: ['Drama'],
        favoriteTitles: ['Parasite']
      };
      mockProfilesRepo.getByUserId.mockResolvedValue(coldStartProfile);
      mockWatchHistoryRepo.getRecentActivity.mockResolvedValue([]);

      // Act
      const recommendations = await agent.generateRecommendations('user-1');

      // Assert
      expect(recommendations).toBeInstanceOf(Array);
    });
  });

  describe('scoreRecommendations', () => {
    it('should calculate explainable match scores', async () => {
      // Arrange
      const mockTasteProfile: TasteProfile = {
        user_id: 'user-1',
        favorite_genres: ['Action', 'Sci-Fi'],
        favorite_titles: ['Inception', 'The Matrix'],
        recent_watches: mockWatchHistory,
        genre_weights: { 'Action': 0.5, 'Sci-Fi': 0.5 },
        rating_patterns: {
          average_rating: 8.5,
          rating_distribution: { 8: 1, 9: 1 }
        }
      };

      const mockCandidates = [
        {
          id: 550,
          title: 'Fight Club',
          genre_ids: [18, 53], // Drama, Thriller
          vote_average: 8.4,
          poster_path: '/poster.jpg'
        }
      ];

      // Act
      const scoredRecommendations = await agent.scoreRecommendations(mockCandidates, mockTasteProfile);

      // Assert
      expect(scoredRecommendations).toBeInstanceOf(Array);
      expect(scoredRecommendations[0]).toHaveProperty('match_score');
      expect(scoredRecommendations[0]).toHaveProperty('short_explanation');
      expect(scoredRecommendations[0].match_score).toBeGreaterThanOrEqual(0);
      expect(scoredRecommendations[0].match_score).toBeLessThanOrEqual(100);
    });
  });
});