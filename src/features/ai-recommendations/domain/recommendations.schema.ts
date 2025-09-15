import { z } from 'zod';

// Content Recommendation Schema
export const contentRecommendationSchema = z.object({
  tmdb_id: z.number().positive(),
  title: z.string().min(1),
  media_type: z.enum(['movie', 'tv']),
  poster_url: z.string().url().optional(),
  match_score: z.number().min(0).max(100),
  short_explanation: z.string().min(1),
  genre_match: z.number().min(0).max(50).optional(),
  title_similarity: z.number().min(0).max(20).optional(),
  rating_signal: z.number().min(0).max(20).optional(),
  friends_boost: z.number().min(0).max(10).optional()
});

// Friend Suggestion Schema
export const friendSuggestionSchema = z.object({
  user_id: z.string().uuid(),
  display_name: z.string().min(1),
  avatar_url: z.string().url().optional(),
  taste_match_score: z.number().min(0).max(100),
  short_rationale: z.string().min(1),
  shared_titles: z.array(z.string()).optional(),
  shared_genres: z.array(z.string()).optional(),
  mutual_friends_count: z.number().min(0).optional()
});

// Taste Profile Schema
export const tasteProfileSchema = z.object({
  user_id: z.string().uuid(),
  favorite_genres: z.array(z.string()),
  favorite_titles: z.array(z.string()),
  recent_watches: z.array(z.object({
    id: z.string(),
    userId: z.string(),
    movieId: z.string(),
    title: z.string(),
    posterUrl: z.string().optional(),
    mediaType: z.enum(['movie', 'tv']),
    status: z.enum(['watched', 'watching', 'dropped']),
    rating: z.number().min(1).max(10).optional(),
    watchedAt: z.date()
  })),
  genre_weights: z.record(z.string(), z.number().min(0).max(1)),
  rating_patterns: z.object({
    average_rating: z.number().min(0).max(10),
    rating_distribution: z.record(z.string(), z.number().min(0))
  })
});

// Recommendation Session Schema
export const recommendationSessionSchema = z.object({
  user_id: z.string().uuid(),
  session_id: z.string().min(1),
  content_recommendations: z.array(contentRecommendationSchema),
  friend_suggestions: z.array(friendSuggestionSchema),
  generated_at: z.date(),
  expires_at: z.date()
});

// API Request/Response Schemas
export const refreshRecommendationsRequestSchema = z.object({
  force_refresh: z.boolean().optional().default(false)
});

export const recommendationsResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    content_recommendations: z.array(contentRecommendationSchema),
    friend_suggestions: z.array(friendSuggestionSchema),
    cached: z.boolean(),
    generated_at: z.string()
  }).optional(),
  error: z.string().optional(),
  code: z.string().optional()
});

// Type exports
export type ContentRecommendationInput = z.input<typeof contentRecommendationSchema>;
export type FriendSuggestionInput = z.input<typeof friendSuggestionSchema>;
export type TasteProfileInput = z.input<typeof tasteProfileSchema>;
export type RecommendationSessionInput = z.input<typeof recommendationSessionSchema>;
export type RefreshRecommendationsRequestInput = z.input<typeof refreshRecommendationsRequestSchema>;
export type RecommendationsResponseInput = z.input<typeof recommendationsResponseSchema>;