# Streaming Session Media Integration - Design Document

## Overview

This design implements TMDB movie/TV show search integration into the streaming session creation workflow. The solution adds a media search component to the streaming session creation form, extends the database schema to store media associations, and enhances the streaming session card display with rich media content including poster images and metadata.

## Architecture

### High-Level Flow

1. **User searches** for media in streaming session creation form
2. **TMDB service** queries the tmdb API for results
3. **User selects** media from search results
4. **Streaming session** is created with associated media metadata
5. **Streaming session cards** display rich media content with posters

### Component Architecture

```
StreamCreationForm
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

### 3. Enhanced Streaming Session Card with Join Functionality

**File:** `src/components/cards/StreamCard.tsx` (updated)

**New Props:**

```typescript
interface StreamCardProps {
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
  currentUserId?: string;
  participants?: StreamParticipant[];
  onJoin?: () => void;
  onLeave?: () => void;
  onToggleReminder?: () => void;
  isJoining?: boolean;
  isLeaving?: boolean;
}

interface StreamParticipant {
  id: string;
  profile: {
    display_name: string;
    avatar_url?: string;
  };
}
```

**Visual Enhancements:**

- Poster image display (with fallback)
- Media title and type badges
- Release year display
- Prominent "Join" button for non-participants
- Three-dots menu button with dropdown options
- Participant count indicator
- Loading states for join/leave actions
- Improved visual hierarchy

**Menu Options:**

- **Non-participants:** Join, Set Reminder
- **Participants:** Leave, Toggle Reminder

### 4. Video Player Component

**File:** `src/features/streaming/components/StreamingVideoPlayer.tsx`

```typescript
interface StreamingVideoPlayerProps {
  streamId: string;
  media: StreamMedia;
  isHost: boolean;
  participants: StreamParticipant[];
  onPlaybackSync?: (state: PlaybackState) => void;
}

interface PlaybackState {
  time: number;
  isPlaying: boolean;
  duration: number;
  buffering: boolean;
}

interface StreamMedia {
  tmdb_id: number;
  media_type: "movie" | "tv";
  media_title: string;
  poster_path?: string;
  episode?: {
    season: number;
    episode: number;
  };
}
```

**Features:**

- HTML5 video player with custom controls
- Synchronized playback across participants
- Host controls for play/pause/seek
- Participant view-only mode (unless host)
- Fullscreen support
- Loading and buffering states
- Error handling for media loading failures

### 5. Stream Page Layout

**File:** `src/app/(app)/streams/[id]/page.tsx` (updated)

**Layout Structure:**

```
┌─────────────────────────────────────┬─────────────┐
│                                     │             │
│           Video Player              │ Participants│
│                                     │             │
│                                     ├─────────────┤
│                                     │             │
│                                     │    Chat     │
│                                     │             │
└─────────────────────────────────────┴─────────────┘
```

**Responsive Behavior:**

- **Desktop:** Side-by-side layout with fixed sidebar
- **Tablet:** Collapsible sidebar with overlay
- **Mobile:** Full-width video with bottom sheet for participants/chat

### 6. Participants Sidebar Component

**File:** `src/features/streaming/components/ParticipantsSidebar.tsx`

```typescript
interface ParticipantsSidebarProps {
  participants: StreamParticipant[];
  currentUserId: string;
  isHost: boolean;
  onKickParticipant?: (participantId: string) => void;
  className?: string;
}
```

**Features:**

- Real-time participant list
- Host indicators and controls
- Avatar display with fallbacks
- Online/offline status indicators
- Kick functionality for hosts

### 7. Stream Chat Component

**File:** `src/features/streaming/components/StreamChat.tsx`

```typescript
interface StreamChatProps {
  streamId: string;
  currentUserId: string;
  participants: StreamParticipant[];
  className?: string;
}
```

**Features:**

- Real-time messaging using Supabase realtime
- Message history loading
- Typing indicators
- Message timestamps
- User mentions and reactions

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
ALTER TABLE habitat_watch_parties ADD COLUMN runtime INTEGER; -- in minutes
ALTER TABLE habitat_watch_parties ADD COLUMN time INTEGER DEFAULT 0; -- playback position in seconds
ALTER TABLE habitat_watch_parties ADD COLUMN is_playing BOOLEAN DEFAULT false;
ALTER TABLE habitat_watch_parties ADD COLUMN last_sync_at TIMESTAMP DEFAULT NOW();

-- Add index for media queries
CREATE INDEX idx_streams_media ON habitat_watch_parties(tmdb_id, media_type);
```

