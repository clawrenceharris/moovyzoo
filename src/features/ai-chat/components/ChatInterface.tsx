'use client';

import { cn } from '@/lib/utils';
import { useChat } from '../hooks/use-chat';
import { MessageList } from './MessageList';
import { ChatInput } from './ChatInput';
import { StarterPrompts } from './StarterPrompts';

interface ChatInterfaceProps {
  className?: string;
}

export function ChatInterface({ className }: ChatInterfaceProps) {
  const {
    messages,
    isLoading,
    error,
    sendMessage,
    clearMessages,
    retryLastMessage
  } = useChat();

  const hasMessages = messages.length > 0;

  return (
    <div className={cn('flex flex-col h-full bg-brand-black-08', className)}>
      {/* Main content area */}
      <div className="flex-1 flex flex-col min-h-0">
        {hasMessages ? (
          <MessageList 
            messages={messages} 
            isLoading={isLoading}
            className="flex-1"
          />
        ) : (
          <div className="flex-1 overflow-y-auto">
            <StarterPrompts onSelectPrompt={sendMessage} />
          </div>
        )}

        {/* Error banner */}
        {error && (
          <div className="mx-4 mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
            <div className="flex items-center justify-between">
              <p className="text-sm text-red-400">{error}</p>
              <div className="flex gap-2">
                <button
                  onClick={retryLastMessage}
                  className="text-xs text-red-400 hover:text-red-300 underline"
                >
                  Retry
                </button>
                <button
                  onClick={() => window.location.reload()}
                  className="text-xs text-red-400 hover:text-red-300 underline"
                >
                  Refresh
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input area */}
      <ChatInput
        onSendMessage={sendMessage}
        disabled={isLoading}
      />

      {/* New Chat Button */}
      {messages.length > 0 && (
        <div className="p-4 border-t border-brand-black-15">
          <button
            onClick={clearMessages}
            className={cn(
              'w-full px-4 py-2 rounded-lg text-sm font-medium',
              'bg-brand-black-12 hover:bg-brand-black-15 border border-brand-black-20',
              'text-brand-grey-70 hover:text-white',
              'transition-all duration-200',
              'focus:outline-none focus:ring-2 focus:ring-brand-red-55'
            )}
          >
            New Chat
          </button>
        </div>
      )}
    </div>
  );
}