import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import {
  searchMovie,
  getMovieDetails,
  getSimilarMovies,
  getTrendingNowOrUpcoming,
  discoverByGenre,
  getMovieGenres,
  formatMovieForDisplay,
} from '../data/tmdb.repository';

// Tool for searching movies by title
export const searchMovieTool = tool(async (input) => {
  try {
    const { title } = input as { title: string };
    const movies = await searchMovie(title);
    console.log("🛠️ searchMovieTool called with title:", title);

    if (movies.length === 0) {
      return `No movies found for "${title}". Try a different title or check the spelling.`;
    }

    const formattedResults = movies.slice(0, 5).map((movie, index) => {
      const year = movie.release_date ? new Date(movie.release_date).getFullYear() : 'Unknown';
      const rating = movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A';
      return `${index + 1}. **${movie.title}** (${year}) - Rating: ${rating}/10\n   ID: ${movie.id}\n   ${movie.overview ? movie.overview.substring(0, 150) + '...' : 'No description available'}`;
    }).join('\n\n');

    return `Found ${movies.length} movies for "${title}":\n\n${formattedResults}\n\nTo get detailed information about any movie, use the movie ID with the get_movie_details tool.`;
  } catch (error) {
    return `Error searching for movies: ${error instanceof Error ? error.message : 'Unknown error occurred'}`;
  }
}, {
  name: 'search_movie',
  description: 'Search for movies by title. Returns basic information including movie ID, title, release date, rating, and overview for up to 5 results.',
  schema: z.object({
    title: z.string().min(1).describe('The movie title to search for')
  })
});

// Tool for getting detailed movie information
export const getMovieDetailsTool = tool(async (input) => {
  try {
    const { movie_id } = input as { movie_id: number };
    const movieDetails = await getMovieDetails(movie_id);
    console.log("🛠️ getMovieDetailsTool called with movie_id:", movie_id);
    return formatMovieForDisplay(movieDetails);
  } catch (error) {
    return `Error fetching movie details: ${error instanceof Error ? error.message : 'Unknown error occurred'}`;
  }
}, {
  name: 'get_movie_details',
  description: 'Get comprehensive details about a specific movie including plot, cast, director, runtime, genres, and trailers. Requires a movie ID from search results.',
  schema: z.object({
    movie_id: z.number().positive().describe('The TMDB movie ID')
  })
});

// Tool for getting similar movies
export const getSimilarMoviesTool = tool(async (input) => {
  try {
    const { movie_id } = input as { movie_id: number };
    const similarMovies = await getSimilarMovies(movie_id);
    console.log("⚙️ getSimilarMoviesTool called with movie_id:", movie_id);
    
    if (similarMovies.length === 0) {
      console.error(`No similar movies found for movie ID ${movie_id}.`);
      return `No similar movies found for movie ID ${movie_id}.`;
    }

    const formattedResults = similarMovies.slice(0, 6).map((movie, index) => {
      const year = movie.release_date ? new Date(movie.release_date).getFullYear() : 'Unknown';
      const rating = movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A';
      return `${index + 1}. **${movie.title}** (${year}) - Rating: ${rating}/10\n   ID: ${movie.id}`;
    }).join('\n\n');

    return `Movies similar to your selection:\n\n${formattedResults}`;
  } catch (error) {
    return `Error fetching similar movies: ${error instanceof Error ? error.message : 'Unknown error occurred'}`;
  }
}, {
  name: 'get_similar_movies',
  description: 'Find movies similar to a specific movie. Requires a movie ID and returns a list of related films.',
  schema: z.object({
    movie_id: z.number().positive().describe('The TMDB movie ID to find similar movies for')
  })
});

