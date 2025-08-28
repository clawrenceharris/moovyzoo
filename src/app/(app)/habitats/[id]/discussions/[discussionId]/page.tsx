"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { ChatInterface } from "@/features/habitats/components";
import { useUser } from "@/hooks/useUser";
import { useHabitatMessages } from "@/features/habitats/hooks/useHabitatMessages";
import { useRealtimeChat } from "@/features/habitats/hooks/useRealtimeChat";
import { habitatsService } from "@/features/habitats/domain/habitats.service";
import { normalizeError } from "@/utils/normalize-error";

export default function DiscussionRoomPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useUser();

  // Extract IDs from params
  const habitatId = params.id as string;
  const discussionId = params.discussionId as string;

  // Validate UUID format
  const isValidUUID = (id: string): boolean => {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(id);
  };

  // State for habitat access validation
  const [accessState, setAccessState] = React.useState<{
    loading: boolean;
    error: string | null;
    hasAccess: boolean;
  }>({
    loading: true,
    error: null,
    hasAccess: false,
  });

  // TODO: Replace with discussion-specific messaging when task 6 is implemented
  // For now, using habitat-level messaging as a temporary solution
  const {
    messages,
    loading,
    loadingMore,
    sending,
    error: messagesError,
    hasMore,
    sendMessage,
    loadMore,
    clearError,
  } = useHabitatMessages(
    accessState.hasAccess ? habitatId : null,
    user?.id || null
  );

  // TODO: Replace with discussion-specific real-time chat when task 6 is implemented
  // For now, using habitat-level real-time chat
  useRealtimeChat(accessState.hasAccess ? habitatId : null, user?.id || null, {
    onMessageInsert: (message) => {
      // This will be handled by the useHabitatMessages hook
    },
    onMessageUpdate: (message) => {
      // This will be handled by the useHabitatMessages hook
    },
    onMessageDelete: (messageId) => {
      // This will be handled by the useHabitatMessages hook
    },
  });

  // Validate access to habitat and discussion
  React.useEffect(() => {
    const validateAccess = async () => {
      if (!user || !habitatId || !discussionId) return;

      try {
        // Check if user can access the habitat
        const canAccess = await habitatsService.canUserAccessHabitat(
          habitatId,
          user.id
        );

        if (!canAccess) {
          setAccessState({
            loading: false,
            error: "You don't have access to this habitat",
            hasAccess: false,
          });
          return;
        }

        // TODO: Add discussion-specific access validation when discussion service is implemented
        // For now, if user has habitat access, they can access discussions

        setAccessState({
          loading: false,
          error: null,
          hasAccess: true,
        });
      } catch (error) {
        const normalizedError = normalizeError(error);
        setAccessState({
          loading: false,
          error: normalizedError.message,
          hasAccess: false,
        });
      }
    };

    validateAccess();
  }, [user, habitatId, discussionId]);

  // Show loading state while user is being fetched
  if (!user) {
    return (
      <div className="flex flex-col h-screen bg-background">
        <div className="border-b border-border bg-card/50 p-4">
          <div className="flex items-center gap-4 animate-pulse">
            <div className="w-12 h-12 rounded-lg bg-muted"></div>
            <div className="flex-1">
              <div className="h-6 bg-muted rounded w-48 mb-2"></div>
              <div className="h-4 bg-muted rounded w-32"></div>
            </div>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="flex items-center gap-2 text-muted-foreground">
            <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
            <span>Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  // Handle invalid IDs
  if (
    !habitatId ||
    !discussionId ||
    !isValidUUID(habitatId) ||
    !isValidUUID(discussionId)
  ) {
    return (
      <div className="flex flex-col h-screen bg-background items-center justify-center p-8 text-center">
        <div className="w-16 h-16 mb-4 rounded-full bg-destructive/10 flex items-center justify-center">
          <svg
            className="w-8 h-8 text-destructive"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>

        <h1 className="text-xl font-semibold text-foreground mb-2">
          Invalid Discussion Room
        </h1>
        <p className="text-sm text-muted-foreground mb-6 max-w-md">
          The discussion room you&apos;re looking for doesn&apos;t exist or the
          link is invalid.
        </p>

        <button
          onClick={() => router.push("/habitats")}
          className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          Back to Habitats
        </button>
      </div>
    );
  }

  // Show loading state while validating access
  if (accessState.loading) {
    return (
      <div className="flex flex-col h-screen bg-background">
        <div className="border-b border-border bg-card/50 p-4">
          <div className="flex items-center gap-4 animate-pulse">
            <div className="w-12 h-12 rounded-lg bg-muted"></div>
            <div className="flex-1">
              <div className="h-6 bg-muted rounded w-48 mb-2"></div>
              <div className="h-4 bg-muted rounded w-32"></div>
            </div>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="flex items-center gap-2 text-muted-foreground">
            <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
            <span>Validating access...</span>
          </div>
        </div>
      </div>
    );
  }

  // Show error state if access validation failed
  if (accessState.error || !accessState.hasAccess) {
    return (
      <div className="flex flex-col h-screen bg-background items-center justify-center p-8 text-center">
        <div className="w-16 h-16 mb-4 rounded-full bg-destructive/10 flex items-center justify-center">
          <svg
            className="w-8 h-8 text-destructive"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L5.636 5.636"
            />
          </svg>
        </div>

        <h1 className="text-xl font-semibold text-foreground mb-2">
          Access Denied
        </h1>
        <p className="text-sm text-muted-foreground mb-6 max-w-md">
          {accessState.error ||
            "You don't have access to this discussion room."}
        </p>

        <div className="flex gap-3">
          <button
            onClick={() => router.push("/habitats")}
            className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground border border-border rounded-lg hover:bg-muted/50 transition-colors"
          >
            Back to Habitats
          </button>
          <button
            onClick={() => router.push(`/habitats/${habitatId}`)}
            className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Back to Habitat
          </button>
        </div>
      </div>
    );
  }

  // Render discussion room with chat interface
  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Breadcrumb Navigation */}
      <div className="border-b border-border bg-card/30 px-6 py-3">
        <nav className="flex items-center gap-2 text-sm">
          <button
            onClick={() => router.push("/habitats")}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Habitats
          </button>
          <svg
            className="w-4 h-4 text-muted-foreground"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 5l7 7-7 7"
            />
          </svg>
          <button
            onClick={() => router.push(`/habitats/${habitatId}`)}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Habitat Dashboard
          </button>
          <svg
            className="w-4 h-4 text-muted-foreground"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 5l7 7-7 7"
            />
          </svg>
          <span className="text-foreground font-medium">Discussion Room</span>
        </nav>
      </div>

      {/* Discussion Room Header */}
      <div className="border-b border-border bg-card/20 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-foreground">
              Discussion Room
            </h1>
            <p className="text-sm text-muted-foreground">
              {/* TODO: Display actual discussion name when discussion service is implemented */}
              Chat with other habitat members
            </p>
          </div>
          <div className="text-xs text-muted-foreground">
            {/* TODO: Show discussion-specific participant count when implemented */}
            Discussion ID: {discussionId.slice(0, 8)}...
          </div>
        </div>
      </div>

      {/* Chat Interface */}
      <div className="flex-1 overflow-hidden">
        <ChatInterface
          messages={messages}
          currentUserId={user.id}
          loading={loading}
          sending={sending}
          error={messagesError}
          onSendMessage={sendMessage}
          onLoadMore={loadMore}
          hasMore={hasMore}
          loadingMore={loadingMore}
          className="h-full"
        />
      </div>
    </div>
  );
}
