"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { WatchPartyCard, LoadingState, EmptyState } from "@/components";
import type { WatchPartyWithParticipants } from "../domain/habitats.types";

interface WatchPartiesProps {
  watchParties: WatchPartyWithParticipants[];
  onJoinParty: (watchPartyId: string) => void;
  onLeaveParty: (watchPartyId: string) => void;
  onEnterParty: (watchPartyId: string) => void;
  onCreateParty?: () => void;
  loading?: boolean;
  className?: string;
}

export function WatchParties({
  watchParties,
  onJoinParty,
  onLeaveParty,
  onEnterParty,
  onCreateParty,
  loading = false,
  className = "",
}: WatchPartiesProps) {
  // Mock data for demo - matches the design
  const mockWatchParty = {
    id: "1",
    title: "The Expanse S1 tonight at 8 PM",
    description:
      "Join us for the first season of The Expanse - space politics and great sci-fi!",
    scheduled_time: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours from now
    participant_count: 23,
    is_participant: false,
    habitat_id: "1",
    creator_id: "1",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    created_by: "1",
    is_active: true,
    participants: [],
  };

  // Use mock data if no real data provided
  const displayParties =
    watchParties.length > 0 ? watchParties : [mockWatchParty];

  // Sort watch parties by scheduled time (upcoming first)
  const sortedParties = [...displayParties].sort((a, b) => {
    const timeA = new Date(a.scheduled_time).getTime();
    const timeB = new Date(b.scheduled_time).getTime();
    const now = Date.now();

    // Live parties first, then upcoming, then past
    const statusA = timeA <= now ? (timeA > now - 30 * 60 * 1000 ? 0 : 2) : 1;
    const statusB = timeB <= now ? (timeB > now - 30 * 60 * 1000 ? 0 : 2) : 1;

    if (statusA !== statusB) return statusA - statusB;
    return timeA - timeB;
  });

  const hasParties = sortedParties.length > 0;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Weekly watch parties</span>
          <div className="flex items-center gap-2">
            {hasParties && (
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground"
              >
                View all
              </Button>
            )}
            {onCreateParty && (
              <Button variant="outline" size="sm" onClick={onCreateParty}>
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                Schedule
              </Button>
            )}
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent>
        {loading ? (
          <LoadingState variant="grid" count={4} />
        ) : hasParties ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sortedParties.map((watchParty) => (
              <WatchPartyCard
                key={watchParty.id}
                watchParty={watchParty}
                onClick={() => onEnterParty(watchParty.id)}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No watch parties scheduled"
            description="Schedule a watch party to enjoy content together with the community!"
            actionLabel="Schedule Watch Party"
            onAction={onCreateParty}
            icon={
              <svg
                className="w-12 h-12 text-muted-foreground"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.586a1 1 0 01.707.293l2.414 2.414a1 1 0 00.707.293H15M9 10V9a2 2 0 012-2h2a2 2 0 012 2v1M9 10v5a2 2 0 002 2h2a2 2 0 002-2v-5"
                />
              </svg>
            }
          />
        )}
      </CardContent>
    </Card>
  );
}
