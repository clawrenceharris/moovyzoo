# Streaming Session Navigation - Design Document

## Overview

This design implements a comprehensive navigation system for streaming sessions, enabling users to click on streaming session cards from any context (habitats, home page, streams listing) and navigate to dedicated streaming session pages. The solution provides detailed session information, real-time participation features, permission-based access control (public, private, unlisted), and seamless navigation context preservation while maintaining the existing media integration capabilities.

## Architecture

### High-Level Navigation Flow

1. **User clicks** streaming session card in any context (habitat, home, streams list)
2. **Router navigates** to `/streams/[id]` with streaming session ID
3. **Permission check** validates user access based on session visibility (public, private, unlisted)
4. **Page loads** streaming session details with media information
5. **Real-time updates** sync participation and status changes
6. **User interacts** with join/leave and social features
7. **Context preservation** allows easy return to origin

### URL Structure

```
/streams/[id]                    # Individual streaming session page
/streams                         # Streaming sessions listing page
/habitats/[id]                   # Habitat page (existing, shows streaming session cards)
/                                # Home page (existing, may show streaming session cards)
```

### Component Architecture

```
StreamingSessionPage
├── StreamingSessionHero
│   ├── MediaPoster
│   ├── SessionInfo
│   ├── StatusIndicator
│   └── VisibilityIndicator
├── StreamingSessionActions
│   ├── JoinLeaveButton
│   ├── ShareButton
│   └── BackNavigation
├── ParticipantsList
│   ├── ParticipantCard
│   └── ParticipantCount
└── StreamingChat (future)
    ├── MessageList
    └── MessageInput
```

## Components and Interfaces

### 1. Streaming Session Page Component

**File:** `src/app/(app)/streams/[id]/page.tsx`

```typescript
interface StreamingSessionPageProps {
  params: { id: string };
}

interface StreamingSessionPageData {
  streamingSession: StreamingSessionWithParticipants;
  participants: ParticipantProfile[];
  userParticipation: UserParticipationStatus;
  canJoin: boolean;
  canLeave: boolean;
  hasViewPermission: boolean;
}

interface StreamingSessionVisibility {
  type: "public" | "private" | "unlisted";
  allowedParticipants?: string[]; // For private sessions
}
```

**Features:**

- Server-side rendering for SEO and performance (public sessions only)
- Permission-based access control with visibility settings
- Real-time subscription for live updates
- Error boundary for graceful error handling
- Loading states with skeleton UI
- Meta tags for social sharing (public/unlisted sessions only)

### 2. Enhanced Streaming Session Card Navigation

**File:** `src/components/cards/StreamingSessionCard.tsx` (updated)

```typescript
interface StreamingSessionCardProps {
  // ... existing props
  href?: string; // Optional custom navigation URL
  context?: "habitat" | "home" | "streams"; // Navigation context
  onNavigate?: (sessionId: string, context?: string) => void;
  showVisibility?: boolean; // Show visibility indicator
}
```

**Navigation Enhancements:**

- Automatic href generation: `/streams/${session.id}`
- Context-aware navigation with proper back button behavior
- Prevent navigation on button clicks within card
- Keyboard navigation support (Enter key)
- Analytics tracking for navigation events
- Visibility indicators for private/unlisted sessions

### 3. Streaming Session Hero Component

**File:** `src/features/streams/components/StreamHero.tsx`

```typescript
interface StreamHeroProps {
  stream: StreamWithParticipants;
  showBackButton?: boolean;
  backUrl?: string;
  backLabel?: string;
}
```

**Visual Elements:**

- Large media poster with fallback
- Streaming session title and description
- Live/Upcoming/Ended status badges
- Scheduled time with countdown for upcoming streams
- Media information (title, year, type)
- Participant count with avatars preview

### 4. Streaming Session Actions Component

**File:** `src/features/streams/components/StreamActions.tsx`

```typescript
interface StreamActionsProps {
  stream: StreamWithParticipants;
  userParticipation: UserParticipationStatus;
  onJoin: () => Promise<void>;
  onLeave: () => Promise<void>;
  onShare: () => void;
}

interface UserParticipationStatus {
  isParticipant: boolean;
  canJoin: boolean;
  canLeave: boolean;
  joinedAt?: Date;
}
```

**Action Features:**

- Join/Leave party with optimistic updates
- Share functionality with native Web Share API fallback
- Disabled states for capacity limits or permissions
- Loading states during API calls
- Success/error feedback with toast notifications

### 5. Participants List Component

**File:** `src/features/streams/components/ParticipantsList.tsx`

