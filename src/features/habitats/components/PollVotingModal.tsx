"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui";
import { Check } from "lucide-react";
import type { PollWithVotes } from "../domain/habitats.types";

interface PollVotingModalProps {
  isOpen: boolean;
  onClose: () => void;
  poll: PollWithVotes;
  onVote: (pollId: string, option: string) => Promise<void>;
}

export function PollVotingModal({
  isOpen,
  onClose,
  poll,
  onVote,
}: PollVotingModalProps) {
  const [selectedOption, setSelectedOption] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>("");
  const [hasVotedInSession, setHasVotedInSession] = useState(false);

  // Since we don't have user vote tracking yet, we'll track it locally in this session
  const hasVoted = hasVotedInSession || !!poll.user_vote;
  const totalVotes = poll.total_votes;

  const handleSubmit = async () => {
    if (!selectedOption) return;
    
    setIsSubmitting(true);
    setError("");
    
    try {
      await onVote(poll.id, selectedOption);
      setHasVotedInSession(true);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit vote");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate percentages for results view
  const getOptionPercentage = (option: string) => {
    if (totalVotes === 0) return 0;
    return Math.round((poll.options[option] / totalVotes) * 100);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{poll.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
              {error}
            </div>
          )}

          {/* Poll Options */}
          <div className="space-y-3">
            {Object.entries(poll.options).map(([option, votes]) => {
              const isSelected = selectedOption === option;
              const percentage = getOptionPercentage(option);

              return (
                <div
                  key={option}
                  className={`relative p-3 border rounded-lg transition-colors ${
                    hasVoted
                      ? "cursor-default bg-muted/30"
                      : "cursor-pointer hover:bg-muted/50"
                  } ${
                    isSelected && !hasVoted
                      ? "border-primary bg-primary/5"
                      : "border-border"
                  }`}
                  onClick={() => {
                    if (!hasVoted && !isSubmitting) {
                      setSelectedOption(option);
                    }
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {!hasVoted ? (
                        <div
                          className={`w-4 h-4 rounded-full border-2 ${
                            isSelected
                              ? "border-primary bg-primary"
                              : "border-muted-foreground"
                          }`}
                        >
                          {isSelected && (
                            <div className="w-full h-full rounded-full bg-primary flex items-center justify-center">
                              <div className="w-1.5 h-1.5 rounded-full bg-white" />
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="w-4 h-4 rounded-full border-2 border-muted-foreground bg-muted" />
                      )}
                      <span className="text-sm font-medium">{option}</span>
                    </div>
                    
                    {hasVoted && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{votes} votes</span>
                        <span>({percentage}%)</span>
                      </div>
                    )}
                  </div>

                  {/* Progress bar for results */}
                  {hasVoted && (
                    <div className="mt-2">
                      <div className="w-full bg-muted rounded-full h-1.5">
                        <div
                          className="h-1.5 bg-primary rounded-full transition-all duration-300"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Vote Summary */}
          <div className="flex items-center justify-between text-sm text-muted-foreground border-t pt-4">
            <span>
              {totalVotes} {totalVotes === 1 ? "vote" : "votes"} total
            </span>
            {hasVotedInSession && (
              <span className="text-green-600 font-medium">
                ✓ Vote submitted successfully
              </span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={onClose}>
              {hasVoted ? "Close" : "Cancel"}
            </Button>
            {!hasVoted && (
              <Button
                onClick={handleSubmit}
                disabled={!selectedOption || isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Submit Vote"}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
