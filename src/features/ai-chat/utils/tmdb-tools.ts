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
  searchTVShow,
  getTVShowDetails,
  formatTVShowForDisplay,
  getSeasonOrEpisode,
  getSimilarOrRecommendationsTV,
  getTrendingOrAiringTV,
  type TMDBEpisode,
  type TMDBSeason,
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

// Tool for searching TV shows by title
export const searchTVTool = tool(async (input) => {
  try {
    const { title, year } = input as { title: string; year?: number };
    const tvShows = await searchTVShow(title, year);
    console.log("🛠️ searchTVTool called with title:", title, "year:", year);

    if (tvShows.length === 0) {
      return `No TV shows found for "${title}". Try a different title or check the spelling.`;
    }

    const formattedResults = tvShows.slice(0, 5).map((tvShow, index) => {
      const year = tvShow.first_air_date ? new Date(tvShow.first_air_date).getFullYear() : 'Unknown';
      const rating = tvShow.vote_average ? tvShow.vote_average.toFixed(1) : 'N/A';
      return `${index + 1}. **${tvShow.name}** (${year}) - Rating: ${rating}/10\n   ID: ${tvShow.id}\n   ${tvShow.overview ? tvShow.overview.substring(0, 150) + '...' : 'No description available'}`;
    }).join('\n\n');

    return `Found ${tvShows.length} TV shows for "${title}":\n\n${formattedResults}\n\nTo get detailed information about any TV show, use the TV show ID with the get_tv_details tool.`;
  } catch (error) {
    return `Error searching for TV shows: ${error instanceof Error ? error.message : 'Unknown error occurred'}`;
  }
}, {
  name: 'search_tv',
  description: 'Search for TV shows by title with optional year filter. Returns basic information including TV show ID, name, first air date, rating, and overview for up to 5 results.',
  schema: z.object({
    title: z.string().min(1).describe('The TV show title to search for'),
    year: z.number().min(1950).max(2030).optional().describe('Optional first air year filter')
  })
});

// Tool for getting detailed TV show information
export const getTVShowDetailsTool = tool(async (input) => {
  try {
    const { tv_id } = input as { tv_id: number };
    const tvShowDetails = await getTVShowDetails(tv_id);
    console.log("🛠️ getTVShowDetailsTool called with tv_id:", tv_id);
    return formatTVShowForDisplay(tvShowDetails);
  } catch (error) {
    return `Error fetching TV show details: ${error instanceof Error ? error.message : 'Unknown error occurred'}`;
  }
}, {
  name: 'get_tv_details',
  description: 'Get comprehensive details about a specific TV show including synopsis, cast, creators, genres, seasons, episodes, networks, and content ratings. Requires a TV show ID from search results.',
  schema: z.object({
    tv_id: z.number().positive().describe('The TMDB TV show ID')
  })
});

