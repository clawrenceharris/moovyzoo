# Stream Interaction Features - Design Document

## Overview

This design implements comprehensive stream interaction functionality including join/leave actions on stream cards, dropdown menu options, synchronized video playback, and a complete stream page layout with real-time participant management and chat. The solution transforms basic streaming session listings into fully interactive watch party experiences with real-time synchronization and social features.

## Architecture

### High-Level Flow

1. **User discovers streams** in habitat or streams listing with enhanced cards
2. **User joins stream** directly from card or through menu options
3. **Stream page loads** with video player, participants sidebar, and chat
4. **Real-time sync** maintains playback state and participant updates across all users
5. **Interactive features** enable chat, participant management, and synchronized viewing

### Component Architecture

```
StreamCard (Enhanced)
├── MediaDisplay
├── JoinButton
├── MenuDropdown
│   ├── JoinOption
│   ├── LeaveOption
│   └── ReminderToggle
└── ParticipantCount

StreamPage
├── VideoPlayer
│   ├── PlaybackControls
│   ├── SyncManager
│   └── FullscreenSupport
└── Sidebar
    ├── ParticipantsList
    └── ChatInterface
        ├── MessageHistory
        ├── MessageInput
        └── TypingIndicators
```

## Components and Interfaces

### 1. Enhanced Stream Card Component

**File:** `src/components/cards/StreamCard.tsx` (updated)

```typescript
interface StreamCardProps {
  stream: StreamWithParticipants;
  currentUserId?: string;
  onJoin?: (streamId: string) => Promise<void>;
  onLeave?: (streamId: string) => Promise<void>;
  onToggleReminder?: (streamId: string, enabled: boolean) => Promise<void>;
  className?: string;
}

interface StreamWithParticipants {
  id: string;
  title: string;
  description?: string;
  scheduled_for: string;
  created_by: string;
  habitat_id: string;
  media?: StreamMedia;
  participant_count: number;
  is_user_participant: boolean;
  user_reminder_enabled?: boolean;
  participants: StreamParticipant[];
}
```

**Features:**

- Prominent "Join" button for non-participants
- Three-dots menu with Shadcn DropdownMenu component
- Real-time participant count updates
- Loading states for all actions
- Optimistic UI updates
- Error handling with retry options

### 2. Video Player Component

**File:** `src/features/streaming/components/StreamVideoPlayer.tsx`

```typescript
interface StreamVideoPlayerProps {
  streamId: string;
  media: StreamMedia;
  isHost: boolean;
  currentUserId: string;
  onPlaybackChange?: (state: PlaybackState) => void;
}

interface PlaybackState {
  currentTime: number;
  isPlaying: boolean;
  duration: number;
  volume: number;
  isFullscreen: boolean;
}

interface StreamMedia {
  tmdb_id: number;
  media_type: "movie" | "tv";
  media_title: string;
  poster_path?: string;
  video_url?: string; // For actual video content
  runtime?: number;
}
```

**Features:**

- HTML5 video player with custom controls
- Host-only playback controls (play/pause/seek)
- Participant view-only mode with sync
- Fullscreen support with mobile optimization
- Loading and buffering states
- Error handling for media failures
- Real-time playback synchronization

### 3. Stream Page Layout

**File:** `src/app/(app)/streams/[id]/page.tsx`

**Layout Structure:**

```
Desktop Layout:
┌─────────────────────────────────────┬─────────────┐
│                                     │             │
│           Video Player              │ Participants│
│                                     │   (Fixed)   │
│                                     ├─────────────┤
│                                     │             │
│                                     │    Chat     │
│                                     │ (Scrollable)│
└─────────────────────────────────────┴─────────────┘

Mobile Layout:
┌─────────────────────────────────────┐
│           Video Player              │
│                                     │
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│        Collapsible Sidebar         │
│    (Participants + Chat Tabs)      │
└─────────────────────────────────────┘
```

### 4. Participants Sidebar Component

**File:** `src/features/streaming/components/ParticipantsSidebar.tsx`

```typescript
interface ParticipantsSidebarProps {
  streamId: string;
  participants: StreamParticipant[];
  currentUserId: string;
  isHost: boolean;
  onKickParticipant?: (participantId: string) => void;
  className?: string;
}

interface StreamParticipant {
  id: string;
  user_id: string;
  joined_at: string;
  is_host: boolean;
  profile: {
    display_name: string;
    avatar_url?: string;
  };
}
```

**Features:**

- Real-time participant list with avatars
- Host indicators and controls
- Join/leave animations
- Online status indicators
- Host management capabilities

### 5. Stream Chat Component

**File:** `src/features/streaming/components/StreamChat.tsx`

```typescript
interface StreamChatProps {
  streamId: string;
  currentUserId: string;
  className?: string;
}

interface ChatMessage {
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
```

**Features:**

- Real-time messaging with Supabase realtime
- Message history with pagination
- Typing indicators
- Message timestamps and user avatars
- Auto-scroll to latest messages
- Mobile-optimized input handling

## Data Models

### Database Schema Updates

**Table:** `stream_participants`

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

**Table:** `stream_messages`

```sql
CREATE TABLE stream_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stream_id UUID NOT NULL REFERENCES habitat_watch_parties(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_stream_messages_stream ON stream_messages(stream_id, created_at);
```

**Table:** `habitat_watch_parties` (updated)

