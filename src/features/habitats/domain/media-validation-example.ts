/**
 * Example usage and validation of media integration in streaming session service
 * This file demonstrates the new media validation functionality
 */

import type { StreamMedia, CreateStreamData } from "./habitats.types";

// Example of valid media data for a movie
export const validMovieMedia: StreamMedia = {
  tmdb_id: 550,
  media_type: "movie",
  media_title: "Fight Club",
  poster_path: "/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg",
  release_date: "1999-10-15",
  runtime: 139,
};

// Example of valid media data for a TV show
export const validTVMedia: StreamMedia = {
  tmdb_id: 1399,
  media_type: "tv",
  media_title: "Game of Thrones",
  poster_path: "/u3bZgnGQ9T01sWNhyveQz0wH0Hl.jpg",
  release_date: "2011-04-17",
  runtime: 60,
};

// Example of minimal valid media data
export const minimalMedia: StreamMedia = {
  tmdb_id: 550,
  media_type: "movie",
  media_title: "Fight Club",
};

// Example using the CreateStreamData interface
export const streamWithMedia: CreateStreamData = {
  description: "Let's watch this classic together!",
  scheduledTime: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
  maxParticipants: 10,
  media: validMovieMedia,
};

/**
 * Example usage of the service methods:
 *
 * // Method 1: Traditional parameters with media
 * await habitatsService.createStream(
 *   habitatId,
 *   "Fight Club Streaming Session",
 *   "Let's watch this classic!",
 *   scheduledTime,
 *   10,
 *   userId,
 *   validMovieMedia
 * );
 *
 * // Method 2: Using CreateStreamData interface
 * await habitatsService.createStream(
 *   habitatId,
 *   userId,
 *   streamWithMedia
 * );
 *
 * // Method 3: Without media (backward compatibility)
 * await habitatsService.createStream(
 *   habitatId,
 *   "General Movie Night",
 *   undefined,
 *   scheduledTime,
 *   15,
 *   userId
 * );
 */

/**
 * Media validation rules implemented:
 *
 * 1. TMDB ID validation:
 *    - Must be a positive integer
 *    - Required when media is provided
 *
 * 2. Media type validation:
 *    - Must be either "movie" or "tv"
 *    - Required when media is provided
 *
 * 3. Media title validation:
 *    - Must be a non-empty string
 *    - Maximum 255 characters
 *    - Required when media is provided
 *
 * 4. Poster path validation (optional):
 *    - Must be a string if provided
 *    - Maximum 255 characters
 *    - Automatically prefixed with "/" if missing
 *
 * 5. Release date validation (optional):
 *    - Must be a valid date string if provided
 *    - Converted to YYYY-MM-DD format
 *
 * 6. Runtime validation (optional):
 *    - Must be a positive integer if provided
 *    - Cannot exceed 1440 minutes (24 hours)
 */

/**
 * Error codes for media validation:
 * - WATCH_PARTY_INVALID_MEDIA: General media validation error
 *
 * Specific validation errors:
 * - "TMDB ID must be a valid integer"
 * - "TMDB ID must be a positive integer"
 * - "Media type must be either 'movie' or 'tv'"
 * - "Media title is required"
 * - "Media title cannot be empty"
 * - "Media title is too long (max 255 characters)"
 * - "Poster path must be a string"
 * - "Poster path is too long (max 255 characters)"
 * - "Release date must be a string"
 * - "Invalid release date format"
 * - "Runtime must be a valid integer"
 * - "Runtime must be a positive number"
 * - "Runtime cannot exceed 24 hours (1440 minutes)"
 */
