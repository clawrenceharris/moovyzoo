// Client-side TMDB API integration using our own API routes

// Types for TMDB API responses (re-exported for compatibility)
export interface TMDBMovie {
  id: number;
  title: string;
  overview: string;
  release_date: string;
  poster_path?: string;
  backdrop_path?: string;
  vote_average: number;
  vote_count: number;
  genre_ids?: number[];
  adult: boolean;
  original_language: string;
  original_title: string;
  popularity: number;
  video: boolean;
}

export interface TMDBMovieDetails extends TMDBMovie {
  runtime: number;
  budget: number;
  revenue: number;
  genres: Array<{ id: number; name: string }>;
  production_companies: Array<{ id: number; name: string; logo_path?: string; origin_country: string }>;
  production_countries: Array<{ iso_3166_1: string; name: string }>;
  spoken_languages: Array<{ english_name: string; iso_639_1: string; name: string }>;
  status: string;
  tagline?: string;
  credits?: {
    cast: Array<{
      id: number;
      name: string;
      character: string;
      known_for_department: string;
      profile_path?: string;
      order: number;
    }>;
    crew: Array<{
      id: number;
      name: string;
      job: string;
      department: string;
      known_for_department: string;
      profile_path?: string;
    }>;
  };
  videos?: {
    results: Array<{
      id: string;
      key: string;
      name: string;
      site: string;
      type: string;
      official: boolean;
      published_at: string;
    }>;
  };
}

export interface TMDBSearchResponse {
  page: number;
  results: TMDBMovie[];
  total_pages: number;
  total_results: number;
}

export interface TMDBTVSearchResponse {
  page: number;
  results: TMDBTVShow[];
  total_pages: number;
  total_results: number;
}

// TV Show Types
export interface TMDBTVShow {
  id: number;
  name: string;
  overview: string;
  first_air_date: string;
  poster_path?: string;
  backdrop_path?: string;
  vote_average: number;
  vote_count: number;
  genre_ids?: number[];
  origin_country: string[];
  original_language: string;
  original_name: string;
  popularity: number;
}

export interface TMDBTVShowDetails extends TMDBTVShow {
  number_of_episodes: number;
  number_of_seasons: number;
  episode_run_time: number[];
  genres: Array<{ id: number; name: string }>;
  created_by: Array<{ id: number; name: string; profile_path?: string }>;
  networks: Array<{ id: number; name: string; logo_path?: string; origin_country: string }>;
  production_companies: Array<{ id: number; name: string; logo_path?: string; origin_country: string }>;
  seasons: Array<{
    id: number;
    name: string;
    overview: string;
    poster_path?: string;
    season_number: number;
    episode_count: number;
    air_date: string;
  }>;
  status: string;
  tagline?: string;
  type: string;
  credits?: {
    cast: Array<{
      id: number;
      name: string;
      character: string;
      known_for_department: string;
      profile_path?: string;
      order: number;
    }>;
    crew: Array<{
      id: number;
      name: string;
      job: string;
      department: string;
      known_for_department: string;
      profile_path?: string;
    }>;
  };
  aggregate_credits?: {
    cast: Array<{
      id: number;
      name: string;
      roles: Array<{
        character: string;
        episode_count: number;
      }>;
      total_episode_count: number;
      profile_path?: string;
    }>;
  };
  videos?: {
    results: Array<{
      id: string;
      key: string;
      name: string;
      site: string;
      type: string;
      official: boolean;
      published_at: string;
    }>;
  };
  content_ratings?: {
    results: Array<{
      iso_3166_1: string;
      rating: string;
    }>;
  };
  external_ids?: {
    imdb_id?: string;
    tvdb_id?: number;
    facebook_id?: string;
    instagram_id?: string;
    twitter_id?: string;
  };
}

export interface TMDBSeason {
  id: number;
  name: string;
  overview: string;
  poster_path?: string;
  season_number: number;
  episode_count: number;
  air_date: string;
  episodes: Array<{
    id: number;
    name: string;
    overview: string;
    episode_number: number;
    season_number: number;
    air_date: string;
    runtime?: number;
    still_path?: string;
    vote_average: number;
    vote_count: number;
    guest_stars: Array<{
      id: number;
      name: string;
      character: string;
      profile_path?: string;
    }>;
    crew: Array<{
      id: number;
      name: string;
      job: string;
      department: string;
      profile_path?: string;
    }>;
  }>;
}

export interface TMDBEpisode {
  id: number;
  name: string;
  overview: string;
  episode_number: number;
  season_number: number;
  air_date: string;
  runtime?: number;
  still_path?: string;
  vote_average: number;
  vote_count: number;
  guest_stars: Array<{
    id: number;
    name: string;
    character: string;
    profile_path?: string;
  }>;
  crew: Array<{
    id: number;
    name: string;
    job: string;
    department: string;
    profile_path?: string;
  }>;
  videos?: {
    results: Array<{
      id: string;
      key: string;
      name: string;
      site: string;
      type: string;
      official: boolean;
      published_at: string;
    }>;
  };
}