```typescript
interface ParticipantsListProps {
  participants: ParticipantProfile[];
  maxVisible?: number;
  showAvatars?: boolean;
  layout?: "grid" | "list" | "compact";
}

interface ParticipantProfile {
  id: string;
  username: string;
  avatar_url?: string;
  joined_at: Date;
  is_host?: boolean;
}
```

**Display Features:**

- Responsive grid/list layouts
- Avatar images with fallbacks
- Host indicators and badges
- "Show more" functionality for large lists
- Real-time participant updates

## Data Layer Design

### 1. Streaming Session Queries and Mutations

**File:** `src/hooks/queries/use-watch-party-queries.ts`

```typescript
// Query hooks for streaming session data
export const useStream = (id: string) => {
  return useQuery({
    queryKey: ["stream", id],
    queryFn: () => streamService.getStream(id),
    staleTime: 30000, // 30 seconds
  });
};

export const useStreamParticipants = (id: string) => {
  return useQuery({
    queryKey: ["streamParticipants", id],
    queryFn: () => streamService.getParticipants(id),
    staleTime: 10000, // 10 seconds
  });
};
```

**File:** `src/hooks/mutations/use-watch-party-mutations.ts`

```typescript
// Mutation hooks for streaming session actions
export const useJoinStream = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (streamId: string) => streamService.joinStream(streamId),
    onSuccess: (data, streamId) => {
      // Optimistic updates
      queryClient.invalidateQueries(["stream", streamId]);
      queryClient.invalidateQueries(["streamParticipants", streamId]);
    },
  });
};

export const useLeaveStream = () => {
  // Similar structure for leaving streams
};
```

### 2. Real-time Subscriptions

**File:** `src/hooks/realtime/use-watch-party-realtime.ts`

```typescript
export const useStreamRealtime = (streamId: string) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const subscription = supabase
      .channel(`watch-party-${streamId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "streaming_members",
          filter: `stream_id=eq.${streamId}`,
        },
        (payload) => {
          // Update participant data in real-time
          queryClient.invalidateQueries(["streamParticipants", streamId]);
        }
      )
      .subscribe();

    return () => subscription.unsubscribe();
  }, [streamId, queryClient]);
};
```

### 3. Service Layer Extensions

**File:** `src/features/streams/domain/watch-party.service.ts`

```typescript
export class StreamService {
  async getStream(id: string): Promise<StreamWithParticipants> {
    // Fetch streaming session with media and participation data
  }

  async getParticipants(streamId: string): Promise<ParticipantProfile[]> {
    // Fetch participant list with profile information
  }

  async joinStream(streamId: string): Promise<void> {
    // Add user as participant with validation
  }

  async leaveStream(streamId: string): Promise<void> {
    // Remove user from participants
  }

