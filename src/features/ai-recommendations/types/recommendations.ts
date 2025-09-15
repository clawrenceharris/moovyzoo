// AI Recommendations Types
// Based on design specifications in .kiro/specs/ai-recommendations/design.md

import { WatchHistoryEntry } from '@/features/profile/domain/profiles.types';

export interface ContentRecommendation {
  tmdb_id: number;
  title: string;
  media_type: 'movie' | 'tv';
  poster_url?: string;
  match_score: number; // 0-100
  short_explanation: string;
  genre_match?: number;
  title_similarity?: number;
  rating_signal?: number;
  friends_boost?: number;
}

export interface FriendSuggestion {
  user_id: string;
  display_name: string;
  avatar_url?: string;
  taste_match_score: number; // 0-100
  short_rationale: string;
  shared_titles?: string[];
  shared_genres?: string[];
  mutual_friends_count?: number;
}

export interface RecommendationSession {
  user_id: string;
  session_id: string;
  content_recommendations: ContentRecommendation[];
  friend_suggestions: FriendSuggestion[];
  generated_at: Date;
  expires_at: Date;
}

export interface TasteProfile {
  user_id: string;
  favorite_genres: string[];
  favorite_titles: string[];
  recent_watches: WatchHistoryEntry[];
  genre_weights: Record<string, number>;
  rating_patterns: {
    average_rating: number;
    rating_distribution: Record<number, number>;
  };
}

// Import existing types from profile feature
export type { WatchHistoryEntry } from '@/features/profile/domain/profiles.types';

// API Response Types
export interface RecommendationsResponse {
  success: boolean;
  data: {
    content_recommendations: ContentRecommendation[];
    friend_suggestions: FriendSuggestion[];
    cached: boolean;
    generated_at: string;
  };
  error?: string;
  code?: string;
}

export interface RefreshRecommendationsRequest {
  force_refresh?: boolean;
}

export interface RefreshRecommendationsResponse {
  success: boolean;
  data: {
    content_recommendations: ContentRecommendation[];
    friend_suggestions: FriendSuggestion[];
    generated_at: string;
  };
  error?: string;
  code?: string;
}

// Error Types
export enum RecommendationErrorCode {
  INSUFFICIENT_DATA = 'INSUFFICIENT_DATA',
  TMDB_API_ERROR = 'TMDB_API_ERROR',
  CACHE_ERROR = 'CACHE_ERROR',
  INVALID_USER_DATA = 'INVALID_USER_DATA',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED'
}

export interface RecommendationError {
  code: RecommendationErrorCode;
  message: string;
  fallback_strategy?: string;
}