"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, MessageCircle } from "lucide-react";
import { ParticipantsList } from "./ParticipantsList";
import { StreamChat } from "./StreamChat";
import { useStreamMessages } from "../hooks/use-stream-chat";
import type { StreamParticipant } from "../domain/stream.types";

interface StreamSidebarProps {
  streamId: string;
  participants: StreamParticipant[];
  currentUserId: string;
  isHost: boolean;
  onKickParticipant?: (participantId: string) => void;
  className?: string;
}

type TabType = "participants" | "chat";

export function StreamSidebar({
  streamId,
  participants,
  currentUserId,
  isHost,
  onKickParticipant,
  className = "",
}: StreamSidebarProps) {
  const [activeTab, setActiveTab] = useState<TabType>("chat");

  // Get message count for chat tab badge
  const { data: messages = [] } = useStreamMessages(streamId, currentUserId);

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
  };

  return (
    <Card className={`flex flex-col w-full h-full ${className}`}>
      {/* Tab Navigation */}
      <div className="flex border-b" role="tablist">
        <Button
          variant={activeTab === "chat" ? "default" : "ghost"}
          className="flex-1 rounded-none rounded-tr-lg relative"
          onClick={() => handleTabChange("chat")}
          role="tab"
          aria-selected={activeTab === "chat"}
          aria-controls="chat-panel"
          id="chat-tab"
        >
          <MessageCircle className="w-4 h-4 mr-2" />
          Chat
          {messages.length > 0 && (
            <span className="ml-2 px-2 py-0.5 text-xs bg-primary/20 text-primary rounded-full">
              {messages.length}
            </span>
          )}
        </Button>
        <Button
          variant={activeTab === "participants" ? "default" : "ghost"}
          className="flex-1 rounded-none rounded-tl-lg border-r relative"
          onClick={() => handleTabChange("participants")}
          role="tab"
          aria-selected={activeTab === "participants"}
          aria-controls="participants-panel"
          id="participants-tab"
        >
          <Users className="w-4 h-4 mr-2" />
          Participants
          {participants.length > 0 && (
            <span className="ml-2 px-2 py-0.5 text-xs bg-primary/20 text-primary rounded-full">
              {participants.length}
            </span>
          )}
        </Button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {/* Chat Panel */}
        <div
          role="tabpanel"
          id="chat-panel"
          aria-labelledby="chat-tab"
          className={`flex-1 overflow-hidden ${activeTab === "chat" ? "flex" : "hidden"}`}
        >
          <div className="flex-1 border-0 rounded-none">
            <StreamChat
              streamId={streamId}
              currentUserId={currentUserId}
              className="border-0 rounded-none h-full"
            />
          </div>
        </div>
      </div>
      {/* Participants Panel */}
      <div
        role="tabpanel"
        id="participants-panel"
        aria-labelledby="participants-tab"
        className={`flex-1 overflow-hidden ${
          activeTab === "participants" ? "flex" : "hidden"
        }`}
      >
        <ParticipantsList
          streamId={streamId}
          participants={participants}
          currentUserId={currentUserId}
          maxVisible={20}
        />
      </div>
    </Card>
  );
}