```sql
-- Add playback synchronization columns
ALTER TABLE habitat_watch_parties ADD COLUMN current_time INTEGER DEFAULT 0; -- seconds
ALTER TABLE habitat_watch_parties ADD COLUMN is_playing BOOLEAN DEFAULT false;
ALTER TABLE habitat_watch_parties ADD COLUMN last_sync_at TIMESTAMP DEFAULT NOW();
ALTER TABLE habitat_watch_parties ADD COLUMN video_url TEXT; -- actual video content URL
```

## Real-time Synchronization Architecture

### Playback Synchronization

**Technology:** Supabase Realtime with PostgreSQL triggers

**Sync Strategy:**

1. **Host Actions** - Play/pause/seek events broadcast to all participants
2. **Participant Sync** - New joiners sync to current playback position
3. **Conflict Resolution** - Host actions take precedence
4. **Network Resilience** - Automatic reconnection and state recovery

**Implementation:**

```typescript
// Realtime subscription for playback state
const playbackSubscription = supabase
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

// Participant management subscription
const participantSubscription = supabase
  .channel(`stream:${streamId}:participants`)
  .on(
    "postgres_changes",
    {
      event: "*",
      schema: "public",
      table: "stream_members",
      filter: `stream_id=eq.${streamId}`,
    },
    (payload) => {
      handleParticipantChange(payload);
    }
  )
  .subscribe();
```

### Chat System

**Message Flow:**

1. User sends message → Validation → Database insert
2. Database trigger → Realtime broadcast → All participants
3. Optimistic UI updates for sender
4. Message history pagination for new joiners

## Error Handling

### Join/Leave Operations

1. **Network failures** - Show retry option, optimistic updates with rollback
2. **Permission errors** - Clear messaging about access restrictions
3. **Concurrent modifications** - Handle race conditions gracefully
4. **Stream capacity limits** - Inform user when stream is full

### Video Player Errors

1. **Media loading failures** - Show error state with retry option
2. **Sync failures** - Attempt reconnection, show connection status
3. **Playback errors** - Fallback to manual sync, notify participants
4. **Network interruptions** - Buffer management, automatic recovery

### Real-time Connection Errors

1. **Connection drops** - Automatic reconnection with exponential backoff
2. **Subscription failures** - Retry subscription, show offline indicator
3. **Message delivery failures** - Queue messages, retry on reconnection
4. **State desync** - Periodic state reconciliation, manual refresh option

## Testing Strategy

### Unit Tests

- **StreamCard** - Join/leave functionality, menu interactions, loading states
- **Video Player** - Playback controls, sync logic, error handling
- **Participants Sidebar** - Real-time updates, host controls
- **Stream Chat** - Message sending, real-time updates, history loading

### Integration Tests

- **Join/Leave workflow** - End-to-end participant management
- **Real-time sync** - Playback synchronization across multiple clients
- **Chat functionality** - Message delivery and real-time updates
- **Database operations** - Participant and message storage/retrieval

### Performance Tests

- **Real-time scalability** - Multiple participants in single stream
- **Video performance** - Playback smoothness, sync accuracy
- **Network resilience** - Connection drops, slow networks
- **Memory usage** - Long-running sessions, subscription cleanup

## Security Considerations

### Access Control

- **Stream permissions** - Validate user can join specific streams
- **Host privileges** - Ensure only hosts can control playback
- **Message validation** - Sanitize chat messages, prevent XSS
- **Rate limiting** - Prevent spam in chat and excessive join/leave actions

### Data Protection

- **User privacy** - Limit participant data exposure
- **Message encryption** - Secure chat message transmission
- **Session security** - Validate stream access tokens
- **Input sanitization** - Clean all user inputs before storage

## Performance Considerations

### Real-time Optimization

- **Connection pooling** - Efficient Supabase realtime connections
- **Event batching** - Group rapid changes to reduce network traffic
- **Selective subscriptions** - Only subscribe to relevant stream events
- **Memory management** - Clean up subscriptions on component unmount

### Video Performance

- **Adaptive streaming** - Support multiple quality levels based on bandwidth
- **Preloading** - Buffer ahead for smooth playback
- **Sync tolerance** - Allow small time differences to prevent constant corrections
- **Bandwidth detection** - Adjust quality based on network conditions

### UI Performance

- **Optimistic updates** - Show changes immediately, rollback on failure
- **Virtual scrolling** - For large participant lists and chat history
- **Lazy loading** - Load components and data as needed
- **Bundle optimization** - Code splitting for video player functionality

## Migration Strategy

### Database Migration

1. **Add new tables** - stream_participants, stream_messages
2. **Update existing table** - Add playback columns to habitat_watch_parties
3. **Create indexes** - Optimize for real-time queries
4. **Backward compatibility** - Existing streams continue working

### Feature Rollout

1. **Feature flags** - Enable/disable new functionality gradually
2. **Progressive enhancement** - Basic functionality works without real-time features
3. **User testing** - Beta test with small groups before full rollout
4. **Performance monitoring** - Track usage, errors, and performance metrics

## Future Enhancements

### Advanced Features

- **Screen sharing** - Allow participants to share screens
- **Voice chat** - Add audio communication alongside video
- **Reactions** - Real-time emoji reactions during playback
- **Polls and games** - Interactive elements during watch parties
- **Recording** - Save chat history and session highlights
- **Mobile apps** - Native iOS/Android applications for better mobile experience