// Tool for getting trending, now playing, or upcoming movies
export const getTrendingNowOrUpcomingTool = tool(async (input) => {
  try {
    const { type } = input as { type: 'trending' | 'now_playing' | 'upcoming' };
    const movies = await getTrendingNowOrUpcoming(type);
    console.log("🛠️ getTrendingNowOrUpcomingTool called with type:", type);
    
    if (movies.length === 0) {
      return `No ${type.replace('_', ' ')} movies found at the moment.`;
    }

    const typeLabels: Record<'trending' | 'now_playing' | 'upcoming', string> = {
      trending: 'Trending Movies Today',
      now_playing: 'Now Playing in Theaters',
      upcoming: 'Upcoming Movies'
    };

    const formattedResults = movies.slice(0, 8).map((movie, index) => {
      const year = movie.release_date ? new Date(movie.release_date).getFullYear() : 'Unknown';
      const rating = movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A';
      return `${index + 1}. **${movie.title}** (${year}) - Rating: ${rating}/10\n   ID: ${movie.id}`;
    }).join('\n\n');

    return `**${typeLabels[type]}:**\n\n${formattedResults}`;
  } catch (error) {
    const { type } = input as { type: 'trending' | 'now_playing' | 'upcoming' };
    return `Error fetching ${type.replace('_', ' ')} movies: ${error instanceof Error ? error.message : 'Unknown error occurred'}`;
  }
}, {
  name: 'get_trending_now_or_upcoming',
  description: 'Get lists of trending movies today, movies currently playing in theaters, or upcoming releases.',
  schema: z.object({
    type: z.enum(['trending', 'now_playing', 'upcoming']).describe('Type of movies to fetch: trending (popular today), now_playing (in theaters), or upcoming (future releases)')
  })
});

// Tool for discovering movies by genre
export const discoverByGenreTool = tool(async (input) => {
  try {
    const { genre_ids, year, sort_by } = input as { genre_ids: string; year?: number; sort_by?: string };
    const movies = await discoverByGenre(genre_ids, year, sort_by);
    console.log("🛠️ discoverByGenreTool called with genre_ids:", genre_ids, "year:", year, "sort_by:", sort_by);
    
    if (movies.length === 0) {
      return `No movies found for the specified criteria. Try different genres or adjust the year filter.`;
    }

    const formattedResults = movies.slice(0, 6).map((movie, index) => {
      const year = movie.release_date ? new Date(movie.release_date).getFullYear() : 'Unknown';
      const rating = movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A';
      return `${index + 1}. **${movie.title}** (${year}) - Rating: ${rating}/10\n   ID: ${movie.id}\n   ${movie.overview ? movie.overview.substring(0, 120) + '...' : 'No description available'}`;
    }).join('\n\n');

    const yearText = year ? ` from ${year}` : '';
    const sortText = sort_by ? ` sorted by ${sort_by.replace('_', ' ').replace('.desc', ' (descending)').replace('.asc', ' (ascending)')}` : '';
    
    return `**Movies by Genre${yearText}${sortText}:**\n\n${formattedResults}`;
  } catch (error) {
    return `Error discovering movies by genre: ${error instanceof Error ? error.message : 'Unknown error occurred'}`;
  }
}, {
  name: 'discover_by_genre',
  description: 'Discover movies by genre with optional year and sorting filters. Use genre IDs (e.g., "28" for Action, "35" for Comedy, "18" for Drama). Multiple genres can be combined with commas.',
  schema: z.object({
    genre_ids: z.string().min(1).describe('Comma-separated genre IDs. Common IDs: Action(28), Adventure(12), Comedy(35), Drama(18), Horror(27), Romance(10749), Sci-Fi(878), Thriller(53)'),
    year: z.number().min(1900).max(2030).optional().describe('Optional release year filter'),
    sort_by: z.string().optional().default('popularity.desc').describe('Sort order: popularity.desc, release_date.desc, vote_average.desc, etc.')
  })
});

// Tool for getting available movie genres
export const getMovieGenresTool = tool(async () => {
  try {
    const genres = await getMovieGenres();
    console.log("🧩 getMovieGenresTool called with genres:", genres);
    
    const genreList = genres.map(genre => `${genre.name} (ID: ${genre.id})`).join('\n');
    
    return `**Available Movie Genres:**\n\n${genreList}\n\nUse these genre IDs with the discover_by_genre tool to find movies in specific genres.`;
  } catch (error) {
    return `Error fetching movie genres: ${error instanceof Error ? error.message : 'Unknown error occurred'}`;
  }
}, {
  name: 'get_movie_genres',
  description: 'Get a list of all available movie genres with their IDs. Useful for discovering movies by specific genres.',
  schema: z.object({
    // No input needed for this tool
  })
});

// Export all TMDB tools as an array
export const tmdbTools = [
  searchMovieTool,
  getMovieDetailsTool,
  getSimilarMoviesTool,
  getTrendingNowOrUpcomingTool,
  discoverByGenreTool,
  getMovieGenresTool
];