// Tool for getting season or episode details
export const getSeasonOrEpisodeTool = tool(async (input) => {
  try {
    const { tv_id, season_number, episode_number } = input as {
      tv_id: number;
      season_number?: number;
      episode_number?: number;
    };

    // Validate that season_number is provided
    if (!season_number) {
      return `Season number is required. Please provide a season number to get season or episode details.`;
    }

    const result = await getSeasonOrEpisode(tv_id, season_number, episode_number);
    console.log("🛠️ getSeasonOrEpisodeTool called with tv_id:", tv_id, "season_number:", season_number, "episode_number:", episode_number);

    // Format the response based on whether it's a season or episode
    if (episode_number) {
      // Episode details
      const episode = result as TMDBEpisode;
      const airDate = episode.air_date ? new Date(episode.air_date).toLocaleDateString() : 'Unknown';
      const rating = episode.vote_average ? episode.vote_average.toFixed(1) : 'N/A';
      const runtime = episode.runtime ? `${episode.runtime} minutes` : 'Unknown';

      let formatted = `**${episode.name}** (Season ${episode.season_number}, Episode ${episode.episode_number})\n`;
      formatted += `Air Date: ${airDate}\n`;
      formatted += `Rating: ${rating}/10\n`;
      formatted += `Runtime: ${runtime}\n`;

      if (episode.overview) {
        formatted += `\n${episode.overview}\n`;
      }

      if (episode.guest_stars && episode.guest_stars.length > 0) {
        const guestStars = episode.guest_stars.slice(0, 5).map((star: { name: string; character: string }) => `${star.name} as ${star.character}`).join(', ');
        formatted += `\nGuest Stars: ${guestStars}\n`;
      }

      if (episode.crew && episode.crew.length > 0) {
        const director = episode.crew.find((person: { job: string; name: string }) => person.job === 'Director');
        if (director) {
          formatted += `Director: ${director.name}\n`;
        }

        const writer = episode.crew.find((person: { job: string; name: string }) => person.job === 'Writer' || person.job === 'Screenplay');
        if (writer) {
          formatted += `Writer: ${writer.name}\n`;
        }
      }

      return formatted;
    } else {
      // Season details
      const season = result as TMDBSeason;
      const airDate = season.air_date ? new Date(season.air_date).toLocaleDateString() : 'Unknown';

      let formatted = `**${season.name}** (Season ${season.season_number})\n`;
      formatted += `Episodes: ${season.episode_count}\n`;
      formatted += `Air Date: ${airDate}\n`;

      if (season.overview) {
        formatted += `\n${season.overview}\n`;
      }

      if (season.episodes && season.episodes.length > 0) {
        formatted += `\n**Episodes:**\n`;
        const episodeList = season.episodes.slice(0, 10).map((ep: { episode_number: number; name: string; air_date: string }) => {
          const epAirDate = ep.air_date ? new Date(ep.air_date).toLocaleDateString() : 'TBA';
          return `${ep.episode_number}. ${ep.name} (${epAirDate})`;
        }).join('\n');
        formatted += episodeList;

        if (season.episodes.length > 10) {
          formatted += `\n... and ${season.episodes.length - 10} more episodes`;
        }
      }

      return formatted;
    }
  } catch (error) {
    const { tv_id, season_number, episode_number } = input as {
      tv_id: number;
      season_number?: number;
      episode_number?: number;
    };

    if (episode_number) {
      return `Error fetching episode details: ${error instanceof Error ? error.message : 'Unknown error occurred'}. Please verify the TV show ID (${tv_id}), season number (${season_number}), and episode number (${episode_number}).`;
    } else {
      return `Error fetching season details: ${error instanceof Error ? error.message : 'Unknown error occurred'}. Please verify the TV show ID (${tv_id}) and season number (${season_number}).`;
    }
  }
}, {
  name: 'get_season_or_episode',
  description: 'Get detailed information about a specific season or episode of a TV show. Provide tv_id and season_number for season details, or add episode_number for specific episode details including guest stars, director, and synopsis.',
  schema: z.object({
    tv_id: z.number().positive().describe('The TMDB TV show ID'),
    season_number: z.number().positive().optional().describe('Season number (required for season/episode details)'),
    episode_number: z.number().positive().optional().describe('Episode number (requires season_number)')
  })
});

