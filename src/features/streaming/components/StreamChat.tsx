"use client";

import React, { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageCircle, Send, Loader2 } from "lucide-react";
import { useStreamMessages, useSendMessage } from "../hooks/use-stream-chat";
import { LoadingState, ErrorState } from "@/components/states";

interface StreamChatProps {
  streamId: string;
  currentUserId: string;
  className?: string;
}

export function StreamChat({
  streamId,
  currentUserId,
  className = "",
}: StreamChatProps) {
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch messages with real-time updates
  const {
    data: messages = [],
    isLoading,
    error,
    refetch,
  } = useStreamMessages(streamId, currentUserId);

  // Send message mutation
  const sendMessageMutation = useSendMessage();

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    if (messagesEndRef.current?.scrollIntoView) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newMessage.trim() || sendMessageMutation.isPending) return;

    try {
      await sendMessageMutation.mutateAsync({
        stream_id: streamId,
        user_id: currentUserId,
        message: newMessage.trim(),
      });
      setNewMessage("");
      inputRef.current?.focus();
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getDisplayName = (message: any) => {
    if (message.user_id === currentUserId) {
      return "You";
    }
    return (
      message.profile?.display_name || `User ${message.user_id.slice(0, 8)}`
    );
  };

  if (isLoading) {
    return (
      <Card className="h-full flex flex-col">
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            Chat
          </h3>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <LoadingState variant="inline" />
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="h-full flex flex-col">
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            Chat
          </h3>
        </div>
        <div className="flex-1 p-4">
          <ErrorState
            variant="inline"
            title="Failed to load chat"
            message="Unable to load messages. Please try again."
            onRetry={() => refetch()}
          />
        </div>
      </Card>
    );
  }

  return (
    <Card className={`h-full flex flex-col ${className}`}>
      <div className="p-4 border-b">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <MessageCircle className="w-5 h-5" />
          Chat
        </h3>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No messages yet</p>
            <p className="text-sm mt-1">Start the conversation!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <div key={message.id} className="flex gap-3">
                {/* Avatar */}
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                  {getDisplayName(message).charAt(0).toUpperCase()}
                </div>

                {/* Message Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 mb-1">
                    <p className="font-medium text-sm">
                      {getDisplayName(message)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatTime(message.created_at)}
                    </p>
                  </div>
                  <p className="text-sm text-foreground break-words">
                    {message.message}
                  </p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Message Input */}
      <div className="p-4 border-t">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <Input
            ref={inputRef}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1"
            maxLength={500}
            disabled={sendMessageMutation.isPending}
          />
          <Button
            type="submit"
            size="sm"
            disabled={!newMessage.trim() || sendMessageMutation.isPending}
            className="px-3"
            aria-label="Send message"
          >
            {sendMessageMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </form>

        {sendMessageMutation.error && (
          <p className="text-sm text-red-500 mt-2">
            Failed to send message. Please try again.
          </p>
        )}
      </div>
    </Card>
  );
}
