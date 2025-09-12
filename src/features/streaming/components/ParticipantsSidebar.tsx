"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { Users, Crown } from "lucide-react";
import type { StreamParticipant } from "../domain/stream.types";
import { ParticipantsList } from "./ParticipantsList";

interface ParticipantsSidebarProps {
  streamId: string;
  participants: StreamParticipant[];
  currentUserId: string;
  isHost: boolean;
  onKickParticipant?: (participantId: string) => void;
  className?: string;
}

export function ParticipantsSidebar({
  streamId,
  participants,
  currentUserId,
  isHost,
  onKickParticipant,
  className = "",
}: ParticipantsSidebarProps) {
  if (participants.length === 0) {
    return (
      <Card className={`p-6 text-center ${className}`}>
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted/20 flex items-center justify-center">
          <Users className="w-8 h-8 text-muted-foreground" />
        </div>
        <p className="text-muted-foreground">No participants yet</p>
        <p className="text-sm text-muted-foreground/70 mt-1">
          Be the first to join this stream!
        </p>
      </Card>
    );
  }

  return (
    <Card className={`flex flex-col ${className}`}>
      <div className="p-4 border-b">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Users className="w-5 h-5" />
          Participants ({participants.length})
        </h3>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-3"></div>
      </div>
    </Card>
  );
}
