'use client';

import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Message } from '../types/chat';
import { MessageBubble } from './MessageBubble';
import { TypingIndicator } from './TypingIndicator';

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
  className?: string;
}

export function MessageList({ messages, isLoading, className }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    const scrollToBottom = () => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ 
          behavior: 'smooth',
          block: 'end'
        });
      }
    };

    // Small delay to ensure DOM is updated
    const timer = setTimeout(scrollToBottom, 100);
    return () => clearTimeout(timer);
  }, [messages, isLoading]);

  return (
    <div 
      ref={containerRef}
      className={cn(
        'flex-1 overflow-y-auto overflow-x-hidden',
        'scrollbar-thin scrollbar-thumb-brand-black-20 scrollbar-track-transparent',
        className
      )}
    >
      {messages.length === 0 && !isLoading ? (
        // Empty state
        <div className="flex flex-col items-center justify-center h-full p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-brand-blue-45 flex items-center justify-center mb-4">
            <span className="text-white font-bold text-xl">AI</span>
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">
            Welcome to Zoovie AI!
          </h3>
          <p className="text-brand-grey-70 text-sm max-w-xs">
            I'm here to help you discover amazing movies and TV shows. Ask me anything about cinema!
          </p>
        </div>
      ) : (
        // Messages
        <div className="min-h-full">
          {messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              isUser={message.role === 'user'}
            />
          ))}
          
          {/* Typing indicator */}
          {isLoading && <TypingIndicator />}
          
          {/* Scroll anchor */}
          <div ref={messagesEndRef} className="h-1" />
        </div>
      )}
    </div>
  );
}