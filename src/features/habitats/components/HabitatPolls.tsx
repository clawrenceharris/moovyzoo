"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PollCard } from "@/components/cards/PollCard";
import { EmptyState, LoadingState } from "@/components";
import type { PollWithVotes } from "../domain/habitats.types";

interface HabitatPollsProps {
  polls: PollWithVotes[];
  loading?: boolean;
  onPollClick: (pollId: string) => void;
  className?: string;
}

export function HabitatPolls({
  polls,
  loading = false,
  onPollClick,
  className = "",
}: HabitatPollsProps) {
  if (loading) {
    return (
      <Card className={`bg-primary-surface ${className}`}>
        <CardHeader>
          <CardTitle>Active Polls</CardTitle>
        </CardHeader>
        <CardContent>
          <LoadingState variant="list" count={3} />
        </CardContent>
      </Card>
    );
  }

  if (polls.length === 0) {
    return (
      <Card className={`bg-primary-surface ${className}`}>
        <CardHeader>
          <CardTitle>Active Polls</CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState
            title="No active polls"
            description="Polls created in this habitat will appear here for members to vote on."
            variant="minimal"
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`bg-primary-surface ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Active Polls</span>
          <span className="text-sm text-muted-foreground font-normal">
            {polls.length} active
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {polls.map((poll) => (
          <PollCard
            key={poll.id}
            poll={poll}
            onClick={() => onPollClick(poll.id)}
          />
        ))}
      </CardContent>
    </Card>
  );
}
