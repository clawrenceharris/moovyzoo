import type { WatchHistoryEntry } from "../domain/profiles.types";
import { createClient } from "@/utils/supabase/server";

/**
 * Input data for creating a new watch history entry
 */
export interface CreateWatchHistoryData {
  userId: string;
  movieId: string;
  title: string;
  posterUrl?: string;
  mediaType: 'movie' | 'tv';
  status: 'watched' | 'watching' | 'dropped';
  rating?: number;
  watchedAt?: Date;
}

/**
 * Database document interface for watch_history table
 */
interface WatchHistoryDocument {
  id: string;
  user_id: string;
  movie_id: string;
  title: string;
  poster_url?: string;
  media_type: 'movie' | 'tv';
  status: 'watched' | 'watching' | 'dropped';
  rating?: number;
  watched_at: string;
  created_at: string;
}

/**
 * Server-side watch history repository for API endpoints
 * Uses server-side Supabase client with authentication
 */
export class WatchHistoryServerRepository {
  /**
   * Add a new watch history entry or update existing one
   */
  async addWatchEntry(data: CreateWatchHistoryData): Promise<WatchHistoryEntry> {
    try {
      // Validate TMDB data structure
      this.validateTMDBData(data);

      const supabase = await createClient();
      const { data: entry, error } = await supabase
        .from("watch_history")
        .upsert({
          user_id: data.userId,
          movie_id: data.movieId,
          title: data.title,
          poster_url: data.posterUrl || null,
          media_type: data.mediaType,
          status: data.status,
          rating: data.rating || null,
          watched_at: data.watchedAt ? data.watchedAt.toISOString() : new Date().toISOString(),
        }, {
          onConflict: 'user_id,movie_id'
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return this.mapDatabaseToWatchHistory(entry);
    } catch (error) {
      throw error;
    }
  }
  /**
   * Get user's recent watch activity (for profile display)
   */
  async getRecentActivity(userId: string, limit = 10): Promise<WatchHistoryEntry[]> {
    try {
      const supabase = await createClient();
      const { data: entries, error } = await supabase
        .from("watch_history")
        .select("*")
        .eq("user_id", userId)
        .order("watched_at", { ascending: false })
        .limit(limit);

      if (error) {
        throw error;
      }

      return entries.map(entry => this.mapDatabaseToWatchHistory(entry));
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get user's complete watch history
   */
  async getUserWatchHistory(userId: string, limit = 50, offset = 0): Promise<WatchHistoryEntry[]> {
    try {
      const supabase = await createClient();
      const { data: entries, error } = await supabase
        .from("watch_history")
        .select("*")
        .eq("user_id", userId)
        .order("watched_at", { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        throw error;
      }

      return entries.map(entry => this.mapDatabaseToWatchHistory(entry));
    } catch (error) {
      throw error;
    }
  }

  /**
   * Validate TMDB movie/TV data structure
   */
  private validateTMDBData(data: CreateWatchHistoryData): void {
    // Validate required fields
    if (!data.movieId || typeof data.movieId !== 'string') {
      throw new Error('Valid TMDB movie/TV ID is required');
    }

    if (!data.title || typeof data.title !== 'string' || data.title.trim().length === 0) {
      throw new Error('Valid title is required');
    }

    if (!['movie', 'tv'].includes(data.mediaType)) {
      throw new Error('Media type must be either "movie" or "tv"');
    }

    if (!['watched', 'watching', 'dropped'].includes(data.status)) {
      throw new Error('Status must be "watched", "watching", or "dropped"');
    }

    // Validate optional fields
    if (data.rating !== undefined) {
      if (typeof data.rating !== 'number' || data.rating < 1 || data.rating > 10) {
        throw new Error('Rating must be a number between 1 and 10');
      }
    }

    if (data.posterUrl !== undefined && data.posterUrl !== null) {
      if (typeof data.posterUrl !== 'string') {
        throw new Error('Poster URL must be a string');
      }
      // Basic URL validation for TMDB poster paths
      if (data.posterUrl && !data.posterUrl.startsWith('/') && !data.posterUrl.startsWith('http')) {
        throw new Error('Invalid poster URL format');
      }
    }

    // Validate TMDB ID format (should be numeric string or number)
    const movieIdNum = parseInt(data.movieId, 10);
    if (isNaN(movieIdNum) || movieIdNum <= 0) {
      throw new Error('TMDB ID must be a positive number');
    }
  }

  /**
   * Map database row to WatchHistoryEntry type
   */
  private mapDatabaseToWatchHistory(dbEntry: WatchHistoryDocument): WatchHistoryEntry {
    return {
      id: dbEntry.id,
      userId: dbEntry.user_id,
      movieId: dbEntry.movie_id,
      title: dbEntry.title,
      posterUrl: dbEntry.poster_url,
      mediaType: dbEntry.media_type,
      status: dbEntry.status,
      rating: dbEntry.rating,
      watchedAt: new Date(dbEntry.watched_at),
    };
  }
}

// Export singleton instance
export const watchHistoryServerRepository = new WatchHistoryServerRepository();