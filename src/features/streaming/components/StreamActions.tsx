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

interface StreamingSessionActionsProps {
  stream: StreamWithParticipants;
  userParticipation: UserParticipationStatus;
  onJoin: () => Promise<void>;
  onLeave: () => Promise<void>;
  onShare: () => void;
  isJoining?: boolean;
  isLeaving?: boolean;
  visibility?: "public" | "private" | "unlisted";
}

// Keep the old interface for backward compatibility
interface StreamActionsProps extends StreamingSessionActionsProps {
  stream: StreamWithParticipants;
}

export function StreamingSessionActions({
  stream,
  userParticipation,
  onJoin,
  onLeave,
  onShare,
  isJoining = false,
  isLeaving = false,
  visibility = "public",
}: StreamingSessionActionsProps) {
  const isSessionFull =
    stream.max_participants &&
    stream.participant_count >= stream.max_participants;

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

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      <div className="flex flex-col gap-2 sm:flex-row">
        {userParticipation.isParticipant ? (
          <Button
            onClick={onLeave}
            disabled={!userParticipation.canLeave || isLeaving}
            variant="outline"
            className="flex items-center justify-center gap-2 min-h-[44px] touch-manipulation"
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
            onClick={onJoin}
            disabled={!userParticipation.canJoin || isJoining}
            className="flex items-center justify-center gap-2 min-h-[44px] touch-manipulation"
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

        <Button
          onClick={onShare}
          variant="outline"
          className="flex items-center justify-center gap-2 min-h-[44px] touch-manipulation"
          size="lg"
        >
          <Share className="h-4 w-4" />
          <span className="sm:inline">Share</span>
        </Button>
      </div>

      <div className="flex items-center gap-4">
        {isSessionFull && !userParticipation.isParticipant && (
          <p className="text-sm text-muted-foreground text-center sm:text-left">
            Session is full ({stream.participant_count}/
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

// Backward compatibility wrapper
export function StreamActions(props: StreamActionsProps) {
  const { stream, ...rest } = props;
  return <StreamingSessionActions {...rest} stream={stream} />;
}