// Helper function to make API calls to our own endpoints
async function apiCall<T>(endpoint: string): Promise<T> {
  try {
    // Construct absolute URL - handle both server and client environments
    let url: string;
    if (endpoint.startsWith('http')) {
      url = endpoint;
    } else {
      // Check if we're in a browser environment
      if (typeof window !== 'undefined') {
        url = `${window.location.origin}${endpoint}`;
      } else {
        // Server-side: use environment variable or default localhost
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL 
          ? `https://${process.env.VERCEL_URL}` 
          : 'http://localhost:3000';
        url = `${baseUrl}${endpoint}`;
      }
    }
    
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API call error:', error);
    throw error;
  }
}

/**
 * Search for movies by title
 * Uses our /api/tmdb/search/movies endpoint
 */
export async function searchMovie(title: string): Promise<TMDBMovie[]> {
  if (!title.trim()) {
    throw new Error('Movie title is required');
  }

  const params = new URLSearchParams({ title: title.trim() });
  const response = await apiCall<{ movies: TMDBMovie[] }>(`/api/tmdb/search/movies?${params}`);
  console.log("⚙️ searchMovie called");
  return response.movies;
}

/**
 * Search for TV shows by title
 * Uses our /api/tmdb/search/tv endpoint
 */
export async function searchTVShow(title: string, year?: number): Promise<TMDBTVShow[]> {
  if (!title.trim()) {
    throw new Error('TV show title is required');
  }

  const params = new URLSearchParams({ title: title.trim() });
  if (year) {
    params.append('year', year.toString());
  }
  console.log("⚙️ searchTVShow called");

  const response = await apiCall<{ tvShows: TMDBTVShow[] }>(`/api/tmdb/search/tv?${params}`);
  return response.tvShows;
}

/**
 * Get detailed movie information by ID
 * Uses our /api/tmdb/movie/[id] endpoint
 */
export async function getMovieDetails(movieId: number): Promise<TMDBMovieDetails> {
  if (!movieId || movieId <= 0) {
    throw new Error('Valid movie ID is required');
  }

  console.log("⚙️ getMovieDetails called");
  const response = await apiCall<{ movieDetails: TMDBMovieDetails }>(`/api/tmdb/movie/${movieId}`);
  return response.movieDetails;
}

/**
 * Get detailed TV show information by ID
 * Uses our /api/tmdb/tv/[id] endpoint
 */
export async function getTVShowDetails(tvId: number): Promise<TMDBTVShowDetails> {
  if (!tvId || tvId <= 0) {
    throw new Error('Valid TV show ID is required');
  }

  console.log("⚙️ getTVShowDetails called");
  const response = await apiCall<{ tvShowDetails: TMDBTVShowDetails }>(`/api/tmdb/tv/${tvId}`);
  return response.tvShowDetails;
}

/**
 * Get season or episode details for a TV show
 * Uses our /api/tmdb/tv/[id]/season/[season] endpoint
 */
export async function getSeasonOrEpisode(
  tvId: number,
  seasonNumber: number,
  episodeNumber?: number
): Promise<TMDBSeason | TMDBEpisode> {
  if (!tvId || tvId <= 0) {
    throw new Error('Valid TV show ID is required');
  }

  if (!seasonNumber || seasonNumber < 0) {
    throw new Error('Valid season number is required');
  }

  if (episodeNumber !== undefined && episodeNumber <= 0) {
    throw new Error('Valid episode number is required');
  }

  const params = episodeNumber !== undefined ? new URLSearchParams({ episode: episodeNumber.toString() }) : new URLSearchParams();
  const url = `/api/tmdb/tv/${tvId}/season/${seasonNumber}${params.toString() ? `?${params}` : ''}`;
  console.log("⚙️ getSeasonOrEpisode called");

  if (episodeNumber !== undefined) {
    const response = await apiCall<{ episode: TMDBEpisode }>(url);
    return response.episode;
  } else {
    const response = await apiCall<{ season: TMDBSeason }>(url);
    return response.season;
  }
}

/**
 * Get TV shows similar to a specific TV show or get recommendations
 * Uses our /api/tmdb/tv/[id]/similar endpoint
 */
export async function getSimilarOrRecommendationsTV(
  tvId: number,
  type: 'similar' | 'recommendations' = 'similar'
): Promise<TMDBTVShow[]> {
  if (!tvId || tvId <= 0) {
    throw new Error('Valid TV show ID is required');
  }

  if (!['similar', 'recommendations'].includes(type)) {
    throw new Error('Type must be either "similar" or "recommendations"');
  }
  console.log("⚙️ getSimilarOrRecommendationsTV called");

  const params = new URLSearchParams({ type });
  const response = await apiCall<{ tvShows: TMDBTVShow[] }>(`/api/tmdb/tv/${tvId}/similar?${params}`);
  return response.tvShows;
}

/**
 * Get movies similar to a specific movie
 * Uses our /api/tmdb/movie/[id]/similar endpoint
 */
export async function getSimilarMovies(movieId: number): Promise<TMDBMovie[]> {
  if (!movieId || movieId <= 0) {
    throw new Error('Valid movie ID is required');
  }

  const response = await apiCall<{ similarMovies: TMDBMovie[] }>(`/api/tmdb/movie/${movieId}/similar`);
  console.log("⚙️ getSimilarMovies called");
  return response.similarMovies;
}

