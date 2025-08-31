// TMDB API Configuration
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_API_KEY = process.env.TMDB_API_KEY;

if (!TMDB_API_KEY) {
  throw new Error('TMDB_API_KEY is required. Please set it in your environment variables.');
}

// Types for TMDB API responses
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

// Helper function to make API calls
async function tmdbFetch<T>(endpoint: string, params: Record<string, string | number | boolean> = {}): Promise<T> {
  const url = new URL(`${TMDB_BASE_URL}${endpoint}`);

  // Add query parameters
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.append(key, value.toString());
    }
  });

  const options = {
    method: 'GET',
    headers: {
      accept: 'application/json',
      Authorization: `Bearer ${TMDB_API_KEY}`
    }
  };

  try {
    const response = await fetch(url.toString(), options);

    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('TMDB API request failed:', error);
    throw new Error(`Failed to fetch from TMDB API: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Search for movies by title
 * Uses /search/movie endpoint
 */
export async function searchMovie(title: string): Promise<TMDBMovie[]> {
  if (!title.trim()) {
    throw new Error('Movie title is required for search');
  }

  const response = await tmdbFetch<TMDBSearchResponse>('/search/movie', {
    query: title.trim(),
    include_adult: false,
    language: 'en-US',
    page: 1
  });

  return response.results;
}

/**
 * Search for TV shows by title
 * Uses /search/tv endpoint
 */
export async function searchTVShow(title: string, year?: number): Promise<TMDBTVShow[]> {
  if (!title.trim()) {
    throw new Error('TV show title is required for search');
  }

  const params: Record<string, string | number | boolean> = {
    query: title.trim(),
    include_adult: false,
    language: 'en-US',
    page: 1
  };

  // Add optional year filter if provided
  if (year && year > 1950 && year <= new Date().getFullYear() + 5) {
    params.first_air_date_year = year;
  }

  const response = await tmdbFetch<TMDBTVSearchResponse>('/search/tv', params);

  return response.results;
}

/**
 * Get detailed movie information by ID
 * Uses /movie/{movie_id}?append_to_response=credits,videos
 */
export async function getMovieDetails(movieId: number): Promise<TMDBMovieDetails> {
  if (!movieId || movieId <= 0) {
    throw new Error('Valid movie ID is required');
  }

  const movieDetails = await tmdbFetch<TMDBMovieDetails>(`/movie/${movieId}`, {
    append_to_response: 'credits,videos',
    language: 'en-US'
  });

  return movieDetails;
}

/**
 * Get detailed TV show information by ID
 * Uses /tv/{tv_id}?append_to_response=credits,videos,content_ratings,external_ids
 */
export async function getTVShowDetails(tvId: number): Promise<TMDBTVShowDetails> {
  if (!tvId || tvId <= 0) {
    throw new Error('Valid TV show ID is required');
  }

  const tvShowDetails = await tmdbFetch<TMDBTVShowDetails>(`/tv/${tvId}`, {
    append_to_response: 'credits,videos,content_ratings,external_ids',
    language: 'en-US'
  });

  return tvShowDetails;
}

/**
 * Get season or episode details for a TV show
 * Uses /tv/{tv_id}/season/{season_number} or /tv/{tv_id}/season/{season_number}/episode/{episode_number}
 * If episode_number is provided, returns episode details; otherwise returns season details
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
    throw new Error('Episode number must be greater than 0 if provided');
  }

  // Determine endpoint based on whether episode number is provided
  const endpoint = episodeNumber !== undefined
    ? `/tv/${tvId}/season/${seasonNumber}/episode/${episodeNumber}`
    : `/tv/${tvId}/season/${seasonNumber}`;

  const params: Record<string, string | number | boolean> = {
    language: 'en-US'
  };

  // Add videos to episode requests
  if (episodeNumber !== undefined) {
    params.append_to_response = 'videos';
  }

  const result = episodeNumber !== undefined
    ? await tmdbFetch<TMDBEpisode>(endpoint, params)
    : await tmdbFetch<TMDBSeason>(endpoint, params);

  return result;
}

/**
 * Get TV shows similar to a specific TV show or get recommendations
 * Uses /tv/{tv_id}/similar or /tv/{tv_id}/recommendations
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

  const endpoint = `/tv/${tvId}/${type}`;

  const response = await tmdbFetch<TMDBTVSearchResponse>(endpoint, {
    language: 'en-US',
    page: 1
  });

  return response.results;
}

/**
 * Get movies similar to a specific movie
 * Uses /movie/{movie_id}/similar
 */
export async function getSimilarMovies(movieId: number): Promise<TMDBMovie[]> {
  if (!movieId || movieId <= 0) {
    throw new Error('Valid movie ID is required');
  }

  const response = await tmdbFetch<TMDBSearchResponse>(`/movie/${movieId}/similar`, {
    language: 'en-US',
    page: 1
  });

  return response.results;
}

/**
 * Get trending, now playing, or upcoming movies
 * Uses different endpoints based on type
 */
export async function getTrendingNowOrUpcoming(
  type: 'trending' | 'now_playing' | 'upcoming'
): Promise<TMDBMovie[]> {
  let endpoint: string;

  switch (type) {
    case 'trending':
      endpoint = '/trending/movie/day';
      break;
    case 'now_playing':
      endpoint = '/movie/now_playing';
      break;
    case 'upcoming':
      endpoint = '/movie/upcoming';
      break;
    default:
      throw new Error('Invalid type. Must be "trending", "now_playing", or "upcoming"');
  }

  const response = await tmdbFetch<TMDBSearchResponse>(endpoint, {
    language: 'en-US',
    page: 1,
    region: 'US'
  });

  return response.results;
}

/**
 * Get trending, on air, airing today, popular, or top-rated TV shows
 * Uses different endpoints based on kind parameter
 */
export async function getTrendingOrAiringTV(
  kind: 'trending' | 'on_the_air' | 'airing_today' | 'popular' | 'top_rated',
  region?: string
): Promise<TMDBTVShow[]> {
  let endpoint: string;

  switch (kind) {
    case 'trending':
      endpoint = '/trending/tv/day';
      break;
    case 'on_the_air':
      endpoint = '/tv/on_the_air';
      break;
    case 'airing_today':
      endpoint = '/tv/airing_today';
      break;
    case 'popular':
      endpoint = '/tv/popular';
      break;
    case 'top_rated':
      endpoint = '/tv/top_rated';
      break;
    default:
      throw new Error('Invalid kind. Must be "trending", "on_the_air", "airing_today", "popular", or "top_rated"');
  }

  const params: Record<string, string | number | boolean> = {
    language: 'en-US',
    page: 1
  };

  // Add region parameter if provided (for regional content like airing today)
  if (region && region.length === 2) {
    params.region = region.toUpperCase();
  }

  const response = await tmdbFetch<TMDBTVSearchResponse>(endpoint, params);

  return response.results;
}

/**
 * Discover movies by genre with optional filters
 * Uses /discover/movie endpoint
 */
export async function discoverByGenre(
  genreIds: string,
  year?: number,
  sortBy: string = 'popularity.desc'
): Promise<TMDBMovie[]> {
  if (!genreIds.trim()) {
    throw new Error('Genre IDs are required');
  }

  const params: Record<string, string | number | boolean> = {
    with_genres: genreIds,
    sort_by: sortBy,
    include_adult: false,
    include_video: false,
    language: 'en-US',
    page: 1
  };

  if (year && year > 1900 && year <= new Date().getFullYear() + 5) {
    params.primary_release_year = year;
  }

  const response = await tmdbFetch<TMDBSearchResponse>('/discover/movie', params);

  return response.results;
}

/**
 * Get movie genres list for reference
 * Uses /genre/movie/list endpoint
 */
export async function getMovieGenres(): Promise<Array<{ id: number; name: string }>> {
  const response = await tmdbFetch<{ genres: Array<{ id: number; name: string }> }>('/genre/movie/list', {
    language: 'en-US'
  });

  return response.genres;
}

// Helper function to format movie data for display
export function formatMovieForDisplay(movie: TMDBMovie | TMDBMovieDetails): string {
  const releaseYear = movie.release_date ? new Date(movie.release_date).getFullYear() : 'Unknown';
  const rating = movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A';

  let formatted = `**${movie.title}** (${releaseYear})\n`;
  formatted += `Rating: ${rating}/10\n`;

  if (movie.overview) {
    formatted += `\n${movie.overview}\n`;
  }

  // Add additional details if it's a detailed movie object
  if ('runtime' in movie && movie.runtime) {
    formatted += `\nRuntime: ${movie.runtime} minutes\n`;
  }

  if ('genres' in movie && movie.genres) {
    const genreNames = movie.genres.map(g => g.name).join(', ');
    formatted += `Genres: ${genreNames}\n`;
  }

  if ('credits' in movie && movie.credits) {
    const director = movie.credits.crew.find(person => person.job === 'Director');
    if (director) {
      formatted += `Director: ${director.name}\n`;
    }

    const mainCast = movie.credits.cast.slice(0, 5).map(actor => actor.name).join(', ');
    if (mainCast) {
      formatted += `Main Cast: ${mainCast}\n`;
    }
  }

  return formatted;
}

// Helper function to format TV show data for display
export function formatTVShowForDisplay(tvShow: TMDBTVShow | TMDBTVShowDetails): string {
  const firstAirYear = tvShow.first_air_date ? new Date(tvShow.first_air_date).getFullYear() : 'Unknown';
  const rating = tvShow.vote_average ? tvShow.vote_average.toFixed(1) : 'N/A';

  let formatted = `**${tvShow.name}** (${firstAirYear})\n`;
  formatted += `Rating: ${rating}/10\n`;

  if (tvShow.overview) {
    formatted += `\n${tvShow.overview}\n`;
  }

  // Add additional details if it's a detailed TV show object
  if ('number_of_seasons' in tvShow && tvShow.number_of_seasons) {
    formatted += `\nSeasons: ${tvShow.number_of_seasons}\n`;
  }

  if ('number_of_episodes' in tvShow && tvShow.number_of_episodes) {
    formatted += `Episodes: ${tvShow.number_of_episodes}\n`;
  }

  if ('episode_run_time' in tvShow && tvShow.episode_run_time && tvShow.episode_run_time.length > 0) {
    const runtime = tvShow.episode_run_time[0];
    formatted += `Episode Runtime: ${runtime} minutes\n`;
  }

  if ('status' in tvShow && tvShow.status) {
    formatted += `Status: ${tvShow.status}\n`;
  }

  if ('genres' in tvShow && tvShow.genres) {
    const genreNames = tvShow.genres.map(g => g.name).join(', ');
    formatted += `Genres: ${genreNames}\n`;
  }

  if ('created_by' in tvShow && tvShow.created_by && tvShow.created_by.length > 0) {
    const creators = tvShow.created_by.map(creator => creator.name).join(', ');
    formatted += `Created by: ${creators}\n`;
  }

  if ('networks' in tvShow && tvShow.networks && tvShow.networks.length > 0) {
    const networkNames = tvShow.networks.map(network => network.name).join(', ');
    formatted += `Networks: ${networkNames}\n`;
  }

  if ('credits' in tvShow && tvShow.credits) {
    const mainCast = tvShow.credits.cast.slice(0, 5).map(actor => actor.name).join(', ');
    if (mainCast) {
      formatted += `Main Cast: ${mainCast}\n`;
    }
  }

  if ('content_ratings' in tvShow && tvShow.content_ratings && tvShow.content_ratings.results.length > 0) {
    const usRating = tvShow.content_ratings.results.find(rating => rating.iso_3166_1 === 'US');
    if (usRating) {
      formatted += `Content Rating: ${usRating.rating}\n`;
    }
  }

  if ('external_ids' in tvShow && tvShow.external_ids && tvShow.external_ids.imdb_id) {
    formatted += `IMDb: https://www.imdb.com/title/${tvShow.external_ids.imdb_id}\n`;
  }

  return formatted;
}

// Helper function to get image URLs
export function getImageUrl(path: string | null | undefined, size: 'w185' | 'w300' | 'w500' | 'original' = 'w300'): string | null {
  if (!path) return null;
  return `https://image.tmdb.org/t/p/${size}${path}`;
}
