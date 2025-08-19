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

  const handleSendMessage = async (content: string, image?: File) => {
    await sendMessage(content, image);
  };

  const handlePromptSelect = (prompt: string) => {
    sendMessage(prompt);
  };

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
            <StarterPrompts onSelectPrompt={handlePromptSelect} />
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
        onSendMessage={handleSendMessage}
        disabled={isLoading}
      />

      {/* Debug info in development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="p-2 text-xs text-brand-grey-70 border-t border-brand-black-15">
          Messages: {messages.length} | Loading: {isLoading.toString()} | Error: {error || 'none'}
          {messages.length > 0 && (
            <button
              onClick={clearMessages}
              className="ml-4 text-brand-red-45 hover:underline"
            >
              Clear
            </button>
          )}
        </div>
      )}
    </div>
  );
}