**Table:** `stream_participants` (new)

```sql
CREATE TABLE stream_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stream_id UUID NOT NULL REFERENCES habitat_watch_parties(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at TIMESTAMP DEFAULT NOW(),
  is_host BOOLEAN DEFAULT false,
  reminder_enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(stream_id, user_id)
);

CREATE INDEX idx_stream_participants_stream ON stream_participants(stream_id);
CREATE INDEX idx_stream_participants_user ON stream_participants(user_id);
```

**Table:** `stream_messages` (new)

```sql
CREATE TABLE stream_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stream_id UUID NOT NULL REFERENCES habitat_watch_parties(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_stream_messages_stream ON stream_messages(stream_id, created_at);
```

### TypeScript Interfaces

**File:** `src/features/streaming/domain/stream.types.ts` (updated)

```typescript
interface StreamMedia {
  tmdb_id: number;
  media_type: "movie" | "tv";
  media_title: string;
  poster_path?: string;
  release_date?: string;
  runtime?: number;
}

interface StreamParticipant {
  id: string;
  user_id: string;
  joined_at: string;
  is_host: boolean;
  reminder_enabled: boolean;
  profile: {
    display_name: string;
    avatar_url?: string;
  };
}

interface PlaybackState {
  time: number;
  is_playing: boolean;
  last_sync_at: string;
}

interface StreamWithParticipants {
  // ... existing fields
  media?: StreamMedia;
  participants: StreamParticipant[];
  playback_state: PlaybackState;
  participant_count: number;
  is_user_participant: boolean;
  user_is_host: boolean;
}

interface CreateStreamData {
  // ... existing fields
  media?: {
    tmdb_id: number;
    media_type: "movie" | "tv";
    media_title: string;
    poster_path?: string;
    release_date?: string;
    runtime?: number;
  };
}

interface StreamMessage {
  id: string;
  stream_id: string;
  user_id: string;
  message: string;
  created_at: string;
  profile: {
    display_name: string;
    avatar_url?: string;
  };
}

interface JoinStreamData {
  stream_id: string;
  reminder_enabled?: boolean;
}

interface UpdateReminderData {
  stream_id: string;
  reminder_enabled: boolean;
}
```

## Error Handling

### TMDB API Error Scenarios

1. **Network failures** - Show retry option, allow form submission without media
2. **Rate limiting** - Implement exponential backoff, show user-friendly message
3. **Invalid responses** - Graceful degradation, log errors for monitoring
4. **Image loading failures** - Fallback to placeholder images

### Participant Management Errors

1. **Join failures** - Show error message, allow retry, don't break card UI
2. **Leave failures** - Optimistic updates with rollback on failure
3. **Permission errors** - Clear messaging about stream access restrictions
4. **Concurrent modifications** - Handle race conditions gracefully

### Video Player Error Scenarios

1. **Media loading failures** - Show error state with retry option
2. **Sync failures** - Attempt reconnection, show connection status
3. **Playback errors** - Fallback to manual sync, notify participants
4. **Network interruptions** - Buffer management, automatic recovery

### Real-time Connection Errors

1. **Connection drops** - Automatic reconnection with exponential backoff
2. **Subscription failures** - Retry subscription, show offline indicator
3. **Message delivery failures** - Queue messages, retry on reconnection
4. **State desync** - Periodic state reconciliation, manual refresh option

### Error Recovery Strategies

- **Graceful degradation** - Core functionality works without real-time features
- **Retry mechanisms** - Automatic and manual retry options for failed operations
- **Fallback visuals** - Default states for failed loads and connections
- **User feedback** - Clear error messages with actionable next steps
- **Offline support** - Basic functionality when network is unavailable
- **State recovery** - Restore user state after connection issues

