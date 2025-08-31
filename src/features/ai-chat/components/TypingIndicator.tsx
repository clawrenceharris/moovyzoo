'use client';

import { cn } from '@/lib/utils';
import Image from 'next/image';

interface TypingIndicatorProps {
  className?: string;
}

export function TypingIndicator({ className }: TypingIndicatorProps) {
  return (
    <div className={cn('flex gap-3 p-4', className)}>
      {/* AI Avatar */}
      <div className="w-8 h-8 rounded-full bg-brand-blue-45 text-white flex items-center justify-center flex-shrink-0">
        <Image
          src="/icons/ai-icon.svg"
          alt="AI"
          width={16}
          height={16}
          className="w-4 h-4"
        />
      </div>

      {/* Typing indicator bubble */}
      <div className="flex flex-col items-start">
        <div className="relative px-4 py-3 rounded-2xl rounded-tl-md bg-brand-black-12 border border-brand-black-20 shadow-sm">
          <div className="flex items-center space-x-1">
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
        
        {/* Timestamp area - matching MessageBubble structure */}
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-brand-grey-70">
            AI is thinking...
          </span>
        </div>
      </div>
    </div>
  );
}