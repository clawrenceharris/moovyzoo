# Watch History Tracking Integration

This document explains how to integrate watch history tracking with existing TMDB API calls and components.

## Overview

The watch history tracking system provides hooks and components to seamlessly track user interactions with movies and TV shows. It integrates with the existing TMDB API infrastructure to automatically capture viewing data.

## Core Hooks

### `useWatchHistory()`

Basic hook for managing watch history entries:

```typescript
import { useWatchHistory } from '@/features/profile/hooks';

function MyComponent() {
  const {
    trackAsWatched,
    trackAsWatching,
    trackAsDropped,
    updateRating,
    isLoading,
    error
  } = useWatchHistory();

  const handleMarkAsWatched = async () => {
    await trackAsWatched({
      movieId: '123',
      title: 'The Matrix',
      mediaType: 'movie',
      posterUrl: 'https://image.tmdb.org/t/p/w500/poster.jpg',
      rating: 9
    });
  };
}
```

### `useTMDBTracking()`

Enhanced hook that integrates directly with TMDB data structures:

```typescript
import { useTMDBTracking } from '@/features/profile/hooks';
import { getMovieDetails } from '@/features/ai-chat/data/tmdb.repository';

function MovieDetailsPage({ movieId }: { movieId: number }) {
  const {
    markMovieAsWatched,
    rateMovie,
    isLoading
  } = useTMDBTracking();

  const handleWatchMovie = async () => {
    const movie = await getMovieDetails(movieId);
    await markMovieAsWatched(movie, 8); // Mark as watched with rating
  };
}
```

## Components

### `WatchHistoryTracker`

Full-featured component for tracking watch status and ratings:

```typescript
import { WatchHistoryTracker } from '@/features/profile/components';

function MovieCard({ movie }: { movie: TMDBMovie }) {
  return (
    <div className="movie-card">
      <h3>{movie.title}</h3>
      <WatchHistoryTracker
        media={movie}
        mediaType="movie"
        variant="full"
        onStatusChange={(status) => {}}
        onRatingChange={(rating) => {}}
      />
    </div>
  );
}
```

### `MediaWithTracking`

Wrapper component that adds tracking to any media display:

```typescript
import { MediaWithTracking } from '@/features/profile/components';

function SearchResults({ movies }: { movies: TMDBMovie[] }) {
  return (
    <div className="grid gap-4">
      {movies.map(movie => (
        <MediaWithTracking
          key={movie.id}
          media={movie}
          mediaType="movie"
          trackerVariant="compact"
        />
      ))}
    </div>
  );
}
```

## Integration Examples

### With Existing TMDB API Calls

Wrap existing API calls to automatically track interactions:

```typescript
import { useTMDBTracking } from '@/features/profile/hooks';
import { getMovieDetails } from '@/features/ai-chat/data/tmdb.repository';

function useMovieWithTracking() {
  const { withTracking } = useTMDBTracking();

  // Automatically track when movie details are fetched
  const getMovieDetailsWithTracking = withTracking(
    () => getMovieDetails(movieId),
    { 
      autoTrack: true, 
      trackAsWatching: true,
      mediaType: 'movie'
    }
  );

  return { getMovieDetailsWithTracking };
}
```

### With Media Search

Enhance search results with quick rating:

```typescript
import { MediaSearchResultWithTracking } from '@/features/profile/components';

function EnhancedMediaSearch() {
  const { results } = useMediaSearch();

  return (
    <div className="search-results">
      {results.map(media => (
        <MediaSearchResultWithTracking
          key={media.id}
          media={media}
          mediaType={media.media_type}
          onSelect={(selectedMedia) => {
            // Handle selection
          }}
        />
      ))}
    </div>
  );
}
```

### Bulk Operations

Track multiple items at once:

```typescript
import { useTMDBTracking } from '@/features/profile/hooks';

function WatchlistManager({ watchlist }: { watchlist: TMDBMovie[] }) {
  const { batchTrack } = useTMDBTracking();

  const markAllAsWatched = async () => {
    await batchTrack(
      watchlist.map(movie => ({
        media: movie,
        mediaType: 'movie' as const,
        status: 'watched' as const,
        rating: 7 // Default rating
      }))
    );
  };

  return (
    <button onClick={markAllAsWatched}>
      Mark All as Watched
    </button>
  );
}
```

## API Integration

The watch history system uses the `/api/watch-history` endpoint:

### POST - Add/Update Entry
```typescript
// Request
{
  movieId: string;
  title: string;
  posterUrl?: string;
  mediaType: 'movie' | 'tv';
  status: 'watched' | 'watching' | 'dropped';
  rating?: number; // 1-10
  watchedAt?: string; // ISO date
}

// Response
{
  success: true;
  data: {
    id: string;
    movieId: string;
    title: string;
    // ... other fields
  }
}
```

### GET - Fetch History
```typescript
// Query params: ?userId=123&limit=20&recent=true

// Response
{
  success: true;
  entries: WatchHistoryEntry[]
}
```

## Best Practices

1. **Use `useTMDBTracking` for TMDB data** - It handles poster URLs and data extraction automatically
2. **Use `useWatchHistory` for custom data** - When you have non-TMDB data or need more control
3. **Implement error handling** - Always check for errors and provide user feedback
4. **Batch operations when possible** - Use `batchTrack` for multiple items
5. **Respect user privacy** - Only track when user explicitly interacts with tracking UI

## Error Handling

All hooks provide error states:

```typescript
const { error, isLoading, reset } = useWatchHistory();

if (error) {
  return (
    <div className="error">
      Failed to update: {error.message}
      <button onClick={reset}>Try Again</button>
    </div>
  );
}
```

## Performance Considerations

- Watch history queries are cached for 5 minutes
- Recent activity queries are cached for 2 minutes
- Failed requests are automatically retried
- Batch operations are more efficient than individual calls
- Background tracking doesn't block UI interactions