# Habitats Components

## ChatInterface

A real-time chat interface component for habitat rooms.

### Features

- **Real-time message display** with user profiles and timestamps
- **Message input** with send functionality and keyboard shortcuts
- **Auto-scrolling** to new messages with manual scroll detection
- **Message pagination** with load more functionality
- **Loading states** for initial load and pagination
- **Error handling** with user-friendly error display
- **Responsive design** with mobile-friendly interface
- **Character limit** with visual feedback (1000 characters)

### Props

```typescript
interface ChatInterfaceProps {
  messages: MessageWithProfile[];
  currentUserId: string;
  loading?: boolean;
  sending?: boolean;
  error?: string | null;
  onSendMessage: (content: string) => Promise<void>;
  onLoadMore?: () => void;
  hasMore?: boolean;
  loadingMore?: boolean;
  className?: string;
}
```

### Usage

```tsx
import { ChatInterface } from "@/features/habitats/components";
import { useHabitatMessages, useRealtimeChat } from "@/features/habitats/hooks";

function DiscussionRoom({ habitatId, discussionId, userId }) {
  const {
    messages,
    loading,
    sending,
    error,
    sendMessage,
    loadMore,
    hasMore,
    loadingMore,
    addMessage,
    updateMessage,
    removeMessage,
  } = useHabitatMessages(habitatId, userId);

  useRealtimeChat(habitatId, userId, {
    onMessageInsert: addMessage,
    onMessageUpdate: updateMessage,
    onMessageDelete: removeMessage,
  });

  return (
    <ChatInterface
      messages={messages}
      currentUserId={userId}
      loading={loading}
      sending={sending}
      error={error}
      onSendMessage={sendMessage}
      onLoadMore={hasMore ? loadMore : undefined}
      hasMore={hasMore}
      loadingMore={loadingMore}
    />
  );
}
```

### Design Features

- **Dark-first design** following the Zoovie visual design system
- **Cinematic styling** with Netflix-inspired dark backgrounds
- **Accent colors** for interactive elements (primary red, accent cyan)
- **Smooth animations** for loading states and interactions
- **Glassmorphism effects** for modern visual appeal
- **Responsive layout** that works on mobile and desktop

### Keyboard Shortcuts

- **Enter**: Send message
- **Shift + Enter**: New line in message
- **Scroll to top**: Load more messages (when available)

### Accessibility

- **Semantic HTML** with proper ARIA labels
- **Keyboard navigation** support
- **Screen reader friendly** with descriptive text
- **High contrast** text for readability
- **Focus indicators** for interactive elements

## ChatExample

A complete example component showing how to integrate ChatInterface with the habitat hooks.

### Usage

```tsx
import { ChatExample } from "@/features/habitats/components";

function DiscussionRoomPage({ params }) {
  const { habitatId, discussionId } = params;
  const { user } = useAuth();

  return (
    <div className="h-screen">
      <ChatExample habitatId={habitatId} userId={user.id} />
    </div>
  );
}
```

This example includes:

- Real-time connection status indicator
- Complete integration with useHabitatMessages and useRealtimeChat hooks
- Error handling and loading states
- Responsive layout with proper height management
