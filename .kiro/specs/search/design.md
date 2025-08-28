# Design Document

## Overview

The Search feature provides a unified search interface with three distinct search domains: Habitats, Users, and Shows & Movies. The feature is implemented as a dedicated search page with tabbed navigation, leveraging existing repository patterns and introducing new search-specific services and components.

The design follows the established Zoovie architecture with feature-based organization, separating concerns between data access, business logic, and UI components. The search functionality integrates with existing Supabase tables for habitats and profiles, while introducing TMDB API integration for movie and TV show content.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Search Page (/search)                    │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │  Habitats   │  │    Users    │  │   Shows & Movies    │  │
│  │     Tab     │  │     Tab     │  │        Tab          │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
├─────────────────────────────────────────────────────────────┤
│                   Search Components                         │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │           SearchInterface Component                     │ │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────────┐   │ │
│  │  │ HabitatCard │ │  UserCard   │ │   ContentCard   │   │ │
│  │  └─────────────┘ └─────────────┘ └─────────────────┘   │ │
│  └─────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│                    Search Services                          │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │  SearchService (orchestrates all search operations)    │ │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────────┐   │ │
│  │  │   Habitats  │ │   Profiles  │ │      TMDB       │   │ │
│  │  │ Repository  │ │ Repository  │ │   Repository    │   │ │
│  │  └─────────────┘ └─────────────┘ └─────────────────┘   │ │
│  └─────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│                     Data Sources                            │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────────┐   │ │
│  │  │  Supabase   │ │  Supabase   │ │   TMDB API      │   │ │
│  │  │  Habitats   │ │  Profiles   │ │   (External)    │   │ │
│  │  └─────────────┘ └─────────────┘ └─────────────────┘   │ │
│  └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Feature Structure

Following the established Zoovie feature architecture:

```
src/features/search/
├── components/
│   ├── SearchInterface.tsx          # Main search page component
│   ├── SearchTabs.tsx              # Tab navigation component
│   ├── SearchInput.tsx             # Debounced search input
│   ├── HabitatSearchResults.tsx    # Habitat results display
│   ├── UserSearchResults.tsx       # User results display
│   ├── ContentSearchResults.tsx    # Movie/TV results display
│   ├── SearchResultCard.tsx        # Generic result card
│   ├── RecentSearches.tsx          # Recent searches display
│   ├── PopularContent.tsx          # Popular/trending content
│   └── index.ts                    # Component exports
├── domain/
│   ├── search.types.ts             # Search domain types
│   ├── search.schema.ts            # Zod validation schemas
│   └── search.service.ts           # Business logic orchestration
├── data/
│   ├── search.repository.ts        # Search-specific queries
│   ├── tmdb.repository.ts          # TMDB API integration
│   └── index.ts                    # Repository exports
├── hooks/
│   ├── useSearch.ts                # Main search hook
│   ├── useSearchHistory.ts         # Recent searches management
│   ├── usePopularContent.ts        # Popular content fetching
│   └── index.ts                    # Hook exports
└── utils/
    ├── search-utils.ts             # Search utility functions
    └── debounce.ts                 # Debouncing utility
```

## Components and Interfaces

### Core Components

#### SearchInterface Component

- **Purpose**: Main container component for the search page
- **Props**: None (manages its own state)
- **State**: Current tab, search queries per tab, loading states
- **Responsibilities**: Tab management, search orchestration, result display

#### SearchTabs Component

- **Purpose**: Tab navigation for different search domains
- **Props**: `activeTab`, `onTabChange`, `searchCounts`
- **State**: None (controlled component). Use Shadcn Tabs component
- **Responsibilities**: Tab switching, result count display

#### SearchInput Component

- **Purpose**: Debounced search input with loading states
- **Props**: `value`, `onChange`, `placeholder`, `loading`
- **State**: Internal debounced value
- **Responsibilities**: Input handling, debouncing, loading indication

#### Search Result Components

Each search domain has its own result component:

**HabitatSearchResults**

- Displays habitat cards with name, description, member count, tags
- Handles join/leave actions
- Shows membership status

**UserSearchResults**

- Displays user cards with avatar, display name, bio excerpt
- Handles profile navigation
- Respects privacy settings

**ContentSearchResults**

- Displays content cards with poster, title, year, genre, rating
- Handles content detail expanded view
- Shows related habitats

### Data Models

#### Search Types

```typescript
// Search query and result types
export interface SearchQuery {
  term: string;
  type: "habitats" | "users" | "content";
  filters?: SearchFilters;
}

export interface SearchFilters {
  genres?: string[];
  year?: number;
  rating?: number;
  memberCount?: { min?: number; max?: number };
}

export interface SearchResults<T> {
  items: T[];
  total: number;
  hasMore: boolean;
  nextOffset?: number;
}

// Domain-specific result types
export interface HabitatSearchResult {
  id: string;
  name: string;
  description: string;
  tags: string[];
  memberCount: number;
  avatarUrl?: string;
  isMember: boolean;
  isPublic: boolean;
}

export interface UserSearchResult {
  id: string;
  displayName: string;
  username: string;
  avatarUrl?: string;
  quote?: string;
  favoriteGenres?: string[];
  lastActiveAt: Date;
}

export interface ContentSearchResult {
  id: string;
  title: string;
  type: "movie" | "tv";
  year: number;
  genres: string[];
  rating: number;
  posterUrl?: string;
  overview: string;
  tmdbId: number;
  relatedHabitats?: HabitatSearchResult[];
}

// Search history types
export interface SearchHistoryItem {
  id: string;
  query: string;
  type: "habitats" | "users" | "content";
  timestamp: Date;
  resultCount: number;
}

// Popular content types
export interface PopularItem {
  id: string;
  title: string;
  type: "habitat" | "user" | "content";
  score: number;
  metadata: Record<string, any>;
}
```

