import { Button } from "@/components/ui";
import {
  Share,
  UserPlus,
  UserMinus,
  Loader2,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react";
import {
  StreamWithParticipants,
  UserParticipationStatus,
} from "../domain/stream.types";
import { useJoinStream, useLeaveStream } from "../hooks";

interface StreamingSessionActionsProps {
  stream: StreamWithParticipants;
  userParticipation: UserParticipationStatus;

  isJoining?: boolean;
  isLeaving?: boolean;
  userId: string;
  visibility?: "public" | "private" | "unlisted";
}

// Keep the old interface for backward compatibility
interface StreamActionsProps extends StreamingSessionActionsProps {
  stream: StreamWithParticipants;
}

export function StreamActions({
  stream,
  userParticipation,
  userId,
  isJoining = false,
  isLeaving = false,
  visibility = "public",
}: StreamingSessionActionsProps) {
  const joinMutation = useJoinStream();
  const leaveMutation = useLeaveStream();

  const isSessionFull =
    stream.max_participants &&
    stream.participants.length >= stream.max_participants;

  const getVisibilityIcon = () => {
    switch (visibility) {
      case "private":
        return <Lock className="h-3 w-3" />;
      case "unlisted":
        return <EyeOff className="h-3 w-3" />;
      default:
        return <Eye className="h-3 w-3" />;
    }
  };

  const getVisibilityLabel = () => {
    switch (visibility) {
      case "private":
        return "Private";
      case "unlisted":
        return "Unlisted";
      default:
        return "Public";
    }
  };
  const handleJoin = async () => {
    joinMutation.mutate({
      streamId: stream.id,
      userId,
    });
  };

  const handleLeave = async () => {
    leaveMutation.mutate({
      streamId: stream.id,
      userId,
    });
  };

  const handleShare = async () => {
    const shareData = {
      title: `${stream.media_title}${
        stream.media_title ? ` - ${stream.media_title}` : ""
      }`,
      text:
        visibility === "private"
          ? "Join me for a private Stream!"
          : "Join me for a Stream!",
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
  };

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      <div className="flex flex-col gap-2 sm:flex-row">
        {userParticipation.isParticipant ? (
          <Button
            onClick={handleLeave}
            disabled={!userParticipation.canLeave || isLeaving}
            variant="outline"
            size="lg"
          >
            {isLeaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Leaving...
              </>
            ) : (
              <>
                <UserMinus className="h-4 w-4" />
                Leave Session
              </>
            )}
          </Button>
        ) : (
          <Button
            onClick={handleJoin}
            variant="primary"
            disabled={!userParticipation.canJoin || isJoining}
            size="lg"
          >
            {isJoining ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Joining...
              </>
            ) : (
              <>
                <UserPlus className="h-4 w-4" />
                Join Session
              </>
            )}
          </Button>
        )}

        <Button onClick={handleShare} variant="outline" size="lg">
          <Share className="h-4 w-4" />
          <span className="sm:inline">Share</span>
        </Button>
      </div>

      <div className="flex items-center gap-4">
        {isSessionFull && !userParticipation.isParticipant && (
          <p className="text-sm text-muted-foreground text-center sm:text-left">
            Group Stream is full ({stream.participants.length}/
            {stream.max_participants})
          </p>
        )}

        {visibility !== "public" && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            {getVisibilityIcon()}
            <span>{getVisibilityLabel()}</span>
          </div>
        )}
      </div>
    </div>
  );
}
