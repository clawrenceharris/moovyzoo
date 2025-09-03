"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Plus, Calendar } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { WatchPartyCard, LoadingState, EmptyState } from "@/components";
import type { WatchPartyWithParticipants } from "../domain/habitats.types";

interface WatchPartiesCarouselProps {
  watchParties: WatchPartyWithParticipants[];
  onJoinParty: (watchPartyId: string) => void;
  onLeaveParty: (watchPartyId: string) => void;
  onEnterParty: (watchPartyId: string) => void;
  onCreateParty?: () => void;
  loading?: boolean;
  className?: string;
}

/**
 * WatchPartiesCarousel component displays watch parties in a prominent horizontal scrolling layout.
 *
 * This component is designed to be placed prominently under the hero banner to highlight
 * the core watch party feature. It sorts parties by scheduled time and provides smooth
 * horizontal scrolling with snap behavior.
 */
export function WatchPartiesCarousel({
  watchParties,
  onJoinParty,
  onLeaveParty,
  onEnterParty,
  onCreateParty,
  loading = false,
  className = "",
}: WatchPartiesCarouselProps) {
  // Sort watch parties by scheduled time (live first, then upcoming, then past)
  const sortedParties = [...watchParties].sort((a, b) => {
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

  const hasParties = sortedParties.length > 0;

  if (loading) {
    return (
      <div className={`bg-card/30 border-b border-border ${className}`}>
        <div className="px-6 py-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Watch Parties</h2>
          </div>
          <LoadingState variant="grid" count={3} />
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-card/30 border-b border-border ${className}`}>
      <div className="px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div>
              <h2 className="text-2xl font-bold">Watch Parties</h2>
              <p className="text-sm text-muted-foreground">
                {sortedParties.length}{" "}
                {sortedParties.length === 1 ? "party" : "parties"} scheduled
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {onCreateParty && (
              <Button
                variant={"secondary"}
                onClick={onCreateParty}
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Schedule Party
              </Button>
            )}
          </div>
        </div>

        {/* Carousel */}
        {hasParties ? (
          <Carousel
            opts={{
              align: "start",
              loop: false,
              skipSnaps: false,
              dragFree: false,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-2 md:-ml-4">
              {sortedParties.map((watchParty) => (
                <CarouselItem
                  key={watchParty.id}
                  className="pl-2 md:pl-4 basis-full sm:basis-1/2 lg:basis-1/3 xl:basis-1/4"
                >
                  <WatchPartyCard
                    watchParty={watchParty}
                    onClick={() => onEnterParty(watchParty.id)}
                    showDescription={true}
                    className="h-full"
                  />
                </CarouselItem>
              ))}
            </CarouselContent>

            {/* Navigation arrows - only show if there are enough items to scroll */}
            {sortedParties.length > 4 && (
              <>
                <CarouselPrevious className="left-0 bg-background/80 backdrop-blur-sm border-border hover:bg-background" />
                <CarouselNext className="right-0 bg-background/80 backdrop-blur-sm border-border hover:bg-background" />
              </>
            )}
          </Carousel>
        ) : (
          <EmptyState
            title="Schedule a Watch Party to start the fun!"
            description="Be the first to schedule a watch party and bring the community together!"
            onAction={() =>
              onCreateParty ? (
                <Button
                  onClick={onCreateParty}
                  className="flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Schedule Watch Party
                </Button>
              ) : undefined
            }
            variant="minimal"
          />
        )}
      </div>
    </div>
  );
}
