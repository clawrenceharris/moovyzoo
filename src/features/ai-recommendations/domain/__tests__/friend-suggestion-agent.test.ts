import { describe, it, expect, beforeEach, vi } from 'vitest';
import { FriendSuggestionAgent } from '../friend-suggestion-agent';
import type { ProfilesRepository } from '@/features/profile/data/profiles.repository';
import type { FriendsRepository } from '@/features/profile/data/friends.repository';
import type { WatchHistoryRepository } from '@/features/profile/data/watch-history.repository';
import type { UserProfile, WatchHistoryEntry, PublicProfile } from '@/features/profile/domain/profiles.types';

// Mock repositories
const mockProfilesRepository = {
  getPublicProfiles: vi.fn(),
  getByUserId: vi.fn(),
} as unknown as ProfilesRepository;

const mockFriendsRepository = {
  getFriends: vi.fn(),
} as unknown as FriendsRepository;

const mockWatchHistoryRepository = {
  getRecentActivity: vi.fn(),
} as unknown as WatchHistoryRepository;

describe('FriendSuggestionAgent', () => {
  let agent: FriendSuggestionAgent;

  beforeEach(() => {
    vi.clearAllMocks();
    agent = new FriendSuggestionAgent(
      mockProfilesRepository,
      mockFriendsRepository,
      mockWatchHistoryRepository
    );
  });

  describe('generateSuggestions', () => {
    it('should return empty array when no public profiles exist', async () => {
      // Arrange
      vi.mocked(mockProfilesRepository.getPublicProfiles).mockResolvedValue([]);
      vi.mocked(mockFriendsRepository.getFriends).mockResolvedValue([]);

      // Act
      const suggestions = await agent.generateSuggestions('user-1');

      // Assert
      expect(suggestions).toEqual([]);
      expect(mockProfilesRepository.getPublicProfiles).toHaveBeenCalledWith('user-1');
      expect(mockFriendsRepository.getFriends).toHaveBeenCalledWith('user-1');
    });

    it('should exclude existing friends from suggestions', async () => {
      // Arrange
      const publicProfiles: PublicProfile[] = [
        {
          id: 'user-2',
          displayName: 'User Two',
          avatarUrl: null,
          favoriteGenres: ['Action', 'Drama'],
          createdAt: new Date(),
        },
        {
          id: 'user-3',
          displayName: 'User Three',
          avatarUrl: null,
          favoriteGenres: ['Comedy', 'Romance'],
          createdAt: new Date(),
        }
      ];

      const existingFriends: UserProfile[] = [
        {
          id: 'profile-1',
          userId: 'user-2',
          email: 'user2@example.com',
          displayName: 'User Two',
          username: 'user2',
          avatarUrl: null,
          bio: null,
          quote: null,
          favoriteGenres: ['Action', 'Drama'],
          favoriteTitles: ['Inception', 'The Dark Knight'],
          isPublic: true,
          onboardingCompleted: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      ];

      vi.mocked(mockProfilesRepository.getPublicProfiles).mockResolvedValue(publicProfiles);
      vi.mocked(mockFriendsRepository.getFriends).mockResolvedValue(existingFriends);
      const currentUserProfile: UserProfile = {
        id: 'profile-current',
        userId: 'user-1',
        email: 'user1@example.com',
        displayName: 'Current User',
        username: 'user1',
        avatarUrl: null,
        bio: null,
        quote: null,
        favoriteGenres: ['Comedy', 'Romance'], // Shared with user-3
        favoriteTitles: [],
        isPublic: true,
        onboardingCompleted: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      vi.mocked(mockProfilesRepository.getByUserId).mockResolvedValue(currentUserProfile);
      vi.mocked(mockWatchHistoryRepository.getRecentActivity).mockResolvedValue([]);

      // Act
      const suggestions = await agent.generateSuggestions('user-1');

      // Assert
      expect(suggestions).toHaveLength(1);
      expect(suggestions[0].user_id).toBe('user-3');
      expect(suggestions[0].display_name).toBe('User Three');
    });

    it('should calculate taste similarity based on shared genres and titles', async () => {
      // Arrange
      const currentUserProfile: UserProfile = {
        id: 'profile-current',
        userId: 'user-1',
        email: 'user1@example.com',
        displayName: 'Current User',
        username: 'user1',
        avatarUrl: null,
        bio: null,
        quote: null,
        favoriteGenres: ['Action', 'Drama', 'Sci-Fi'],
        favoriteTitles: ['Inception', 'The Dark Knight', 'Interstellar'],
        isPublic: true,
        onboardingCompleted: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const candidateProfile: PublicProfile = {
        id: 'user-2',
        displayName: 'Similar User',
        avatarUrl: null,
        favoriteGenres: ['Action', 'Drama'], // 2/3 shared genres
        createdAt: new Date(),
      };

      const currentUserWatchHistory: WatchHistoryEntry[] = [
        {
          id: 'watch-1',
          userId: 'user-1',
          movieId: '27205',
          title: 'Inception',
          posterUrl: null,
          mediaType: 'movie',
          status: 'watched',
          rating: 9,
          watchedAt: new Date(),
        }
      ];

      vi.mocked(mockProfilesRepository.getPublicProfiles).mockResolvedValue([candidateProfile]);
      vi.mocked(mockFriendsRepository.getFriends).mockResolvedValue([]);
      vi.mocked(mockProfilesRepository.getByUserId).mockResolvedValue(currentUserProfile);
      vi.mocked(mockWatchHistoryRepository.getRecentActivity).mockResolvedValue(currentUserWatchHistory);

      // Act
      const suggestions = await agent.generateSuggestions('user-1');

      // Assert
      expect(suggestions).toHaveLength(1);
      expect(suggestions[0].taste_match_score).toBeGreaterThan(0);
      expect(suggestions[0].shared_genres).toEqual(['Action', 'Drama']);
      expect(suggestions[0].short_rationale).toContain('Shared interest');
    });

    it('should generate explainable rationales for suggestions', async () => {
      // Arrange
      const currentUserProfile: UserProfile = {
        id: 'profile-current',
        userId: 'user-1',
        email: 'user1@example.com',
        displayName: 'Current User',
        username: 'user1',
        avatarUrl: null,
        bio: null,
        quote: null,
        favoriteGenres: ['Action'],
        favoriteTitles: ['Inception'],
        isPublic: true,
        onboardingCompleted: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const candidateProfile: PublicProfile = {
        id: 'user-2',
        displayName: 'Action Fan',
        avatarUrl: null,
        favoriteGenres: ['Action'],
        createdAt: new Date(),
      };

      vi.mocked(mockProfilesRepository.getPublicProfiles).mockResolvedValue([candidateProfile]);
      vi.mocked(mockFriendsRepository.getFriends).mockResolvedValue([]);
      vi.mocked(mockProfilesRepository.getByUserId).mockResolvedValue(currentUserProfile);
      vi.mocked(mockWatchHistoryRepository.getRecentActivity).mockResolvedValue([]);

      // Act
      const suggestions = await agent.generateSuggestions('user-1');

      // Assert
      expect(suggestions).toHaveLength(1);
      expect(suggestions[0].short_rationale).toBeTruthy();
      expect(typeof suggestions[0].short_rationale).toBe('string');
      expect(suggestions[0].short_rationale.length).toBeGreaterThan(0);
    });
  });
});