// Tool for getting similar TV shows or recommendations
export const getSimilarOrRecommendationsTVTool = tool(async (input) => {
  try {
    const { tv_id, type } = input as { tv_id: number; type: 'similar' | 'recommendations' };
    const tvShows = await getSimilarOrRecommendationsTV(tv_id, type);
    console.log("🛠️ getSimilarOrRecommendationsTVTool called with tv_id:", tv_id, "type:", type);

    if (tvShows.length === 0) {
      const typeLabel = type === 'similar' ? 'similar TV shows' : 'TV show recommendations';
      return `No ${typeLabel} found for TV show ID ${tv_id}.`;
    }

    const typeLabel = type === 'similar' ? 'Similar TV Shows' : 'Recommended TV Shows';
    const formattedResults = tvShows.slice(0, 6).map((tvShow, index) => {
      const year = tvShow.first_air_date ? new Date(tvShow.first_air_date).getFullYear() : 'Unknown';
      const rating = tvShow.vote_average ? tvShow.vote_average.toFixed(1) : 'N/A';
      return `${index + 1}. **${tvShow.name}** (${year}) - Rating: ${rating}/10\n   ID: ${tvShow.id}`;
    }).join('\n\n');

    return `**${typeLabel}:**\n\n${formattedResults}`;
  } catch (error) {
    const { tv_id, type } = input as { tv_id: number; type: 'similar' | 'recommendations' };
    const typeLabel = type === 'similar' ? 'similar TV shows' : 'TV show recommendations';
    return `Error fetching ${typeLabel}: ${error instanceof Error ? error.message : 'Unknown error occurred'}. Please verify the TV show ID (${tv_id}).`;
  }
}, {
  name: 'get_similar_or_recommendations_tv',
  description: 'Get TV shows similar to a specific TV show or get recommendations based on a TV show. Use "similar" to find shows with similar themes/genres, or "recommendations" for personalized suggestions.',
  schema: z.object({
    tv_id: z.number().positive().describe('The TMDB TV show ID'),
    type: z.enum(['similar', 'recommendations']).default('similar').describe('Type of related content to fetch: "similar" for shows with similar themes, "recommendations" for personalized suggestions')
  })
});

// Tool for getting trending, airing, or popular TV shows
export const getTrendingOrAiringTVTool = tool(async (input) => {
  try {
    const { kind, region } = input as { 
      kind: 'trending' | 'on_the_air' | 'airing_today' | 'popular' | 'top_rated'; 
      region?: string 
    };
    const tvShows = await getTrendingOrAiringTV(kind, region);
    console.log("🛠️ getTrendingOrAiringTVTool called with kind:", kind, "region:", region);

    if (tvShows.length === 0) {
      return `No ${kind.replace('_', ' ')} TV shows found at the moment.`;
    }

    const kindLabels: Record<'trending' | 'on_the_air' | 'airing_today' | 'popular' | 'top_rated', string> = {
      trending: 'Trending TV Shows Today',
      on_the_air: 'Currently On The Air',
      airing_today: 'Airing Today',
      popular: 'Popular TV Shows',
      top_rated: 'Top Rated TV Shows'
    };

    const formattedResults = tvShows.slice(0, 8).map((tvShow, index) => {
      const year = tvShow.first_air_date ? new Date(tvShow.first_air_date).getFullYear() : 'Unknown';
      const rating = tvShow.vote_average ? tvShow.vote_average.toFixed(1) : 'N/A';
      return `${index + 1}. **${tvShow.name}** (${year}) - Rating: ${rating}/10\n   ID: ${tvShow.id}`;
    }).join('\n\n');

    const regionText = region ? ` (${region.toUpperCase()})` : '';
    return `**${kindLabels[kind]}${regionText}:**\n\n${formattedResults}`;
  } catch (error) {
    const { kind } = input as { kind: 'trending' | 'on_the_air' | 'airing_today' | 'popular' | 'top_rated' };
    return `Error fetching ${kind.replace('_', ' ')} TV shows: ${error instanceof Error ? error.message : 'Unknown error occurred'}`;
  }
}, {
  name: 'get_trending_or_airing_tv',
  description: 'Get lists of trending TV shows, currently airing series, shows airing today, popular shows, or top-rated shows. Optionally filter by region.',
  schema: z.object({
    kind: z.enum(['trending', 'on_the_air', 'airing_today', 'popular', 'top_rated']).describe('Type of TV shows to fetch: trending (popular today), on_the_air (currently broadcasting), airing_today (episodes today), popular (most popular), or top_rated (highest rated)'),
    region: z.string().length(2).optional().describe('Optional region code (e.g., "US", "GB") for regional results')
  })
});

// Export all TMDB tools as an array (movies and TV shows)
export const tmdbTools = [
  searchMovieTool,
  getMovieDetailsTool,
  getSimilarMoviesTool,
  getTrendingNowOrUpcomingTool,
  discoverByGenreTool,
  getMovieGenresTool,
  searchTVTool,
  getTVShowDetailsTool,
  getSeasonOrEpisodeTool,
  getSimilarOrRecommendationsTVTool,
  getTrendingOrAiringTVTool
];