  async checkUserParticipation(
    streamId: string
  ): Promise<UserParticipationStatus> {
    // Check if user can join/leave and current status
  }
}
```

## Navigation and Routing

### 1. Enhanced Streaming Session Card Navigation

```typescript
// In StreamCard component
const handleCardClick = (e: React.MouseEvent) => {
  // Prevent navigation if clicking on interactive elements
  if ((e.target as HTMLElement).closest('button, a, [role="button"]')) {
    return;
  }

  // Track navigation context for analytics
  if (onNavigate) {
    onNavigate(stream.id, context);
  }

  // Navigate to streaming session page
  router.push(href || `/streams/${stream.id}`);
};
```

### 2. Context-Aware Back Navigation

```typescript
// In StreamPage component
const getBackNavigation = () => {
  const referrer = document.referrer;
  const searchParams = new URLSearchParams(window.location.search);
  const returnUrl = searchParams.get("return");

  if (returnUrl) {
    return { url: returnUrl, label: "Back" };
  }

  if (referrer.includes("/habitats/")) {
    return { url: referrer, label: "Back to Habitat" };
  }

  if (referrer.includes("/streams")) {
    return { url: "/streams", label: "Back to Streaming Sessions" };
  }

  return { url: "/", label: "Back to Home" };
};
```

### 3. URL Parameter Handling

```typescript
// Support for navigation context preservation
const navigateToStream = (streamId: string, returnUrl?: string) => {
  const url = new URL(`/streams/${streamId}`, window.location.origin);

  if (returnUrl) {
    url.searchParams.set("return", returnUrl);
  }

  router.push(url.toString());
};
```

## Error Handling and Edge Cases

### 1. Streaming Session Not Found

```typescript
// In streaming session page
if (!stream) {
  return (
    <ErrorState
      title="Streaming Session Not Found"
      message="This streaming session may have been deleted or you don't have permission to view it."
      action={
        <Button onClick={() => router.push("/streams")}>
          Browse Other Streaming Sessions
        </Button>
      }
    />
  );
}
```

### 2. Permission and Access Control

```typescript
// Check user permissions before showing actions
const canUserJoin = (stream: StreamWithParticipants, user: User) => {
  if (!user) return false;
  if (stream.is_private && !stream.habitat?.members?.includes(user.id)) {
    return false;
  }
  if (stream.participant_count >= stream.max_participants) {
    return false;
  }
  return true;
};
```

### 3. Real-time Connection Handling

```typescript
// Handle connection states
const useConnectionStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return isOnline;
};
```

## SEO and Social Sharing

### 1. Meta Tags Generation

```typescript
// In streaming session page
export async function generateMetadata({ params }: { params: { id: string } }) {
  const stream = await getStream(params.id);

  if (!stream) {
    return {
      title: "Streaming Session Not Found",
    };
  }

  const title = `${stream.media_title || stream.title} - Streaming Session`;
  const description =
    stream.description ||
    `Join the streaming session for ${stream.media_title}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: stream.poster_path
        ? [
            {
              url: getImageUrl(stream.poster_path),
              width: 500,
              height: 750,
              alt: `${stream.media_title} poster`,
            },
          ]
        : [],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: stream.poster_path ? [getImageUrl(stream.poster_path)] : [],
    },
  };
}
```

### 2. Structured Data

```typescript
// JSON-LD structured data for streaming sessions
const generateStructuredData = (stream: StreamWithParticipants) => {
  return {
    "@context": "https://schema.org",
    "@type": "Event",
    name: stream.media_title || stream.title,
    description: stream.description,
    startDate: stream.scheduled_time,
    eventStatus: stream.status === "live" ? "EventScheduled" : "EventPostponed",
    eventAttendanceMode: "OnlineEventAttendanceMode",
    location: {
      "@type": "VirtualLocation",
      url: `${process.env.NEXT_PUBLIC_APP_URL}/streams/${stream.id}`,
    },
    organizer: {
      "@type": "Person",
      name: stream.created_by_username,
    },
  };
};
```

## Performance Considerations

### 1. Page Loading Optimization

- **Server-side rendering** for initial page load and SEO
- **Incremental Static Regeneration** for popular streaming sessions
- **Image optimization** with Next.js Image component
- **Code splitting** for streaming session-specific features

### 2. Real-time Updates Optimization

- **Debounced updates** to prevent excessive re-renders
- **Selective subscriptions** based on user permissions
- **Connection pooling** for multiple real-time features
- **Graceful degradation** when real-time fails

### 3. Caching Strategy

```typescript
// Query cache configuration
const streamQueryConfig = {
  staleTime: 30000, // 30 seconds for streaming session data
  cacheTime: 300000, // 5 minutes in cache
  refetchOnWindowFocus: true,
  refetchOnReconnect: true,
};
```

## Mobile and Responsive Design

### 1. Touch-Friendly Interactions

- **Minimum 44px touch targets** for all interactive elements
- **Swipe gestures** for participant list navigation
- **Pull-to-refresh** for manual data updates
- **Haptic feedback** for join/leave actions (where supported)

### 2. Responsive Layout Breakpoints

```css
/* Mobile-first responsive design */
.watch-party-hero {
  @apply flex flex-col gap-4;
}

@media (min-width: 768px) {
  .watch-party-hero {
    @apply flex-row gap-6;
  }
}

@media (min-width: 1024px) {
  .watch-party-hero {
    @apply gap-8;
  }
}
```

### 3. Progressive Enhancement

- **Core functionality** works without JavaScript
- **Enhanced features** layer on top with JS
- **Offline support** with service worker (future enhancement)
- **Reduced motion** support for accessibility

## Testing Strategy

### 1. Unit Tests

- **Component rendering** with different streaming session states
- **Navigation behavior** with various contexts
- **Real-time update handling** with mocked subscriptions
- **Error state handling** for edge cases

### 2. Integration Tests

- **End-to-end navigation** from card to page
- **Join/leave functionality** with database updates
- **Real-time synchronization** across multiple clients
- **Permission and access control** validation

### 3. Performance Tests

- **Page load times** with different data sizes
- **Real-time update performance** under load
- **Mobile performance** on slower devices
- **Image loading optimization** effectiveness

## Future Enhancements

### Phase 2 Features

- **Streaming session chat** with real-time messaging
- **Synchronized playback** with streaming services
- **Reactions and emojis** during live streams
- **Streaming session recordings** and highlights

### Advanced Features

- **Video calling integration** for face-to-face watching
- **Screen sharing** for host-controlled viewing
- **Stream games and trivia** during watch sessions
- **AI-powered recommendations** for similar streams
