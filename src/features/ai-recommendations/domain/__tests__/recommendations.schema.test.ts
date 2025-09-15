import { describe, it, expect } from 'vitest';
import {
  contentRecommendationSchema,
  friendSuggestionSchema,
  recommendationSessionSchema,
  tasteProfileSchema,
  refreshRecommendationsRequestSchema,
  recommendationsResponseSchema
} from '../recommendations.schema';

describe('contentRecommendationSchema', () => {
  it('should validate valid content recommendation', () => {
    const validRecommendation = {
      tmdb_id: 550,
      title: 'Fight Club',
      media_type: 'movie' as const,
      poster_url: 'https://image.tmdb.org/t/p/w500/poster.jpg',
      match_score: 85,
      short_explanation: 'Matches your love for psychological thrillers',
      genre_match: 40,
      title_similarity: 20,
      rating_signal: 15,
      friends_boost: 10
    };

    const result = contentRecommendationSchema.safeParse(validRecommendation);
    expect(result.success).toBe(true);
  });

  it('should reject invalid match_score', () => {
    const invalidRecommendation = {
      tmdb_id: 550,
      title: 'Fight Club',
      media_type: 'movie' as const,
      match_score: 150, // Invalid: > 100
      short_explanation: 'Test explanation'
    };

    const result = contentRecommendationSchema.safeParse(invalidRecommendation);
    expect(result.success).toBe(false);
  });

  it('should reject invalid media_type', () => {
    const invalidRecommendation = {
      tmdb_id: 550,
      title: 'Fight Club',
      media_type: 'book', // Invalid: not 'movie' or 'tv'
      match_score: 85,
      short_explanation: 'Test explanation'
    };

    const result = contentRecommendationSchema.safeParse(invalidRecommendation);
    expect(result.success).toBe(false);
  });

  it('should allow optional fields to be undefined', () => {
    const minimalRecommendation = {
      tmdb_id: 550,
      title: 'Fight Club',
      media_type: 'movie' as const,
      match_score: 85,
      short_explanation: 'Test explanation'
    };

    const result = contentRecommendationSchema.safeParse(minimalRecommendation);
    expect(result.success).toBe(true);
  });
});

describe('friendSuggestionSchema', () => {
  it('should validate valid friend suggestion', () => {
    const validSuggestion = {
      user_id: '123e4567-e89b-12d3-a456-426614174000',
      display_name: 'MovieBuff42',
      avatar_url: 'https://example.com/avatar.jpg',
      taste_match_score: 78,
      short_rationale: 'Also gave Parasite & Whiplash 9/10',
      shared_titles: ['Parasite', 'Whiplash'],
      shared_genres: ['Drama', 'Thriller'],
      mutual_friends_count: 2
    };

    const result = friendSuggestionSchema.safeParse(validSuggestion);
    expect(result.success).toBe(true);
  });

  it('should reject invalid user_id format', () => {
    const invalidSuggestion = {
      user_id: 'not-a-uuid',
      display_name: 'MovieBuff42',
      taste_match_score: 78,
      short_rationale: 'Test rationale'
    };

    const result = friendSuggestionSchema.safeParse(invalidSuggestion);
    expect(result.success).toBe(false);
  });

  it('should reject invalid taste_match_score', () => {
    const invalidSuggestion = {
      user_id: '123e4567-e89b-12d3-a456-426614174000',
      display_name: 'MovieBuff42',
      taste_match_score: -5, // Invalid: < 0
      short_rationale: 'Test rationale'
    };

    const result = friendSuggestionSchema.safeParse(invalidSuggestion);
    expect(result.success).toBe(false);
  });
});

describe('recommendationSessionSchema', () => {
  it('should validate valid recommendation session', () => {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const validSession = {
      user_id: '123e4567-e89b-12d3-a456-426614174000',
      session_id: 'session-abc123',
      content_recommendations: [],
      friend_suggestions: [],
      generated_at: now,
      expires_at: expiresAt
    };

    const result = recommendationSessionSchema.safeParse(validSession);
    expect(result.success).toBe(true);
  });

  it('should reject invalid user_id format', () => {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const invalidSession = {
      user_id: 'not-a-uuid',
      session_id: 'session-abc123',
      content_recommendations: [],
      friend_suggestions: [],
      generated_at: now,
      expires_at: expiresAt
    };

    const result = recommendationSessionSchema.safeParse(invalidSession);
    expect(result.success).toBe(false);
  });
});

describe('tasteProfileSchema', () => {
  it('should validate valid taste profile', () => {
    const validProfile = {
      user_id: '123e4567-e89b-12d3-a456-426614174000',
      favorite_genres: ['Action', 'Sci-Fi'],
      favorite_titles: ['Inception', 'The Matrix'],
      recent_watches: [],
      genre_weights: {
        'Action': 0.8,
        'Sci-Fi': 0.9
      },
      rating_patterns: {
        average_rating: 7.5,
        rating_distribution: {
          '8': 15,
          '9': 8,
          '10': 3
        }
      }
    };

    const result = tasteProfileSchema.safeParse(validProfile);
    expect(result.success).toBe(true);
  });

  it('should reject invalid genre weights', () => {
    const invalidProfile = {
      user_id: '123e4567-e89b-12d3-a456-426614174000',
      favorite_genres: ['Action'],
      favorite_titles: ['Inception'],
      recent_watches: [],
      genre_weights: {
        'Action': 1.5 // Invalid: > 1
      },
      rating_patterns: {
        average_rating: 7.5,
        rating_distribution: {}
      }
    };

    const result = tasteProfileSchema.safeParse(invalidProfile);
    expect(result.success).toBe(false);
  });
});

describe('refreshRecommendationsRequestSchema', () => {
  it('should validate valid refresh request', () => {
    const validRequest = {
      force_refresh: true
    };

    const result = refreshRecommendationsRequestSchema.safeParse(validRequest);
    expect(result.success).toBe(true);
  });

  it('should validate empty refresh request', () => {
    const emptyRequest = {};

    const result = refreshRecommendationsRequestSchema.safeParse(emptyRequest);
    expect(result.success).toBe(true);
  });
});

describe('recommendationsResponseSchema', () => {
  it('should validate valid recommendations response', () => {
    const validResponse = {
      success: true,
      data: {
        content_recommendations: [],
        friend_suggestions: [],
        cached: false,
        generated_at: new Date().toISOString()
      }
    };

    const result = recommendationsResponseSchema.safeParse(validResponse);
    expect(result.success).toBe(true);
  });

  it('should validate error response', () => {
    const errorResponse = {
      success: false,
      data: {
        content_recommendations: [],
        friend_suggestions: [],
        cached: false,
        generated_at: new Date().toISOString()
      },
      error: 'Something went wrong',
      code: 'TMDB_API_ERROR'
    };

    const result = recommendationsResponseSchema.safeParse(errorResponse);
    expect(result.success).toBe(true);
  });
});