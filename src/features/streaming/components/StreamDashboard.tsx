import React from "react";
import {
  useStreamDashboard,
  useJoinStream,
  useLeaveStream,
} from "../hooks/use-stream";
import { Button, LoadingState, ErrorState } from "@/components";
import { StreamService } from "../domain/stream.service";
import { cn } from "@/lib/utils";
import { ParticipantsList } from "./ParticipantsList";

const streamService = new StreamService();

/**
 * Props for StreamDashboard component
 */
interface StreamDashboardProps {
  streamId: string;
  userId: string;
  className?: string;
}

/**
 * StreamDashboard component displays Stream information and controls
 */
export function StreamDashboard({
  streamId,
  userId,
  className,
}: StreamDashboardProps) {
  const {
    data: dashboardData,
    isLoading,
    error,
    refetch,
  } = useStreamDashboard(streamId, userId);

  const joinMutation = useJoinStream();
  const leaveMutation = useLeaveStream();

  const handleJoin = () => {
    joinMutation.mutate({ streamId, userId });
  };

  const handleLeave = () => {
    leaveMutation.mutate({ streamId, userId });
  };

  if (isLoading) {
    return (
      <div className={cn("container mx-auto px-4 py-8", className)}>
        <LoadingState variant="card" count={1} />
      </div>
    );
  }

  if (error || !dashboardData) {
    return (
      <div className={cn("container mx-auto px-4 py-8", className)}>
        <ErrorState
          title="Failed to load Stream"
          message="We couldn't load this Stream. Please try again."
          onRetry={() => refetch()}
          variant="card"
        />
      </div>
    );
  }

  const { stream, userParticipation, canJoin, canLeave } = dashboardData;
  const status = streamService.getStreamStatus(stream);

  const getStatusColor = () => {
    switch (status.status) {
      case "live":
        return "text-green-500";
      case "starting_soon":
        return "text-yellow-500";
      case "upcoming":
        return "text-blue-500";
      case "ended":
        return "text-muted-foreground";
      default:
        return "text-muted-foreground";
    }
  };

  const getStatusText = () => {
    switch (status.status) {
      case "live":
        return "Live Now";
      case "starting_soon":
        return `Starting in ${status.timeUntilStart} min`;
      case "upcoming":
        return "Upcoming";
      case "ended":
        return "Ended";
      default:
        return "Unknown";
    }
  };

  return (
    <div className={cn("container mx-auto px-4 py-8", className)}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold">{stream.media_title}</h1>
            <div className="flex items-center gap-2">
              <span className={cn("text-sm font-medium", getStatusColor())}>
                {getStatusText()}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            {canJoin && (
              <Button
                onClick={handleJoin}
                disabled={joinMutation.isPending}
                className="btn-primary"
              >
                {joinMutation.isPending ? "Joining..." : "Join Stream"}
              </Button>
            )}
            {canLeave && (
              <Button
                onClick={handleLeave}
                disabled={leaveMutation.isPending}
                variant="outline"
              >
                {leaveMutation.isPending ? "Leaving..." : "Leave Stream"}
              </Button>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Stream Details */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Stream Details</h2>
              <div className="space-y-3">
                <div>
                  <span className="text-muted-foreground">Scheduled:</span>
                  <span className="ml-2">
                    {new Date(stream.scheduled_time).toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Participants:</span>
                  <span className="ml-2">{stream.participants.length}</span>
                  {stream.max_participants && (
                    <span className="text-muted-foreground">
                      /{stream.max_participants}
                    </span>
                  )}
                </div>
                {stream.description && (
                  <div>
                    <span className="text-muted-foreground">Description:</span>
                    <p className="mt-1 text-sm">{stream.description}</p>
                  </div>
                )}
                {userParticipation.isParticipant &&
                  userParticipation.joinedAt && (
                    <div>
                      <span className="text-muted-foreground">You joined:</span>
                      <span className="ml-2">
                        {userParticipation.joinedAt.toLocaleString()}
                      </span>
                    </div>
                  )}
              </div>
            </div>

            {/* Media Information */}
            {stream.media_title && (
              <div>
                <h2 className="text-xl font-semibold mb-4">
                  What We're Watching
                </h2>
                <div className="space-y-3">
                  <div>
                    <span className="text-muted-foreground">Title:</span>
                    <span className="ml-2">{stream.media_title}</span>
                  </div>
                  {stream.media_type && (
                    <div>
                      <span className="text-muted-foreground">Type:</span>
                      <span className="ml-2 capitalize">
                        {stream.media_type}
                      </span>
                    </div>
                  )}
                  {stream.release_date && (
                    <div>
                      <span className="text-muted-foreground">Release:</span>
                      <span className="ml-2">
                        {new Date(stream.release_date).getFullYear()}
                      </span>
                    </div>
                  )}
                  {stream.runtime && (
                    <div>
                      <span className="text-muted-foreground">Runtime:</span>
                      <span className="ml-2">{stream.runtime} minutes</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Participants List */}
        {dashboardData.participants.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">
              Participants ({dashboardData.participants.length})
            </h2>
            <div className="bg-card border border-border rounded-lg p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                <ParticipantsList participants={dashboardData.participants} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
