# SyncEventManager

The `SyncEventManager` is a service responsible for managing real-time playback synchronization events in streaming sessions. It handles event broadcasting, deduplication, rate limiting, and chronological ordering to ensure consistent playback state across all participants.

## Features

### Event Broadcasting

- Broadcasts playback events (play, pause, seek) to all participants via Supabase
- Handles database insertion with error recovery
- Automatic event deduplication to prevent duplicate processing

### Rate Limiting

- Prevents event spam from rapid user actions
- Configurable rate limit (default: 5 events per second)
- Automatic rate limit window management with cleanup

### Event Deduplication

- Tracks processed events using unique event IDs
- Prevents duplicate event processing across different methods
- Memory-efficient tracking with cleanup on destroy

### Chronological Ordering

- Batch processing for events that need chronological ordering
- Sorts events by timestamp before processing
- Ensures consistent state across all participants

### Connection Management

- Event queuing during connection interruptions
- Batch processing of queued events on reconnection
- Graceful handling of database errors

## Usage

### Basic Setup

```typescript
import { SyncEventManager } from "@/features/streaming/services";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(url, key);
const syncManager = new SyncEventManager("stream-id", supabase);

// Listen for incoming events
syncManager.onEvent((event) => {
  console.log("Received sync event:", event);
  // Apply sync event to video player
});
```

### Broadcasting Events

```typescript
const playEvent: PlaybackEvent = {
  type: "play",
  timestamp: Date.now(),
  currentTime: 120,
  hostUserId: "host-123",
  eventId: "unique-event-id",
  metadata: {},
};

const success = await syncManager.broadcastEvent(playEvent);
if (!success) {
  console.log("Failed to broadcast event - rate limited or database error");
}
```

### Handling Connection Interruptions

```typescript
// Queue events when offline
syncManager.queueEvent(playEvent);
syncManager.queueEvent(pauseEvent);

// Process queued events when connection is restored
await syncManager.processEventQueue();
```

### Batch Processing for Chronological Ordering

```typescript
// Add events to batch (useful for events arriving out of order)
syncManager.addEventToBatch(event1);
syncManager.addEventToBatch(event2);
syncManager.addEventToBatch(event3);

// Process all events in chronological order
await syncManager.processBatch();
```

### Rate Limiting

```typescript
// Check if event can be broadcast
if (syncManager.canBroadcastEvent()) {
  await syncManager.broadcastEvent(event);
} else {
  console.log(
    `Rate limited. ${syncManager.getRemainingRateLimit()} events remaining`
  );
}
```

### Cleanup

```typescript
// Always call destroy when done to prevent memory leaks
syncManager.destroy();
```

## Event Types

The service handles the following playback event types:

- `play` - Video playback started
- `pause` - Video playback paused
- `seek` - Video position changed
- `sync_request` - Manual sync requested by participant
- `buffer_start` - Video buffering started
- `buffer_end` - Video buffering ended

## Database Schema

The service expects a `playback_events` table with the following structure:

```sql
CREATE TABLE playback_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stream_id UUID NOT NULL REFERENCES streams(id) ON DELETE CASCADE,
  host_user_id UUID NOT NULL REFERENCES auth.users(id),
  event_type TEXT NOT NULL CHECK (event_type IN ('play', 'pause', 'seek', 'sync_request', 'buffer_start', 'buffer_end')),
  event_id TEXT NOT NULL UNIQUE,
  timestamp_ms BIGINT NOT NULL,
  current_time INTEGER NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW()
);
```

## Configuration

### Rate Limiting

- Default: 5 events per second
- Configurable via constructor or class property
- Automatic cleanup of old rate limit windows

### Memory Management

- Automatic cleanup of processed event IDs on destroy
- Event queue and buffer management
- No memory leaks with proper cleanup

## Error Handling

The service handles various error scenarios:

1. **Database Errors**: Events are marked as processed even if database insertion fails
2. **Rate Limiting**: Events are rejected when rate limit is exceeded
3. **Connection Issues**: Events can be queued and processed later
4. **Duplicate Events**: Automatic deduplication prevents duplicate processing

## Integration with Playback Sync

The `SyncEventManager` is designed to work with the `use-playback-sync` hook:

```typescript
// In use-playback-sync.ts
const syncManager = new SyncEventManager(streamId, supabase);

// Host broadcasts events
const broadcastPlaybackEvent = async (event: PlaybackEvent) => {
  const success = await syncManager.broadcastEvent(event);
  if (!success) {
    // Handle broadcast failure
  }
};

// Participants receive events
syncManager.onEvent((event) => {
  // Apply sync event to YouTube player
  applyPlaybackEvent(event);
});
```

## Testing

The service includes comprehensive test coverage:

- Unit tests for all core functionality
- Integration tests for real-world scenarios
- Performance tests for memory management
- Error handling tests for edge cases

Run tests with:

```bash
npm run test src/features/streaming/services/__tests__/sync-event-manager.test.ts
npm run test src/features/streaming/services/__tests__/sync-event-manager.integration.test.ts
```

## Performance Considerations

- Event deduplication uses Set for O(1) lookup
- Rate limiting uses Map with automatic cleanup
- Batch processing sorts events only when needed
- Memory usage is bounded by proper cleanup

## Requirements Satisfied

This implementation satisfies the following requirements from the playback synchronization spec:

- **4.1**: Real-time event broadcasting using Supabase
- **4.2**: Event type, timestamp, and position data inclusion
- **4.3**: Stream-specific channel subscriptions
- **4.4**: Database-triggered real-time notifications
- **4.5**: Automatic reconnection and resync
- **4.6**: Current state requests for reconnection
- **4.7**: Chronological event ordering
