# TMDB Service Layer

This module provides a comprehensive service layer for integrating with The Movie Database (TMDB) API for watch party media integration.

## Features

- **Media Search**: Search for movies and TV shows using TMDB's multi-search endpoint
- **Image URL Construction**: Generate properly sized poster and backdrop URLs
- **Caching**: Automatic caching of search results with TTL (5 minutes)
- **Error Handling**: Comprehensive error handling for API failures, rate limiting, and network issues
- **Debouncing**: Built-in request debouncing to prevent excessive API calls
- **TypeScript Support**: Full TypeScript interfaces and type safety

## Core Components

### TMDBService Class

The main service class that handles all TMDB API interactions.

```typescript
import { tmdbService } from "@/utils/tmdb/service";

// Search for media
const results = await tmdbService.searchMedia("avengers");

// Get poster URL
const posterUrl = tmdbService.getPosterUrl("/poster.jpg", "w500");

// Transform to selected media format
const selectedMedia = tmdbService.transformToSelectedMedia(result);
```

### React Hooks

#### useMediaSearch

A React hook that provides debounced search functionality with loading and error states.

```typescript
import { useMediaSearch } from "@/hooks/useMediaSearch";

function MediaSearchComponent() {
  const { results, isLoading, error, search, clearResults } = useMediaSearch();

  return (
    <div>
      <input onChange={(e) => search(e.target.value)} />
      {isLoading && <div>Searching...</div>}
      {error && <div>Error: {error}</div>}
      {results.map((result) => (
        <div key={result.id}>{result.title || result.name}</div>
      ))}
    </div>
  );
}
```

#### useDebounce / useDebouncedSearch

Utility hooks for debouncing search input and preventing excessive API calls.

```typescript
import { useDebouncedSearch } from "@/hooks/useDebounce";

const { debouncedTerm, shouldSearch } = useDebouncedSearch(query, 300, 3);
```

## API Reference

### TMDBService Methods

#### `searchMedia(query: string): Promise<TMDBSearchResult[]>`

Searches for movies and TV shows using TMDB's multi-search endpoint.

- **Parameters**:
  - `query`: Search term (minimum 3 characters)
- **Returns**: Array of search results
- **Caching**: Results cached for 5 minutes
- **Rate Limiting**: Handles 429 responses with appropriate errors

#### `getImageUrl(path: string, size?: string): string`

Constructs TMDB image URLs with proper sizing.

- **Parameters**:
  - `path`: Image path from TMDB API
  - `size`: Image size (default: 'w500')
- **Returns**: Full image URL

#### `getPosterUrl(posterPath?: string, size?: string): string`

Convenience method for poster URLs specifically.

#### `transformToSelectedMedia(result: TMDBSearchResult): SelectedMedia`

Transforms TMDB search results to the application's SelectedMedia format.

#### `getAvailablePosterSizes(): string[]`

Returns available poster sizes: `['w92', 'w154', 'w185', 'w342', 'w500', 'w780', 'original']`

#### `clearCache(): void`

Clears all cached search results.

#### `getCacheStats(): { size: number; entries: string[] }`

Returns cache statistics for debugging.

## TypeScript Interfaces

### TMDBSearchResult

```typescript
interface TMDBSearchResult {
  id: number;
  title?: string; // For movies
  name?: string; // For TV shows
  poster_path?: string;
  release_date?: string; // For movies
  first_air_date?: string; // For TV shows
  media_type: "movie" | "tv";
  overview?: string;
  runtime?: number; // For movies
  episode_run_time?: number[]; // For TV shows
}
```

### SelectedMedia

```typescript
interface SelectedMedia {
  tmdb_id: number;
  media_type: "movie" | "tv";
  title: string;
  media_title: string;
  poster_path?: string;
  release_date?: string;
  runtime?: number;
}
```

## Error Handling

The service provides specific error codes for different failure scenarios:

- `TMDB_RATE_LIMIT_EXCEEDED`: Too many requests (429)
- `TMDB_UNAUTHORIZED`: Invalid API key (401)
- `TMDB_NETWORK_ERROR`: Network connectivity issues
- `TMDB_SEARCH_FAILED`: Generic search failure

## Performance Features

### Caching

- Search results are cached for 5 minutes
- Automatic cache cleanup removes expired entries
- Cache size monitoring and manual clearing available

### Debouncing

- 300ms default debounce delay
- Minimum 3 character search requirement
- Prevents excessive API calls during typing

### Request Limiting

- Maximum 10 results per search
- Filters out invalid results (missing titles)
- Only includes movies and TV shows

## Configuration

### Environment Variables

```bash
NEXT_PUBLIC_TMBD_API_KEY=your_tmdb_api_key_here
```

### Image Sizes

Available poster sizes from TMDB:

- `w92`: 92px wide (thumbnail)
- `w154`: 154px wide (small)
- `w185`: 185px wide (medium-small)
- `w342`: 342px wide (medium)
- `w500`: 500px wide (large, default)
- `w780`: 780px wide (extra large)
- `original`: Original size

## Usage Examples

### Basic Search

```typescript
try {
  const results = await tmdbService.searchMedia("marvel");
  console.log(`Found ${results.length} results`);
} catch (error) {
  console.error("Search failed:", error.message);
}
```

### Responsive Images

```typescript
function getResponsivePosters(posterPath: string) {
  return {
    mobile: tmdbService.getPosterUrl(posterPath, "w185"),
    tablet: tmdbService.getPosterUrl(posterPath, "w342"),
    desktop: tmdbService.getPosterUrl(posterPath, "w500"),
  };
}
```

### Error Handling

```typescript
try {
  const results = await tmdbService.searchMedia(query);
  // Handle results
} catch (error) {
  if (error.message === "TMDB_RATE_LIMIT_EXCEEDED") {
    // Show rate limit message
  } else if (error.message === "TMDB_NETWORK_ERROR") {
    // Show network error message
  } else {
    // Show generic error message
  }
}
```

## Testing

Comprehensive test suite covers:

- Search functionality with various inputs
- Error handling for different failure scenarios
- Caching behavior and cleanup
- Image URL construction
- Data transformation methods
- React hook behavior and state management

Run tests with:

```bash
npm run test -- src/utils/tmdb
npm run test -- src/hooks/__tests__/useMediaSearch.test.ts
```

## Integration with Watch Party Creation

This service integrates with the watch party creation flow:

1. User types in media search field
2. `useMediaSearch` hook debounces input and calls `tmdbService.searchMedia`
3. Results displayed with poster images using `getPosterUrl`
4. User selects media, transformed to `SelectedMedia` format
5. Selected media stored with watch party in database
6. Watch party cards display media using poster URLs

## Future Enhancements

- Trending content suggestions
- Genre-based filtering
- Streaming availability integration
- Advanced search filters (year, rating, etc.)
- Image optimization and lazy loading
- Offline caching with IndexedDB
