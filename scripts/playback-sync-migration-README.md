# Playback Synchronization Migration

This migration adds real-time playback synchronization functionality to the streaming feature.

## Overview

The playback synchronization system enables synchronized video playback across multiple participants in a streaming session. Only hosts can control playback (play, pause, seek), and all participants automatically sync to the host's actions.

## Database Changes

### New Columns Added to `streams` table:

- `current_time` (INTEGER): Current playback position in seconds
- `is_playing` (BOOLEAN): Whether the stream is currently playing
- `last_sync_at` (TIMESTAMP): Timestamp of last playback state sync
- `video_url` (TEXT): URL to the actual video content for playback

### New Index:

- `idx_streams_playback_sync`: Optimizes playback state queries for active streams

## Implementation Components

### 1. Playback Sync Hook (`use-playback-sync.ts`)

- Manages real-time playback state synchronization
- Handles Supabase realtime subscriptions
- Implements sync tolerance to prevent micro-adjustments
- Provides connection status monitoring

### 2. Enhanced StreamVideoPlayer Component

- Integrates with playback sync hook
- Host-only controls with real-time broadcasting
- Participant view-only mode with automatic sync
- Connection status indicators
- Network resilience and reconnection handling

### 3. Repository Layer Updates

- `updatePlaybackState()`: Updates playback state in database
- `getPlaybackState()`: Retrieves current playback state
- Proper error handling and validation

### 4. Service Layer Updates

- `updatePlaybackState()`: Business logic with host validation
- `getPlaybackState()`: Service-level playback state retrieval
- `subscribeToPlaybackChanges()`: Real-time subscription management

## Key Features

### Sync Tolerance

- Prevents constant micro-adjustments by ignoring time differences < 0.5 seconds
- Reduces network traffic and improves user experience

### Host-Only Controls

- Only hosts can play, pause, or seek
- Participants see "View Only" indicator
- Host actions broadcast to all participants in real-time

### Connection Management

- Visual connection status indicators
- Automatic reconnection on network issues
- Graceful handling of connection failures

### Network Resilience

- Handles network interruptions gracefully
- Automatic state recovery on reconnection
- Conflict resolution (host actions take precedence)

## Running the Migration

### Apply Migration:

```sql
-- Run the migration
\i scripts/playback-sync-migration.sql
```

### Rollback (if needed):

```sql
-- Rollback the migration
\i scripts/rollback-playback-sync-migration.sql
```

## Testing

The implementation includes comprehensive tests:

- **Unit Tests**: `use-playback-sync.test.ts` - Tests hook functionality
- **Integration Tests**: `StreamVideoPlayer.sync.test.tsx` - Tests component integration
- **Existing Tests**: Updated to work with new playback sync functionality

### Running Tests:

```bash
# Run playback sync tests
npm run test src/features/streaming/hooks/__tests__/use-playback-sync.test.ts

# Run video player sync tests
npm run test src/features/streaming/components/__tests__/StreamVideoPlayer.sync.test.tsx

# Run all streaming tests
npm run test src/features/streaming
```

## Usage Example

```typescript
// In a streaming session page
import { StreamVideoPlayer } from "@/features/streaming/components";

function StreamPage({ streamId, media, isHost, currentUserId }) {
  return (
    <StreamVideoPlayer
      streamId={streamId}
      media={media}
      isHost={isHost}
      currentUserId={currentUserId}
      onPlaybackChange={(state) => {
        // Handle playback state changes
        console.log("Playback state:", state);
      }}
    />
  );
}
```

## Real-time Synchronization Flow

1. **Host Action**: Host plays/pauses/seeks video
2. **Broadcast**: Action broadcasts to database via `updatePlaybackState()`
3. **Real-time Update**: Supabase realtime triggers update to all participants
4. **Participant Sync**: Participants receive update and sync their video players
5. **Conflict Resolution**: Host actions always take precedence

## Performance Considerations

- **Sync Tolerance**: Reduces unnecessary network traffic
- **Efficient Queries**: Indexed database queries for fast playback state retrieval
- **Connection Pooling**: Optimized Supabase realtime connections
- **Memory Management**: Proper subscription cleanup on component unmount

## Security

- **Host Validation**: Only hosts can update playback state
- **Input Validation**: All playback state updates are validated
- **Authentication**: Requires valid user authentication
- **Rate Limiting**: Prevents spam of playback state updates

## Troubleshooting

### Common Issues:

1. **Sync Delays**: Check network connection and Supabase realtime status
2. **Permission Errors**: Verify user is host before allowing playback controls
3. **Connection Issues**: Monitor connection status indicators in UI
4. **State Conflicts**: Host actions always override participant state

### Debug Tools:

- Connection status indicators in video player
- Browser console logs for sync events
- Network tab to monitor realtime subscriptions
- Database logs for playback state updates

## Future Enhancements

- **Adaptive Sync**: Adjust sync tolerance based on network conditions
- **Playback History**: Track and replay playback sessions
- **Advanced Controls**: Chapter navigation, playback speed control
- **Mobile Optimization**: Enhanced touch controls and gestures
- **Analytics**: Track sync accuracy and user engagement metrics
