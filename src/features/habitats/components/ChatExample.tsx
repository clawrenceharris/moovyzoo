"use client";

import React from "react";
import { ChatInterface } from "./ChatInterface";
import { useHabitatMessages } from "../hooks/useHabitatMessages";
import { useRealtimeChat } from "../hooks/useRealtimeChat";

interface ChatExampleProps {
  habitatId: string;
  userId: string;
}

/**
 * Example component showing how to integrate ChatInterface with hooks
 * This demonstrates the complete chat functionality
 */
export function ChatExample({ habitatId, userId }: ChatExampleProps) {
  // Use the habitat messages hook
  const {
    messages,
    loading,
    loadingMore,
    sending,
    error,
    hasMore,
    sendMessage,
    loadMore,
    addMessage,
    updateMessage,
    removeMessage,
  } = useHabitatMessages(habitatId, userId);

  // Use the real-time chat hook
  const {
    connected,
    connecting,
    error: realtimeError,
  } = useRealtimeChat(habitatId, userId, {
    onMessageInsert: addMessage,
    onMessageUpdate: updateMessage,
    onMessageDelete: removeMessage,
    onError: (error) => console.error("Real-time error:", error),
  });

  // Handle message sending
  const handleSendMessage = async (content: string) => {
    try {
      await sendMessage(content);
    } catch (error) {
      // Error is already handled by the hook
      throw error;
    }
  };

  // Combine errors
  const combinedError = error || realtimeError;

  return (
    <div className="flex flex-col h-full">
      {/* Connection status */}
      <div className="px-4 py-2 bg-card/50 border-b border-border">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Chat</h2>
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${
                connected
                  ? "bg-green-500"
                  : connecting
                  ? "bg-yellow-500 animate-pulse"
                  : "bg-red-500"
              }`}
            />
            <span className="text-xs text-muted-foreground">
              {connected
                ? "Connected"
                : connecting
                ? "Connecting..."
                : "Disconnected"}
            </span>
          </div>
        </div>
      </div>

      {/* Chat interface */}
      <ChatInterface
        messages={messages}
        currentUserId={userId}
        loading={loading}
        sending={sending}
        error={combinedError}
        onSendMessage={handleSendMessage}
        onLoadMore={hasMore ? loadMore : undefined}
        hasMore={hasMore}
        loadingMore={loadingMore}
        className="flex-1"
      />
    </div>
  );
}
