"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DiscussionCard,
  PollCard,
  WatchPartyCard,
  LoadingState,
  EmptyState,
} from "@/components";
import type {
  DiscussionWithStats,
  PollWithVotes,
  WatchPartyWithParticipants,
} from "../domain/habitats.types";

interface PopularInHabitatProps {
  discussions: DiscussionWithStats[];
  polls: PollWithVotes[];
  watchParties: WatchPartyWithParticipants[];
  onDiscussionClick: (discussionId: string) => void;
  onPollClick: (pollId: string) => void;
  onWatchPartyClick: (watchPartyId: string) => void;
  loading?: boolean;
  className?: string;
}

export function PopularInHabitat({
  discussions,
  polls,
  watchParties,
  onDiscussionClick,
  onPollClick,
  onWatchPartyClick,
  loading = false,
  className = "",
}: PopularInHabitatProps) {
  // Mock data for demo purposes - matches the design
  const mockDiscussions = [
    {
      id: "1",
      name: "Favorite Sci-Fi AI Character",
      description:
        "Who's your favorite AI character from sci-fi movies and shows?",
      message_count: 207,
      last_message_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      habitat_id: "1",
      creator_id: "1",
      created_by: "1",
      is_active: true,
    },
    {
      id: "2",
      name: "HAL 9000 (2001: A Space Odyssey)",
      description:
        "Discussion about the iconic AI from Stanley Kubrick's masterpiece",
      message_count: 89,
      last_message_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      habitat_id: "1",
      creator_id: "1",
      created_by: "1",
      is_active: true,
    },
    {
      id: "3",
      name: "Data (Star Trek)",
      description: "The android officer from Star Trek: The Next Generation",
      message_count: 156,
      last_message_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      habitat_id: "1",
      creator_id: "1",
      created_by: "1",
      is_active: true,
    },
    {
      id: "4",
      name: "TARS (Interstellar)",
      description:
        "The witty robot companion from Christopher Nolan's Interstellar",
      message_count: 73,
      last_message_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      habitat_id: "1",
      creator_id: "1",
      created_by: "1",
      is_active: true,
    },
    {
      id: "5",
      name: "Ava (Ex Machina)",
      description:
        "The sophisticated AI from Alex Garland's psychological thriller",
      message_count: 124,
      last_message_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      habitat_id: "1",
      creator_id: "1",
      created_by: "1",
      is_active: true,
    },
  ];

  // Use mock data if no real data provided
  const displayDiscussions =
    discussions.length > 0 ? discussions : mockDiscussions;

  // Combine and sort all activities by recent activity
  const allActivities = [
    ...displayDiscussions.map((d) => ({
      type: "discussion" as const,
      item: d,
      timestamp: d.last_message_at || d.created_at,
    })),
    ...polls.map((p) => ({
      type: "poll" as const,
      item: p,
      timestamp: p.created_at,
    })),
    ...watchParties.map((w) => ({
      type: "watchParty" as const,
      item: w,
      timestamp: w.scheduled_time,
    })),
  ].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const hasContent = allActivities.length > 0;

  return (
    <Card className="bg-primary-surface">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Popular in this habitat</span>
          {hasContent && (
            <Button variant="ghost" size="sm" className="text-muted-foreground">
              View all
            </Button>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent>
        {loading ? (
          <LoadingState variant="list" count={3} />
        ) : hasContent ? (
          <div className="space-y-3">
            {allActivities.slice(0, 5).map((activity, index) => {
              switch (activity.type) {
                case "discussion":
                  return (
                    <DiscussionCard
                      key={`discussion-${activity.item.id}`}
                      discussion={activity.item}
                      onClick={() => onDiscussionClick(activity.item.id)}
                    />
                  );
                case "poll":
                  return (
                    <PollCard
                      key={`poll-${activity.item.id}`}
                      poll={activity.item}
                      onClick={() => onPollClick(activity.item.id)}
                    />
                  );
                case "watchParty":
                  return (
                    <WatchPartyCard
                      key={`watchParty-${activity.item.id}`}
                      watchParty={activity.item}
                      onClick={() => onWatchPartyClick(activity.item.id)}
                    />
                  );
                default:
                  return null;
              }
            })}
          </div>
        ) : (
          <EmptyState
            variant="card"
            title="No discussions yet"
            description="Start a conversation about your favorite scenes or theories!"
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
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            }
          />
        )}
      </CardContent>
    </Card>
  );
}
