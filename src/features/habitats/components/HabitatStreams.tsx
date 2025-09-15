"use client";

import React from "react";
import { Button } from "@/components/ui";
import { Plus, Calendar } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

import type { StreamWithParticipants } from "@/features/streaming/domain/stream.types";
import { EmptyState, LoadingState, StreamCard } from "@/components";
import { Card, CardHeader } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

interface StreamingCarouselProps {
  streams: StreamWithParticipants[];
  onJoinStream: (streamId: string) => void;
  onLeaveStream: (streamId: string) => void;
  onEnterStream: (streamId: string) => void;
  onCreateStream?: () => void;
  loading?: boolean;
  className?: string;
  userId: string;
}

/**
 * StreamingCarousel component displays Streams in a prominent horizontal scrolling layout.
 *
 * This component is designed to be placed prominently under the hero banner to highlight
 * the core Stream feature. It sorts streams by scheduled time and provides smooth
 * horizontal scrolling with snap behavior.
 */
export function HabitatStreams({
  streams,
  userId,
  onJoinStream,
  onLeaveStream,
  onEnterStream,
  onCreateStream,
  loading = false,
  className = "",
}: StreamingCarouselProps) {
  // Sort Streams by scheduled time (live first, then upcoming, then past)
  const sortedStreams = [...streams].sort((a, b) => {
    const timeA = new Date(a.scheduled_time).getTime();
    const timeB = new Date(b.scheduled_time).getTime();
    const now = Date.now();

    // Determine status for sorting priority
    const getStatusPriority = (time: number) => {
      if (Math.abs(time - now) <= 30 * 60 * 1000) return 0; // Live (within 30 min)
      if (time > now) return 1; // Upcoming
      return 2; // Past
    };

    const priorityA = getStatusPriority(timeA);
    const priorityB = getStatusPriority(timeB);

    if (priorityA !== priorityB) return priorityA - priorityB;
    return timeA - timeB; // Sort by time within same status
  });

  const hasParties = sortedStreams.length > 0;

  if (loading) {
    return (
      <div className={`bg-card/30 border-b border-border ${className}`}>
        <div className="px-6 py-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Streams</h2>
          </div>
          <LoadingState variant="grid" count={3} />
        </div>
      </div>
    );
  }

  return (
    <Card className="bg-primary-surface">
      {/* Header */}
      <CardHeader className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div>
            <h2 className="text-2xl font-bold">Streams</h2>
            <p className="text-sm text-muted-foreground">
              {sortedStreams.length} Streams scheduled
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {onCreateStream && (
            <Button
              variant={"secondary"}
              onClick={onCreateStream}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Schedule Stream
            </Button>
          )}
        </div>
      </CardHeader>

      {/* Carousel */}
      {hasParties ? (
        <div className="flex overflow-scroll flex-row p-7 gap-4">
          {sortedStreams.map((stream) => (
            <div key={stream.id} className="flex-shrink-0 w-96 max-w-96">
              <StreamCard
                userId={userId}
                stream={stream}
                onJoinClick={() => {
                  onJoinStream(stream.id);
                }}
                onLeaveClick={() => onLeaveStream(stream.id)}
                onWatchClick={() => onEnterStream(stream.id)}
              />
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title="Schedule a Stream to start the fun!"
          description="Be the first to schedule a Stream and bring the community together!"
          onAction={() =>
            onCreateStream ? (
              <Button
                onClick={onCreateStream}
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Schedule Stream
              </Button>
            ) : undefined
          }
          variant="minimal"
        />
      )}
    </Card>
  );
}
