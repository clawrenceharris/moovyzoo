'use client';

import { useState } from 'react';
import { Copy, Check, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Message } from '../types/chat';
import { formatTimestamp, copyMessageToClipboard } from '../utils/message-formatting';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

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
          <Image
            src="/icons/ai-icon.svg"
            alt="AI"
            width={16}
            height={16}
            className="w-4 h-4"
          />
        )}
      </div>

      {/* Message content */}
      <div className={cn(
        'flex flex-col min-w-0 flex-1',
        isUser ? 'items-end' : 'items-start'
      )}>
        {/* Message bubble */}
        <div className={cn(
          'relative px-4 py-3 rounded-2xl break-words word-wrap max-w-full',
          'shadow-sm',
          isUser ? [
            'bg-brand-red-45 text-white max-w-[85%]',
            'rounded-tr-md'
          ] : [
            'bg-brand-black-12 text-white border border-brand-black-20 max-w-[90%]',
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
            <div className="text-sm leading-relaxed break-words overflow-wrap-anywhere">
              {isUser ? (
                // User messages: plain text with whitespace preservation
                <div className="whitespace-pre-wrap">{message.content}</div>
              ) : (
                // AI messages: rendered markdown
                <div className="prose prose-sm prose-invert max-w-none">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                    // Custom styling for markdown elements
                    p: ({ children }) => <p className="mb-2 last:mb-0 text-gray-400">{children}</p>,
                    h1: ({ children }) => <h1 className="text-lg font-bold mb-2 text-white">{children}</h1>,
                    h2: ({ children }) => <h2 className="text-base font-bold mb-2 text-white">{children}</h2>,
                    h3: ({ children }) => <h3 className="text-sm font-bold mb-2 text-white">{children}</h3>,
                    strong: ({ children }) => <strong className="font-semibold text-white">{children}</strong>,
                    em: ({ children }) => <em className="italic text-white">{children}</em>,
                    code: ({ children }) => (
                      <code className="bg-brand-black-20 text-brand-red-55 px-1 py-0.5 rounded text-xs font-mono">
                        {children}
                      </code>
                    ),
                    pre: ({ children }) => (
                      <pre className="bg-brand-black-20 border border-brand-black-25 rounded-lg p-3 overflow-x-auto mt-2 mb-2">
                        {children}
                      </pre>
                    ),
                    ul: ({ children }) => <ul className="list-disc pl-4 mb-2 space-y-1">{children}</ul>,
                    ol: ({ children }) => <ol className="list-decimal pl-4 mb-2 space-y-1">{children}</ol>,
                    li: ({ children }) => <li className="text-white">{children}</li>,
                    blockquote: ({ children }) => (
                      <blockquote className="border-l-4 border-brand-blue-45 pl-4 italic bg-brand-black-15 rounded-r-lg py-2 my-2">
                        {children}
                      </blockquote>
                    ),
                    a: ({ href, children }) => (
                      <a 
                        href={href} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-brand-blue-55 hover:text-brand-blue-45 underline"
                      >
                        {children}
                      </a>
                    ),
                  }}
                                  >
                    {message.content}
                  </ReactMarkdown>
                </div>
              )}
            </div>
          )}

          {/* Status indicator for user messages */}
          {isUser && (
            <div className={cn(
              'absolute -bottom-1 -right-1 w-3 h-3 rounded-full z-10',
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