/**
 * Get trending, now playing, or upcoming movies
 * Uses our /api/tmdb/trending/movies endpoint
 */
export async function getTrendingNowOrUpcoming(
  type: 'trending' | 'now_playing' | 'upcoming'
): Promise<TMDBMovie[]> {
  if (!['trending', 'now_playing', 'upcoming'].includes(type)) {
    throw new Error('Invalid type. Must be "trending", "now_playing", or "upcoming"');
  }

  const params = new URLSearchParams({ type });
  const response = await apiCall<{ movies: TMDBMovie[] }>(`/api/tmdb/trending/movies?${params}`);
  console.log("⚙️ getTrendingNowOrUpcoming called");
  return response.movies;
}

/**
 * Get trending, on air, airing today, popular, or top-rated TV shows
 * Uses our /api/tmdb/trending/tv endpoint
 */
export async function getTrendingOrAiringTV(
  kind: 'trending' | 'on_the_air' | 'airing_today' | 'popular' | 'top_rated',
  region?: string
): Promise<TMDBTVShow[]> {
  if (!['trending', 'on_the_air', 'airing_today', 'popular', 'top_rated'].includes(kind)) {
    throw new Error('Invalid kind. Must be "trending", "on_the_air", "airing_today", "popular", or "top_rated"');
  }

  const params = new URLSearchParams({ kind });
  if (region) {
    params.append('region', region);
  }
  console.log("⚙️ getTrendingOrAiringTV called");

  const response = await apiCall<{ tvShows: TMDBTVShow[] }>(`/api/tmdb/trending/tv?${params}`);
  return response.tvShows;
}

/**
 * Discover movies by genre with optional filters
 * Uses our /api/tmdb/discover endpoint
 */
export async function discoverByGenre(
  genreIds: string,
  year?: number,
  sortBy: string = 'popularity.desc'
): Promise<TMDBMovie[]> {
  if (!genreIds.trim()) {
    throw new Error('Genre IDs are required');
  }

  const params = new URLSearchParams({
    genreIds: genreIds.trim(),
    sortBy
  });

  if (year) {
    params.append('year', year.toString());
  }

  console.log("⚙️ discoverByGenre called");

  const response = await apiCall<{ movies: TMDBMovie[] }>(`/api/tmdb/discover?${params}`);
  return response.movies;
}

/**
 * Get movie genres list for reference
 * Uses our /api/tmdb/genres endpoint
 */
export async function getMovieGenres(): Promise<Array<{ id: number; name: string }>> {
  const response = await apiCall<{ genres: Array<{ id: number; name: string }> }>('/api/tmdb/genres');
  return response.genres;
}

// Helper function to format movie data for display
export function formatMovieForDisplay(movie: TMDBMovie | TMDBMovieDetails): string {
  const year = movie.release_date ? new Date(movie.release_date).getFullYear() : 'Unknown year';
  const rating = movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A';

  let result = `**${movie.title}** (${year}) - Rating: ${rating}/10\n`;
  result += `ID: ${movie.id}\n`;

  if (movie.overview) {
    result += `Overview: ${movie.overview}\n`;
  }

  if ('runtime' in movie && movie.runtime) {
    result += `Runtime: ${movie.runtime} minutes\n`;
  }

  if ('genres' in movie && movie.genres) {
    const genres = movie.genres.map(g => g.name).join(', ');
    result += `Genres: ${genres}\n`;
  }

  console.log("⚙️ formatMovieForDisplay called");

  return result;
}

// Helper function to format TV show data for display
export function formatTVShowForDisplay(tvShow: TMDBTVShow | TMDBTVShowDetails): string {
  const year = tvShow.first_air_date ? new Date(tvShow.first_air_date).getFullYear() : 'Unknown year';
  const rating = tvShow.vote_average ? tvShow.vote_average.toFixed(1) : 'N/A';

  let result = `**${tvShow.name}** (${year}) - Rating: ${rating}/10\n`;
  result += `ID: ${tvShow.id}\n`;

  if (tvShow.overview) {
    result += `Overview: ${tvShow.overview}\n`;
  }

  if ('number_of_seasons' in tvShow && tvShow.number_of_seasons) {
    result += `Seasons: ${tvShow.number_of_seasons}\n`;
  }

  if ('number_of_episodes' in tvShow && tvShow.number_of_episodes) {
    result += `Episodes: ${tvShow.number_of_episodes}\n`;
  }

  if ('genres' in tvShow && tvShow.genres) {
    const genres = tvShow.genres.map(g => g.name).join(', ');
    result += `Genres: ${genres}\n`;
  }

  return result;
}

// Helper function to get image URLs
export function getImageUrl(path: string | null | undefined, size: 'w185' | 'w300' | 'w500' | 'original' = 'w300'): string | null {
  if (!path) return null;

  console.log("⚙️ getImageUrl called");
  return `https://image.tmdb.org/t/p/${size}${path}`;

}
