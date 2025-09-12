# Streaming Feature - Participant Management

## Overview

The streaming feature now includes comprehensive participant management functionality that allows users to join/leave streams, manage reminder settings, and provides real-time updates for all participants.

## Key Features

### Enhanced Participant Management

- **Join/Leave Streams**: Users can join and leave streaming sessions with proper validation
- **Host Assignment**: First participant automatically becomes host with control permissions
- **Reminder Settings**: Participants can toggle reminder notifications for streams
- **Real-time Updates**: All participant changes are broadcast in real-time to connected users

### Database Schema

The participant management uses the `stream_participants` table with the following structure:

```sql
CREATE TABLE stream_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stream_id UUID NOT NULL REFERENCES habitat_watch_parties(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_host BOOLEAN DEFAULT false,
  reminder_enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_stream_participant UNIQUE(stream_id, user_id)
);
```

### Service Layer Methods

#### Core Participant Operations

- `joinStreamEnhanced(data: ParticipantJoinData)`: Join a stream with enhanced features
- `leaveStreamEnhanced(streamId: string, userId: string)`: Leave a stream
- `toggleReminder(streamId: string, userId: string, enabled: boolean)`: Toggle reminder settings

#### Participant Queries

- `getParticipantByUserId(streamId: string, userId: string)`: Get specific participant
- `getParticipantsEnhanced(streamId: string)`: Get all participants with profile info
- `isUserHost(streamId: string, userId: string)`: Check if user is host

#### Host Management

- `transferHost(streamId: string, currentHostId: string, newHostId: string)`: Transfer host privileges

#### Real-time Features

- `subscribeToParticipantChanges(streamId: string, callback: Function)`: Subscribe to participant updates

### Repository Layer Methods

#### Participant CRUD Operations

- `createParticipant(participantData)`: Create new participant record with profile data
- `getParticipantById(participantId: string)`: Get participant by ID with profile information
- `updateParticipantReminder(streamId: string, userId: string, enabled: boolean)`: Update reminder preferences
- `deleteParticipant(streamId: string, userId: string)`: Remove participant from stream

#### Participant Queries

- `getParticipantCount(streamId: string)`: Get total participant count for stream
- `getStreamHost(streamId: string)`: Get current host participant with profile data
- `getParticipantsWithProfiles(streamId: string)`: Get all participants with profile information

#### Host Management

- `updateParticipantHostStatus(streamId: string, userId: string, isHost: boolean)`: Update host status

## Usage Examples

### Joining a Stream

```typescript
import { streamService } from "@/features/streaming/domain/stream.service";

const joinData = {
  streamId: "stream-uuid",
  userId: "user-uuid",
  reminderEnabled: true,
};

try {
  const participant = await streamService.joinStreamEnhanced(joinData);
  console.log("Joined as:", participant.is_host ? "Host" : "Participant");
} catch (error) {
  console.error("Failed to join stream:", error);
}
```

### Real-time Participant Updates

```typescript
const unsubscribe = streamService.subscribeToParticipantChanges(
  streamId,
  (payload) => {
    switch (payload.eventType) {
      case "INSERT":
        console.log("User joined:", payload.new);
        break;
      case "DELETE":
        console.log("User left:", payload.old);
        break;
      case "UPDATE":
        console.log("Participant updated:", payload.new);
        break;
    }
  }
);

// Cleanup when component unmounts
return () => unsubscribe();
```

### Host Management

```typescript
// Check if user is host
const isHost = await streamService.isUserHost(streamId, userId);

// Transfer host privileges
if (isHost) {
  await streamService.transferHost(streamId, currentUserId, newHostUserId);
}
```

## Error Handling

The service uses normalized error codes for consistent error handling:

- `ALREADY_PARTICIPANT`: User is already a participant
- `NOT_PARTICIPANT`: User is not a participant
- `WATCH_PARTY_NOT_FOUND`: Stream does not exist
- `WATCH_PARTY_FULL`: Stream has reached maximum participants
- `INSUFFICIENT_PERMISSIONS`: User lacks required permissions

## Database Triggers

The system includes several database triggers for automatic management:

1. **Participant Count Updates**: Automatically updates participant count when users join/leave
2. **Host Assignment**: First participant automatically becomes host
3. **Host Reassignment**: When host leaves, privileges transfer to next oldest participant

## Security

- **Row Level Security (RLS)**: Enabled on `stream_participants` table
- **Access Control**: Users can only join streams they have access to
- **Input Validation**: All inputs are validated and sanitized
- **Rate Limiting**: Prevents spam join/leave actions

## Testing

The participant management functionality includes comprehensive tests:

- **Unit Tests**: Test individual service methods
- **Integration Tests**: Test database schema compatibility
- **Error Handling Tests**: Validate error scenarios
- **Real-time Tests**: Test subscription functionality

Run tests with:

```bash
npm run test src/features/streaming
```

## Migration

To enable participant management, run the database migration:

```sql
-- Run the stream-participants-migration.sql script
-- This creates the necessary tables, indexes, and triggers
```

## Future Enhancements

- **Participant Roles**: Additional roles beyond host/participant
- **Kick Functionality**: Allow hosts to remove participants
- **Invitation System**: Send invitations to specific users
- **Participant Limits**: Per-user limits on concurrent streams
