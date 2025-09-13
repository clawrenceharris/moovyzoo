# Playback Synchronization Migration - Enhanced Sync State

This migration adds comprehensive real-time playback synchronization functionality with enhanced sync state management, event logging, and automatic cleanup procedures.

## Overview

The enhanced playback synchronization system enables synchronized video playback across multiple participants in a streaming session with advanced features including:

- Event logging and recovery capabilities
- Network lag compensation with configurable tolerance
- Automatic cleanup of old sync data
- Comprehensive indexing for optimal performance
- Robust error handling and state recovery

## Database Changes

### Enhanced `streams` table columns:

- `time` (INTEGER): Current playback position in seconds
- `is_playing` (BOOLEAN): Whether the stream is currently playing
- `last_sync_at` (TIMESTAMP): Timestamp of last playback state sync
- `video_url` (TEXT): URL to the actual video content for playback
- `sync_enabled` (BOOLEAN): Whether synchronization is enabled for this stream
- `sync_tolerance` (INTEGER): Sync tolerance in milliseconds for lag compensation

### New `playback_events` table:

- `id` (UUID): Primary key
- `stream_id` (UUID): Reference to streams table
- `host_user_id` (UUID): User who triggered the event
- `event_type` (TEXT): Type of playback event (play, pause, seek, sync_request, buffer_start, buffer_end)
- `event_id` (TEXT): Unique identifier for event deduplication
- `timestamp_ms` (BIGINT): Unix timestamp in milliseconds when event occurred
- `time` (INTEGER): Video position in seconds at time of event
- `metadata` (JSONB): Additional event data (seek positions, buffer reasons, etc.)
- `created_at` (TIMESTAMP): Record creation timestamp

### New Indexes for Performance:

- `idx_streams_playback_sync`: Optimizes playback state queries for active streams
- `idx_streams_sync_enabled`: Optimizes queries for sync-enabled active streams
- `idx_playback_events_stream_timestamp`: Efficient event queries by stream and time
- `idx_playback_events_event_id`: Fast event deduplication lookups
- `idx_playback_events_cleanup`: Optimizes cleanup operations
- `idx_playback_events_stream_type`: Efficient queries by stream and event type

### Cleanup Functions:

- `cleanup_old_playback_events()`: Removes events older than 7 days
- `cleanup_inactive_stream_sync_state()`: Resets sync state for inactive streams
- `maintain_playback_sync_data()`: Comprehensive maintenance function

## Implementation Components

### 1. Enhanced Playback Sync Hook (`use-playback-sync.ts`)

- Manages real-time playback state synchronization with YouTube Player API
- Handles Supabase realtime subscriptions for event broadcasting
- Implements configurable sync tolerance to prevent micro-adjustments
- Provides connection status monitoring and quality assessment
- Integrates with lag compensation engine for network delay handling

### 2. Event Logging and Recovery System

- **Event Storage**: All playback events stored in `playback_events` table
- **Deduplication**: Unique event IDs prevent duplicate event processing
- **Recovery**: Event history enables state recovery after connection issues
- **Metadata**: Rich event metadata for debugging and analytics

### 3. Automatic Cleanup Procedures

- **Old Events**: Automatic removal of events older than 7 days
- **Inactive Streams**: Reset sync state for streams inactive > 24 hours
- **Maintenance**: Scheduled cleanup functions prevent database bloat
- **Logging**: Cleanup operations logged for monitoring

### 4. Enhanced StreamVideoPlayer Component

- Integrates with enhanced sync system and YouTube Player API
- Host-only controls with event broadcasting to all participants
- Participant view-only mode with automatic sync and lag compensation
- Connection status indicators and manual resync controls
- Network resilience with automatic reconnection and state recovery

### 5. Repository Layer Updates

- `updatePlaybackState()`: Updates playback state with event logging
- `getPlaybackState()`: Retrieves current playback state with caching
- `logPlaybackEvent()`: Records events for recovery and analytics
- `getPlaybackEvents()`: Retrieves event history for debugging
- Proper error handling, validation, and performance optimization

### 6. Service Layer Updates

- `updatePlaybackState()`: Business logic with host validation and event logging
- `getPlaybackState()`: Service-level playback state retrieval with caching
- `subscribeToPlaybackChanges()`: Enhanced real-time subscription management
- `processPlaybackEvent()`: Event processing with deduplication and validation

## Key Features

### Enhanced Sync Tolerance and Lag Compensation

- Configurable sync tolerance (default 500ms) stored per stream
- Network delay measurement and adaptive tolerance adjustment
- Prevents constant micro-adjustments while maintaining sync accuracy
- Reduces network traffic and improves user experience

### Event Logging and Recovery

- Complete event history stored in `playback_events` table
- Event deduplication prevents duplicate processing
- State recovery capabilities for connection interruptions
- Rich metadata for debugging and analytics

### Host-Only Controls with Event Broadcasting

- Only hosts can play, pause, or seek with full event logging
- Participants see "View Only" indicator with sync status
- Host actions broadcast to all participants via real-time events
- Event validation and rate limiting prevent spam

### Advanced Connection Management

- Visual connection status indicators with quality metrics
- Automatic reconnection with state recovery from event history
- Graceful handling of connection failures with fallback strategies
- Manual resync controls for participants

### Network Resilience and Performance

- Handles network interruptions with automatic recovery
- Event queue management for offline/online transitions
- Conflict resolution with host authority and event ordering
- Optimized database queries with comprehensive indexing

### Automatic Data Management

- Cleanup functions prevent database bloat from old events
- Automatic reset of sync state for inactive streams
- Scheduled maintenance procedures with logging
- Performance monitoring and optimization

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
      syncEnabled={true} // Enable synchronization
      onPlaybackChange={(state) => {
        // Handle playback state changes with enhanced sync data
        console.log("Playback state:", state);
        console.log("Sync status:", state.syncStatus);
        console.log("Last sync:", state.lastSyncAt);
      }}
      onSyncStatusChange={(status) => {
        // Handle sync status changes
        console.log("Connection:", status.connected);
        console.log("Syncing:", status.syncing);
        console.log("Error:", status.error);
      }}
    />
  );
}

// Manual cleanup example (typically run as scheduled job)
async function runMaintenanceCleanup() {
  const result = await supabase.rpc("maintain_playback_sync_data");
  console.log(
    `Cleaned up ${result.events_deleted} events and reset ${result.streams_reset} streams`
  );
}
```

## Enhanced Real-time Synchronization Flow

1. **Host Action**: Host plays/pauses/seeks video with YouTube Player API
2. **Event Creation**: Unique event created with deduplication ID and metadata
3. **Event Logging**: Event stored in `playback_events` table with full context
4. **State Update**: Stream playback state updated in `streams` table
5. **Real-time Broadcast**: Supabase realtime triggers event to all participants
6. **Event Processing**: Participants receive and validate events for deduplication
7. **Lag Compensation**: Network delay calculated and sync tolerance applied
8. **Participant Sync**: YouTube players sync with lag-compensated timing
9. **Conflict Resolution**: Host events take precedence with timestamp ordering
10. **Recovery**: Event history enables state recovery after connection issues

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