#### TMDB Integration Types

```typescript
export interface TMDBMovie {
  id: number;
  title: string;
  overview: string;
  release_date: string;
  genre_ids: number[];
  vote_average: number;
  poster_path?: string;
  backdrop_path?: string;
}

export interface TMDBTVShow {
  id: number;
  name: string;
  overview: string;
  first_air_date: string;
  genre_ids: number[];
  vote_average: number;
  poster_path?: string;
  backdrop_path?: string;
}

export interface TMDBSearchResponse<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}
```

## Data Models

### Database Schema Extensions

The search feature primarily uses existing tables but may require some additions:

#### Search History Table (Optional)

```sql
CREATE TABLE search_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  query TEXT NOT NULL,
  search_type TEXT NOT NULL CHECK (search_type IN ('habitats', 'users', 'content')),
  result_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_search_history_user_type ON search_history(user_id, search_type);
CREATE INDEX idx_search_history_created_at ON search_history(created_at DESC);
```

#### Popular Content Cache Table (Optional)

```sql
CREATE TABLE popular_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type TEXT NOT NULL CHECK (content_type IN ('habitat', 'user', 'content')),
  content_id TEXT NOT NULL,
  score DECIMAL NOT NULL DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_popular_content_type_score ON popular_content(content_type, score DESC);
```

### Search Indexes

To optimize search performance, we'll add full-text search indexes:

```sql
-- Habitat search index
CREATE INDEX idx_habitats_search ON habitats
USING GIN (to_tsvector('english', name || ' ' || COALESCE(description, '') || ' ' || array_to_string(tags, ' ')));

-- Profile search index
CREATE INDEX idx_profiles_search ON profiles
USING GIN (to_tsvector('english', display_name || ' ' || COALESCE(quote, '')));
```

## Error Handling

### Search-Specific Error Codes

```typescript
export enum SearchErrorCode {
  SEARCH_QUERY_TOO_SHORT = "SEARCH_QUERY_TOO_SHORT",
  SEARCH_QUERY_TOO_LONG = "SEARCH_QUERY_TOO_LONG",
  SEARCH_RATE_LIMITED = "SEARCH_RATE_LIMITED",
  SEARCH_SERVICE_UNAVAILABLE = "SEARCH_SERVICE_UNAVAILABLE",
  TMDB_API_ERROR = "TMDB_API_ERROR",
  TMDB_RATE_LIMITED = "TMDB_RATE_LIMITED",
  SEARCH_RESULTS_TIMEOUT = "SEARCH_RESULTS_TIMEOUT",
}
```

### Error Handling Strategy

1. **Input Validation**: Validate search queries before processing
2. **Rate Limiting**: Implement client-side debouncing and server-side rate limiting
3. **Fallback Handling**: Graceful degradation when external APIs fail
4. **Timeout Management**: Set reasonable timeouts for search operations
5. **User Feedback**: Clear error messages with actionable suggestions

## Testing Strategy

### Unit Tests

1. **Search Service Tests**

   - Query validation and sanitization
   - Result aggregation and formatting
   - Error handling scenarios

2. **Repository Tests**

   - Database query correctness
   - TMDB API integration
   - Search result mapping

3. **Component Tests**

   - Search input debouncing
   - Tab switching behavior
   - Result rendering and interaction

4. **Hook Tests**
   - Search state management
   - History persistence
   - Popular content caching

### Integration Tests

1. **Search Flow Tests**

   - End-to-end search scenarios
   - Cross-tab search persistence
   - Result navigation flows

2. **API Integration Tests**
   - TMDB API response handling
   - Supabase search queries
   - Error scenario handling

### Performance Tests

1. **Search Performance**

   - Query response times
   - Large result set handling
   - Concurrent search handling

2. **Mobile Performance**
   - Touch interaction responsiveness
   - Scroll performance with large lists
   - Memory usage optimization

## Implementation Considerations

### Performance Optimizations

1. **Debouncing**: 300ms debounce on search inputs
2. **Caching**: Cache popular searches and TMDB results
3. **Pagination**: Implement virtual scrolling for large result sets
4. **Prefetching**: Preload popular content on page load

### Security Considerations

1. **Input Sanitization**: Sanitize all search queries
2. **Rate Limiting**: Prevent search abuse
3. **Privacy Respect**: Honor user privacy settings in search results
4. **API Key Security**: Secure TMDB API key handling

### Accessibility Features

1. **Keyboard Navigation**: Full keyboard support for tabs and results
2. **Screen Reader Support**: Proper ARIA labels and announcements
3. **Focus Management**: Logical focus flow through search interface
4. **High Contrast**: Support for high contrast mode

### Mobile Optimizations

1. **Touch Targets**: Minimum 44px touch targets
2. **Responsive Design**: Adaptive layout for different screen sizes
3. **Gesture Support**: Swipe navigation between tabs
4. **Performance**: Optimized for mobile network conditions
