# Watch Party Media Integration - Design Document

## Overview

This design implements TMDB movie/TV show search integration into the watch party creation workflow. The solution adds a media search component to the watch party creation form, extends the database schema to store media associations, and enhances the watch party card display with rich media content including poster images and metadata.

## Architecture

### High-Level Flow

1. **User searches** for media in watch party creation form
2. **TMDB service** queries the tmdb API for results
3. **User selects** media from search results
4. **Watch party** is created with associated media metadata
5. **Watch party cards** display rich media content with posters

### Component Architecture

```
WatchPartyCreationForm
├── MediaSearchField (new)
│   ├── SearchInput
│   ├── SearchResults
│   └── SelectedMedia
├── ExistingFormFields
└── FormActions
```

**Methods:**

- `searchMedia()` - Multi-search for movies and TV shows
- `getImageUrl()` - Construct TMDB image URLs with proper sizing

### 2. Media Search Component

**File:** `src/components/media/MediaSearchField.tsx`

```typescript
interface MediaSearchFieldProps {
  onMediaSelect: (media: SelectedMedia | null) => void;
  selectedMedia?: SelectedMedia | null;
  placeholder?: string;
  disabled?: boolean;
}

interface SelectedMedia {
  tmdb_id: number;
  media_type: "movie" | "tv";
  title: string;
  mediaTitle: string;
  posterPath?: string;
  releaseDate?: string;
}
```

**Features:**

- Debounced search input (300ms delay)
- Loading states and error handling
- Responsive search results dropdown
- Selected media display with clear option
- Keyboard navigation support

### 3. Enhanced Watch Party Card

**File:** `src/components/cards/WatchPartyCard.tsx` (updated)

**New Props:**

```typescript
interface WatchPartyCardProps {
  // ... existing props
  media?: {
    tmdbId: number;
    mediaType: "movie" | "tv";
    title: string;
    mediaTitle: string;
    posterPath?: string;
    releaseDate?: string;
  };
  showMediaInfo?: boolean;
}
```

**Visual Enhancements:**

- Poster image display (with fallback)
- Media title and type badges
- Release year display
- Improved visual hierarchy

## Data Models

### Database Schema Updates

**Table:** `habitat_watch_parties`

```sql
-- Add new columns for media integration
ALTER TABLE habitat_watch_parties ADD COLUMN tmdb_id INTEGER;
ALTER TABLE habitat_watch_parties ADD COLUMN media_type VARCHAR(10) CHECK (media_type IN ('movie', 'tv'));
ALTER TABLE habitat_watch_parties ADD COLUMN media_title VARCHAR(255);
ALTER TABLE habitat_watch_parties ADD COLUMN poster_path VARCHAR(255);
ALTER TABLE habitat_watch_parties ADD COLUMN release_date DATE;

-- Add index for media queries
CREATE INDEX idx_watch_parties_media ON habitat_watch_parties(tmdb_id, media_type);
```

### TypeScript Interfaces

**File:** `src/features/habitats/domain/habitats.types.ts` (updated)

```typescript
interface WatchPartyMedia {
  tmdb_id: number;
  media_type: "movie" | "tv";
  media_title: string;
  poster_path?: string;
  release_date?: string;
}

interface WatchPartyWithParticipants {
  // ... existing fields
  media?: WatchPartyMedia;
}

interface CreateWatchPartyData {
  // ... existing fields
  media?: {
    tmdb_id: number;
    media_type: "movie" | "tv";
    media_title: string;
    poster_path?: string;
    release_date?: string;
  };
}
```

## Error Handling

### TMDB API Error Scenarios

1. **Network failures** - Show retry option, allow form submission without media
2. **Rate limiting** - Implement exponential backoff, show user-friendly message
3. **Invalid responses** - Graceful degradation, log errors for monitoring
4. **Image loading failures** - Fallback to placeholder images

### Error Recovery Strategies

- **Graceful degradation** - Watch parties work without media association
- **Retry mechanisms** - Allow users to retry failed searches
- **Fallback visuals** - Default posters for failed image loads
- **Validation** - Ensure form submission works regardless of media state

## Testing Strategy

### Unit Tests

- **TMDB Service** - Mock API responses, test error handling
- **MediaSearchField** - User interactions, debouncing, selection
- **WatchPartyCard** - Media display, fallback scenarios

### Integration Tests

- **Form submission** - With and without media selection
- **Database operations** - Media data storage and retrieval
- **API integration** - Real TMDB API calls (limited)

### Visual Tests

- **Responsive design** - Mobile and desktop layouts
- **Loading states** - Search and image loading indicators
- **Error states** - Failed searches and image loads

## Performance Considerations

### API Optimization

- **Debounced searches** - Reduce API calls during typing
- **Result caching** - Cache recent search results (5-minute TTL)
- **Image optimization** - Use appropriate TMDB image sizes
- **Request limiting** - Maximum 10 results per search

### UI Performance

- **Lazy loading** - Load images as they come into view
- **Virtual scrolling** - For large search result sets
- **Optimistic updates** - Show selected media immediately
- **Bundle optimization** - Code splitting for TMDB functionality

## Security Considerations

### API Key Management

- **Environment variables** - Store TMDB API key securely
- **Client-side exposure** - Use NEXT*PUBLIC* prefix for client access
- **Rate limiting** - Implement client-side request throttling

### Data Validation

- **Input sanitization** - Clean search queries and media data
- **Schema validation** - Validate TMDB responses before storage
- **XSS prevention** - Sanitize media titles and descriptions

## Migration Strategy

### Database Migration

1. **Add new columns** - Non-breaking addition to existing table
2. **Backward compatibility** - Existing watch parties continue working
3. **Data population** - Optional: backfill popular content metadata

### Feature Rollout

1. **Feature flag** - Enable/disable media search functionality
2. **Gradual rollout** - Start with power users, expand to all users
3. **Monitoring** - Track usage, errors, and performance metrics

## Future Enhancements

### Phase 2 Features

- **Trending content** - Show popular movies/shows in search
- **Recommendations** - Suggest content based on habitat themes
- **Season/episode selection** - For TV shows, allow specific episode targeting
- **Watchlist integration** - Import from user's TMDB watchlist

### Advanced Features

- **Content ratings** - Display MPAA/TV ratings
- **Genre filtering** - Filter search results by genre
- **Streaming availability** - Show where content can be watched
- **AI recommendations** - Use habitat activity to suggest content
