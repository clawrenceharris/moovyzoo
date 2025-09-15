"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { ChatInterface } from "@/features/habitats/components";

import type {
  Discussion,
  HabitatWithMembership,
} from "@/features/habitats/domain/habitats.types";
import { habitatsService } from "@/features/habitats/domain/habitats.service";
import { normalizeError } from "@/utils/normalize-error";
import { useUser } from "@/hooks/use-user";
import { useDiscussionMessages } from "@/features/habitats/hooks/use-discussion-messages";
import { useDiscussionRealtimeChat } from "@/features/habitats/hooks/use-discussion-realtime-chat";

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

  // State for habitat _deni validation
  const [accessState, setAccessState] = React.useState<{
    loading: boolean;
    error: string | null;
    hasAccess: boolean;
  }>({
    loading: true,
    error: null,
    hasAccess: false,
  });

  // State for discussion and habitat data
  const [discussionData, setDiscussionData] = React.useState<{
    discussion: Discussion | null;
    habitat: HabitatWithMembership | null;
    loading: boolean;
    error: string | null;
  }>({
    discussion: null,
    habitat: null,
    loading: true,
    error: null,
  });

  // Use discussion-specific messaging hooks
  const {
    messages,
    loading,
    loadingMore,
    sending,
    error: messagesError,
    hasMore,
    sendMessage,
    loadMore,
    addMessage,
    updateMessage,
    removeMessage,
  } = useDiscussionMessages(
    accessState.hasAccess ? habitatId : null,
    accessState.hasAccess ? discussionId : null
  );

  // Use discussion-specific real-time chat
  useDiscussionRealtimeChat(
    accessState.hasAccess ? habitatId : null,
    accessState.hasAccess ? discussionId : null,
    user?.id || null,
    {
      onMessageInsert: addMessage,
      onMessageUpdate: updateMessage,
      onMessageDelete: removeMessage,
    }
  );

  // Validate access to habitat and discussion, and fetch data
  React.useEffect(() => {
    const validateAccessAndFetchData = async () => {
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

        // Fetch discussion and habitat data in parallel
        const [discussion, habitat] = await Promise.all([
          habitatsService.getDiscussionById(discussionId, user.id),
          habitatsService.getHabitatById(habitatId, user.id),
        ]);

        // Validate that discussion belongs to the habitat
        if (discussion.habitat_id !== habitatId) {
          setAccessState({
            loading: false,
            error: "Discussion does not belong to this habitat",
            hasAccess: false,
          });
          return;
        }

        setDiscussionData({
          discussion,
          habitat,
          loading: false,
          error: null,
        });

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
        setDiscussionData({
          discussion: null,
          habitat: null,
          loading: false,
          error: normalizedError.message,
        });
      }
    };

    validateAccessAndFetchData();
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

  // Show loading state while validating access or loading discussion data
  if (accessState.loading || discussionData.loading) {
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

  // Show error state if access validation failed or discussion data failed to load
  if (accessState.error || !accessState.hasAccess || discussionData.error) {
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
            discussionData.error ||
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
      {/* Chat Interface with discussion header */}
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
        discussion={discussionData.discussion || undefined}
        className="h-full"
      />
    </div>
  );
}
