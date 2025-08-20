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

// Helper function to get image URLs
export function getImageUrl(path: string | null | undefined, size: 'w185' | 'w300' | 'w500' | 'original' = 'w300'): string | null {
  if (!path) return null;
  return `https://image.tmdb.org/t/p/${size}${path}`;
}
