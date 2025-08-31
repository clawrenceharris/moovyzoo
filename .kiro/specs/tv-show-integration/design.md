# Design Document

## Overview

This design extends the existing TMDB-powered AI chat system to support TV shows and series alongside movies. The architecture follows the established patterns in the current movie implementation, adding parallel TV show functionality through new TMDB API endpoints while maintaining consistency with existing code structure and user experience.

The design leverages TMDB's comprehensive TV show API endpoints to provide search, detailed information, season/episode data, recommendations, and trending content for television series. The implementation will seamlessly integrate with the existing LangGraph agent system and maintain the same tool-based architecture.

## Architecture

### High-Level Architecture

The TV show integration follows the existing three-layer architecture:

1. **Tool Layer** (`tmdb-tools.ts`): LangChain tools that define the interface for TV show operations
2. **Data Layer** (`tmdb.repository.ts`): Repository functions that handle TMDB API calls and data transformation
3. **Agent Layer** (`langraph-config.ts`): LangGraph agent configuration that includes both movie and TV show tools

### API Integration Strategy

The design integrates five core TMDB TV show endpoints:

- **Search TV** (`/search/tv`): Find TV shows by title with disambiguation
- **TV Details** (`/tv/{tv_id}`): Comprehensive show information with append_to_response
- **Season/Episode Details** (`/tv/{tv_id}/season/{season_number}` and `/tv/{tv_id}/season/{s}/episode/{e}`): Detailed season and episode information
- **Similar/Recommendations** (`/tv/{tv_id}/similar` and `/tv/{tv_id}/recommendations`): Content discovery
- **Trending/Popular** (`/trending/tv/day`, `/tv/on_the_air`, `/tv/airing_today`, `/tv/popular`, `/tv/top_rated`): Current and popular content

## Components and Interfaces

### Data Types

New TypeScript interfaces will be added to `tmdb.repository.ts`:

```typescript
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
```

### Repository Functions

New repository functions will be added to `tmdb.repository.ts`:

1. **searchTVShow(title: string, year?: number)**: Search for TV shows by title
2. **getTVShowDetails(tvId: number)**: Get comprehensive TV show details with credits, videos, content ratings, and external IDs
3. **getSeasonDetails(tvId: number, seasonNumber: number)**: Get detailed season information including episode list
4. **getEpisodeDetails(tvId: number, seasonNumber: number, episodeNumber: number)**: Get specific episode details
5. **getSimilarTVShows(tvId: number)**: Get shows similar to the specified TV show
6. **getTVShowRecommendations(tvId: number)**: Get recommended shows based on the specified TV show
7. **getTrendingOrAiringTV(kind: 'trending'|'on_the_air'|'airing_today'|'popular'|'top_rated')**: Get various TV show lists
8. **formatTVShowForDisplay(tvShow: TMDBTVShow | TMDBTVShowDetails)**: Format TV show data for user-friendly display

### LangChain Tools

New tools will be added to `tmdb-tools.ts`:

1. **searchTVTool**: Search for TV shows by title with optional year filter
2. **getTVShowDetailsTool**: Get comprehensive TV show information
3. **getSeasonOrEpisodeTool**: Get season or episode details with flexible parameters
4. **getSimilarOrRecommendationsTVTool**: Get similar shows or recommendations
5. **getTrendingOrAiringTVTool**: Get trending, airing, or popular TV shows

### Tool Schemas

Each tool will have well-defined Zod schemas:

```typescript
// Search TV Tool Schema
z.object({
  title: z.string().min(1).describe('The TV show title to search for'),
  year: z.number().min(1950).max(2030).optional().describe('Optional first air year filter')
})

// TV Show Details Tool Schema
z.object({
  tv_id: z.number().positive().describe('The TMDB TV show ID')
})

// Season/Episode Tool Schema
z.object({
  tv_id: z.number().positive().describe('The TMDB TV show ID'),
  season_number: z.number().positive().optional().describe('Season number (required for season/episode details)'),
  episode_number: z.number().positive().optional().describe('Episode number (requires season_number)')
})

// Similar/Recommendations Tool Schema
z.object({
  tv_id: z.number().positive().describe('The TMDB TV show ID'),
  type: z.enum(['similar', 'recommendations']).default('similar').describe('Type of related content to fetch')
})

// Trending/Airing Tool Schema
z.object({
  kind: z.enum(['trending', 'on_the_air', 'airing_today', 'popular', 'top_rated']).describe('Type of TV show list to fetch'),
  region: z.string().length(2).optional().describe('Optional region code (e.g., "US")')
})
```

## Data Models

### TV Show Search Response

The search functionality will return standardized TV show objects with consistent formatting:

```typescript
interface TVShowSearchResult {
  id: number;
  name: string;
  first_air_date: string;
  overview: string;
  vote_average: number;
  poster_path?: string;
}
```

### TV Show Details Response

Comprehensive TV show details will include:

- Basic information (name, overview, air dates, status)
- Production details (creators, networks, production companies)
- Cast and crew information (both regular and aggregate credits)
- Season and episode structure
- Content ratings and external platform links
- Available videos and trailers

### Season/Episode Response

Season and episode data will provide:

- Episode lists with air dates and descriptions
- Guest star information
- Director and writer credits
- Runtime and rating information
- Available video content

## Error Handling

### API Error Management

The TV show integration will follow the existing error handling patterns:

1. **Network Errors**: Wrapped in descriptive error messages with fallback suggestions
2. **Invalid IDs**: Clear messaging when TV show, season, or episode IDs are not found
3. **Missing Data**: Graceful handling when optional data (ratings, videos, etc.) is unavailable
4. **Rate Limiting**: Appropriate error messages for TMDB API rate limits

### User-Facing Error Messages

Error messages will be consistent with the existing movie tool patterns:

- "No TV shows found for '[title]'. Try a different title or check the spelling."
- "TV show details not available for ID [id]. Please verify the TV show ID."
- "Season [number] not found for this TV show. Available seasons: [list]."
- "Episode [number] not available for Season [season]. Available episodes: [range]."

## Testing Strategy

### Manual Testing Scenarios

Key manual testing scenarios:

1. **Search and Discovery**: Search for popular shows, get details, find similar content
2. **Season/Episode Exploration**: Navigate through seasons and episodes of long-running series
3. **Trending Content**: Verify current trending and airing show data
4. **Error Scenarios**: Test with invalid IDs, non-existent shows, and network failures

## Performance Considerations

### API Efficiency

The design optimizes TMDB API usage:

1. **Append to Response**: Use `append_to_response` parameter to minimize API calls for TV show details
2. **Caching Strategy**: Leverage existing caching patterns for frequently requested data
3. **Batch Operations**: Group related API calls where possible

### Response Formatting

TV show data formatting will be optimized for:

1. **Readability**: Clear, structured output that's easy to scan
2. **Relevance**: Prioritize most important information (main cast, creators, current season)
3. **Consistency**: Maintain formatting consistency with existing movie tools

## Security Considerations

### Data Validation

All TV show data will be validated:

1. **Input Sanitization**: Clean and validate user inputs before API calls
2. **Response Validation**: Verify API response structure and data types
3. **XSS Prevention**: Sanitize display content to prevent security vulnerabilities