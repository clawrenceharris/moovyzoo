"use client";

import React, { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageCircle, Send } from "lucide-react";

interface ChatMessage {
  id: string;
  stream_id: string;
  user_id: string;
  message: string;
  created_at: string;
  profile: {
    display_name: string;
    avatar_url?: string;
  };
}

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
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newMessage.trim()) return;

    // Create optimistic message
    const optimisticMessage: ChatMessage = {
      id: `temp-${Date.now()}`,
      stream_id: streamId,
      user_id: currentUserId,
      message: newMessage.trim(),
      created_at: new Date().toISOString(),
      profile: {
        display_name: "You",
      },
    };

    // Add to messages immediately
    setMessages((prev) => [...prev, optimisticMessage]);
    setNewMessage("");

    // TODO: Send to backend and handle real-time updates
    // For now, just simulate the message being sent
    console.log("Sending message:", optimisticMessage);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);

    // TODO: Implement typing indicators
    if (!isTyping) {
      setIsTyping(true);
      // Debounce typing indicator
      setTimeout(() => setIsTyping(false), 1000);
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Card className={`h-full flex flex-col`}>
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
                  {message.profile.display_name.charAt(0).toUpperCase()}
                </div>

                {/* Message Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 mb-1">
                    <p className="font-medium text-sm">
                      {message.user_id === currentUserId
                        ? "You"
                        : message.profile.display_name}
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
            onChange={handleInputChange}
            placeholder="Type a message..."
            className="flex-1"
            maxLength={500}
          />
          <Button
            type="submit"
            size="sm"
            disabled={!newMessage.trim()}
            className="px-3"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </Card>
  );
}
