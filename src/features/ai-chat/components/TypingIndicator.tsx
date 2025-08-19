'use client';

import { cn } from '@/lib/utils';

interface TypingIndicatorProps {
  className?: string;
}

export function TypingIndicator({ className }: TypingIndicatorProps) {
  return (
    <div className={cn('flex items-center space-x-2 p-4', className)}>
      <div className="flex items-center space-x-1">
        <div className="w-8 h-8 rounded-full bg-brand-blue-45 flex items-center justify-center">
          <span className="text-white font-bold text-xs">AI</span>
        </div>
        <div className="flex space-x-1 ml-3">
          <div 
            className="w-2 h-2 bg-brand-grey-70 rounded-full animate-bounce"
            style={{ animationDelay: '0ms' }}
          />
          <div 
            className="w-2 h-2 bg-brand-grey-70 rounded-full animate-bounce"
            style={{ animationDelay: '150ms' }}
          />
          <div 
            className="w-2 h-2 bg-brand-grey-70 rounded-full animate-bounce"
            style={{ animationDelay: '300ms' }}
          />
        </div>
      </div>
      <span className="text-sm text-brand-grey-70 ml-2" aria-live="polite">
        AI is thinking...
      </span>
    </div>
  );
}