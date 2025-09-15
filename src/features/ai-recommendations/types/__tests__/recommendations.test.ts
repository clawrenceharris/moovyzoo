import { describe, it, expect } from 'vitest';
import type {
    ContentRecommendation,
    FriendSuggestion,
    RecommendationSession,
    TasteProfile
} from '../recommendations';
import { RecommendationErrorCode } from '../recommendations';

describe('ContentRecommendation', () => {
    it('should have correct structure for movie recommendation', () => {
        const recommendation: ContentRecommendation = {
            tmdb_id: 550,
            title: 'Fight Club',
            media_type: 'movie',
            poster_url: 'https://image.tmdb.org/t/p/w500/poster.jpg',
            match_score: 85,
            short_explanation: 'Matches your love for psychological thrillers',
            genre_match: 40,
            title_similarity: 20,
            rating_signal: 15,
            friends_boost: 10
        };

        expect(recommendation.tmdb_id).toBe(550);
        expect(recommendation.media_type).toBe('movie');
        expect(recommendation.match_score).toBeGreaterThanOrEqual(0);
        expect(recommendation.match_score).toBeLessThanOrEqual(100);
    });

    it('should have correct structure for TV recommendation', () => {
        const recommendation: ContentRecommendation = {
            tmdb_id: 1399,
            title: 'Game of Thrones',
            media_type: 'tv',
            match_score: 92,
            short_explanation: 'Perfect match for fantasy drama fans'
        };

        expect(recommendation.media_type).toBe('tv');
        expect(recommendation.short_explanation).toBeTruthy();
    });

    it('should allow optional scoring breakdown fields', () => {
        const recommendation: ContentRecommendation = {
            tmdb_id: 278,
            title: 'The Shawshank Redemption',
            media_type: 'movie',
            match_score: 95,
            short_explanation: 'Highly rated drama matching your preferences'
        };

        expect(recommendation.genre_match).toBeUndefined();
        expect(recommendation.title_similarity).toBeUndefined();
        expect(recommendation.rating_signal).toBeUndefined();
        expect(recommendation.friends_boost).toBeUndefined();
    });
});

describe('FriendSuggestion', () => {
    it('should have correct structure for friend suggestion', () => {
        const suggestion: FriendSuggestion = {
            user_id: 'user-123',
            display_name: 'MovieBuff42',
            avatar_url: 'https://example.com/avatar.jpg',
            taste_match_score: 78,
            short_rationale: 'Also gave Parasite & Whiplash 9/10',
            shared_titles: ['Parasite', 'Whiplash', 'Dune'],
            shared_genres: ['Drama', 'Thriller'],
            mutual_friends_count: 2
        };

        expect(suggestion.user_id).toBe('user-123');
        expect(suggestion.taste_match_score).toBeGreaterThanOrEqual(0);
        expect(suggestion.taste_match_score).toBeLessThanOrEqual(100);
        expect(suggestion.short_rationale).toBeTruthy();
    });

    it('should allow optional fields', () => {
        const suggestion: FriendSuggestion = {
            user_id: 'user-456',
            display_name: 'CinemaLover',
            taste_match_score: 65,
            short_rationale: 'Shares similar genre preferences'
        };

        expect(suggestion.avatar_url).toBeUndefined();
        expect(suggestion.shared_titles).toBeUndefined();
        expect(suggestion.shared_genres).toBeUndefined();
        expect(suggestion.mutual_friends_count).toBeUndefined();
    });
});

describe('RecommendationSession', () => {
    it('should have correct structure for session cache', () => {
        const now = new Date();
        const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours

        const session: RecommendationSession = {
            user_id: 'user-789',
            session_id: 'session-abc123',
            content_recommendations: [],
            friend_suggestions: [],
            generated_at: now,
            expires_at: expiresAt
        };

        expect(session.user_id).toBe('user-789');
        expect(session.session_id).toBe('session-abc123');
        expect(Array.isArray(session.content_recommendations)).toBe(true);
        expect(Array.isArray(session.friend_suggestions)).toBe(true);
        expect(session.generated_at).toBeInstanceOf(Date);
        expect(session.expires_at).toBeInstanceOf(Date);
    });
});

describe('TasteProfile', () => {
    it('should have correct structure for user taste profile', () => {
        const profile: TasteProfile = {
            user_id: 'user-999',
            favorite_genres: ['Action', 'Sci-Fi', 'Drama'],
            favorite_titles: ['Inception', 'The Matrix', 'Interstellar'],
            recent_watches: [],
            genre_weights: {
                'Action': 0.8,
                'Sci-Fi': 0.9,
                'Drama': 0.7
            },
            rating_patterns: {
                average_rating: 7.5,
                rating_distribution: {
                    8: 15,
                    9: 8,
                    10: 3
                }
            }
        };

        expect(profile.user_id).toBe('user-999');
        expect(Array.isArray(profile.favorite_genres)).toBe(true);
        expect(Array.isArray(profile.favorite_titles)).toBe(true);
        expect(Array.isArray(profile.recent_watches)).toBe(true);
        expect(typeof profile.genre_weights).toBe('object');
        expect(typeof profile.rating_patterns).toBe('object');
        expect(typeof profile.rating_patterns.average_rating).toBe('number');
    });
});

describe('RecommendationErrorCode', () => {
    it('should have all required error codes', () => {
        expect(RecommendationErrorCode.INSUFFICIENT_DATA).toBe('INSUFFICIENT_DATA');
        expect(RecommendationErrorCode.TMDB_API_ERROR).toBe('TMDB_API_ERROR');
        expect(RecommendationErrorCode.CACHE_ERROR).toBe('CACHE_ERROR');
        expect(RecommendationErrorCode.INVALID_USER_DATA).toBe('INVALID_USER_DATA');
        expect(RecommendationErrorCode.RATE_LIMIT_EXCEEDED).toBe('RATE_LIMIT_EXCEEDED');
    });
});