## Testing Strategy

### Unit Tests

- **TMDB Service** - Mock API responses, test error handling
- **MediaSearchField** - User interactions, debouncing, selection
- **StreamCard** - Media display, join/leave functionality, menu interactions
- **Video Player** - Playback controls, sync logic, error states
- **Participants Sidebar** - Real-time updates, host controls
- **Stream Chat** - Message sending, real-time updates, history loading

### Integration Tests

- **Form submission** - With and without media selection
- **Database operations** - Media data storage, participant management
- **API integration** - Real TMDB API calls (limited)
- **Join/Leave workflow** - End-to-end participant management
- **Real-time sync** - Playback synchronization across multiple clients
- **Chat functionality** - Message delivery and real-time updates

### Visual Tests

- **Responsive design** - Mobile and desktop layouts for all components
- **Loading states** - Search, video loading, join/leave actions
- **Error states** - Failed searches, connection issues, playback errors
- **Interactive states** - Menu dropdowns, video controls, chat interface

### Performance Tests

- **Real-time scalability** - Multiple participants in single stream
- **Video performance** - Playback smoothness, sync accuracy
- **Network resilience** - Connection drops, slow networks
- **Memory usage** - Long-running sessions, subscription cleanup

### Accessibility Tests

- **Keyboard navigation** - All interactive elements accessible
- **Screen reader support** - Proper ARIA labels and descriptions
- **Color contrast** - Meet WCAG guidelines for all UI elements
- **Focus management** - Logical tab order, visible focus indicators

## Real-time Synchronization Architecture

### Playback Synchronization

**Technology:** Supabase Realtime with PostgreSQL triggers

**Sync Strategy:**

1. **Host Actions** - Play/pause/seek events broadcast to all participants
2. **Participant Sync** - New joiners sync to current playback position
3. **Conflict Resolution** - Host actions take precedence over participant actions
4. **Network Resilience** - Automatic reconnection and state recovery

**Implementation:**

```typescript
// Realtime subscription for playback state
const syncSubscription = supabase
  .channel(`stream:${streamId}:playback`)
  .on(
    "postgres_changes",
    {
      event: "UPDATE",
      schema: "public",
      table: "habitat_watch_parties",
      filter: `id=eq.${streamId}`,
    },
    (payload) => {
      handlePlaybackSync(payload.new);
    }
  )
  .subscribe();
```

### Participant Management

**Real-time Updates:**

- Participant join/leave events
- Host status changes
- Reminder preference updates

**Data Flow:**

```
User Action → Service Layer → Database → Realtime Trigger → All Participants
```

### Chat System

**Message Flow:**

1. User sends message → Validation → Database insert
2. Database trigger → Realtime broadcast → All participants
3. Optimistic UI updates for sender
4. Message history pagination for new joiners

## Performance Considerations

### API Optimization

- **Debounced searches** - Reduce API calls during typing
- **Result caching** - Cache recent search results (5-minute TTL)
- **Image optimization** - Use appropriate TMDB image sizes
- **Request limiting** - Maximum 10 results per search

### UI Performance

- **Lazy loading** - Load images as they come into view
- **Virtual scrolling** - For large search result sets and chat history
- **Optimistic updates** - Show selected media and participant changes immediately
- **Bundle optimization** - Code splitting for TMDB functionality and video player

### Real-time Performance

- **Connection pooling** - Efficient Supabase realtime connections
- **Event batching** - Group rapid playback changes to reduce network traffic
- **Selective subscriptions** - Only subscribe to relevant stream events
- **Memory management** - Clean up subscriptions on component unmount

### Video Performance

- **Adaptive streaming** - Support multiple video quality levels
- **Preloading** - Buffer ahead for smooth playback
- **Sync tolerance** - Allow small time differences to prevent constant corrections
- **Bandwidth detection** - Adjust quality based on network conditions

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
2. **Backward compatibility** - Existing streaming sessions continue working
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
