'use client';

import { useState } from 'react';
import { Copy, Check, User, Bot } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Message } from '../types/chat';
import { formatTimestamp, copyMessageToClipboard } from '../utils/message-formatting';

interface MessageBubbleProps {
  message: Message;
  isUser: boolean;
}

export function MessageBubble({ message, isUser }: MessageBubbleProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const success = await copyMessageToClipboard(message);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className={cn(
      'flex gap-3 p-4 group',
      isUser ? 'flex-row-reverse' : 'flex-row'
    )}>
      {/* Avatar */}
      <div className={cn(
        'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
        isUser 
          ? 'bg-brand-grey-70 text-brand-black-08' 
          : 'bg-brand-blue-45 text-white'
      )}>
        {isUser ? (
          <User className="w-4 h-4" />
        ) : (
          <Bot className="w-4 h-4" />
        )}
      </div>

      {/* Message content */}
      <div className={cn(
        'flex flex-col max-w-[80%]',
        isUser ? 'items-end' : 'items-start'
      )}>
        {/* Message bubble */}
        <div className={cn(
          'relative px-4 py-3 rounded-2xl break-words',
          'shadow-sm',
          isUser ? [
            'bg-brand-red-45 text-white',
            'rounded-tr-md'
          ] : [
            'bg-brand-black-12 text-white border border-brand-black-20',
            'rounded-tl-md'
          ],
          message.status === 'error' && 'opacity-60 border-red-500'
        )}>
          {/* Image if present */}
          {message.image && (
            <div className="mb-3">
              <img
                src={message.image.url}
                alt={message.image.alt}
                className="max-w-full h-auto rounded-lg max-h-64 object-cover"
                loading="lazy"
              />
            </div>
          )}

          {/* Text content */}
          {message.content && (
            <div className="text-sm leading-relaxed whitespace-pre-wrap">
              {message.content}
            </div>
          )}

          {/* Status indicator for user messages */}
          {isUser && (
            <div className={cn(
              'absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-brand-black-08',
              message.status === 'sending' && 'bg-brand-grey-70',
              message.status === 'sent' && 'bg-green-500',
              message.status === 'error' && 'bg-red-500'
            )} />
          )}
        </div>

        {/* Timestamp and actions */}
        <div className={cn(
          'flex items-center gap-2 mt-1 opacity-0 group-hover:opacity-100 transition-opacity',
          isUser ? 'flex-row-reverse' : 'flex-row'
        )}>
          <span className="text-xs text-brand-grey-70">
            {formatTimestamp(message.timestamp)}
          </span>
          
          <button
            onClick={handleCopy}
            className={cn(
              'p-1 rounded hover:bg-brand-black-15 transition-colors',
              'text-brand-grey-70 hover:text-white',
              'focus:outline-none focus:ring-1 focus:ring-brand-red-55'
            )}
            aria-label="Copy message"
          >
            {copied ? (
              <Check className="w-3 h-3 text-green-500" />
            ) : (
              <Copy className="w-3 h-3" />
            )}
          </button>
        </div>

        {/* Error message */}
        {message.status === 'error' && (
          <div className="text-xs text-red-400 mt-1">
            Failed to send message
          </div>
        )}
      </div>
    </div>
  );
}