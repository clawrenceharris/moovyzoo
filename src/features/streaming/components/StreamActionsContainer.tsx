import { useCallback } from "react";
import { StreamingSessionActions, StreamActions } from "./StreamActions";

import {
  StreamWithParticipants,
  UserParticipationStatus,
} from "../domain/stream.types";
import { useJoinStream, useLeaveStream } from "../hooks";

interface StreamingSessionActionsContainerProps {
  stream: StreamWithParticipants;
  userParticipation: UserParticipationStatus;
  userId: string;
  visibility?: "public" | "private" | "unlisted";
}

// Backward compatibility interface
interface StreamActionsContainerProps
  extends StreamingSessionActionsContainerProps {
  stream: StreamWithParticipants;
}

export function StreamingSessionActionsContainer({
  stream,
  userParticipation,
  userId,
  visibility = "public",
}: StreamingSessionActionsContainerProps) {
  const joinMutation = useJoinStream();
  const leaveMutation = useLeaveStream();

  const handleJoin = useCallback(async () => {
    joinMutation.mutate({
      streamId: stream.id,
      userId,
    });
  }, [joinMutation, stream.id, userId]);

  const handleLeave = useCallback(async () => {
    leaveMutation.mutate({
      streamId: stream.id,
      userId,
    });
  }, [leaveMutation, stream.id, userId]);

  const handleShare = useCallback(async () => {
    const shareData = {
      title: `${stream.media_title}${
        stream.media_title ? ` - ${stream.media_title}` : ""
      }`,
      text:
        visibility === "private"
          ? "Join me for a private streaming session!"
          : "Join me for a streaming session!",
      url: `${window.location.origin}/streams/${stream.id}`,
    };

    try {
      if (navigator.share && visibility !== "private") {
        // Don't use native share for private sessions to avoid accidental sharing
        await navigator.share(shareData);
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareData.url);
        // TODO: Show toast notification that link was copied
      } else {
        // Fallback for older browsers
        const textArea = document.createElement("textarea");
        textArea.value = shareData.url;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
        // TODO: Show toast notification that link was copied
      }
    } catch (error) {
      console.error("Error sharing:", error);
      // TODO: Show error toast notification
    }
  }, [stream, visibility]);

  return (
    <StreamingSessionActions
      stream={stream}
      userParticipation={userParticipation}
      onJoin={handleJoin}
      onLeave={handleLeave}
      onShare={handleShare}
      isJoining={joinMutation.isPending}
      isLeaving={leaveMutation.isPending}
      visibility={visibility}
    />
  );
}

// Backward compatibility wrapper
export function StreamActionsContainer(props: StreamActionsContainerProps) {
  const { stream, ...rest } = props;
  return <StreamingSessionActionsContainer {...rest} stream={stream} />;
}
