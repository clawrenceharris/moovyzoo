"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import { Input, Button } from "@/components/ui";

import type { Discussion, MessageWithProfile } from "../domain/habitats.types";
import { formatDistanceToNow } from "date-fns";

interface ChatInterfaceProps {
  messages: MessageWithProfile[];
  currentUserId: string;
  discussion: Discussion | undefined;
  loading?: boolean;
  sending?: boolean;
  error?: string | null;
  onSendMessage: (content: string) => Promise<void>;
  onLoadMore?: () => void;
  hasMore?: boolean;
  loadingMore?: boolean;
  className?: string;
}

interface MessageItemProps {
  message: MessageWithProfile;
  isCurrentUser: boolean;
}

function MessageItem({ message, isCurrentUser }: MessageItemProps) {
  const formatTimestamp = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch {
      return "Unknown time";
    }
  };

  return (
    <div
      className={`flex gap-3 p-3 hover:bg-muted/30 transition-colors ${
        isCurrentUser ? "flex-row-reverse" : ""
      }`}
    >
      {/* Avatar */}
      <div className="flex-shrink-0">
        {message.user_profile?.avatar_url ? (
          <Image
            src={message.user_profile.avatar_url}
            alt={message.user_profile.display_name}
            width={32}
            height={32}
            className="w-8 h-8 rounded-full object-cover border border-border"
            unoptimized
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center">
            <span className="text-xs font-medium text-accent">
              {message.user_profile?.display_name?.charAt(0)?.toUpperCase() ||
                "?"}
            </span>
          </div>
        )}
      </div>

      {/* Message content */}
      <div className={`flex-1 min-w-0 ${isCurrentUser ? "text-right" : ""}`}>
        <div
          className={`flex items-baseline gap-2 mb-1 ${
            isCurrentUser ? "justify-end" : ""
          }`}
        >
          <span className="text-sm font-medium text-foreground">
            {isCurrentUser ? "You" : message.user_profile?.display_name}
          </span>
          <span className="text-xs text-muted-foreground">
            {formatTimestamp(message.created_at)}
          </span>
        </div>

        <div
          className={`inline-block max-w-[80%] p-3 rounded-lg ${
            isCurrentUser
              ? "bg-primary text-primary-foreground ml-auto"
              : "bg-card border border-border"
          }`}
        >
          <p className="text-sm whitespace-pre-wrap break-words">
            {message.content}
          </p>
        </div>
      </div>
    </div>
  );
}

function LoadingMessages() {
  return (
    <div className="space-y-4 p-4">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="flex gap-3 animate-pulse">
          <div className="w-8 h-8 rounded-full bg-muted"></div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-3 bg-muted rounded w-20"></div>
              <div className="h-3 bg-muted rounded w-16"></div>
            </div>
            <div className="h-10 bg-muted rounded-lg w-3/4"></div>
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyMessages() {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
      <div className="w-16 h-16 mb-4 rounded-full bg-muted/20 flex items-center justify-center">
        <svg
          className="w-8 h-8 text-muted-foreground"
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
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">
        Start the conversation
      </h3>
      <p className="text-sm text-muted-foreground max-w-sm">
        Be the first to share your thoughts about this habitat. Say hello to
        fellow fans!
      </p>
    </div>
  );
}

export function ChatInterface({
  messages,
  currentUserId,
  loading = false,
  sending = false,
  error,
  onSendMessage,
  onLoadMore,
  discussion,
  hasMore = false,
  loadingMore = false,
  className = "",
}: ChatInterfaceProps) {
  const [messageInput, setMessageInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [shouldScrollToBottom, setShouldScrollToBottom] = useState(true);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = useCallback(() => {
    if (shouldScrollToBottom && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [shouldScrollToBottom]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Handle scroll to detect if user is at bottom
  const handleScroll = useCallback(() => {
    if (!messagesContainerRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } =
      messagesContainerRef.current;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 100;
    setShouldScrollToBottom(isAtBottom);

    // Load more messages when scrolling to top
    if (scrollTop === 0 && hasMore && !loadingMore && onLoadMore) {
      onLoadMore();
    }
  }, [hasMore, loadingMore, onLoadMore]);

  // Handle message submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const content = messageInput.trim();
    if (!content || sending) return;

    try {
      await onSendMessage(content);
      setMessageInput("");
      setShouldScrollToBottom(true);
    } catch (error) {
      // Error is handled by parent component
      console.error("Failed to send message:", error);
    }
  };

  // Handle Enter key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className={`flex flex-col h-full bg-background ${className}`}>
      <h1> {discussion?.name}</h1>
      {/* Messages container */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent"
        onScroll={handleScroll}
      >
        {/* Load more indicator */}
        {loadingMore && (
          <div className="flex justify-center py-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
              Loading more messages...
            </div>
          </div>
        )}

        {/* Messages */}
        {loading ? (
          <LoadingMessages />
        ) : messages.length === 0 ? (
          <EmptyMessages />
        ) : (
          <div className="space-y-1">
            {messages
              .slice()
              .reverse()
              .map((message) => (
                <MessageItem
                  key={message.id}
                  message={message}
                  isCurrentUser={message.user_id === currentUserId}
                />
              ))}
          </div>
        )}

        {/* Scroll anchor */}
        <div ref={messagesEndRef} />
      </div>

      {/* Error display */}
      {error && (
        <div className="px-4 py-2 bg-destructive/10 border-t border-destructive/20">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {/* Message input */}
      <div className="border-t border-border bg-card/50 backdrop-blur-sm p-4">
        <form onSubmit={handleSubmit} className="flex gap-3">
          <div className="flex-1">
            <Input
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              disabled={sending}
              className="resize-none bg-background/50 border-border focus:border-accent focus:ring-accent/20"
              maxLength={1000}
            />
          </div>
          <Button
            type="submit"
            disabled={!messageInput.trim() || sending}
            className="px-6 bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            {sending ? (
              <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
            )}
          </Button>
        </form>

        {/* Character count */}
        <div className="flex justify-between items-center mt-2 text-xs text-muted-foreground">
          <span>Press Enter to send, Shift+Enter for new line</span>
          <span>{messageInput.length}/1000</span>
        </div>
      </div>
    </div>
  );
}
