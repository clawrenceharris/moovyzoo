# Habitat Hooks

This directory contains React hooks for managing habitat functionality in the Zoovie application.

## Hooks Overview

### `useUserHabitats`

Manages the user's joined habitats with loading states and error handling.

**Features:**

- Fetches user's joined habitats on mount
- Join/leave habitat functionality with automatic refresh
- Loading states and error handling
- Manual refresh capability

**Usage:**

```tsx
import { useUserHabitats } from "@/features/habitats/hooks";

function HabitatsList({ userId }: { userId: string }) {
  const { habitats, loading, error, joinHabitat, leaveHabitat } =
    useUserHabitats(userId);

  if (loading) return <div>Loading habitats...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {habitats.map((habitat) => (
        <div key={habitat.id}>
          <h3>{habitat.name}</h3>
          <p>{habitat.description}</p>
          <button onClick={() => leaveHabitat(habitat.id)}>
            Leave Habitat
          </button>
        </div>
      ))}
    </div>
  );
}
```

### `useHabitatMessages`

Manages chat messages for a specific habitat with pagination and real-time updates.

**Features:**

- Loads messages with pagination
- Send/delete message functionality
- Real-time message management (add/update/remove)
- Loading states for different operations
- Auto-refresh option

**Usage:**

```tsx
import { useHabitatMessages } from "@/features/habitats/hooks";

function ChatInterface({
  habitatId,
  userId,
}: {
  habitatId: string;
  userId: string;
}) {
  const { messages, loading, sending, sendMessage, loadMore, hasMore } =
    useHabitatMessages(habitatId, userId);

  const handleSendMessage = async (content: string) => {
    try {
      await sendMessage(content);
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  if (loading) return <div>Loading messages...</div>;

  return (
    <div>
      <div className="messages">
        {messages.map((message) => (
          <div key={message.id}>
            <strong>{message.user_profile.display_name}:</strong>
            <span>{message.content}</span>
          </div>
        ))}
      </div>
      {hasMore && <button onClick={loadMore}>Load More Messages</button>}
      <MessageInput onSend={handleSendMessage} disabled={sending} />
    </div>
  );
}
```

### `useRealtimeChat`

Manages real-time chat connections using Supabase realtime functionality.

**Features:**

- Automatic connection management
- Real-time message event handling
- Connection status monitoring
- Auto-reconnection with configurable attempts
- Error handling and recovery

**Usage:**

```tsx
import { useRealtimeChat, useHabitatMessages } from "@/features/habitats/hooks";

function RealtimeChatRoom({
  habitatId,
  userId,
}: {
  habitatId: string;
  userId: string;
}) {
  const messagesHook = useHabitatMessages(habitatId, userId);

  const { connected, connecting, error } = useRealtimeChat(habitatId, userId, {
    onMessageInsert: messagesHook.addMessage,
    onMessageUpdate: messagesHook.updateMessage,
    onMessageDelete: messagesHook.removeMessage,
  });

  return (
    <div>
      <div className="connection-status">
        {connecting && <span>Connecting...</span>}
        {connected && <span>🟢 Connected</span>}
        {error && <span>🔴 {error}</span>}
      </div>

      <ChatInterface
        messages={messagesHook.messages}
        onSendMessage={messagesHook.sendMessage}
        loading={messagesHook.loading}
      />
    </div>
  );
}
```

## Integration Example

Here's how to use all three hooks together for a complete habitat chat experience:

```tsx
import {
  useUserHabitats,
  useHabitatMessages,
  useRealtimeChat,
} from "@/features/habitats/hooks";

function HabitatChatApp({ userId }: { userId: string }) {
  const [selectedHabitatId, setSelectedHabitatId] = useState<string | null>(
    null
  );

  // Get user's habitats
  const { habitats, loading: habitatsLoading } = useUserHabitats(userId);

  // Get messages for selected habitat
  const messagesHook = useHabitatMessages(selectedHabitatId, userId);

  // Set up real-time chat
  const { connected, error: realtimeError } = useRealtimeChat(
    selectedHabitatId,
    userId,
    {
      onMessageInsert: messagesHook.addMessage,
      onMessageUpdate: messagesHook.updateMessage,
      onMessageDelete: messagesHook.removeMessage,
    }
  );

  if (habitatsLoading) return <div>Loading...</div>;

  return (
    <div className="habitat-chat-app">
      <aside className="habitat-list">
        <h2>Your Habitats</h2>
        {habitats.map((habitat) => (
          <button
            key={habitat.id}
            onClick={() => setSelectedHabitatId(habitat.id)}
            className={selectedHabitatId === habitat.id ? "active" : ""}
          >
            {habitat.name}
          </button>
        ))}
      </aside>

      <main className="chat-area">
        {selectedHabitatId ? (
          <>
            <header>
              <h2>{habitats.find((h) => h.id === selectedHabitatId)?.name}</h2>
              <div className="status">
                {connected ? "🟢 Live" : "🔴 Offline"}
              </div>
            </header>

            <ChatInterface {...messagesHook} />
          </>
        ) : (
          <div>Select a habitat to start chatting</div>
        )}
      </main>
    </div>
  );
}
```

## Error Handling

All hooks use the centralized error handling system:

- Errors are normalized using `normalizeError()` from `@/utils/normalize-error`
- User-friendly messages are retrieved from `errorMap` in `@/utils/error-map`
- Each hook provides a `clearError()` function to reset error state
- Hooks handle both network errors and business logic errors

## Testing

Unit tests are provided for each hook in the `__tests__` directory:

- `useUserHabitats.test.ts` - Tests habitat fetching, joining, and leaving
- `useHabitatMessages.test.ts` - Tests message loading, sending, and pagination
- `useRealtimeChat.test.ts` - Tests real-time connection and event handling

To run tests (when testing framework is set up):

```bash
npm test src/features/habitats/hooks/__tests__
```

## Performance Considerations

- **useUserHabitats**: Caches habitats and only refetches when explicitly requested
- **useHabitatMessages**: Uses pagination to avoid loading too many messages at once
- **useRealtimeChat**: Automatically manages connections and cleans up on unmount

## Dependencies

- React hooks (useState, useEffect, useCallback, useRef)
- Supabase client for real-time functionality
- Habitat service layer for business logic
- Error handling utilities for consistent error management
