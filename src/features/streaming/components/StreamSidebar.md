# StreamSidebar Component

A unified sidebar component that combines participant list and chat functionality with tabbed navigation.

## Features

- **Tabbed Interface**: Switch between "Participants" and "Chat" views
- **Active Participant Tracking**: Shows only users currently viewing the stream page using Supabase Presence
- **Real-time Chat**: Live messaging with message count badges
- **Participant Count Badges**: Shows number of active participants and total messages
- **Responsive Design**: Optimized for different screen sizes
- **Accessibility**: Full ARIA support with proper tab navigation

## Usage

```tsx
import { StreamSidebar } from "@/features/streaming/components";

<StreamSidebar
  streamId="stream-123"
  participants={participants}
  currentUserId="user-456"
  isHost={true}
  className="h-full"
/>;
```

## Props

| Prop                | Type                   | Required | Description                                     |
| ------------------- | ---------------------- | -------- | ----------------------------------------------- |
| `streamId`          | `string`               | Yes      | ID of the stream for presence tracking and chat |
| `participants`      | `StreamParticipant[]`  | Yes      | Array of all stream participants                |
| `currentUserId`     | `string`               | Yes      | ID of the current user                          |
| `isHost`            | `boolean`              | Yes      | Whether the current user is the stream host     |
| `onKickParticipant` | `(id: string) => void` | No       | Callback for kicking participants (host only)   |
| `className`         | `string`               | No       | Additional CSS classes                          |

## Tabs

### Participants Tab

- Shows floating avatar animations for active participants only
- Displays participant count badge
- Uses presence system to track who's currently viewing the stream
- Shows host indicators with crown icons

### Chat Tab

- Real-time messaging functionality
- Message count badge when there are unread messages
- Auto-scroll to new messages
- Message validation and error handling

## Dependencies

- `@/features/streaming/components/ParticipantsList` - For participant display
- `@/features/streaming/components/StreamChat` - For chat functionality
- `@/features/streaming/hooks/use-stream-chat` - For chat data and mutations
- `@/features/streaming/hooks/use-stream-presence` - For active participant tracking

## Testing

The component includes comprehensive tests covering:

- Tab switching functionality
- Participant and message count badges
- Empty states
- Chat message display
- Accessibility features

Run tests with:

```bash
npm run test src/features/streaming/components/__tests__/StreamSidebar.test.tsx
```
